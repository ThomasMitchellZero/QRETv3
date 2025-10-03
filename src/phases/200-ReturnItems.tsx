import React from "react";
import { Phase } from "../components/Components";
import { fakeCatalog } from "../api/fakeApi";

import { Card, Floorplan, ActorTile, Stage } from "../components/Components";
import {
  useTransaction,
  useReturnItemsPhase,
  useTransients,
} from "../logic/Logic";

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
  const [, dispatchTransients] = useTransients();

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQty = parseInt(e.target.value, 10) || 0;
    dispatch({
      kind: "REPO_ACTION",
      payload: {
        repoAction: {
          kind: "EDIT",
          target: "return-items",
          payload: { id, changes: { qty: newQty } },
        },
      },
    });
  };

  const handleRemove = () => {
    dispatch({
      kind: "REPO_ACTION",
      payload: {
        repoAction: {
          kind: "REMOVE",
          target: "return-items",
          payload: { id },
        },
      },
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchTransients({ kind: "CLEAR_TRANSIENTS", payload: { preserve: [] } });
  };

  return (
    <Card className="return-items-card" onClick={handleCardClick}>
      <div className="item-id PLACEHOLDER">
        <strong>Item #{id}</strong>
      </div>
      <Stage id={`item-${id}`}>
        <ActorTile
          id={`item-${id}-qty`}
          headline={<div className="qty-display">{qty}</div>}
        >
          <input type="number" value={qty} onChange={handleQtyChange} min={0} />
        </ActorTile>
        <ActorTile
          id={`item-${id}-refund`}
          headline={<div className="qty-display">{"Refund"}</div>}
        >
          <div className="refund-amount PLACEHOLDER">$XX.XX</div>
        </ActorTile>
      </Stage>

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
      <div className="catalog-items-list">
        Available Item IDs: {Object.keys(fakeCatalog).join(", ")}
      </div>
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
      kind: "REPO_ACTION",
      payload: {
        repoAction: {
          kind: "ADD",
          target: "return-items",
          payload: { id: pendingItemId, qty: pendingQty },
        },
      },
    });
    // Reset local entry fields
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingItemId", value: "" },
    });
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingQty", value: 1 },
    });
  };

  return (
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
