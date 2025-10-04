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
import type {
  TransactionState,
  PhaseNode,
  Item,
  Invoice,
  PhaseState,
  TransientState,
  ReturnItemsPhaseState,
} from "../types/Types";

//********************************************************************
//  TRANSACTION STATE CONTEXT
//********************************************************************
const initialTransactionState: TransactionState = {
  currentPhase: "start",
  userInputs: {},
  phases: [
    { phaseId: "start", url: "/start", status: "mandatory" },
    { phaseId: "return-items", url: "/return-items", status: "mandatory" },
    { phaseId: "receipts", url: "/receipts", status: "mandatory" },
  ],
};

// ================================================================
// Unified Meta-Repo Reducer Model Types
// ================================================================
/**
 * RepoTarget: Represents the key of a userInputs repo (e.g., "receiptedItems", "returnedItems", etc).
 * Extend this union as needed for each repo managed in userInputs.
 */
export type RepoTarget = string; // For generality, allow any string key in userInputs

export type RepoActionType = "ADD" | "EDIT" | "REMOVE" | "DEDUCT";

/**
 * RepoAction: Action for mutating a userInputs repo.
 */
export type RepoAction = {
  kind: RepoActionType;
  target: RepoTarget;
  payload: any;
};

type TransactionAction =
  | { kind: "SET_PHASE"; payload: { phaseId: string } }
  | { kind: "SET_INPUT"; payload: { key: string; value: any } }
  | { kind: "RESET" }
  | { kind: "REPO_ACTION"; payload: { repoAction: RepoAction } };

/**
 * Helper: handleRepoAction
 * Mutates the appropriate userInputs repo based on the action type.
 * New Map-based implementation for React-safe immutability.
 * - Always coerces repos into a Map (userInputs[target] instanceof Map ? userInputs[target] : new Map()).
 * - Clones Map immutably (const newRepo = new Map(currentRepo)).
 * - Handles "ADD", "EDIT", "REMOVE", "DEDUCT" with Map semantics (.set, .get, .delete).
 * - Throws clear errors if required id/property is missing.
 * - Returns updated userInputs with { ...userInputs, [target]: newRepo }.
 */

function handleRepoAction(
  userInputs: Record<string, any>,
  action: RepoAction
): Record<string, any> {
  const { kind, target, payload } = action;

  // Ensure target is always a Map
  const currentRepo: Map<any, any> =
    userInputs[target] instanceof Map ? userInputs[target] : new Map();

  // Clone Map immutably (React requires new reference)
  const newRepo = new Map(currentRepo);

  switch (kind) {
    case "ADD": {
      if (!payload.id) {
        throw new Error("⚠️ ADD requires payload.id");
      }
      // If item with id exists and has a numeric "qty" property, increment it by payload.qty (default 1)
      const existing = newRepo.get(payload.id);
      if (existing && typeof existing.qty === "number") {
        const addQty = typeof payload.qty === "number" ? payload.qty : 1;
        newRepo.set(payload.id, {
          ...existing,
          qty: existing.qty + addQty,
        });
      } else {
        newRepo.set(payload.id, payload);
      }
      break;
    }

    case "EDIT": {
      const { id, changes } = payload;
      if (!id) throw new Error("⚠️ EDIT requires payload.id");
      const existing = newRepo.get(id);
      if (existing) {
        newRepo.set(id, { ...existing, ...changes });
      }
      break;
    }

    case "REMOVE": {
      const { id } = payload;
      if (!id) throw new Error("⚠️ REMOVE requires payload.id");
      newRepo.delete(id);
      break;
    }

    case "DEDUCT": {
      const { id, property, amount = 1 } = payload;
      if (!id) throw new Error("⚠️ DEDUCT requires payload.id");
      const existing = newRepo.get(id);
      if (existing && typeof existing[property] === "number") {
        const newValue = existing[property] - amount;
        if (newValue <= 0) {
          newRepo.delete(id);
        } else {
          newRepo.set(id, {
            ...existing,
            [property]: newValue,
          });
        }
      }
      break;
    }

    default:
      return userInputs;
  }

  return { ...userInputs, [target]: newRepo };
}

function transactionReducer(
  state: TransactionState,
  action: TransactionAction
): TransactionState {
  switch (action.kind) {
    case "SET_PHASE":
      return { ...state, currentPhase: action.payload.phaseId };
    case "SET_INPUT":
      return {
        ...state,
        userInputs: {
          ...state.userInputs,
          [action.payload.key]: action.payload.value,
        },
      };
    case "RESET":
      return initialTransactionState;
    case "REPO_ACTION":
      return {
        ...state,
        userInputs: handleRepoAction(
          state.userInputs,
          action.payload.repoAction
        ),
      };
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
  activeScreen: "primary",
};

type PhaseAction =
  | { kind: "SET_SCREEN"; payload: { screen: string } }
  | { kind: "SET_LOCAL"; payload: { key: string; value: any } }
  | { kind: "RESET"; payload?: { phaseId?: string } };

function phaseReducer(state: any, action: PhaseAction): any {
  switch (action.kind) {
    case "SET_SCREEN":
      return { ...state, screen: action.payload.screen };
    case "SET_LOCAL":
      // For generic PhaseState, just assign key/value at root; for ReturnItemsPhaseState, assign pendingItemId/pendingQty
      if (
        action.payload.key === "pendingItemId" ||
        action.payload.key === "pendingQty"
      ) {
        return { ...state, [action.payload.key]: action.payload.value };
      }
      return { ...state, [action.payload.key]: action.payload.value };
    case "RESET":
      return { ...initialPhaseState, phaseId: action.payload?.phaseId ?? "" };
    default:
      return state;
  }
}

//********************************************************************
//  TRANSIENT STATE CONTEXT
//********************************************************************
const initialTransientState: TransientState = {};

type TransientAction =
  | {
      kind: "SET_SOLO";
      payload?: { activeStageId?: string; activeSoloId?: string };
    }
  | { kind: "SET_ERROR"; payload?: { errorIds?: string[] } }
  | { kind: "SET_DIALOG"; payload?: { dialogId?: string } }
  | { kind: "RESET_TRANSIENTS" }
  | { kind: "CLEAR_TRANSIENTS"; payload?: { preserve?: string[] } };

function transientReducer(
  state: TransientState,
  action: TransientAction
): Object {
  switch (action.kind) {
    case "SET_SOLO":
      return {
        ...state,
        ...(action.payload ?? {}),
      };
    case "SET_ERROR":
      return { ...state, errorIds: action.payload?.errorIds ?? [] };
    case "SET_DIALOG":
      return { ...state, dialogId: action.payload?.dialogId };
    case "RESET_TRANSIENTS":
      return { ...initialTransientState };
    case "CLEAR_TRANSIENTS": {
      const preserve = action.payload?.preserve || [];
      let newState: TransientState = {};
      preserve.forEach((key: string) => {
        if (state[key] !== undefined) {
          newState[key] = state[key];
        }
      });
      return newState;
    }
    default:
      return state;
  }
}

const PhaseContext = createContext<
  [PhaseState, Dispatch<PhaseAction>] | undefined
>(undefined);

const TransientContext = createContext<
  [TransientState, Dispatch<TransientAction>] | undefined
>(undefined);

export function PhaseProvider({
  children,
  phaseId,
}: {
  children: ReactNode;
  phaseId: string;
}) {
  const phaseValue = useReducer(phaseReducer, {
    ...initialPhaseState,
    phaseId,
  });
  const transientValue = useReducer(transientReducer, {
    ...initialTransientState,
  });
  return (
    <PhaseContext.Provider value={phaseValue}>
      <TransientContext.Provider value={transientValue}>
        {children}
      </TransientContext.Provider>
    </PhaseContext.Provider>
  );
}

export function usePhase(): [PhaseState, Dispatch<PhaseAction>] {
  const ctx = useContext(PhaseContext);
  if (!ctx) {
    throw new Error("usePhase must be used within PhaseProvider");
  }
  return ctx;
}

// Hook: useReturnItemsPhase
// Definition: Returns phase state as ReturnItemsPhaseState for the Return Items phase.
// Intent: Typed access for phase state with pendingItemId/pendingQty fields.
// Outputs: [ReturnItemsPhaseState, Dispatch<PhaseAction>]

export function useReturnItemsPhase(): [
  ReturnItemsPhaseState,
  Dispatch<PhaseAction>
] {
  const ctx = useContext(PhaseContext);
  if (!ctx) {
    throw new Error("useReturnItemsPhase must be used within PhaseProvider");
  }
  // Cast phase state as ReturnItemsPhaseState (safe: fields are optional)
  return ctx as [ReturnItemsPhaseState, Dispatch<PhaseAction>];
}

export function useTransients(): [TransientState, Dispatch<TransientAction>] {
  const ctx = useContext(TransientContext);
  if (!ctx) {
    throw new Error("useTransients must be used within PhaseProvider");
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
  return state.phases.find((p) => p.phaseId === state.currentPhase);
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
    const exists = transaction.phases.some((p) => p.phaseId === phaseId);
    if (!exists) {
      throw new Error(
        `⚠️ Attempted to navigate to invalid phaseId: ${phaseId}`
      );
    }

    // Update transaction-level state
    dispatchTransaction({ kind: "SET_PHASE", payload: { phaseId } });

    // Reset phase-level state to primary
    dispatchPhase({ kind: "RESET", payload: { phaseId } });
  };
}
