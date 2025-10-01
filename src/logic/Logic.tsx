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
  currentPhase: "start",
  userInputs: {},
  phases: [
    { id: "start", url: "/start", status: "mandatory" },
    { id: "return-items", url: "/return-items", status: "mandatory" },
    { id: "receipts", url: "/receipts", status: "mandatory" },
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

/**
 * RepoActionType: Supported actions for a repo.
 * - ADD: Add a new item to the repo array.
 * - EDIT: Edit an item in the repo array by id or index.
 * - REMOVE: Remove an item from the repo array by id or index.
 * - DEDUCT: Deduct (decrement) a property (e.g., quantity) from an item by id or index.
 */
export type RepoActionType = "ADD" | "EDIT" | "REMOVE" | "DEDUCT";

/**
 * RepoAction: Action for mutating a userInputs repo.
 */
export type RepoAction = {
  type: RepoActionType;
  target: RepoTarget;
  payload: any;
};

type TransactionAction =
  | { type: "SET_PHASE"; phaseId: string }
  | { type: "SET_INPUT"; key: string; value: any }
  | { type: "RESET" }
  | { type: "REPO_ACTION"; repoAction: RepoAction };

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
  const { type, target, payload } = action;

  // Ensure target is always a Map
  const currentRepo: Map<any, any> =
    userInputs[target] instanceof Map ? userInputs[target] : new Map();

  // Clone Map immutably (React requires new reference)
  const newRepo = new Map(currentRepo);

  switch (type) {
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
    case "REPO_ACTION":
      return {
        ...state,
        userInputs: handleRepoAction(state.userInputs, action.repoAction),
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

export function PhaseProvider({
  children,
  phaseId,
}: {
  children: ReactNode;
  phaseId: string;
}) {
  const value = useReducer(phaseReducer, { ...initialPhaseState, phaseId });
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
