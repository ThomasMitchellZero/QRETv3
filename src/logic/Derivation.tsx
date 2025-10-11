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
          invoId: item.invoId ?? "- -",
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
   * Multi-receipt-aware: match both item and receipt when present.
   */
  function areEqual(b: Record<string, any>, m: Record<string, any>): boolean {
    // canonical equality for blend: match both item and receipt when present
    const itemMatch = b.itemId === m.itemId;
    const invoMatch = safeValue(b.invoId) === safeValue(m.invoId);
    return itemMatch && invoMatch;
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

  function arrayToMap<T extends Record<string, any>>(
    arr: T[] | undefined,
    key: keyof T = "id"
  ): Map<string, T> {
    if (!arr || arr.length === 0) return new Map();

    const result = new Map<string, T>();
    for (const atom of arr) {
      const k = atom[key];
      if (k) result.set(String(k), atom);
    }

    return result;
  }

  // RETURNS BLEND

  const returnItemsBlend = blenderize(
    atomizedReturnItems,
    atomizedReceiptedItems
  );

  const returnItemAtoms = arrayToMap(returnItemsBlend as Item[], "itemId");

  //--------------------------------------
  // Consolidate — Consistent Map Structure
  //--------------------------------------

  /**
   * Canonical null-safe value converter for rollups & grouping.
   * Converts undefined/null into "- -" (QRET’s shared missing marker).
   */
  function safeValue<T>(value: T | undefined | null): T | string {
    return value ?? "- -";
  }

  /**
   * Filters a Map of atoms by predicate.
   * @param atomMap - Map of atoms
   * @param predicate - Function that returns true to keep the entry
   * @returns A new Map with only matching entries.
   */
  function filterMap(
    atomMap: Map<string, Record<string, any>>,
    predicate: (atom: Record<string, any>, key: string) => boolean
  ): Map<string, Record<string, any>> {
    const result = new Map<string, Record<string, any>>();
    for (const [k, v] of atomMap.entries()) {
      if (predicate(v, k)) result.set(k, v);
    }
    return result;
  }

  /**
   * Extracts unique normalized keys from an array or map of records.
   * Uses "- -" for null/undefined keys.
   * @param atoms - Iterable of atoms (Record<string, any>)
   * @param field - The field key (string)
   * @returns {string[]}
   */
  function getUniqueKeys(
    atoms: Iterable<Record<string, any>>,
    field: string
  ): string[] {
    const set = new Set<string>();
    for (const atom of atoms) {
      const raw = atom[field];
      set.add(raw == null ? "- -" : String(raw));
    }
    return Array.from(set);
  }

  /**
   * Sums the numeric values of a given field across a Map of atoms.
   * @param atomMap - Map of atoms (each a Record of consistent keys)
   * @param field - The numeric key to aggregate (e.g. "qty" or "valueCents")
   * @returns The summed total of that field.
   */
  function aggregateAtoms(
    atomMap: Map<string, Record<string, any>>,
    field: string
  ): number {
    let total = 0;
    for (const atom of atomMap.values()) {
      const val = atom[field];
      if (typeof val === "number" && !isNaN(val)) total += val;
    }
    return total;
  }

  /**
   * rollupByKey()
   * -------------------------
   * Filters a Map of atoms by a specific key/value pair,
   * then sums a numeric field across the filtered subset.
   *
   * @param atomMap - Map of flat atom records
   * @param filterField - Field to match against
   * @param filterValue - Value to match for inclusion
   * @param sumField - Numeric field to aggregate (e.g. "qty" or "valueCents")
   * @returns The numeric total of that field among matching atoms
   */
  function rollupByKey(
    atomMap: Map<string, Record<string, any>>,
    filterField: string,
    filterValue: any,
    sumField: string
  ): number {
    const subset = filterMap(
      atomMap,
      (atom) => atom[filterField] === filterValue
    );
    return aggregateAtoms(subset, sumField);
  }

  // Export helpers via hook return
  return {
    returnItemAtoms,
    aggregateAtoms,
    getUniqueKeys,
    filterMap,
    rollupByKey,
  };
}
