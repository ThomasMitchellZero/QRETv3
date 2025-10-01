import React from "react";
import { Phase } from "../components/Components";

import { Card, Floorplan } from "../components/Components";
import { useTransaction } from "../logic/Logic";

//********************************************************************
//  RETURN ITEMS CARD
//********************************************************************
// Component: ReturnItemsCard
// Definition: UI card for a single returned item entry.
// Intent: Allow user to view and edit item quantity or remove the item.
// Constraints:
//   - Pure UI + dispatch to transaction state.
//   - Props must match ReturnItems repo entry.
// Inputs: { id: string; qty: number }
// Outputs: JSX card with editable qty and remove button.
export function ReturnItemsCard({ id, qty }: { id: string; qty: number }) {
  const [, dispatch] = useTransaction();

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value, 10) || 0;
    dispatch({
      type: "REPO_ACTION",
      repoAction: {
        type: "EDIT",
        target: "return-items",
        payload: { id, changes: { qty: newQty } },
      },
    });
  };

  const handleRemove = () => {
    dispatch({
      type: "REPO_ACTION",
      repoAction: {
        type: "REMOVE",
        target: "return-items",
        payload: { id },
      },
    });
  };

  return (
    <Card className="return-items-card">
      <div>
        <strong>Item #{id}</strong>
      </div>
      <div>
        Qty:{" "}
        <input type="number" value={qty} onChange={handleQtyChange} min={0} />
      </div>
      <button onClick={handleRemove} aria-label="Remove item">
        🗑️
      </button>
    </Card>
  );
}

//********************************************************************
//  RETURN ITEMS PHASE SCAFFOLD
//********************************************************************
// Component: ReturnItemsPhase
// Definition: Scaffold wrapper for the "return-items" phase of the QRET workflow.
// Intent: Provide a canonical container for the Return Items phase, ensuring correct phaseId and structure.
// Constraints:
//   - Must wrap children in the canonical Phase container.
//   - phaseId must be "return-items".
//   - No business logic or navigation; render only.
// Inputs: children (React.ReactNode)
// Outputs: JSX structure for the Return Items phase.
export function ReturnItemsPhase() {
  return (
    <Phase phaseId="return-items" title="Return Items">
      <Floorplan pageTitle="Return Items" leftColumn={null} />
    </Phase>
  );
}
