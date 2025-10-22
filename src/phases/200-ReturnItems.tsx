import React from "react";
import { Phase, Numpad } from "../components/Components";
import { fakeCatalog } from "../api/fakeApi";
import { cloneDeep } from "lodash";

import {
  Floorplan,
  ProductDetailsTile,
  LabeledValue,
} from "../components/Components";

import { Stage, Actor, useInterlude, Dialog } from "../logic/Interlude";
import { useTransaction, useReturnItemsPhase, dollarize } from "../logic/Logic";

import type { Item } from "../types/Types";

import { useDerivation } from "../logic/Derivation";

//********************************************************************
//  RETURN QTY
//********************************************************************

function ReturnQtyScene(itemId: string) {
  return { [`return-qty-${itemId}`]: true };
}

function ReturnQtyTile({ item }: { item: Item }) {
  const { itemId, qty } = item;

  const scene = ReturnQtyScene(itemId);

  return (
    <Actor id={`return-qty-${itemId}`} scene={scene} className={`w-sm`}>
      <LabeledValue label="Return Qty" textAlign="left" value={`${qty}`} />
    </Actor>
  );
}

export function ReturnQtyDialog({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId, qty } = item;

  return (
    <Dialog
      id={`return-qty-dialog-${itemId}`}
      className={`dialog align-start`}
      scene={ReturnQtyScene(itemId)}
    >
      <Numpad
        value={transaction.returnItems?.get(itemId)?.qty ?? 0}
        onChange={(v) => {
          const next = new Map(transaction.returnItems);
          const existing = next.get(itemId);
          if (existing) next.set(itemId, { ...existing, qty: v });
          dispatch({
            kind: "SET_INPUT",
            payload: { key: "returnItems", value: next },
          });
        }}
      />
    </Dialog>
  );
}

//********************************************************************
//  Refund Details
//********************************************************************

const refundDetailsSwift = {
  /*

  You’re focused solely on RefundDetailsTile and RefundDetailsDialog in 200-ReturnItems.
Both currently share intertwined logic—data, state, and rendering responsibilities mixed together.
Your goal:
	•	Split the Tile (the clickable Actor) and the Dialog (the expanding detail view).
	•	Preserve all working logic (refund data, calculations, interactivity).
	•	Avoid duplicating or desynchronizing shared logic.
	•	Limit work to ~15 minutes, prioritizing reliability over elegance.

Target outcome:
	•	RefundDetailsTile = lightweight trigger (renders summary info, dispatches Interlude scene).
	•	RefundDetailsDialog = separate component (renders full details, reads same props/context).
	•	Shared logic (e.g. refund total computation) lives in a pure helper function or a custom hook—whichever is faster to extract.

Constraints:
	•	No changes to global architecture.
	•	Must remain consistent with current Interlude (Scene-driven visibility).
	•	Keep refactor local to 200-ReturnItems.

Approach summary:
	1.	Identify shared logic inside RefundDetailsTile (like calculations).
	2.	Extract that logic to a useRefundDetails() helper/hook file in the same directory. (~5 min)
	3.	Pass the hook’s return values into both components. (~5 min)
	4.	Replace Dialog conditional rendering with isActive(sceneKey) from Interlude. (~3–5 min)

End result: two clean, independent components connected by one small shared logic module.

*/
};

const refundDetailsScene = (itemId: string) => ({
  [`refund-details-${itemId}`]: true,
});

export function RefundDetailsTile({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );

  const receiptedAtoms = thisItemsAtoms.filter((a) => a.invoId != null);

  const totalQty = aggregateAtoms(thisItemsAtoms, "qty");
  const receiptedQty = aggregateAtoms(receiptedAtoms, "qty");
  const itemRefunds = aggregateAtoms(thisItemsAtoms, "valueCents");
  const scene = refundDetailsScene(itemId);

  return (
    <Actor
      id={`refund-details-${itemId}`}
      scene={scene}
      className={`w-md  align-center`}
    >
      <div className="hbox w-md">
        <LabeledValue
          label="Receipted"
          value={`${receiptedQty} / ${totalQty}`}
          className="fill-main"
        />
        <LabeledValue
          label="Total Refund"
          value={dollarize(itemRefunds)}
          textAlign="right"
        />
      </div>
    </Actor>
  );
}

export function RefundDetailsDialog({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );
  const keyOf = (v: string | number | undefined) =>
    v === undefined ? "__NO_RECEIPT__" : String(v);

  const receiptKeys = [...new Set(thisItemsAtoms.map((a) => keyOf(a.invoId)))];

  const scene = { [`refund-details-${itemId}`]: true };

  const refundRows = receiptKeys.map((rk) => {
    const atomsForKey = thisItemsAtoms.filter((a) => keyOf(a.invoId) === rk);
    const thisInvoQty = aggregateAtoms(atomsForKey, "qty");
    const thisInvoValue = aggregateAtoms(atomsForKey, "valueCents");
    const label = rk === "__NO_RECEIPT__" ? "No Receipt" : `Rcpt. #${rk}`;
    const labelStyle = rk === "__NO_RECEIPT__" ? "text-critical" : "";
    const valueStyle =
      rk === "__NO_RECEIPT__" ? "text-critical" : "text-success";

    return (
      <div key={rk} className="hbox gap-8rpx fill-cross">
        <div
          className={`fill-main ${labelStyle}`}
        >{`${label} x ${thisInvoQty}`}</div>
        <div className={`text ${valueStyle} subtitle bold`}>
          {dollarize(thisInvoValue)}
        </div>
      </div>
    );
  });

  return (
    <Dialog
      id={`refund-details-${itemId}`}
      scene={scene}
      className={`w-md`}
      rowClassName={`align-center`} // related actor is near the middle.
    >
      {refundRows}
    </Dialog>
  );
}

export function ReturnItemsCard({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId } = item;

  // Local interaction boundary for this item
  const scene = { [`item-${itemId}`]: true };

  return (
    <div className="card hbox gap-16rpx">
      {/* Static header: not part of Interlude */}
      <ProductDetailsTile item={item} hasPrice={false} />

      {/* Localized interaction zone */}
      <Stage id={`stage-${itemId} `} scene={scene} className="fill-main">
        <div className={`hbox`}>
          <ReturnQtyTile item={item} />
          <RefundDetailsTile item={item} />
        </div>
        {/* Dialogs */}

        <RefundDetailsDialog item={item} />
        <ReturnQtyDialog item={item} />
      </Stage>

      {/* Cleanup actions (non-Interlude) */}
      <div className="hbox justify-end align-start">
        <button
          className="btn--outline h-sm text title"
          onClick={() => {
            const next = new Map(transaction.returnItems);
            next.delete(itemId);
            dispatch({
              kind: "SET_INPUT",
              payload: { key: "returnItems", value: next },
            });
          }}
        >
          x
        </button>
      </div>
    </div>
  );
}
// ================================
// RETURN ITEMS LIST
// ================================

function ReturnItemsList() {
  const [transaction] = useTransaction();
  const repo = transaction.returnItems;
  const itemsMap: Map<string, Item> =
    repo instanceof Map ? repo : new Map(Object.entries(repo || {}));
  return (
    <div className="card-ctnr gap-16rpx">
      {Array.from(itemsMap.values()).map((item: Item) => (
        <ReturnItemsCard key={item.itemId} item={item} />
      ))}
    </div>
  );
}

// ================================
// ITEM ENTRY
// ================================

function ItemEntry() {
  const [, dispatch] = useTransaction();
  const [phase, dispatchPhase] = useReturnItemsPhase();

  const pendingItemId = phase.pendingItemId || "";
  const pendingQty = phase.pendingQty || 1;

  const handleAdd = () => {
    if (!pendingItemId || pendingQty <= 0) return;
    const newItem: Item = {
      itemId: pendingItemId,
      qty: pendingQty,
      valueCents: undefined,
      invoId: undefined,
    };
    dispatch({ kind: "ADD_ITEM", payload: newItem });
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingItemId", value: "" },
    });
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingQty", value: 1 },
    });
  };

  // Why is the Muggle's model of the time involved in UI work so skewed?
  return (
    <>
      <div className="catalog-items-list">
        Available Item IDs: {Object.keys(fakeCatalog).join(", ")}
      </div>
      <div className="item-entry">
        <input
          type="text"
          placeholder="Item #"
          value={pendingItemId}
          onChange={(e) =>
            dispatchPhase({
              kind: "SET_LOCAL",
              payload: { key: "pendingItemId", value: e.target.value },
            })
          }
        />
        <input
          type="number"
          min={1}
          value={pendingQty}
          onChange={(e) =>
            dispatchPhase({
              kind: "SET_LOCAL",
              payload: {
                key: "pendingQty",
                value: parseInt(e.target.value, 10) || 1,
              },
            })
          }
        />
        <button onClick={handleAdd}>Add Item</button>
      </div>
    </>
  );
}

//********************************************************************
//  RETURN ITEMS PHASE SCAFFOLD
//********************************************************************

export function ReturnItemsPhase() {
  return (
    <Phase phaseId="return-items" title="Return Items">
      <Floorplan
        pageTitle="Return Items"
        mainContent={<ReturnItemsList />}
        rightColumn={<ItemEntry />}
      />
    </Phase>
  );
}
