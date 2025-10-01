import React from "react";
import { Phase } from "../components/Components";

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
    <Phase phaseId="receipts" title="Receipts">
      {children}
    </Phase>
  );
}
