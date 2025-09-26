// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

/* --- SPEC --- */
type Scope = "universal" | "global" | "app" | "screen" | "component";

type Definition = {
  id: string;
  definition: string;
  scope: Scope;
  goal?: string;
  inputs?: string[];
  constraints?: string[];
  outputs?: string[];
  parent?: string;
  children?: string[];
  terms?: string[];
  precedence?: number;
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
   APP RULES (QRET scaffolding)
   ================================ */
type AppRules = {
  noSkeletons: boolean;
  singleAsset: boolean;
};

const appRules: AppRules = {
  noSkeletons: true, // no placeholder UIs, real logic only
  singleAsset: true, // generator is the one canonical source
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
const dictionary: Record<string, Definition> = {
  Ambiguity: {
    id: "TERM-AMBIGUITY-001",
    definition:
      "A lack of clarity in definitions, rules, or intent requiring resolution.",
    parent: "Spec",
    scope: "universal",
  },
  ActorTile: {
    id: "TERM-ACTOR-TILE-001",
    definition:
      "A UI component representing an individual actor. Only one can be marked as 'Solo' within a given context.",
    scope: "global",
  },
  Chat: {
    id: "TERM-CHAT-001",
    definition:
      "Interactive conversation between human and model, not authoritative.",
    scope: "universal",
  },
  Conditional: {
    id: "TERM-CONDITIONAL-001",
    definition:
      "A step that is optional for developers to include in a phase. If implemented, it is mandatory for the user.",
    scope: "universal",
  },
  Configurable: {
    id: "TERM-CONFIGURABLE-001",
    definition:
      "A design element whose behavior or presence can be toggled or adjusted by developers at build time.",
    scope: "universal",
  },
  Contradictions: {
    id: "TERM-CONTRADICTIONS-001",
    definition: "Conflicts between rules or definitions in the spec.",
    parent: "Spec",
    scope: "universal",
  },
  DerivedValue: {
    id: "TERM-DERIVED-VALUE-001",
    definition:
      "A value computed from other data. It must always be recalculated on render and never stored in persistent state.",
    scope: "global",
  },
  GeneratedCode: {
    id: "TERM-GENERATED-CODE-001",
    definition: "Code output produced deterministically from the spec.",
    parent: "Spec",
    scope: "universal",
  },
  Phase: {
    id: "TERM-PHASE-001",
    definition:
      "A distinct step or stage in the QRET workflow. Each phase can include up to four steps: (1) User Input (mandatory, visible UI), (2) Validity of Phase Repo (mandatory, below the UI), (3) Resolutions (conditional, may be included as a separate screen or workflow, always required if present), and (4) Cleanup (conditional, may be included to remove invalid entries).",
    scope: "global",
  },
  PrototypeChain: {
    id: "TERM-PROTOTYPE-CHAIN-001",
    definition:
      "The structured hierarchy of definitions and rules to ensure convergence.",
    scope: "universal",
  },
  ReceiptedItems: {
    id: "TERM-RECEIPTED-ITEMS-001",
    definition: "Items listed on a receipt that are eligible for return.",
    parent: "Spec",
    scope: "global",
  },
  Refund: {
    id: "TERM-REFUND-001",
    definition: "The total amount to be returned to the customer.",
    scope: "global",
  },
  ReturnedItems: {
    id: "TERM-RETURNED-ITEMS-001",
    definition: "Items provided by the customer for return.",
    parent: "Spec",
    scope: "global",
  },
  Spec: {
    id: "TERM-SPEC-001",
    definition: "The authoritative specification file (generate.ts).",
    scope: "universal",
  },
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
      definition: "Rule definition",
      goal: "Ensure the spec is the only authoritative source of truth",
      inputs: ["generate.ts spec"],
      constraints: ["No rules from chat", "No assumptions outside the spec"],
      outputs: ["Deterministic builds"],
      precedence: 100,
      scope: "global" as Scope,
      terms: ["Spec"],
    },
    {
      id: "PROC-COMPILATION-001",
      definition: "Rule definition",
      goal: "Ensure generated code compiles immediately",
      inputs: ["Generated code"],
      constraints: ["Must pass TypeScript compiler without errors"],
      outputs: ["Compilable .tsx files"],
      precedence: 0,
      scope: "global" as Scope,
      terms: ["GeneratedCode"],
    },
    {
      id: "PROC-CONTRADICTION-001",
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
      scope: "global" as Scope,
      terms: ["Spec", "Contradictions"],
    },
    {
      id: "PROC-CHAT-001",
      definition: "Rule definition",
      goal: "Ensure chat is non-binding",
      inputs: ["Chat context"],
      constraints: ["Chat may clarify but cannot introduce binding rules"],
      outputs: ["Spec remains authoritative"],
      precedence: 100,
      scope: "global" as Scope,
      terms: ["Chat", "Spec"],
    },
    {
      id: "PROC-AMBIGUITY-001",
      definition: "Rule definition",
      goal: "Surface ambiguities and conflicts explicitly",
      inputs: ["Spec"],
      constraints: [
        "Must generate warnings when ambiguity, gaps, or conflicts are detected",
      ],
      outputs: ["Warnings presented to user"],
      precedence: 100,
      scope: "global" as Scope,
      terms: ["Ambiguity", "Spec", "Conflicts"],
    },
    {
      id: "PROC-PROTOTYPE-CHAIN-001",
      definition: "Rule definition",
      goal: "Consolidate prototype chain where appropriate",
      inputs: ["Spec rules", "Dictionary terms"],
      constraints: ["Look for overlaps and redundancies"],
      outputs: ["Unified prototype chain"],
      precedence: 100,
      scope: "universal" as Scope,
      terms: ["PrototypeChain"],
    },
    {
      id: "PROC-UNIQUE-KEYS-001",
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
      scope: "global" as Scope,
      terms: ["Spec"],
    },
  ] as Definition[],
  outputs: [
    "Generated .tsx files under /src (React app in TypeScript, scope: global)",
    "Diffs only when modifying generator/spec (scope: global)",
  ],
};

/* ================================
   DOMAIN RULES (QRET-specific)
   ================================ */
const domainRules: Definition[] = [
  {
    id: "DOM-REFUND-001",
    definition: "Rule definition",
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
    id: "DOM-NAVIGATION-001",
    definition: "Rule definition",
    goal: "Allow free navigation between phases unless explicitly restricted",
    inputs: ["Navigation state", "Phase definitions"],
    constraints: ["Phases are navigable unless a rule explicitly blocks it"],
    outputs: ["Users can move freely between phases"],
    precedence: 50,
    scope: "global" as Scope,
    terms: ["Navigation"],
  },
  {
    id: "DOM-PHASE-001",
    definition: "Rule definition",
    goal: "Advance phase only after validation and cleanup",
    inputs: ["Phase data"],
    constraints: [
      "Validation must succeed",
      "Cleanup must run before phase advance",
    ],
    outputs: ["Validated and cleaned state before advancing"],
    precedence: 100,
    scope: "global" as Scope,
    terms: ["Validation", "Cleanup"],
  },
  {
    id: "DOM-STAGE-001",
    definition: "Rule definition",
    goal: "Prevent stages from auto-closing due to internal interaction",
    inputs: ["Stage state"],
    constraints: [
      "Stage closure cannot be triggered solely by internal component interaction",
    ],
    outputs: ["Stages remain open unless explicitly closed"],
    precedence: 80,
    scope: "global" as Scope,
    terms: ["Stage"],
  },
  {
    id: "DOM-ACTOR-TILE-001",
    definition: "Rule definition",
    goal: "Restrict Solo state to a single ActorTile in a context",
    inputs: ["ActorTile states", "Context"],
    constraints: [
      "Only one ActorTile can be marked Solo within a given context",
    ],
    outputs: ["Valid state with at most one Solo ActorTile per context"],
    precedence: 90,
    scope: "global" as Scope,
    terms: ["ActorTile"],
  },
  {
    id: "DOM-DERIVED-VALUE-001",
    definition: "Rule definition",
    goal: "Ensure derived values are recalculated on render",
    inputs: ["Component props", "Component state"],
    constraints: [
      "Derived values must not be stored in state",
      "Derived values must be recalculated each render",
    ],
    outputs: ["Components with reliable, up-to-date derived values"],
    precedence: 95,
    scope: "global" as Scope,
    terms: ["DerivedValue"],
  },
];

/* ================================
   UI SCREENS
   ================================ */
// screens will be defined later
/* --- /SPEC --- */

/* --- TEMPLATES --- */
function renderPage(screen: PageScreen): string {
  return `// managed by AIDA
import React from "react";

export default function ${screen.name}(): JSX.Element {
  return <h1>Hello World</h1>;
}
`;
}

function renderForm(screen: FormScreen): string {
  return `// managed by AIDA
import React from "react";

export default function ${screen.name}(): JSX.Element {
  return <h1>Hello World</h1>;
}
`;
}
/* --- /TEMPLATES --- */

/* --- MAIN --- */
async function main(): Promise<void> {
  const outDir = path.resolve("src");
  await fs.mkdir(outDir, { recursive: true });

  const outputs: string[] = [];

  for (const screen of screens) {
    let code: string;
    switch (screen.type) {
      case "page":
        code = renderPage(screen);
        break;
      case "form":
        code = renderForm(screen);
        break;
      default: {
        // Exhaustiveness guard
        const _never: never = screen;
        throw new Error("Unsupported screen type: " + JSON.stringify(_never));
      }
    }
    const file = path.join(outDir, `${screen.name}.tsx`);
    await fs.writeFile(file, code, "utf8");
    outputs.push(`src/${screen.name}.tsx`);
  }

  console.log("Generated:", outputs.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
/* --- /MAIN --- */
