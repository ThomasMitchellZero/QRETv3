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
import { fakeInvoices } from "../api/fakeApi";
import type { Item, Invoice, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";

export function useDerivation() {
  const [transaction] = useTransaction();

  //--------------------------------------
  // Helpers
  //--------------------------------------

  // Pull repos from TransactionState
  const refTransaction: TransactionState = transaction;
  const trxnReturnItems = transaction?.returnItems ?? new Map();
  const trxnReceipts = transaction?.receipts ?? new Map();

  //------------------------------
  // Layer 0: Collect Data
  //------------------------------

  //------------------------------
  // Layer 1: Normalize Data
  //------------------------------

  function normalizeReturnItems(): Item[] {
    return Array.from(trxnReturnItems.values());
  }

  function normalizeReceiptedItems(): Item[] {
    const items: Item[] = [];
    const receipts = trxnReceipts; // from TransactionState
    const invoices = fakeInvoices; // canonical source of item details

    receipts.forEach((_, invoId) => {
      const invoice = invoices[invoId];
      if (!invoice || !invoice.items) return;

      invoice.items.forEach((item) => {
        items.push({
          ...item,
          invoId, // attach parent invoice ID
        });
      });
    });

    return items;
  }

  const rawReceiptedItems = normalizeReceiptedItems();
  const rawReturnItems = normalizeReturnItems();

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
          valueCents: item.valueCents ?? undefined, // already per unit
        };
        atoms.push(atom);
      }
    });

    return atoms;
  }

  // Atomize Implementations.

  const atomizedReturnItems = atomize(rawReturnItems);
  const atomizedReceiptedItems = atomize(rawReceiptedItems);

  console.log("Atomized Return Items:", atomizedReturnItems);
  console.log("Atomized Receipted Items:", atomizedReceiptedItems);

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
  // Purpose: Attach new properties from one or more "mixer" layers onto the persistent blend, without altering its length.
  // No business logic. No type knowledge. Just dumb data merging.

  /**
   * Equality check — determines whether two records are equal
   * based only on their shared keys.
   */
  function areEqual(b: Record<string, any>, m: Record<string, any>): boolean {
    return b.itemId === m.itemId;
  }

  function blenderize(
    blend: Record<string, any>[],
    mixer: Record<string, any>[]
  ): Record<string, any>[] {
    // Make a mutable copy of the mixer pool
    const remaining = [...mixer];
    const result: Record<string, any>[] = [];

    // Outer loop: iterate through every atom in the Blend
    for (const b of blend) {
      let matched = false;

      // Inner loop: iterate through the remaining Mixer atoms
      for (let i = 0; i < remaining.length; i++) {
        const m = remaining[i];
        if (!m) continue; // ✅ skip if undefined

        // If they are canonically identical, collapse them
        if (areEqual(b, m)) {
          result.push(m); // the Mix atom replaces the Blend atom
          remaining.splice(i, 1); // remove that Mix atom from the pool
          matched = true;
          break; // stop searching once collapsed
        }
      }

      // If no match found, keep the original Blend atom
      if (!matched) {
        result.push(b);
      }
    }

    return result;
  }

  // RETURNS BLEND

  const returnItemsBlend = blenderize(
    atomizedReturnItems,
    atomizedReceiptedItems
  );

  console.log("Return Items Blend:", returnItemsBlend);

  //--------------------------------------
  // Layer : Rollups
  //--------------------------------------

  function distillizer<T extends Record<string, any>>(
    items: T[],
    keys: (keyof T)[]
  ): T[] {
    if (items.length === 0) return [];

    // Map from composite key string → aggregated record
    const grouped = new Map<string, T>();

    items.forEach((atom) => {
      // Build unique key from grouping fields
      const key = keys.map((k) => String(atom[k] ?? "null")).join("|");
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
  //--------------------------------------
  // Consolidate — Universal Rollup Function (Map-based)
  //--------------------------------------
  // Accepts an array of atom-like objects, groups them by specified key fields,
  // and aggregates (sums) numeric fields defined in `aggregateKeys`.
  // Returns a Map keyed by the concatenated group keys (e.g. "itemId|invoId").
  // This version aligns with the AIDA Map-centric architecture.

  function consolidate<T extends Record<string, any>>(
    atoms: T[],
    keys: (keyof T)[],
    aggregateKeys: (keyof T)[] = []
  ): Map<string, T> {
    const grouped = new Map<string, T[]>();

    // 1️⃣ Group atoms by specified identity keys
    for (const atom of atoms) {
      const key = keys.map((k) => String(atom[k] ?? "null")).join("|");
      const group = grouped.get(key) ?? [];
      group.push(atom);
      grouped.set(key, group);
    }

    // 2️⃣ Consolidate each group into a single record
    const results = new Map<string, T>();
    for (const [key, groupAtoms] of grouped) {
      const base = { ...groupAtoms[0] } as T;

      for (const field of aggregateKeys) {
        const total = groupAtoms.reduce((sum, a) => {
          const v = a[field];
          return typeof v === "number" ? sum + v : sum;
        }, 0);
        (base as any)[field] = total;
      }

      results.set(key, base);
    }

    // 3️⃣ Return the fully consolidated Map
    return results;
  }
  // total Return value

  const refundItems = distillizer<Item>(returnItemsBlend as Item[], [
    "itemId",
    "invoId",
  ]);

  //--------------------------------------
  // New Consolidate-Based Refund Rollup
  //--------------------------------------

  const refundItemsMap = consolidate<Item>(
    returnItemsBlend as Item[],
    ["itemId", "invoId"], // group by both keys
    ["qty", "valueCents"] // aggregate fields
  );

  // Convert to array for comparison with distillizer output
  const refundItemsArray = Array.from(refundItemsMap.values());

  //--------------------------------------
  // Comparison Test: distillizer vs consolidate
  //--------------------------------------

  const refundItemsTest = JSON.stringify(refundItems);
  const refundItemsMapTest = JSON.stringify(refundItemsArray);

  if (refundItemsTest === refundItemsMapTest) {
    console.log("✅ consolidate() matches distillizer()");
  } else {
    console.warn("⚠️ consolidate() differs from distillizer()");
    console.log("distillizer:", refundItems);
    console.log("consolidate:", refundItemsArray);
  }

  const totalReturnCents = refundItems.reduce(
    (sum, item) => sum + (item.valueCents ?? 0),
    0
  );

  const perItemRefunds = distillizer<Item>(refundItems, ["itemId"]);
  console.log("Per-Item Refunds:", perItemRefunds);

  // Rollup of all

  // ================================
  // Layer : Secondary Rollups (Relational Views)
  // ================================

  // For each itemId, collect all refund records (i.e., per receipt) where that item appears.
  const itemReceipts: Map<string, Item[]> = new Map();
  refundItems.forEach((item) => {
    const list = itemReceipts.get(item.itemId) ?? [];
    list.push(item);
    itemReceipts.set(item.itemId, list);
  });

  // receiptItemsSold — Map<invoId, Item[]>
  // For each receipt (invoice ID), collect all items refunded under that receipt.
  const receiptItemsSold: Map<string, Item[]> = new Map();
  refundItems.forEach((item) => {
    const list = receiptItemsSold.get(item.invoId ?? "unknown") ?? [];
    list.push(item);
    receiptItemsSold.set(item.invoId ?? "unknown", list);
  });

  return {
    refundItems,
    perItemRefunds,
    totalReturnCents,
    receiptItemsSold,
  };
}
