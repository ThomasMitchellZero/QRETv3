import React from "react";
import { cloneDeep } from "lodash";

import {
  Phase,
  LabeledValue,
  Container,
  Floorplan,
  Stage,
  ActorTile,
} from "../components/Components";
import { useTransaction, dollarize } from "../logic/Logic";
import type { Invoice } from "../types/Types";
import { fakeInvoices } from "../api/fakeApi";

// ================================
// RECEIPT CARD
// ================================
type ReceiptCardProps = { invoice: Invoice };

function ReceiptCard({ invoice }: ReceiptCardProps) {
  const [transaction, dispatch] = useTransaction();
  const { invoId, items } = invoice;

  const totalQty = items.reduce((sum, item) => sum + (item.qty ?? 0), 0);
  const totalValueCents = items.reduce(
    (sum, item) => sum + (item.valueCents ?? 0),
    0
  );

  const handleRemove = () => {
    const receipts = transaction.receipts ?? new Map();
    const next = cloneDeep(receipts);
    next.delete(invoId);
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: next },
    });
  };

  return (
    <Container className="card hbox">
      <LabeledValue
        label="Receipt #"
        value={invoId}
        className="fill-main w-md"
      />

      <Stage id={`receipt-${invoId}`}>
        <ActorTile
          id={`receipt-${invoId}-items`}
          headline={
            <div className="hbox space-between">
              <LabeledValue
                className="fill-main"
                label="Items Sold:"
                textAlign="left"
                value={String(totalQty)}
              />
              <LabeledValue
                className="w-sm"
                textAlign="right"
                label="Receipt Value:"
                value={dollarize(totalValueCents)}
              />
            </div>
          }
        >
          <div className="vbox">
            {items.map((item) => (
              <div key={item.itemId} className="hbox space-between">
                <span>ID: {item.itemId}</span>
                <span>Qty: {item.qty}</span>
              </div>
            ))}
          </div>
        </ActorTile>
      </Stage>

      <button onClick={handleRemove} aria-label="Remove receipt">
        🗑️
      </button>
    </Container>
  );
}

// ================================
// RECEIPT LIST
// ================================
function ReceiptList() {
  const [transaction] = useTransaction();
  const receipts = transaction.receipts ?? new Map();

  if (!receipts.size)
    return <div className="text title center fill">No Receipts Added</div>;

  return (
    <div className="card-ctnr">
      {Array.from(receipts.values()).map((invoice: Invoice) => (
        <ReceiptCard key={invoice.invoId} invoice={invoice} />
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
    const receipts = transaction.receipts ?? new Map();
    if (receipts.has(id)) return; // ignore duplicates
    const next = cloneDeep(receipts);
    next.set(id, fakeInvoices[id] ?? { invoId: id, items: [] });
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: next },
    });
    setId("");
  };

  return (
    <>
      <div className="text body">
        Available Receipt IDs: {Object.keys(fakeInvoices).join(", ")}
      </div>
      <div className="hbox">
        <input
          type="text"
          placeholder="Receipt #"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </>
  );
}

// ================================
// RECEIPTS PHASE
// ================================
export function ReceiptsPhase() {
  return (
    <Phase phaseId="receipts" title="Receipts">
      <Floorplan
        pageTitle="Receipts"
        mainContent={<ReceiptList />}
        rightColumn={<ReceiptEntry />}
      />
    </Phase>
  );
}
