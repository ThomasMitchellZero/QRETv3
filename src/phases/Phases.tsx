import React from "react";
import { usePhase } from "../logic/Logic";
import { Floorplan, NavBar } from "../components/Components";
import { PhaseProvider } from "../logic/Logic";

export type PhaseProps = {
  phaseId: string;
  children: React.ReactNode;
};

//********************************************************************
//  PHASE NODE TILE
//********************************************************************
// ================================
// Phases.tsx — Canonical Phase Wrappers
// Definition: Provides page-level containers for each Phase, wrapping children
//             in the standard Floorplan layout.
// Intent: Ensure every Phase uses the same consistent structure.
// Constraints:
//   - Must not define business logic (delegates to Logic.ts).
//   - Styling delegated to style.scss.
// Inputs: { children } React nodes
// Outputs: Page layout with consistent floorplan.
// ================================

// Phase component is no longer needed as a wrapper; Floorplan is used directly by all Phase scaffolds.

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
export function StartPhase({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider phaseId="start">
      <Floorplan
        topBar={<div>Top Bar</div>}
        leftColumn={<div>Left Column</div>}
        rightColumn={<div>Right Column</div>}
        pageTitle={<div>Start</div>}
        navBar={<NavBar />}
        mainContent={<>{children}</>}
        footer={<div>Footer</div>}
      />
    </PhaseProvider>
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
export function ReturnItemsPhase({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider phaseId="return-items">
      <Floorplan
        topBar={<div>Top Bar</div>}
        leftColumn={<div>Left Column</div>}
        rightColumn={<div>Right Column</div>}
        pageTitle={<div>Return Items</div>}
        navBar={<NavBar />}
        mainContent={<>{children}</>}
        footer={<div>Footer</div>}
      />
    </PhaseProvider>
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
export function ReceiptsPhase({ children }: { children: React.ReactNode }) {
  return (
    <PhaseProvider phaseId="receipts">
      <Floorplan
        topBar={<div>Top Bar</div>}
        leftColumn={<div>Left Column</div>}
        rightColumn={<div>Right Column</div>}
        pageTitle={<div>Receipts</div>}
        navBar={<NavBar />}
        mainContent={<>{children}</>}
        footer={<div>Footer</div>}
      />
    </PhaseProvider>
  );
}
