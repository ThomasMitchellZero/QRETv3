import React from "react";
import { Phase, Numpad } from "../components/Components";
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

function ReturnQtyTile({ Item }: {Item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const {itemId, qty} = Item;

  return (
    <ActorTile
      id={`return-qty-${itemId}`}
      headline={<div className="qty-display">{qty}</div>}
      style={`w-sm testes t`}
    >
      <Numpad
        onChange={(v) => {
          const current = transaction.returnItems || new Map();
          const newMap = new Map(current);
          if (newMap.has(itemId)) {
            const existingItem = newMap.get(itemId);
            newMap.set(itemId, { ...existingItem, qty: v });
            dispatch({
              kind: "SET_INPUT",
              payload: { key: "returnItems", value: newMap },
            });
          }
        }}
      />
    </ActorTile>
  );
}

export function RefundDetailsTile({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  // matching Atoms
  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );

  // Local key normalizer: never use `undefined` as a key. Keep it for data, map to a sentinel for grouping.
  const keyOf = (v: string | number | undefined) =>
    v === undefined ? "__NO_RECEIPT__" : String(v);

  // Receipted subset (truthy invoId). Note: uses data truth, not the sentinel.
  const receiptedAtoms = thisItemsAtoms.filter((a) => a.invoId != null);

  const totalQty = aggregateAtoms(thisItemsAtoms, "qty");
  const receiptedQty = aggregateAtoms(receiptedAtoms, "qty");
  const itemRefunds = aggregateAtoms(thisItemsAtoms, "valueCents");

  // Unique display keys derived from atoms using the local sentinel
  const receiptKeys = [...new Set(thisItemsAtoms.map((a) => keyOf(a.invoId)))];

  // Debug
  console.log("thisItemsAtoms AI", thisItemsAtoms);
  console.log("receiptKeys AI", receiptKeys);

  const uiRefundRows = receiptKeys.map((rk) => {
    const atomsForKey = thisItemsAtoms.filter((a) => keyOf(a.invoId) === rk);
    const thisInvoQty = aggregateAtoms(atomsForKey, "qty");
    const thisInvoValue = aggregateAtoms(atomsForKey, "valueCents");
    const label = rk === "__NO_RECEIPT__" ? "No Receipt" : `Rcpt. #${rk}`;

    return (
      <div key={rk} className="hbox space-between">
        <div>{label}</div>
        <div>{thisInvoQty}</div>
        <div>{dollarize(thisInvoValue)}</div>
      </div>
    );
  });

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
            value={dollarize(itemRefunds)}
            textAlign="right"
          />
        </div>
      }
    >
      {/* SOLO CONTENT */}
      {uiRefundRows}
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
        <RefundDetailsTile item={item} />
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
