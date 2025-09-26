// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

/* --- SPEC --- */
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

type PageScreen = { name: string; type: "page"; content: string };
type FormScreen = {
  name: string;
  type: "form";
  fields: string[];
  actions: string[]; // e.g., ["submit"]
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

const intent = {
  goal: "Build React prototype deterministically from spec",
  precedence: 100, // Highest authority at the app level
  inputs: ["Screen definitions", "Working agreement rules", "Tooling rules"],
  constraints: [
    {
      rule: "Spec is the single source of truth",
      precedence: 100,
      scope: "global",
    },
    {
      rule: "Generated code must compile immediately",
      precedence: 0,
      scope: "global",
    },
    {
      rule: "Do not silently fix contradictions",
      precedence: 100,
      scope: "global",
    },
    {
      rule: "Do not take binding rules from chat",
      precedence: 100,
      scope: "global",
    },
    {
      rule: "Must explicitly warn about any ambiguity, spec gaps, or conflicting rules",
      precedence: 100,
      scope: "global",
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
  },
  {
    name: "Login",
    type: "form",
    fields: ["email", "password"],
    actions: ["submit"],
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
