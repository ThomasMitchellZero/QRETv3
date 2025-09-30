// ================================
// Logic.ts — Canonical Logic & State Bucket
// Definition: Shared hooks, state management, and reusable logic for QRET.
// Intent: Provide centralized, reusable logic primitives (contexts, reducers, hooks).
// Constraints:
//   - Must not contain UI rendering.
//   - Must delegate type shapes to Types.ts.
// Inputs: User interactions, navigation triggers.
// Outputs: State management utilities and reusable hooks.
// ================================

import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { TransactionState, PhaseState } from "../types/Types";
import type { PhaseNode } from "../types/Types"; // make sure this is at the top

//********************************************************************
//  TRANSACTION STATE CONTEXT
//********************************************************************
const initialTransactionState: TransactionState = {
  currentPhase: "",
  userInputs: {},
  phases: [
    { id: "add-items", url: "/add-items", status: "mandatory" },
    { id: "receipts", url: "/receipts", status: "mandatory" },
    { id: "refund", url: "/refund", status: "mandatory" },
  ],
};

type TransactionAction =
  | { type: "SET_PHASE"; phaseId: string }
  | { type: "SET_INPUT"; key: string; value: any }
  | { type: "RESET" };

function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, currentPhase: action.phaseId };
    case "SET_INPUT":
      return {
        ...state,
        userInputs: { ...state.userInputs, [action.key]: action.value },
      };
    case "RESET":
      return initialTransactionState;
    default:
      return state;
  }
}

const TransactionContext: React.Context<
  [TransactionState, Dispatch<TransactionAction>] | undefined
> = createContext<[TransactionState, Dispatch<TransactionAction>] | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const value = useReducer(transactionReducer, initialTransactionState);
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransaction(): [
  TransactionState,
  Dispatch<TransactionAction>
] {
  const ctx = useContext(TransactionContext);
  if (!ctx) {
    throw new Error("useTransaction must be used within TransactionProvider");
  }
  return ctx;
}

//********************************************************************
//  PHASE STATE CONTEXT
//********************************************************************
const initialPhaseState: PhaseState = {
  phaseId: "",
  screen: "primary",
  localValues: {},
};

type PhaseAction =
  | { type: "SET_SCREEN"; screen: string }
  | { type: "SET_LOCAL"; key: string; value: any }
  | { type: "RESET"; phaseId?: string };

function phaseReducer(state: PhaseState, action: PhaseAction): PhaseState {
  switch (action.type) {
    case "SET_SCREEN":
      return { ...state, screen: action.screen };
    case "SET_LOCAL":
      return {
        ...state,
        localValues: { ...state.localValues, [action.key]: action.value },
      };
    case "RESET":
      return { ...initialPhaseState, phaseId: action.phaseId ?? "" };
    default:
      return state;
  }
}

const PhaseContext = createContext<
  [PhaseState, Dispatch<PhaseAction>] | undefined
>(undefined);

export function PhaseProvider({ children }: { children: ReactNode }) {
  const value = useReducer(phaseReducer, initialPhaseState);
  return (
    <PhaseContext.Provider value={value}>{children}</PhaseContext.Provider>
  );
}

export function usePhase(): [PhaseState, Dispatch<PhaseAction>] {
  const ctx = useContext(PhaseContext);
  if (!ctx) {
    throw new Error("usePhase must be used within PhaseProvider");
  }
  return ctx;
}

//********************************************************************
//  TRANSACTION SELECTORS (DERIVED VALUES)
//********************************************************************

/**
 * Hook: useSelectedPhase
 * Definition: Returns the currently selected PhaseNode (derived from currentPhase).
 * Intent: Convenience for components to access the active PhaseNode without duplicating logic.
 * Constraints:
 *   - Does not mutate state.
 *   - Returns undefined if no phase matches currentPhase.
 * Inputs: Transaction state (currentPhase + phases).
 * Outputs: The matching PhaseNode or undefined.
 */
export function useSelectedPhase(): PhaseNode | undefined {
  const [state] = useTransaction();
  return state.phases.find((p) => p.id === state.currentPhase);
}

/**
 * Hook: useIsSelected
 * Definition: Returns whether the given phaseId is currently selected.
 * Intent: Lightweight boolean check for component logic.
 * Constraints:
 *   - Pure function, derived from Transaction state.
 * Inputs: phaseId, Transaction state.
 * Outputs: true if phaseId === currentPhase, else false.
 */
export function useIsSelected(phaseId: string): boolean {
  const [state] = useTransaction();
  return state.currentPhase === phaseId;
}

//********************************************************************
//  HOOK: useNavigatePhase
//********************************************************************
/**
 * Hook: useNavigatePhase
 * Definition: Returns a function to navigate directly to a PhaseNode by id.
 * Intent: Centralize phase navigation into a single, spec-aligned primitive.
 * Constraints:
 *   - Fails loud if target phaseId does not exist in TransactionState.phases.
 *   - Always resets PhaseState to its primary screen when navigating.
 *   - Must not silently bypass disabled/hidden states (caller must validate).
 * Inputs: phaseId (string)
 * Outputs: Updates TransactionState.currentPhase and resets PhaseState.
 */
export function useNavigatePhase(): (phaseId: string) => void {
  const [transaction, dispatchTransaction] = useTransaction();
  const [, dispatchPhase] = usePhase();

  return (phaseId: string) => {
    const exists = transaction.phases.some((p) => p.id === phaseId);
    if (!exists) {
      throw new Error(
        `⚠️ Attempted to navigate to invalid phaseId: ${phaseId}`
      );
    }

    // Update transaction-level state
    dispatchTransaction({ type: "SET_PHASE", phaseId });

    // Reset phase-level state to primary
    dispatchPhase({ type: "RESET", phaseId });
  };
}
