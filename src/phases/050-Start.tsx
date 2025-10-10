// ================================================
// 050-Start.tsx — Transaction Bootstrap Phase
// Definition: Canonical starting phase for QRET.
// Intent: Provide deterministic demo seeding buttons
//         for items, receipts, and full FastFill loads.
// Constraints:
//   - Uses only canonical TransactionState reducers.
//   - Uses standard Map convention for all repos.
//   - Avoids modifying reducer logic or core Logic.tsx.
// Inputs: User clicks on phase controls.
// Outputs: Updated TransactionState with dummy data.
// ================================================

import React from "react";
import { Phase, Floorplan } from "../components/Components";
import { useTransaction } from "../logic/Logic";
import { fakeCatalog, getFakeInvoicesMap } from "../api/fakeApi";
import type { Item, Invoice } from "../types/Types";

// --------------------------------------------------
//  Helpers: State Injection
// --------------------------------------------------

/** Adds a provided Map of Items to TransactionState.returnItems */
function addItemsToTransaction(
  dispatch: Function,
  itemsMap: Map<string, Item>
) {
  dispatch({
    kind: "SET_INPUT",
    payload: { key: "returnItems", value: new Map(itemsMap) },
  });
}

/** Adds a provided Map of Invoices to TransactionState.receipts */
function addReceiptsToTransaction(
  dispatch: Function,
  receiptsMap: Map<string, Invoice>
) {
  dispatch({
    kind: "SET_INPUT",
    payload: { key: "receipts", value: new Map(receiptsMap) },
  });
}

/** Adds both items and receipts to TransactionState */
function addItemsAndReceiptsToTransaction(
  dispatch: Function,
  itemsMap: Map<string, Item>,
  receiptsMap: Map<string, Invoice>
) {
  addItemsToTransaction(dispatch, itemsMap);
  addReceiptsToTransaction(dispatch, receiptsMap);
}

/** Canonical "Fast Fill" — loads both canonical receipts (99988, 99977)
 *  and several demo return items from the fake catalog. */
function fastFill(dispatch: Function) {
  // Explicit dummy artifacts (deterministic, not random)
  const itemsMap = new Map<string, Item>([
    ["1122", { itemId: "1122", qty: 1 }],
    ["2233", { itemId: "2233", qty: 2 }],
    ["3344", { itemId: "3344", qty: 1 }],
  ]);

  const invoicesMap = getFakeInvoicesMap();

  addItemsAndReceiptsToTransaction(dispatch, itemsMap, invoicesMap);
}

// --------------------------------------------------
//  UI: Start Phase
// --------------------------------------------------

export function StartPhase() {
  const [, dispatch] = useTransaction();

  return (
    <Phase phaseId="start" title="Start Transaction">
      <Floorplan
        pageTitle="Start Phase"
        mainContent={
          <div className="vbox padding-24rpx">
            <h2>Demo Setup</h2>
            <p>
              Use the buttons below to populate this demo transaction with
              canonical data.
            </p>

            <div className="hbox gap-16rpx">
              <button
                className="btn--primary"
                onClick={() =>
                  addItemsToTransaction(
                    dispatch,
                    new Map([
                      ["1122", { itemId: "1122", qty: 2 }],
                      ["2233", { itemId: "2233", qty: 1 }],
                    ])
                  )
                }
              >
                Add Items
              </button>

              <button
                className="btn--secondary"
                onClick={() =>
                  addReceiptsToTransaction(dispatch, getFakeInvoicesMap())
                }
              >
                Add Receipts
              </button>

              <button
                className="btn--outline"
                onClick={() => fastFill(dispatch)}
              >
                Fast Fill (Items + Receipts)
              </button>
            </div>
          </div>
        }
      />
    </Phase>
  );
}
