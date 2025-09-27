// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

/* --- SPEC --- */
type Concept = {
  id: string;
  term: string;
  layer: "universal" | "global" | "app" | "screen" | "component";
  definition?: string;
  goal?: string;
  inputs?: string[];
  constraints?: string[];
  outputs?: string[];
  children?: Concept[];
  precedence?: number;
  scopePath?: string[];
};

// Component type: must represent a React component (component or screen), outputs must include a React component file or UI element
type Component = Concept & {
  layer: "component" | "screen";
  outputs: string[]; // must output a React component file or UI element
};

type WorkingAgreementRules = {
  noSilentFixes: boolean;
  // New fields per updated working agreement:
  specIsOnlySource: boolean; // The spec is the only authoritative source.
  askUntilClear: boolean; // Ask clarifying questions until requirements are clear.
  diffOnlyEdits: boolean; // Only output code diffs/edits, no extra commentary.
  toolingInSpec: boolean; // Tooling requirements must be in the spec.
  convergeOnIntent: boolean; // Converge on user intent through clarification.
  diffIsStandard: boolean; // All changes must be delivered as diffs/patches with apply button support.
  warnOnContextRisk: boolean; // Must warn the user if there is any risk of losing context
  chatIsNonAuthoritative: boolean; // Chat may clarify but is never binding
  standardizeWarnings: boolean; // Generated code must use a standard warning format for auto-filled or ambiguous decisions
};

/* ================================
   PROCESS RULES (AIDA-wide)
   ================================ */
const workingAgreementRules: WorkingAgreementRules = {
  noSilentFixes: true, // never “fix” spec silently
  specIsOnlySource: true, // The spec is the only authoritative source.
  askUntilClear: true, // Ask clarifying questions until requirements are clear.
  diffOnlyEdits: true, // Only output code diffs/edits, no extra commentary.
  toolingInSpec: true, // Tooling requirements must be in the spec.
  convergeOnIntent: true, // Converge on user intent through clarification.
  diffIsStandard: true, // All changes must be delivered as diffs/patches with apply button support.
  warnOnContextRisk: true, // Explicitly warn if there is any risk of losing context
  chatIsNonAuthoritative: true, // Chat may clarify but is never binding
  standardizeWarnings: true, // Use `// ⚠️ Warning:` for auto-filled or ambiguous decisions
};

/* ================================
   TEMP RULES (Ephemeral)
   ================================ */
type TempRules = Record<string, unknown>;

const tempRules: TempRules = {
  // put temporary process rules here, remove later
};

/* ================================
   DICTIONARY (Terms & Definitions)
   ================================ */
const dictionary: Record<string, Concept> = {
  Floorplan: {
    id: "TERM-FLOORPLAN-001",
    term: "Floorplan",
    layer: "global",
    definition:
      "The global layout template for all ecosystem apps. The page is divided into two rows: (1) Top bar, 2rem tall, blue, reserved for ecosystem-level content, and (2) App window filling the rest of the viewport. The App window has three columns: optional left (25%), optional right (25%), and a main column that fills the remaining space. The main column contains stacked rows: (a) Page Title & Exit button, (b) Navigation bar nodes, (c) Main Content (configurable, expands to fill), and (d) Footer row with total refund on the left and continuation button on the right.",
  },
  Ambiguity: {
    id: "TERM-AMBIGUITY-001",
    term: "Ambiguity",
    layer: "universal",
    definition:
      "A lack of clarity in definitions, rules, or intent requiring resolution.",
  },
  ActorTile: {
    id: "TERM-ACTOR-TILE-001",
    term: "ActorTile",
    layer: "global",
    definition:
      "A UI component representing an individual actor. Only one can be marked as 'Solo' within a given context.",
  },
  Chat: {
    id: "TERM-CHAT-001",
    term: "Chat",
    layer: "universal",
    definition:
      "Interactive conversation between human and model, not authoritative.",
  },
  Conditional: {
    id: "TERM-CONDITIONAL-001",
    term: "Conditional",
    layer: "universal",
    definition:
      "A step that is optional for developers to include in a phase. If implemented, it is mandatory for the user.",
  },
  Configurable: {
    id: "TERM-CONFIGURABLE-001",
    term: "Configurable",
    layer: "universal",
    definition:
      "A design element whose behavior or presence can be toggled or adjusted by developers at build time.",
  },
  Contradictions: {
    id: "TERM-CONTRADICTIONS-001",
    term: "Contradictions",
    layer: "universal",
    definition: "Conflicts between rules or definitions in the spec.",
  },
  DerivedValue: {
    id: "TERM-DERIVED-VALUE-001",
    term: "DerivedValue",
    layer: "global",
    definition: "A value computed from other data.",
  },
  GeneratedCode: {
    id: "TERM-GENERATED-CODE-001",
    term: "GeneratedCode",
    layer: "universal",
    definition: "Code output produced deterministically from the spec.",
  },
  Phase: {
    id: "TERM-PHASE-001",
    term: "Phase",
    layer: "global",
    definition:
      "A distinct step or stage in the QRET workflow consisting of required user interaction and supporting logic.",
  },
  PrototypeChain: {
    id: "TERM-PROTOTYPE-CHAIN-001",
    term: "PrototypeChain",
    layer: "universal",
    definition:
      "The structured hierarchy of definitions and rules to ensure convergence.",
  },
  ReceiptedItems: {
    id: "TERM-RECEIPTED-ITEMS-001",
    term: "ReceiptedItems",
    layer: "global",
    definition: "Items listed on a receipt that are eligible for return.",
  },
  Refund: {
    id: "TERM-REFUND-001",
    term: "Refund",
    layer: "global",
    definition: "The total amount to be returned to the customer.",
  },
  ReturnedItems: {
    id: "TERM-RETURNED-ITEMS-001",
    term: "ReturnedItems",
    layer: "global",
    definition: "Items provided by the customer for return.",
  },
  Spec: {
    id: "TERM-SPEC-001",
    term: "Spec",
    layer: "universal",
    definition: "The authoritative specification file (generate.ts).",
  },
};

/* ================================
   FLOORPLAN COMPONENT
   ================================ */
const floorplanComponent: Component = {
  id: "COMP-FLOORPLAN-001",
  term: "FloorplanComponent",
  layer: "component",
  definition: "Global floorplan component for ecosystem apps",
  inputs: ["leftColumn", "rightColumn", "mainContent"],
  outputs: ["Floorplan.tsx"], // outputs a React component file
  children: [
    {
      id: "COMP-TOPBAR-001",
      term: "TopBar",
      layer: "component",
      definition:
        "Top bar, 2rem tall, blue, reserved for ecosystem-level content",
      outputs: ["TopBar.tsx"],
    },
    {
      id: "COMP-LEFTCOL-001",
      term: "LeftColumn",
      layer: "component",
      definition: "Optional left column (25% width)",
      outputs: ["LeftColumn.tsx"],
    },
    {
      id: "COMP-MAINCOL-001",
      term: "MainColumn",
      layer: "component",
      definition: "Main column, fills remaining space, contains stacked rows",
      outputs: ["MainColumn.tsx"],
      children: [
        {
          id: "COMP-TITLE-ROW-001",
          term: "PageTitleRow",
          layer: "component",
          definition: "Row: Page Title & Exit button",
          outputs: ["PageTitleRow.tsx"],
        },
        {
          id: "COMP-NAVBAR-ROW-001",
          term: "NavigationBarRow",
          layer: "component",
          definition: "Row: Navigation bar nodes",
          outputs: ["NavigationBarRow.tsx"],
        },
        {
          id: "COMP-MAINCONTENT-ROW-001",
          term: "MainContentRow",
          layer: "component",
          definition: "Row: Main Content (configurable, expands to fill)",
          outputs: ["MainContentRow.tsx"],
        },
        {
          id: "COMP-FOOTER-ROW-001",
          term: "FooterRow",
          layer: "component",
          definition:
            "Row: Footer with total refund on the left and continuation button on the right",
          outputs: ["FooterRow.tsx"],
        },
      ],
    },
    {
      id: "COMP-RIGHTCOL-001",
      term: "RightColumn",
      layer: "component",
      definition: "Optional right column (25% width)",
      outputs: ["RightColumn.tsx"],
    },
  ],
};

/* ================================
   DEFAULTS
   ================================ */
const defaults = {
  sizeUnit: "rem", // default unit for spacing, margin, padding
  fontUnit: "rem", // default for font sizes
  colorFormat: "hex", // default color format
  responsive: "mobileFirst", // base assumption for breakpoints
};

/* ================================
   POLICIES
   ================================ */
const policies = {
  done: {
    compilePass: true, // must pass TypeScript compile
    runPass: true, // must run under npm start
    styleRequired: false, // CSS/styling not required at this stage
    featureComplete: false, // partial implementations are acceptable unless specified otherwise
  },
  tieBreaker: {
    rule: "scopeFirst", // Narrower scope always wins; precedence resolves ties within scope
    sameScopeResolution: "precedence", // Higher precedence wins when scope is equal
    sameScopeAndPrecedence: "lastDefined", // If still tied, the later-defined rule wins
  },
  optimization: {
    prioritize: "clarity" as const, // prioritize clarity over performance/abstraction
  },
  naming: {
    enforceDictionary: true, // all terms in the spec must resolve to dictionary entries
    onMissingTerm: "error" as const, // fail fast if a term is not in the dictionary
  },
  error: {
    trivial: "autoFill" as const, // fill in safe defaults silently
    moderate: "warn" as const, // generate but flag with standardized warnings
    critical: "ask" as const, // stop and request clarification
  },
};

/* ================================
   INTENT (Meta constraints/outputs)
   ================================ */
const intent = {
  goal: "Build React prototype deterministically from spec",
  precedence: 100, // Highest authority at the app level
  inputs: ["Screen definitions", "Working agreement rules", "Tooling rules"],
  constraints: [
    {
      id: "PROC-SPEC-001",
      term: "SpecRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Ensure the spec is the only authoritative source of truth",
      inputs: ["generate.ts spec"],
      constraints: ["No rules from chat", "No assumptions outside the spec"],
      outputs: ["Deterministic builds"],
      precedence: 100,
    },
    {
      id: "PROC-COMPILATION-001",
      term: "CompilationRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Ensure generated code compiles immediately",
      inputs: ["Generated code"],
      constraints: ["Must pass TypeScript compiler without errors"],
      outputs: ["Compilable .tsx files"],
      precedence: 0,
    },
    {
      id: "PROC-CONTRADICTION-001",
      term: "ContradictionRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Prevent silent contradictions",
      inputs: ["Spec"],
      constraints: [
        "Do not change conflicting rules without explicit clarification",
      ],
      outputs: [
        "Warnings or clarification requests when contradictions appear",
      ],
      precedence: 100,
    },
    {
      id: "PROC-CHAT-001",
      term: "ChatRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Ensure chat is non-binding",
      inputs: ["Chat context"],
      constraints: ["Chat may clarify but cannot introduce binding rules"],
      outputs: ["Spec remains authoritative"],
      precedence: 100,
    },
    {
      id: "PROC-AMBIGUITY-001",
      term: "AmbiguityRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Surface ambiguities and conflicts explicitly",
      inputs: ["Spec"],
      constraints: [
        "Must generate warnings when ambiguity, gaps, or conflicts are detected",
      ],
      outputs: ["Warnings presented to user"],
      precedence: 100,
    },
    {
      id: "PROC-PROTOTYPE-CHAIN-001",
      term: "PrototypeChainRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Consolidate prototype chain where appropriate",
      inputs: ["Spec rules", "Dictionary terms"],
      constraints: ["Look for overlaps and redundancies"],
      outputs: ["Unified prototype chain"],
      precedence: 100,
    },
    {
      id: "PROC-UNIQUE-KEYS-001",
      term: "UniqueKeysRule",
      layer: "universal",
      definition: "Rule definition",
      goal: "Guarantee that definition keys are unique across their scope and the prototype chain",
      inputs: ["Dictionary terms", "Rules", "Prototype chain"],
      constraints: [
        "A definition's key cannot duplicate another within the same scope",
        "A definition's key cannot duplicate any ancestor's key in the prototype chain",
      ],
      outputs: [
        "Globally unique, non-colliding definitions across scope and prototype chain",
      ],
      precedence: 100,
    },
  ] as Concept[],
  outputs: [
    "Generated .tsx files under /src (React app in TypeScript, scope: global)",
    "Diffs only when modifying generator/spec (scope: global)",
  ],
};

/* ================================
   DOMAIN RULES (QRET-specific)
   ================================ */
const domainRules: Concept[] = [
  {
    id: "DOM-REFUND-001",
    term: "RefundRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Calculate refunds accurately",
    inputs: ["ReceiptedItems", "ReturnedItems"],
    constraints: ["Item IDs must be numeric", "Quantity must be > 0"],
    outputs: [
      "Refund total = intersection of receiptedItems and returnedItems",
    ],
    precedence: 100,
  },
  {
    id: "DOM-NAVIGATION-001",
    term: "NavigationRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Allow free navigation between phases unless explicitly restricted",
    inputs: ["Navigation state", "Phase definitions"],
    constraints: ["Phases are navigable unless a rule explicitly blocks it"],
    outputs: ["Users can move freely between phases"],
    precedence: 50,
  },
  {
    id: "DOM-PHASE-001",
    term: "PhaseRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Advance phase only after validation and cleanup",
    inputs: ["Phase data"],
    constraints: [
      "Validation must succeed",
      "Cleanup must run before phase advance",
    ],
    outputs: ["Validated and cleaned state before advancing"],
    precedence: 100,
  },
  {
    id: "DOM-STAGE-001",
    term: "StageRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Prevent stages from auto-closing due to internal interaction",
    inputs: ["Stage state"],
    constraints: [
      "Stage closure cannot be triggered solely by internal component interaction",
    ],
    outputs: ["Stages remain open unless explicitly closed"],
    precedence: 80,
  },
  {
    id: "DOM-ACTOR-TILE-001",
    term: "ActorTileSoloRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Restrict Solo state to a single ActorTile in a context",
    inputs: ["ActorTile states", "Context"],
    constraints: [
      "Only one ActorTile can be marked Solo within a given context",
    ],
    outputs: ["Valid state with at most one Solo ActorTile per context"],
    precedence: 90,
  },
  {
    id: "DOM-DERIVED-VALUE-001",
    term: "DerivedValueRule",
    layer: "global",
    definition: "Rule definition",
    goal: "Ensure derived values are recalculated on render",
    inputs: ["Component props", "Component state"],
    constraints: [
      "Derived values must not be stored in state",
      "Derived values must be recalculated each render",
      "Derived values must always be deterministic given the same inputs",
    ],
    outputs: ["Components with reliable, up-to-date derived values"],
    precedence: 95,
  },
];

/* ================================
   UI SCREENS
   ================================ */

const screens: Concept[] = [
  {
    id: "COMP-HOME-001",
    term: "Home",
    layer: "screen",
    definition: "Home page screen",
    goal: "Provide a landing page",
    constraints: ["Must render Hello World"],
    outputs: ["src/Home.tsx"],
  },
  {
    ...floorplanComponent,
    outputs: ["src/components/FloorplanComponent.tsx"],
    // Ensure file path for FloorplanComponent
  },
];

/* --- TEMPLATES --- */
function renderPage(screen: Concept): string {
  return `// managed by AIDA
import React from "react";

export default function ${screen.term}(): JSX.Element {
  return <h1>Hello World</h1>;
}
`;
}

function renderComponent(comp: Concept, bgColor: string): string {
  // Each component renders a <div> with its label (term) and a background color
  return `// managed by AIDA
import React from "react";

export default function ${comp.term}(): JSX.Element {
  return (
    <div style={{
      background: "${bgColor}",
      padding: "1rem",
      margin: "0.5rem",
      borderRadius: "0.5rem",
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center"
    }}>
      ${comp.term}
    </div>
  );
}
`;
}
/* --- /TEMPLATES --- */

/* --- MAIN --- */
async function main(): Promise<void> {
  const outDir = path.resolve("src");
  await fs.mkdir(outDir, { recursive: true });

  const outputs: string[] = [];

  // Helper: assign a distinct background color per component depth
  const bgColors = [
    "#1976d2", // FloorplanComponent
    "#388e3c", // TopBar, LeftColumn, RightColumn, MainColumn
    "#fbc02d", // PageTitleRow, NavigationBarRow, MainContentRow, FooterRow
    "#8e24aa", // Deeper
    "#d84315", // More depth
  ];

  // Recursively generate components from a root Concept/component
  async function generateComponentFiles(
    comp: Concept,
    depth: number = 0
  ): Promise<void> {
    const bgColor = bgColors[depth % bgColors.length];
    if (comp.outputs && comp.outputs.length > 0) {
      for (const out of comp.outputs) {
        // Determine output path: if not absolute, write under src/components
        let filePath = out;
        if (!filePath.startsWith("src/")) {
          filePath = path.join("src/components", out);
        }
        const absPath = path.resolve(filePath);
        await fs.mkdir(path.dirname(absPath), { recursive: true });
        const code = renderComponent(comp, bgColor);
        await fs.writeFile(absPath, code, "utf8");
        outputs.push(filePath.replace(/\\/g, "/"));
      }
    }
    if (comp.children) {
      for (const child of comp.children) {
        await generateComponentFiles(child, depth + 1);
      }
    }
  }

  // Generate screens (Home and FloorplanComponent)
  for (const screen of screens) {
    if (screen.term === "Home") {
      // Home screen: output to src/Home.tsx
      const code = renderPage(screen);
      const file = path.join(outDir, `Home.tsx`);
      await fs.writeFile(file, code, "utf8");
      outputs.push(`src/Home.tsx`);
    } else if (screen.term === "FloorplanComponent") {
      // Generate FloorplanComponent and its children recursively
      await generateComponentFiles(screen, 0);
    }
  }

  console.log("Generated:", outputs.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
/* --- /MAIN --- */
