import React from "react";
import { Phase } from "../components/Components";
import { Floorplan, Tile } from "../components/Components";
import { useTransaction } from "../logic/Logic";
import { fakeCatalog, fakeInvoices } from "../api/fakeApi";
import type { Item, Invoice } from "../types/Types";

export function StartPhase() {
  const [, dispatch] = useTransaction();

  const handleFastFill = () => {
    // Build receipts Map from fakeInvoices
    const receipts = new Map<string, Invoice>(
      Object.entries(fakeInvoices).map(([id, inv]) => [id, inv])
    );

    // Create a few return items from catalog
    const sampleItems: Item[] = Object.values(fakeCatalog)
      .slice(0, 5) // grab first 5 catalog items
      .map((entry) => ({
        itemId: entry.itemId,
        qty: Math.ceil(Math.random() * 3),
      }));

    const returnItems = new Map<string, Item>(
      sampleItems.map((item) => [item.itemId, item])
    );

    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: receipts },
    });
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "returnItems", value: returnItems },
    });

    console.log("🚀 FastFill complete", { receipts, returnItems });
  };

  return (
    <Phase phaseId="start" title="Start">
      <Floorplan
        pageTitle="Start"
        mainContent={
          <div className="card-ctnr">
            <button onClick={handleFastFill}>⚡ FastFill</button>
          </div>
        }
      />
    </Phase>
  );
}
