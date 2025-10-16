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
  valueCents?: number | undefined;
  qty?: number;
  invoId: string | undefined; // only for items sourced from an invoice
};

// Invoice =
export type Invoice = {
  invoId: string;
  items: Item[];
  customer?: Customer;
  payment?: Payment;
};

// Customer = contact metadata for invoice search and matching
export type Customer = {
  name?: string;
  phone?: number; // stored as integer for numeric search
  email?: string;
};

// Payment = tender metadata for invoice search and matching
export type Payment = {
  cc?: string; // full credit card number (mock data)
  method?: string;
  authCode?: string;
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

export type TransientState = {
  activeContainer?: string;
  activeErrorId?: string;
  [key: string]: any; // allows flexible extension
};

export type TransactionState = {
  currentPhase: string; // id of current Phase/NavNode
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

// ================================
// Reference Objects (for APE)
// ================================
export const refItem: Item = {
  itemId: "0000",
  valueCents: 1000,
  qty: 1,
  invoId: "99999",
};

export const refInvoice: Invoice = {
  invoId: "99999",
  items: [refItem],
  customer: {
    name: "John Doe",
    phone: 1234567890,
    email: "john@example.com",
  },
  payment: {
    cc: "4111111111111111",
    method: "credit",
    authCode: "AUTHCODE123",
  },
};

export const refCustomer: Customer = {
  name: "Jane Smith",
  phone: 9876543210,
  email: "jane@example.com",
};

export const refPayment: Payment = {
  cc: "4222222222222",
  method: "debit",
  authCode: "AUTH98765",
};

export const refPhaseNode: PhaseNode = {
  phaseId: "example-phase",
  url: "/example",
  status: "mandatory",
  selected: true,
  enabled: true,
  visible: true,
};

export const refTransientState: TransientState = {
  activeContainer: "example-container",
  activeErrorId: "none",
};

export const refTransactionState: TransactionState = {
  currentPhase: "start",
  phases: [refPhaseNode],
  returnItems: new Map([["0000", refItem]]),
  receipts: new Map([["99999", refInvoice]]),
};

export const refPhaseState: PhaseState = {
  phaseId: "start",
  activeScreen: "primary",
};

export const refReturnItemsPhaseState: ReturnItemsPhaseState = {
  phaseId: "return-items",
  activeScreen: "primary",
  pendingItemId: "0000",
  pendingQty: 1,
};
