// ================================
// Types.ts — Canonical Types Bucket
// Definition: Central repository of shared type definitions for QRET.
// Intent: Ensure consistency of shape and intent across components, logic, and pages.
// Constraints:
//   - All types must have artifact-level headers.
//   - No business logic or rendering allowed here.
// Inputs: Referenced across all buckets.
// Outputs: Type safety for TS code.
// ================================

////////////////////////////////
// Kinetic Data Types
///////////////////////////////

// Primary Item
export type Item = {
  itemId: string;
  valueCents?: number;
  qty?: number;
  invoId?: string; // only for items sourced from an invoice
};

// Invoice = list of BaseItems with qty + valueCents
export type Invoice = {
  invoId: string;
  items: (Item & { qty: number; valueCents: number })[];
};

////////////////////////////////
// Stable Data Types
///////////////////////////////

export type PhaseNode = {
  phaseId: string;
  url: string;
  status: "mandatory" | "conditional";
  conditions?: any[];
  selected?: boolean;
  enabled?: boolean;
  visible?: boolean;
};

////////////////////////////////
// State Handlers
///////////////////////////////

export type TransientState = Record<string, any>; // This saves us some validity checking.

export type TransactionState = {
  currentPhase: string; // id of current Phase/NavNode
  userInputs: Record<string, any>; // flexible map for user input values
  phases: PhaseNode[]; // ordered list of phases in this transaction. In state b/c this can vary.
  // Canonical transaction-level repos:
  returnItems?: Map<string, Item>;
  receipts?: Map<string, Invoice>;
};

export type PhaseState = {
  phaseId: string;
  activeScreen: string; // id of current screen within this phase
};

export type ReturnItemsPhaseState = PhaseState & {
  pendingItemId: string;
  pendingQty: number;
};
