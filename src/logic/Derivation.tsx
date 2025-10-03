//TEXTCANON

/*
Atomization Contract (Agreed)

- Atomization is enrichment-only.
  Each pass takes an existing set of Atoms and attaches new distinguishing properties.
  It never mutates or removes upstream properties, and it never alters the cart itself.

- Survival is deferred.
  Atoms that cannot be matched/enriched in a given pass still receive the new property,
  but with an empty/null/undefined value. No filtering occurs during atomization.

- Filtering and rollups happen downstream.
  Consumers decide how to treat Atoms with missing props (e.g., filter out atoms with
  no receiptId, partition by returnReason, roll up values). This keeps logic out of
  the atomizer itself.

- Monotonic enrichment.
  Every atomization layer guarantees the same number of Atoms out as in. Each layer
  only accretes properties; no merges, no deletions.

This makes the atomizer "dumb": always same-length in/out, always attaches new props,
never performs business logic. All elimination, aggregation, or interpretation is
deferred to explicit downstream helpers.
*/

import { fakeCatalog } from "../api/fakeApi";
import type { BaseItem, Invoice, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";

type Atom = {
  atomId: string /* Do we even need this?  There are going to be duplicates, so what would this even represent?
  // maybe a light help function that will generate a unique atomId?

  // Perhaps this is like a standard that all atoms should follow to ensure successful atomization?

  ?? FttB, we are only atomizing around Items.  
    However, we'll eventually have to do it for other things.  Takeaway is that we can't necessarily have depend on Item-like conventions.

    This all gets an awful lot easier if we don't have to do any additional info beyond just merging the items.  And really, shouldn't it be the case?  Each layer of atomization is intended to apply a different definition of "same" until we have made every relevant distinction our code will consume.



  */;
};

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

      -We've agreed that a data-only type is appropriate.
        -The atom itself does not need to contain 2 items.  Only in comparison does the 2-item structure even appear.  
        -
    

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

    -The other things I do in the Repos is store ONLY data that comes from the users.  We would still use the TYPE, but we should never duplicate data if we can just get it by key.  So we would never add item details or invoice details to a repo or derived list.  These are things we'd pull from data right before it's rendered in the UI.

    



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

//------------------------------
// Layer 2: Intersections + Enrichment
//------------------------------

//--------------------------------------
// Layer 3: Rollups
//--------------------------------------

/*

  A function that takes an Atomized set, and then loops through and totals specified increment(s?)



*/

// Monkey want banana
