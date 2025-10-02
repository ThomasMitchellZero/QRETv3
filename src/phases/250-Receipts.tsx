import React from "react";
import { Phase } from "../components/Components";
import { Card, Floorplan } from "../components/Components";
import { useTransaction } from "../logic/Logic";

//********************************************************************
//  RECEIPTS CARD
//********************************************************************
// Component: ReceiptsCard
// Definition: UI card for a single receipt entry.
// Intent: Allow user to view the receipt id and remove it.
// Constraints:
//   - Pure UI + dispatch to transaction state.
//   - Props: { id: string }
// Inputs: { id: string }
// Outputs: JSX card with receipt id and remove button.
function ReceiptsCard({ id }: { id: string }) {
  const [, dispatch] = useTransaction();
  const handleRemove = () => {
    dispatch({
      type: "REPO_ACTION",
      repoAction: {
        type: "REMOVE",
        target: "receipts",
        payload: { id },
      },
    });
  };
  return (
    <Card className="return-items-card">
      <div>
        <strong>Receipt #{id}</strong>
      </div>
      <button onClick={handleRemove} aria-label="Remove receipt">
        🗑️
      </button>
    </Card>
  );
}

// ================================
// RECEIPTS LIST
// ================================
// Component: ReceiptsList
// Definition: List of all receipts currently in the transaction repo.
// Intent: Map the "receipts" repo and display each using ReceiptsCard.
// Constraints:
//   - Must read from transaction.userInputs["receipts"].
//   - Must coerce repo to a Map if needed.
function ReceiptsList() {
  const [transaction] = useTransaction();
  const repo = transaction.userInputs["receipts"];
  const receiptsMap: Map<string, any> =
    repo instanceof Map
      ? repo
      : new Map(repo && typeof repo === "object" ? Object.entries(repo) : []);
  return (
    <div className="return-items-list">
      {Array.from(receiptsMap.values()).map((receipt: any) => (
        <ReceiptsCard key={receipt.id} id={receipt.id} />
      ))}
    </div>
  );
}

// ================================
// RECEIPT ENTRY
// ================================
// Component: ReceiptEntry
// Definition: Local form for adding a receipt by id.
// Intent: Collect receipt id, then push to TransactionState when valid.
// Constraints:
//   - Local state only until Add button pressed.
// Inputs: none
// Outputs: Dispatches ADD action with { id } payload.
function ReceiptEntry() {
  const [, dispatch] = useTransaction();
  const [id, setId] = React.useState("");

  const handleAdd = () => {
    if (!id) return;
    dispatch({
      type: "REPO_ACTION",
      repoAction: {
        type: "ADD",
        target: "receipts",
        payload: { id },
      },
    });
    setId("");
  };

  return (
    <div className="item-entry">
      <input
        type="text"
        placeholder="Receipt #"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleAdd}>Add Receipt</button>
    </div>
  );
}

//********************************************************************
//  RECEIPTS PHASE SCAFFOLD
//********************************************************************
// Component: ReceiptsPhase
// Definition: Scaffold wrapper for the "receipts" phase of the QRET workflow.
// Intent: Provide a canonical container for the Receipts phase, ensuring correct phaseId and structure.
// Constraints:
//   - Must wrap children in the canonical Phase container.
//   - phaseId must be "receipts".
//   - No business logic or navigation; render only.
// Inputs: children (React.ReactNode)
// Outputs: JSX structure for the Receipts phase.
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
