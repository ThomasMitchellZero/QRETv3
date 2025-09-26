// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

/* --- SPEC --- */
type Scope = "universal" | "global" | "screen" | "component";

type Rule = {
  goal: string;
  inputs: string[];
  constraints: string[];
  outputs: string[];
  precedence: number;
  scope: Scope;
  terms?: string[]; // dictionary terms this rule depends on
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
const dictionary: Record<string, string> = {
  // term: definition
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
      goal: "Ensure the spec is the only authoritative source of truth",
      inputs: ["generate.ts spec"],
      constraints: ["No rules from chat", "No assumptions outside the spec"],
      outputs: ["Deterministic builds"],
      precedence: 100,
      scope: "global" as Scope,
      terms: ["Spec"],
    },
    {
      rule: "Generated code must compile immediately",
      precedence: 0,
      scope: "global" as Scope, // scope can be: universal | global | screen | component
    },
    {
      rule: "Do not silently fix contradictions",
      precedence: 100,
      scope: "global" as Scope, // scope can be: universal | global | screen | component
    },
    {
      rule: "Do not take binding rules from chat",
      precedence: 100,
      scope: "global" as Scope, // scope can be: universal | global | screen | component
    },
    {
      rule: "Must explicitly warn about any ambiguity, spec gaps, or conflicting rules",
      precedence: 100,
      scope: "global" as Scope, // scope can be: universal | global | screen | component
    },
    {
      rule: "Always look for opportunities to consolidate the prototype chain where it makes sense",
      precedence: 100,
      scope: "universal" as Scope,
    },
  ] as Rule[],
  outputs: [
    "Generated .tsx files under /src",
    "Diffs only when modifying generator/spec",
  ],
};

/* ================================
   DOMAIN RULES (QRET-specific)
   ================================ */
const domainRules: Rule[] = [
  {
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
];

/* ================================
   UI SCREENS
   ================================ */
const screens: Screen[] = [
  {
    name: "HelloWorld",
    type: "page",
    content: "This is a generated component.",
    changeType: "replace",
  },
  {
    name: "Login",
    type: "form",
    fields: ["email", "password"],
    actions: ["submit"],
    changeType: "replace",
  },
];
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
