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
import type { Item, Invoice, TransactionState } from "../types/Types";
import { useTransaction } from "./Logic";

/* 

  // Dictionary:
    *Collapse: If two atoms share all overlapping properties with identical values, they collapse into one canonical atom.

  //The Atom.  An indivisible unit of data.  It must progressively accrete properties, but never lose them.
  -Atoms DO NOT have their own identifier.  
    -If you need to identify an atom, you have failed to normalize your data.
    -Atoms must be flat.  Any atom property must be a single primitive value (string, number, boolean, null/undefined).

*/

/*


  //Atomization Layer
    -Normalized data is disassembled into an equal mass of Atoms by the smallest indivisible increment.

*/

/*


  // Enrichment Layer



   -No properties can be removed or altered.  If you need to change properties in the logic, you have failed to normalize your data.
  -The same quantity of atoms should flow into and out of each layer.
  -
*/

//--------------------------------------
// Helpers
//--------------------------------------

//------------------------------
// Layer 1: Normalize Data
//------------------------------

// ReturnItems : Good as-is.

//------------------------------
// Layer 2: Atomize Data
//------------------------------
/*
    -Normalized entries are disassembled into a Map of Atoms by the smallest indivisible increment.
*/

// core atomization function(){} // slice that array into individual atoms

// Atomize ReturnItems by qty(){}

// Atomize ReceiptedItems by qty(){}

//------------------------------
// Layer 3: Enrichment
//------------------------------

/*
   -The Enrichment layer contains all cycles that add at least one new property to each Atom passed in.
    -Enrichment can be conditional, but the condition is always an equality check between 2 atoms.
      -In addition, that logic can only determines the values within the Type being merged - either an empty default or something else.  In either case, the quantity of atoms is unchanged from beginning to end.
  
    -Enrichments are divided in xxx.  In a chute:
      -subsequent layers can depend on properties added in previous layers.
      -the quantity of atoms is unchanged from beginning to end.
*/

// the default enrichment function(){}

// Start the ReturnItems chute here.

// Enrich ReturnItems by ReceiptedItems on === item-id(){}

//--------------------------------------
// Layer 3: Rollups
//--------------------------------------

/*




*/
