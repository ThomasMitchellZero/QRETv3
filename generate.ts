/* ================================
   DOMAIN RULES (QRET-specific)
   ================================ */
const domainRules: Rule[] = [
  {
    id: "DOM-001",
    goal: "Calculate refunds accurately",
    inputs: ["ReceiptedItems", "ReturnedItems"],
    constraints: ["Item IDs must be numeric", "Quantity must be > 0"],
    outputs: [
      "Refund total = intersection of receiptedItems and returnedItems",
    ],
    precedence: 100,
    scope: "global" as Scope,
    terms: ["Refund", "ReceiptedItems", "ReturnedItems"],
  },
  {
    id: "DOM-002",
    goal: "Allow free navigation between phases unless explicitly restricted",
    inputs: ["Navigation state", "Phase definitions"],
    constraints: ["Phases are navigable unless a rule explicitly blocks it"],
    outputs: ["Users can move freely between phases"],
    precedence: 50,
    scope: "global" as Scope,
    terms: ["Navigation"],
  },
  {
    id: "DOM-003",
    goal: "Advance phase only after validation and cleanup",
    inputs: ["Phase data"],
    constraints: ["Validation must succeed", "Cleanup must run before phase advance"],
    outputs: ["Validated and cleaned state before advancing"],
    precedence: 100,
    scope: "global" as Scope,
    terms: ["Validation", "Cleanup"],
  },
  {
    id: "DOM-004",
    goal: "Prevent stages from auto-closing due to internal interaction",
    inputs: ["Stage state"],
    constraints: ["Stage closure cannot be triggered solely by internal component interaction"],
    outputs: ["Stages remain open unless explicitly closed"],
    precedence: 80,
    scope: "global" as Scope,
    terms: ["Stage"],
  },
];
