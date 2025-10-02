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

//********************************************************************
//  PHASE NODE
//********************************************************************
// Type: PhaseNode
// Definition: Canonical description of a navigable phase/step.
// Intent: Encapsulate identifiers, URLs, and conditions for navigation.
// Constraints:
//   - `status` must be "mandatory" or "conditional".
//   - Conditions, if present, must be externally resolvable booleans.
//   - `selected` is true if this phase is the current phase.
//   - `enabled` is true if the user/system can navigate into this phase.
//   - `visible` is true if the phase is shown in the UI, even if disabled.
// Inputs: Phase/transaction state, routing logic.
// Outputs: Metadata consumed by navigation UI and logic, including state flags.
export type PhaseNode = {
  id: string;
  url: string;
  status: "mandatory" | "conditional";
  conditions?: string[];
  selected?: boolean;
  enabled?: boolean;
  visible?: boolean;
};

//********************************************************************
//  Transaction State
//********************************************************************
// Type: TransactionState
// Definition: Transaction-level state persists across the entire return transaction.
// Intent: Store user inputs and transaction-spanning values (e.g., current Phase).
// Constraints:
//   - Persists until the end of the transaction.
//   - May include flexible input maps for modularity.
// Inputs: User-provided inputs, navigation state.
// Outputs: State available across all phases until reset.
export type TransactionState = {
  currentPhase: string; // id of current Phase/NavNode
  userInputs: Record<string, any>; // flexible map for user input values
  transactionId?: string; // optional identifier for persistence/debug
  phases: PhaseNode[]; // ordered list of phases in this transaction
};

//********************************************************************
//  Phase State
//********************************************************************
// Type: PhaseState
// Definition: Phase-level state is ephemeral and resets on exit.
// Intent: Track which screen of the phase is active and any temporary values.
// Constraints:
//   - Discarded when phase is exited.
//   - Must not persist beyond phase lifecycle.
// Inputs: Phase-local interactions.
// Outputs: Temporary state affecting only this phase.
export type PhaseState = {
  phaseId: string; // id of the current phase
  screen: string; // id of the current screen in this phase
};

// Type: ReturnItemsPhaseState
// Definition: PhaseState extension for Return Items phase, includes local entry fields.
// Intent: Track item entry form state in phase context.
// Constraints: pendingItemId and pendingQty are optional and ephemeral.
// Inputs: Used by Return Items phase.
// Outputs: Extended phase state for item entry.
export type ReturnItemsPhaseState = PhaseState & {
  pendingItemId?: string;
  pendingQty?: number;
};

// src/types/Types.ts
export type BaseItem = {
  id: string;
  valueCents?: number;
  qty?: number;
};
