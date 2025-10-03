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

/*

Monkey Fling Poo

    -A standard type for all atoms?  Maybe not necessary?  But it would be nice if the logic functions could be typed to expect a certain shape.
        -If nothing else, I want the Atoms to have an atomization ID, distinct from the item ID.  The whole idea of this process is to reduce it to singular units, so of course we're going to have fully-identical instances.
        -Maybe a standard ID and a type to expect?  
        -Or maybe this is just an extension of each type?

    -"Are We Related?": Compare Atom({ FirstAtom, SecondAtom, matchingFn(FirstAtom, SecondAtom)   }) -> boolean
        /A function that will compare two atoms against a definition of 'the same item' and return true if they are the same, false otherwise./

    -Some way (maybe a reducer?) to will perform pre-defined (or user-specified?) operations on 2 atoms.

    -A function that will take two sets of atoms and an AreWeRelatedFn, and return 3 sets:
        -Atoms that are in both sets (intersection)
        -Atoms that are only in the first set
        -Atoms that are only in the second set

        -We probably have to do something to the output, although I suppose if we are REALLY clever with our typing we could just merge that shit without logic.
            -Also, if there are values that lose critical info when stored... that means we're making a mistake in how we capture data, right?

        The goal would be that at the end, you have identified all instances that are the same and joined them.  The result would have all the properties of both parents, for future atomization.

    The other things I do in the Repos is store ONLY data that comes from the users.  We would still use the TYPE, but we should never be duplicating 

    
    
    returns 3 maps: The intersection, the items only in the first map, and the items only in the second map.


*/

//------------------------------
// Layer 1: Normalized Views
//------------------------------

// Extracts the Items sold on receipts currently in the transaction State (TransactionState.receipts).
export function deriveReceiptedItems(
  receiptsInput: Map<string, Invoice> | Record<string, Invoice> | undefined
): Map<string, BaseItem> {
  const receiptsMap: Map<string, Invoice> =
    receiptsInput instanceof Map
      ? receiptsInput
      : new Map(receiptsInput ? Object.entries(receiptsInput) : []);

  const itemsMap = new Map<string, BaseItem>();

  receiptsMap.forEach((invoice) => {
    invoice.items.forEach((item) => {
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

export function summarizeReceiptedItems(
  receiptsRepo: TransactionState["receipts"]
) {
  const receipted = deriveReceiptedItems(receiptsRepo);

  const items = Array.from(receipted.values());
  const totalItems = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const totalValue = items.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.valueCents || 0),
    0
  );

  return { items, totalItems, totalValue };
}
