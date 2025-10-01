import React from "react";
import { usePhase } from "../logic/Logic";
import { Floorplan } from "../components/Components";

export type PhaseProps = {
  phaseId: string;
  children: React.ReactNode;
};

//********************************************************************
//  PHASE NODE TILE
//********************************************************************
// ================================
// Phase.tsx — Canonical Phase Container
// Definition: Reusable wrapper for a single Phase of the QRET workflow.
// Intent: Provide consistent structure and local state for each Phase.
// Constraints:
//   - Must be wrapped in TransactionProvider and PhaseProvider.
//   - Phase state is ephemeral; resets on exit.
//   - Business logic and navigation must be delegated to Logic.ts hooks.
// Inputs: phaseId (string), children (React.ReactNode)
// Outputs: JSX structure for the Phase
// ================================

export function Phase({ phaseId, children }: PhaseProps): JSX.Element {
  const [phaseState] = usePhase();

  return (
    <div className="phase" data-phase-id={phaseId}>
      <div className="phase-screen"></div>
      <div className="phase-content">{children}</div>
    </div>
  );
}

//********************************************************************
//  START PHASE SCAFFOLD
//********************************************************************
// Component: StartPhase
// Definition: Scaffold wrapper for the "add-items" phase of the QRET workflow.
// Intent: Provide a canonical container for the Start phase, ensuring correct phaseId and structure.
// Constraints:
//   - Must wrap children in the canonical Phase container.
//   - phaseId must be "add-items".
//   - No business logic or navigation; render only.
// Inputs: children (React.ReactNode)
// Outputs: JSX structure for the Start phase.
export function StartPhase({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <Phase phaseId="add-items">{children}</Phase>;
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
export function ReturnItemsPhase({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <Phase phaseId="return-items">{children}</Phase>;
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
export function ReceiptsPhase({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <Phase phaseId="receipts">{children}</Phase>;
}
