//TEXTCANON

/*
Atomization Contract (Agreed)

-AT NO POINT should any of this logic reference TransactionState.userInputs.  That is a vestigial definition that is too difficult for me to change right now.  ANY data coming from TransactionState must be from the canonical repos (returnItems, receipts).

- Atomization is the act of distilling a complex data structure into an equivalent mass of its smallest
  indivisible units, called Atoms. Each Atom is a flat object containing only primitive values.

- Blending is the act of applying one or more Mixers to the persistent Blend of Atoms. 
  Each pass attaches new distinguishing properties.
  It never mutates or removes upstream properties, and it never alters the cart itself.

- Survival is deferred.
  Atoms that cannot be matched/enriched in a given pass still receive the new property,
  but with an empty/null/undefined value. No filtering occurs during atomization.

- Filtering and rollups happen downstream.
  Consumers decide how to treat Atoms with missing props (e.g., filter out atoms with
  no receiptId, partition by returnReason, roll up values). This keeps logic out of
  the atomizer itself.

- Both share a common atomic structure — they differ only in role: the Blend persists, the Mixers are consumed.
- Each layer is a total, monotonic Blending: no Atoms are destroyed; every Atom in the Blend gains at least one new property from either a matching Mixer Atom or the empty canonical Mixer of that type.

This makes the atomizer "dumb": always same-length in/out, always attaches new props,
never performs business logic. All elimination, aggregation, or interpretation is
deferred to explicit downstream helpers.
*/

/* 

  // Dictionary:
    *Collapse: If two atoms share all overlapping properties with identical values, they collapse into one canonical atom.

    *Collapsible*: A set of atoms with identical values for all overlapping properties.

    *Blend*: The ongoing continuity.  It is the persistent data mass that survives across layers.  It always exits with the same number of Atoms it entered with, enriched but never diminished.

    *Mixers* are temporary enrichers.  They contribute new properties to the Blend’s Atoms, then are discarded.

    *Atom* : An indivisible unit of data.  It must progressively accrete properties, but never lose them.
      -Atoms DO NOT have their own identifier.  
      -If you need to identify an atom, you have failed to normalize your data.
      -Atoms must be flat.  Any atom property must be a single primitive value (string, number, boolean, null/undefined).

*/
import React from "react";
import { fakeCatalog, fakeInvoices } from "../api/fakeApi";
import type { Item, Invoice, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";

export function useDerivation() {
  const [transaction] = useTransaction();

  //--------------------------------------
  // Helpers
  //--------------------------------------

  // Pull repos from TransactionState
  const trxnReturnItems = transaction?.returnItems ?? new Map();
  const trxnReceipts = transaction?.receipts ?? new Map();

  //------------------------------
  // Layer 0: Collect Data
  //------------------------------

  // Mock API lookups
  const apiReceipts = fakeInvoices;
  const apiCatalog = fakeCatalog;

  //------------------------------
  // Layer 1: Normalize Data
  //------------------------------

  const normalizeReturnItems = (items: Map<string, Item>): Item[] =>
    Array.from(items.values()).map((item) => ({ ...item }));

  const normalizeReceiptedItems = (invoices: Map<string, Invoice>): Item[] => {
    const collected: Item[] = [];

    invoices.forEach((invoice, invoId) => {
      const canonicalInvoice = fakeInvoices[invoId];
      if (!canonicalInvoice) {
        console.warn(`⚠️ Invoice ${invoId} not found in fakeInvoices`);
        return;
      }

      canonicalInvoice.items.forEach((item) => {
        collected.push({
          itemId: item.itemId,
          qty: item.qty,
          valueCents: item.valueCents,
          invoId, // record provenance
        });
      });
    });

    return collected;
  };

  const rawReceiptedItems = normalizeReturnItems(trxnReceipts);
  const rawReturnItems = normalizeReceiptedItems(trxnReturnItems);

  //------------------------------
  // Layer 2: Atomize Data
  //------------------------------

  //Normalized entries are disassembled into a Map of Atoms by the smallest indivisible increment.
  // Core Atomization function
  function atomize<T extends Record<string, any>>(items: T[]): T[] {
    const atoms: T[] = [];

    items.forEach((item) => {
      const qty = item.qty ?? 1;

      // Each atom represents one "unit" of the original item
      for (let i = 0; i < qty; i++) {
        const atom = {
          ...item,
          qty: 1,
          // Optionally normalize per-unit value if present
          ...(item.valueInCents && qty > 0
            ? { valueInCents: item.valueInCents / qty }
            : {}),
        };
        atoms.push(atom);
      }
    });

    return atoms;
  }

  // Atomize Implementations.

  const atomizedReturnItems = atomize(rawReturnItems);
  const atomizedReceiptedItems = atomize(rawReceiptedItems);

  //------------------------------
  // Layer 3: Blending
  //------------------------------

  /*
   -The Blending layer contains all cycles that add at least one new property to each Atom passed in.
    -Blending can be conditional, but the condition is always an equality check between 2 atoms.
      -In addition, that logic can only determines the values within the Type being merged - either an empty default or something else.  In either case, the quantity of atoms is unchanged from beginning to end.
  
      -subsequent layers can depend on properties added in previous layers.
      -the quantity of atoms is unchanged from beginning to end.
*/

  // ================================
  // Blending Core (Type-Agnostic)
  // ================================
  // These functions treat all inputs as flat objects (Record<string, any>).
  // They make no assumptions about shape, type, or domain semantics.
  // Purpose: Attach new properties from one or more "mixer" layers
  //           onto the persistent blend, without altering its length.
  // No business logic. No type knowledge. Just dumb data merging.

  /**
   * Equality check — determines whether two records are equal
   * based only on their shared keys.
   */
  function areEqual(a: Record<string, any>, b: Record<string, any>): boolean {
    const sharedKeys = Object.keys(a).filter((key) => key in b);
    return sharedKeys.every((key) => a[key] === b[key]);
  }

  /**
   * Collapse — merges two records if they are equal on shared keys,
   * otherwise applies a default mixer record (empty enrichment).
   */
  function collapse(
    a: Record<string, any>,
    b: Record<string, any>,
    defaultMixer: Record<string, any> = {}
  ): Record<string, any> {
    return areEqual(a, b) ? { ...a, ...b } : { ...a, ...defaultMixer };
  }

  /**
   * Blenderize — applies one or more mixer arrays to a blend array,
   * enriching each element in the blend with properties from the first
   * matching record in each mixer. Quantity and order are preserved.
   */
  function blenderize(
    blend: Record<string, any>[],
    mixers: Record<string, any>[][],
    defaultMixer: Record<string, any> = {}
  ): Record<string, any>[] {
    return blend.map((b) => {
      let enriched = { ...b };

      mixers.forEach((mixer) => {
        const match = mixer.find((m) => areEqual(b, m));
        enriched = match
          ? { ...enriched, ...match }
          : { ...enriched, ...defaultMixer };
      });

      return enriched;
    });
  }

  // RETURNS BLEND

  // Inital ReturnItems blend = empty Map.

  const returnItemsBlend = blenderize(atomizedReturnItems, [
    atomizedReceiptedItems,
  ]);

  // Blend ReceiptedItems

  //--------------------------------------
  // Layer : Rollups
  //--------------------------------------

  // Validate that distillizer is idempotent for given grouping keys
  function distillizerStringTest() {
    const once = distillizer(returnItemsBlend, ["itemId"]);
    const twice = distillizer(once, ["itemId"]);

    const serialize = (x: any) => JSON.stringify(x);
    const sameLength = once.length === twice.length;
    const sameContent = once.every(
      (a, i) => serialize(a) === serialize(twice[i])
    );

    return sameLength && sameContent;
  }

  function distillizer<T extends Record<string, any>>(
    atoms: T[],
    groupKeys: (keyof T)[] // must specify which fields define identity
  ): T[] {
    if (atoms.length === 0) return [];

    // Map from composite key string → aggregated record
    const grouped = new Map<string, T>();

    atoms.forEach((atom) => {
      // Build unique key from grouping fields
      const key = groupKeys.map((k) => String(atom[k] ?? "null")).join("|");
      const existing = grouped.get(key);

      if (existing) {
        // If group exists, sum numeric fields
        const merged: Record<string, any> = { ...existing };
        for (const [k, v] of Object.entries(atom)) {
          if (typeof v === "number") {
            merged[k] = (merged[k] ?? 0) + v; // accumulate totals
          }
        }
        grouped.set(key, merged as T);
      } else {
        // If no group exists, initialize it
        grouped.set(key, { ...atom });
      }
    });

    // Return all consolidated records as array
    return Array.from(grouped.values());
  }

  // total Return value
  const totalReturnCents = distillizer(returnItemsBlend, [
    "itemId",
    "invoId",
  ]).reduce((sum, item) => sum + (item.valueCents ?? 0), 0);

  const refundItems = distillizer(returnItemsBlend, ["itemId", "invoId"]);
  const perItemRefunds = distillizer(refundItems, ["itemId"]);
  const sanityCheck = distillizerStringTest();

  // Rollup of all

  return {
    refundItems,
    perItemRefunds,
    totalReturnCents,
    sanityCheck,
  };
}

// Call your current derivation entrypoint
// 🧪 ----------------------------------------------------
//  TEST HARNESS — Plug-and-Play
// -------------------------------------------------------

export const RefundDebugger: React.FC = () => {
  const result = useDerivation();

  React.useEffect(() => {
    console.log("🧩 Derivation Test Output:", result);
  }, [result]);

  return (
    <div style={{ fontFamily: "monospace", padding: "0.5rem" }}>
      <div>🧪 Derivation Test Running</div>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
};

try {
  // ✅ correct: just use the object returned by the hook directly
  const result = useDerivation();
  console.log("🧩 Derivation Test Output:");
  console.log(JSON.stringify(result, null, 2));
} catch (err) {
  console.error("❌ Derivation error:", err);
}
