import React from "react";
import { Phase } from "../components/Components";

//********************************************************************
//  RECEIPTS PHASE SCAFFOLD
//********************************************************************
// Component: ReceiptsPhase

export function RefundPhase({ children }: { children: React.ReactNode }) {
  return (
    <Phase phaseId="refund" title="Refund">
      {children}
    </Phase>
  );
}
