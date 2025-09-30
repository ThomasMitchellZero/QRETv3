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
//  NAV NODE
//********************************************************************
// Type: NavNode
// Definition: Canonical description of a navigable phase/step.
// Intent: Encapsulate identifiers, URLs, and conditions for navigation.
// Constraints:
//   - `status` must be "mandatory" or "conditional".
//   - Conditions, if present, must be externally resolvable booleans.
// Inputs: Phase/transaction state, routing logic.
// Outputs: Metadata consumed by navigation UI and logic.
export type NavNode = {
  id: string; // unique identifier of the nav node
  url: string; // URL path associated with the phase
  status: "mandatory" | "conditional"; // whether always required or conditionally included
  conditions?: string[]; // optional list of conditions controlling navigation to this node
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
  localValues: Record<string, any>; // ephemeral inputs/flags
};
