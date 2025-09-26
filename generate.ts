// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

/* --- SPEC --- */
type Scope = "universal" | "global" | "screen" | "component";

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

// Tooling requirements: mandatory, part of spec, must be present for generator runs
const tooling = {
  generatorLanguage: "ts",
  generatorRunner: "tsx",
  genScript: "gen",
  genCommand: "npx tsx generate.ts",
  outputExtension: ".tsx",
  ensurePackageScript: true,
  requireTypeScriptForApp: true,
  enforceESM: true,
  note: "Any change to tooling must be made in the spec. Chat proposals are not authoritative.",
};

type AppRules = {
  noSkeletons: boolean;
  singleAsset: boolean;
};

type TempRules = Record<string, unknown>;

type PageScreen = {
  name: string;
  type: "page";
  content: string;
  changeType?: "add" | "edit" | "replace";
};
type FormScreen = {
  name: string;
  type: "form";
  fields: string[];
  actions: string[]; // e.g., ["submit"]
  changeType?: "add" | "edit" | "replace";
};
type Screen = PageScreen | FormScreen;

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

const appRules: AppRules = {
  noSkeletons: true, // no placeholder UIs, real logic only
  singleAsset: true, // generator is the one canonical source
};

const tempRules: TempRules = {
  // put temporary process rules here, remove later
};

const dictionary: Record<string, string> = {
  // term: definition
};


const defaults = {
  sizeUnit: "rem", // default unit for spacing, margin, padding
  fontUnit: "rem", // default for font sizes
  colorFormat: "hex", // default color format
  responsive: "mobileFirst", // base assumption for breakpoints
};


const policies = {
  done: {
    compilePass: true,       // must pass TypeScript compile
    runPass: true,           // must run under npm start
    styleRequired: false,    // CSS/styling not required at this stage
    featureComplete: false,  // partial implementations are acceptable unless specified otherwise
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
    moderate: "warn" as const,    // generate but flag with standardized warnings
    critical: "ask" as const,     // stop and request clarification
  },
};


const intent = {
  goal: "Build React prototype deterministically from spec",
  precedence: 100, // Highest authority at the app level
  inputs: ["Screen definitions", "Working agreement rules", "Tooling rules"],
  constraints: [
    {
      rule: "Spec is the single source of truth",
      precedence: 100,
      scope: "global" as Scope, // scope can be: universal | global | screen | component
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
  ],
  outputs: [
    "Generated .tsx files under /src",
    "Diffs only when modifying generator/spec",
  ],
};

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
