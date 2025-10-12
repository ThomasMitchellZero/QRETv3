import React from "react";
import type { Item, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";
import { fakeInvoices } from "../api/fakeApi";

// =====================================================
// useDerivation — deterministic, type-preserving pipeline
// =====================================================

export function useDerivation() {
  const [transaction] = useTransaction();
  // -------------------------------
  // Layer 0 — Collect
  // -------------------------------
  const trxnReturnItems = transaction?.returnItems ?? new Map();
  const trxnReceipts = transaction?.receipts ?? new Map();

  // -------------------------------
  // Layer 1 — Normalize
  // -------------------------------
  function normalizeReturnItems(): Item[] {
    return Array.from(trxnReturnItems.values()).map((i) => {
      return {
        ...i,
        valueCents: i.valueCents ?? 0,
        invoId: i.invoId ?? undefined,
      };
    });
  }

  function normalizeReceiptedItems(): Item[] {
    const receipts = [...trxnReceipts.values()].map((inv) => {
      const full = fakeInvoices[inv.invoId];
      return full ?? inv;
    });
    return receipts.flatMap((invoice) => invoice.items || []);
  }

  const normalizedReturnItems = normalizeReturnItems();
  const normalizedReceiptedItems = normalizeReceiptedItems();

  // -------------------------------
  // Layer 2 — Atomize
  // -------------------------------
  // Expands quantity to one record per unit.
  function atomize(items: Item[]): Item[] {
    const atoms: Item[] = [];
    for (const i of items) {
      const qty = i.qty ?? 1;
      for (let n = 0; n < qty; n++) {
        atoms.push({
          ...i,
          qty: 1,
        });
      }
    }
    return atoms;
  }

  const atomizedReturnItems = atomize(normalizedReturnItems);
  const atomizedReceiptedItems = atomize(normalizedReceiptedItems);

  // -------------------------------
  // Layer 3 — Blend (Substitution)
  // -------------------------------

  // =====================================================
  // Blenderize — one-time substitution layer
  // =====================================================
  // Definition:
  //   Performs one-to-one substitution of mixer elements into
  //   the persistent blend array, based on an equality predicate.
  //   Each mixer element can be used once only.
  // Constraints:
  //   - No mutations to source arrays
  //   - Deterministic order and output length
  //   - Type-preserving; equality defined externally
  // =====================================================

  function blenderize<T>(
    blend: T[],
    mixer: T[],
    isEqual: (a: T, b: T) => boolean
  ): T[] {
    const used = new Set<T>(); // ledger of consumed mixer elements
    return blend.map((b) => {
      const match = mixer.find((m) => !used.has(m) && isEqual(b, m));
      if (match) {
        used.add(match); // mark it consumed
        return match; // substitute richer equivalent
      }
      return b; // pass through unchanged
    });
  }

  const returnItemAtoms = blenderize(
    atomizedReturnItems,
    atomizedReceiptedItems,
    (a, b) => a.itemId == b.itemId
  );

  // -------------------------------
  // Layer 4 — Helpers
  // -------------------------------
  // Only helpers that extend Array semantics in meaningful ways.
  function getUniqueKeys<T extends object>(
    arr: T[],
    key: keyof T
  ): (string | number | undefined)[] {
    return [...new Set(arr.map((a) => a[key] as string | number | undefined))];
  }

  function aggregateAtoms<T extends object>(arr: T[], field: keyof T): number {
    const output = arr.reduce((acc, a) => {
      const val = Number(a[field]);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return output;
  }

  function rollupByKey<T extends object>(
    arr: T[],
    filterField: keyof T,
    filterValue: any,
    sumField: keyof T
  ): number {
    return aggregateAtoms(
      arr.filter((a) => a[filterField] === filterValue),
      sumField
    );
  }

  // No filterMap wrapper; native Array.filter is sufficient.

  // -------------------------------
  // Exports
  // -------------------------------
  return {
    returnItemAtoms,
    aggregateAtoms,
    getUniqueKeys,
    rollupByKey,
  };
}
