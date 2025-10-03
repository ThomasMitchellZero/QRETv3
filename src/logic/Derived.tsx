// ================================
// derived.ts — Canonical Derivations Bucket
// Definition: Pure functions that compute derived values from repos and static data.
// Intent: Provide a reusable derivation tree for refunds, eligibility, and enriched views.
// Constraints:
//   - Never store derived values in state.
//   - Functions must be pure: inputs in, outputs out.
//   - Composable: each function does one thing, callers compose results.
// Inputs: Transaction repos, fakeCatalog
// Outputs: Derived maps, enriched arrays, summaries
// ================================

import { fakeCatalog } from "../api/fakeApi";
import type { BaseItem, Invoice, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";

//--------------------------------------
// Helpers
//--------------------------------------
function toMap(repo: any): Map<string, any> {
  if (!repo) return new Map();
  return repo instanceof Map ? repo : new Map(Object.entries(repo));
}

//------------------------------
// Layer 1: Normalized Views
//------------------------------
export function deriveReceiptedItems(receiptsRepo: any): Map<string, BaseItem> {
  const receipts = toMap(receiptsRepo);
  const itemsMap = new Map<string, BaseItem>();

  receipts.forEach((receipt: any) => {
    receipt.items.forEach((item: any) => {
      const existing = itemsMap.get(item.id);
      if (existing) {
        const newQty = (existing.qty || 0) + item.qty;
        if (newQty > 0) {
          itemsMap.set(item.id, {
            ...existing,
            qty: newQty,
          });
        }
      } else if (item.qty > 0) {
        itemsMap.set(item.id, {
          id: item.id,
          qty: item.qty,
          valueCents: item.valueCents,
        });
      }
    });
  });

  return itemsMap;
}

export function deriveReturnedItems(returnRepo: any): Map<string, BaseItem> {
  const map = toMap(returnRepo);
  // filter out zero-qty
  map.forEach((item, id) => {
    if (!item.qty || item.qty <= 0) {
      map.delete(id);
    }
  });
  return map;
}

// ================================
// atomizer.ts — Canonical Atomizer Utility
// Definition: Utility functions to atomize repos into canonical atoms.
// Intent: Decompose all repo items into qty=1 atomic entries for safe matching.
// Constraints:
//   - No business logic beyond atomization.
//   - Works for both Map-based repos and plain object repos.
// Inputs: Repo (Map or Record), optional source string
// Outputs: CanonicalAtom[]
// ================================

export type CanonicalAtom = {
  id: string;
  valueCents?: number | undefined;
  source?: string | undefined; // e.g. "returns" or receipt id
};

/**
 * Atomize a single item entry (qty -> repeated atoms).
 */
export function atomizeItem(item: {
  id: string;
  qty: number;
  valueCents: number;
  source?: string;
}): CanonicalAtom[] {
  const atoms: CanonicalAtom[] = [];
  for (let i = 0; i < item.qty; i++) {
    atoms.push({
      id: item.id,
      valueCents: item.valueCents,
      source: item.source,
    });
  }
  return atoms;
}

/**
 * Atomize a whole repo (Map or plain object of items).
 *
 * @param repo Map<string, any> or Record<string, any>
 * @param source optional string (e.g. "returns" or receipt id) applied to all atoms if not already set
 */
export function atomizeRepo(
  repo: Map<string, any> | Record<string, any>,
  source?: string
): CanonicalAtom[] {
  const entries: [string, any][] =
    repo instanceof Map ? Array.from(repo.entries()) : Object.entries(repo);

  return entries.flatMap(([id, item]) =>
    atomizeItem({
      id,
      qty: item.qty ?? 1,
      valueCents: item.valueCents ?? 0,
      source: item.source ?? source,
    })
  );
}

//------------------------------
// Layer 2: Intersections + Enrichment
//------------------------------
export function deriveEligibleReturns(
  receipted: Map<string, BaseItem>,
  returned: Map<string, BaseItem>
): Map<string, BaseItem> {
  const eligible = new Map<string, BaseItem>();
  returned.forEach((ret, id) => {
    const rec = receipted.get(id);
    if (rec) {
      const qty = Math.min(ret.qty || 0, rec.qty || 0);
      if (qty > 0) {
        eligible.set(id, {
          ...rec,
          qty,
        });
      }
    }
  });
  return eligible;
}

export function deriveReceiptedLunes(
  receipted: Map<string, BaseItem>,
  returned: Map<string, BaseItem>
): {
  lens: Map<string, BaseItem>;
  unReceiptedItems: Map<string, BaseItem>;
  unReturnedItems: Map<string, BaseItem>;
} {
  const lens = new Map<string, BaseItem>();
  const unReceiptedItems = new Map<string, BaseItem>();
  const unReturnedItems = new Map<string, BaseItem>();

  // Returned loop: lens or unReceipted
  returned.forEach((ret, id) => {
    const rec = receipted.get(id);
    if (rec) {
      const qty = Math.min(ret.qty || 0, rec.qty || 0);
      if (qty > 0) {
        lens.set(id, { ...rec, qty });
      }
    } else if (ret.qty && ret.qty > 0) {
      unReceiptedItems.set(id, { ...ret });
    }
  });

  // Receipted loop: items not returned
  receipted.forEach((rec, id) => {
    if (!returned.has(id) && rec.qty && rec.qty > 0) {
      unReturnedItems.set(id, { ...rec });
    }
  });

  return { lens, unReceiptedItems, unReturnedItems };
}

//--------------------------------------
// Layer 3: Rollups
//--------------------------------------
export function deriveRefundTotal(eligible: Map<string, BaseItem>): number {
  let total = 0;
  eligible.forEach((item) => {
    total += (item.qty || 0) * (item.valueCents || 0);
  });
  return total;
}

export function deriveRefundSummary(eligible: Map<string, BaseItem>) {
  const totalItems = Array.from(eligible.values()).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );
  const refundTotal = deriveRefundTotal(eligible);
  return { totalItems, refundTotal };
}

//======================================
// Layer 4: Summaries
//======================================

/**
 * summarizeReceiptedItems
 * Definition: Produce a flattened list of receipted items with aggregate totals.
 * Intent: Provide UI-ready data for rendering receipts summary.
 * Constraints:
 *   - Pure function, no state mutation.
 *   - Input must be a receipts repo (TransactionState.receipts).
 * Inputs: receiptsRepo (Map<string, Invoice> or Record<string, Invoice>)
 * Outputs: { items: BaseItem[], totalItems: number, totalValue: number }
 */
export function summarizeReceiptedItems() {
  const [transaction] = useTransaction();
  const receiptsRepo = transaction.receipts || new Map<string, Invoice>();
  const receipted = deriveReceiptedItems(receiptsRepo);

  const totalItems = Array.from(receipted.values()).reduce(
    (sum, item) => sum + (item.qty || 0),
    0
  );

  const totalValue = Array.from(receipted.values()).reduce(
    (sum, item) => sum + (item.qty || 0) * (item.valueCents || 0),
    0
  );

  return {
    items: Array.from(receipted.values()),
    totalItems,
    totalValue,
  };
}
