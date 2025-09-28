// src/spec/spec_base.ts
export const AppScreens = [
  {
    id: "SCR-FLOORPLAN-001",
    term: "FloorplanScreen",
    layer: "screen",
    children: [
      { id: "COMP-FLOORPLAN-001", term: "FloorplanComponent", layer: "component", outputs: ["src/components/FloorplanComponent.tsx"] }
    ],
  },
  // other screens...
];

export const DomainRules = [
  {
    id: "RULE-001",
    term: "RefundCalculation",
    constraints: [
      "Refund total = sum of all refundable items minus any fees"
    ],
    outputs: [],
  },
  {
    id: "RULE-002",
    term: "UserMovement",
    constraints: [
      "Users can move freely within allowed zones without restrictions"
    ],
    outputs: [],
  },
  {
    id: "RULE-003",
    term: "StateValidation",
    constraints: [
      "Validated and cleaned state before advancing"
    ],
    outputs: [],
  },
  {
    id: "RULE-004",
    term: "StageManagement",
    constraints: [
      "Stages remain open until all conditions are met"
    ],
    outputs: [],
  },
  {
    id: "RULE-005",
    term: "StateValidity",
    constraints: [
      "Valid state with all required fields populated"
    ],
    outputs: [],
  },
  {
    id: "RULE-006",
    term: "ComponentReliability",
    constraints: [
      "Components with reliable and consistent output"
    ],
    outputs: [],
  },
  // other rules...
];
