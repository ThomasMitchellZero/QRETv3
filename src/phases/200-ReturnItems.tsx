import React from "react";
import { Phase } from "../components/Components";

import { Card, Floorplan, ActorTile } from "../components/Components";
import { useTransaction, useReturnItemsPhase } from "../logic/Logic";

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
      <div className="item-id PLACEHOLDER">
        <strong>Item #{id}</strong>
      </div>
      <ActorTile id={id}>
        {/* ActorTile will render one of these based on solo state */}
        {({ isSolo }: { isSolo: boolean }) =>
          isSolo ? (
            <input
              type="number"
              value={qty}
              onChange={handleQtyChange}
              min={0}
            />
          ) : (
            <div className="qty-display">{qty}</div>
          )
        }
      </ActorTile>
      <button onClick={handleRemove} aria-label="Remove item">
        🗑️
      </button>
    </Card>
  );
}

// ================================
// RETURN ITEMS LIST
// ================================
// Component: ReturnItemsList
// Definition: List of all return items currently in the transaction repo.
// Intent: Map the "return-items" repo and display each item using ReturnItemsCard.
// Constraints:
//   - Must read from transaction.userInputs["return-items"].
//   - Must coerce repo to a Map if needed.
// Inputs: none
// Outputs: List of ReturnItemsCard components.
function ReturnItemsList() {
  const [transaction] = useTransaction();
  const repo = transaction.userInputs["return-items"];
  const itemsMap: Map<string, any> =
    repo instanceof Map ? repo : new Map(Object.entries(repo || {}));

  return (
    <div className="return-items-list">
      {Array.from(itemsMap.values()).map((item: any) => (
        <ReturnItemsCard key={item.id} id={item.id} qty={item.qty} />
      ))}
    </div>
  );
}

// ================================
// ITEM ENTRY
// ================================
// Component: ItemEntry
// Definition: Local form for adding a return item by id and qty.
// Intent: Collect item details, then push to TransactionState when valid.
// Constraints:
//   - Local state only until Add button pressed.
//   - Populates same type used by ReturnItemsCard and "return-items" repo.
// Inputs: none
// Outputs: Dispatches ADD action with { id, qty } payload.
function ItemEntry() {
  const [, dispatch] = useTransaction();
  const [phase, dispatchPhase] = useReturnItemsPhase();

  const pendingItemId = phase.pendingItemId || "";
  const pendingQty = phase.pendingQty || 1;

  const handleAdd = () => {
    if (!pendingItemId || pendingQty <= 0) return;
    dispatch({
      type: "REPO_ACTION",
      repoAction: {
        type: "ADD",
        target: "return-items",
        payload: { id: pendingItemId, qty: pendingQty },
      },
    });
    // Reset local entry fields
    dispatchPhase({ type: "SET_LOCAL", key: "pendingItemId", value: "" });
    dispatchPhase({ type: "SET_LOCAL", key: "pendingQty", value: 1 });
  };

  return (
    <div className="item-entry">
      <input
        type="text"
        placeholder="Item #"
        value={pendingItemId}
        onChange={(e) =>
          dispatchPhase({
            type: "SET_LOCAL",
            key: "pendingItemId",
            value: e.target.value,
          })
        }
      />
      <input
        type="number"
        min={1}
        value={pendingQty}
        onChange={(e) =>
          dispatchPhase({
            type: "SET_LOCAL",
            key: "pendingQty",
            value: parseInt(e.target.value, 10) || 1,
          })
        }
      />
      <button onClick={handleAdd}>Add Item</button>
    </div>
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
      <Floorplan
        pageTitle="Return Items"
        leftColumn={null}
        mainContent={<ReturnItemsList />}
        rightColumn={<ItemEntry />}
      />
    </Phase>
  );
}
