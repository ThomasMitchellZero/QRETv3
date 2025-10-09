import React from "react";
import { Phase } from "../components/Components";
import { fakeCatalog } from "../api/fakeApi";

import {
  Floorplan,
  ActorTile,
  Stage,
  ProductDetailsTile,
  Container,
  LabeledValue,
  type ProductDetailsTileProps,
} from "../components/Components";
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
// Component: ReturnItemsCard
// Definition: UI card for a single returned item entry.
// Now expects an `item: Item` prop.

export function RefundDetails({ item }: { item: Item }) {
  const { itemId } = item;
  const { perItemRefunds, refundItems } = useDerivation();

  // Derived data
  const refundRecord = perItemRefunds.find((r) => r.itemId === itemId);
  const matchingRefunds = refundItems.filter((r) => r.itemId === itemId);
  const receiptedQty = matchingRefunds.reduce(
    (sum, i) => sum + (i.qty ?? 0),
    0
  );
  const totalQty = item.qty ?? 0;
  const baseValue = refundRecord?.valueCents ?? 0;
  const itemRefundTotal = receiptedQty * baseValue;
  const hasReceipts = receiptedQty > 0;

  return (
    <ActorTile
      id={`item-${itemId}-refund-details`}
      style={`w-md testes t`}
      headline={
        <div className="hbox ">
          <LabeledValue
            label="Receipted"
            value={`${receiptedQty} / ${totalQty}`}
            className="fill-main"
          />
          <LabeledValue
            label="Total Refund"
            value={dollarize(itemRefundTotal)}
            textAlign="right"
          />
        </div>
      }
    >
      {/* SOLO CONTENT */}
      <div className="">
        <div className="">
          <div className="">Receipted Items</div>
          <div className="">
            {receiptedQty} / {totalQty}
          </div>
          {hasReceipts ? (
            <ul className="">
              {matchingRefunds.map((r, idx) => (
                <li key={`${r.invoId}-${idx}`}>
                  Receipt #{r.invoId} — $
                  {((r.valueCents ?? 0) / 100).toFixed(2)}
                </li>
              ))}
            </ul>
          ) : (
            <div className="">No Receipts</div>
          )}
        </div>
      </div>
    </ActorTile>
  );
}

export function ReturnItemsCard({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const [, dispatchTransients] = useTransients();
  const { itemId, qty } = item;

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value, 10) || 0;
    const current = transaction.returnItems || new Map();
    const newMap = new Map(current);
    if (newMap.has(itemId)) {
      const existingItem = newMap.get(itemId);
      newMap.set(itemId, { ...existingItem, qty: newQty });
    }
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "returnItems", value: newMap },
    });
  };

  const handleRemove = () => {
    const current = transaction.returnItems || new Map();
    const newMap = new Map(current);
    newMap.delete(itemId);
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "returnItems", value: newMap },
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchTransients({ kind: "CLEAR_TRANSIENTS", payload: { preserve: [] } });
  };

  return (
    <Container className="card hbox" onClick={handleCardClick}>
      <ProductDetailsTile item={item} hasPrice={false} />
      <Stage id={`item-${itemId}`}>
        <ActorTile
          id={`item-${itemId}-qty`}
          headline={<div className="qty-display">{qty}</div>}
          style={`w-sm`}
        >
          <input type="number" value={qty} onChange={handleQtyChange} min={0} />
        </ActorTile>
        <RefundDetails item={item} />
      </Stage>
      <button onClick={handleRemove} aria-label="Remove item">
        🗑️
      </button>
    </Container>
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
    <div className="card-ctnr ">
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
  const [transaction, dispatch] = useTransaction();
  const [phase, dispatchPhase] = useReturnItemsPhase();

  const pendingItemId = phase.pendingItemId || "";
  const pendingQty = phase.pendingQty || 1;

  const handleAdd = () => {
    if (!pendingItemId || pendingQty <= 0) return;
    const current = transaction.returnItems || new Map();
    const newMap = new Map(current);

    if (newMap.has(pendingItemId)) {
      const item = newMap.get(pendingItemId);
      newMap.set(pendingItemId, { ...item, qty: item.qty + pendingQty });
    } else {
      newMap.set(pendingItemId, { itemId: pendingItemId, qty: pendingQty });
    }

    dispatch({
      kind: "SET_INPUT",
      payload: { key: "returnItems", value: newMap },
    });

    // Reset the local phase fields
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
