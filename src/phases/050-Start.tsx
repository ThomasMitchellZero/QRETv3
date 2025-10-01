import React from "react";
import { Phase } from "../components/Components";
import { Card, Floorplan } from "../components/Components";

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
export function StartPhase() {
  return (
    <Phase phaseId="start" title="Start">
      <Floorplan pageTitle="Start" />
    </Phase>
  );
}
