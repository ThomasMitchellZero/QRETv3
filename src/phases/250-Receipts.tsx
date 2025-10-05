import { fakeInvoices, fakeCatalog } from "../api/fakeApi";
import React from "react";
import { Phase } from "../components/Components";
import { Card, Floorplan, Stage, ActorTile } from "../components/Components";
import { useTransaction } from "../logic/Logic";
import { useDerivation } from "../logic/Derivation";

// ================================
// RECEIPTS CARD
// ================================
function ReceiptsCard({ invoId }: { invoId: string }) {
  const [transaction, dispatch] = useTransaction();
  const items = fakeInvoices[invoId]?.items ?? [];
  const totalQty = items.reduce((sum: number, item: any) => sum + item.qty, 0);

  const handleRemove = () => {
    const current = transaction.receipts || new Map();
    const newMap = new Map(current);
    newMap.delete(invoId);

    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: newMap },
    });
  };

  const actorTileChildren = (
    <div className="receipt-items-list">
      {items.map((item) => (
        <button
          key={item.itemId}
          className="receipt-item-btn"
        >{`ID: ${item.itemId} Qty: ${item.qty}`}</button>
      ))}
    </div>
  );

  return (
    <Card className="return-items-card">
      <div>
        <strong>Receipt #{invoId}</strong>
      </div>
      <Stage key={`receipt-${invoId}`} id={`receipt-${invoId}`}>
        <ActorTile
          key={`receipt-${invoId}-items`}
          id={`receipt-${invoId}-items`}
          headline={<div className="qty-display">{totalQty}</div>}
        >
          {actorTileChildren}
        </ActorTile>
      </Stage>
      <button onClick={handleRemove} aria-label="Remove receipt">
        🗑️
      </button>
    </Card>
  );
}

// ================================
// RECEIPTS LIST
// ================================
function ReceiptsList() {
  const [transaction] = useTransaction();
  const repo = transaction.receipts;
  const receiptsMap: Map<string, any> =
    repo instanceof Map ? repo : new Map(Object.entries(repo || {}));

  return (
    <div className="return-items-list">
      {Array.from(receiptsMap.values()).map((receipt: any) => (
        <ReceiptsCard key={receipt.invoId} invoId={receipt.invoId} />
      ))}
    </div>
  );
}

// ================================
// RECEIPT ENTRY
// ================================
function ReceiptEntry() {
  const [transaction, dispatch] = useTransaction();
  const [id, setId] = React.useState("");

  const handleAdd = () => {
    if (!id) return;
    const current = transaction.receipts || new Map();
    const newMap = new Map(current);

    if (!newMap.has(id)) {
      newMap.set(id, { invoId: id, items: [] });
    }

    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: newMap },
    });

    setId("");
  };

  return (
    <>
      <div className="receipts-list-ids">
        Available Receipt IDs: {Object.keys(fakeInvoices).join(", ")}
      </div>
      <div className="item-entry">
        <input
          type="text"
          placeholder="Receipt #"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={handleAdd}>Add Receipt</button>
      </div>
    </>
  );
}

export function ReceiptsPhase() {
  return (
    <Phase phaseId="receipts" title="Receipts">
      <Floorplan
        pageTitle="Receipts"

        mainContent={<ReceiptsList />}
        rightColumn={<ReceiptEntry />}
      />
    </Phase>
  );
}
