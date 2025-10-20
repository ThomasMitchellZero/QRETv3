import React from "react";
import { Phase, Numpad } from "../components/Components";
import { fakeCatalog } from "../api/fakeApi";
import { cloneDeep } from "lodash";

import {
  Floorplan,
  ProductDetailsTile,
  LabeledValue,
  type ProductDetailsTileProps,
} from "../components/Components";

import { Stage, Actor, useInterlude, Dialog } from "../logic/Interlude";
import {
  useTransaction,
  useReturnItemsPhase,
  useTransients,
  dollarize,
} from "../logic/Logic";

import type { Item } from "../types/Types";

import { useDerivation } from "../logic/Derivation";

//********************************************************************
//  RETURN ITEMS CARD
//********************************************************************

function ReturnQtyTile({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId, qty } = item;

  const scene = { [`return-qty-${itemId}`]: true };

  return (
    <Actor
      id={`return-qty-${itemId}`}
      scene={scene}
      headline={
        <LabeledValue label="Return Qty" textAlign="left" value={`${qty}`} />
      }
      dialog={
        <Dialog id={`return-qty-dialog-${itemId}`} scene={scene}>
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
      }
      className="vbox w-sm"
    />
  );
}

export function RefundDetailsTile({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );
  const keyOf = (v: string | number | undefined) =>
    v === undefined ? "__NO_RECEIPT__" : String(v);
  const receiptedAtoms = thisItemsAtoms.filter((a) => a.invoId != null);

  const totalQty = aggregateAtoms(thisItemsAtoms, "qty");
  const receiptedQty = aggregateAtoms(receiptedAtoms, "qty");
  const itemRefunds = aggregateAtoms(thisItemsAtoms, "valueCents");
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
      <div key={rk} className="hbox gap-8rpx fill-main">
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
    <Actor
      id={`refund-details-${itemId}`}
      scene={scene}
      headline={
        <div className="hbox">
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
      }
      dialog={
        <Dialog id={`refund-dialog-${itemId}`} scene={scene}>
          <div className="vbox gap-8rpx">
            <div className="divider-h" />
            {refundRows}
          </div>
        </Dialog>
      }
      className="vbox w-md"
    />
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
      <Stage id={`stage-${itemId}`} scene={scene} className="hbox gap-8rpx">
        <ReturnQtyTile item={item} />
        <RefundDetailsTile item={item} />
      </Stage>

      {/* Footer actions (non-Interlude) */}
      <div className="hbox fill-main justify-end align-start">
        <button
          className="btn--outline h-sm text"
          onClick={() => {
            const next = new Map(transaction.returnItems);
            next.delete(itemId);
            dispatch({
              kind: "SET_INPUT",
              payload: { key: "returnItems", value: next },
            });
          }}
        >
          🗑️ Remove
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
