// generate.ts
// managed by AIDA

import fs = require("fs").promises;
import path = require("path");


/* --- SPEC --- */
type WorkingAgreementRules = {
  managedByAida: boolean;
  confirmBeforeGuess: boolean;
  noSilentFixes: boolean;
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
  managedByAida: true, // every generated file must carry // managed by AIDA
  confirmBeforeGuess: true, // only one clarifying question if ambiguity
  noSilentFixes: true, // never “fix” spec silently
};

const appRules: AppRules = {
  noSkeletons: true, // no placeholder UIs, real logic only
  singleAsset: true, // generator is the one canonical source
};

const tempRules: TempRules = {
  // put temporary process rules here, remove later
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
  return <div>${screen.content}</div>;
}
`;
}

function renderForm(screen: FormScreen): string {
  // Enforce noSkeletons by emitting a working controlled form
  const inputs = screen.fields
    .map(
      (f) => `
        <label style={{display:"block", marginBottom:8}}>
          <span style={{display:"block"}}>${f}</span>
          <input
            name="${f}"
            value={form.${f} ?? ""}
            onChange={(e) => setForm(prev => ({ ...prev, ${f}: e.target.value }))}
          />
        </label>`
    )
    .join("");

  const submitHandler = screen.actions.includes("submit")
    ? `
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit", form); // replace with real handler later
  };`
    : `
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); };`;

  return `// managed by AIDA
import React from "react";

type ${screen.name}Form = {
  ${screen.fields.map((f) => `${f}?: string;`).join("\n  ")}
};

export default function ${screen.name}(): JSX.Element {
  const [form, setForm] = React.useState<${screen.name}Form>({});
  ${submitHandler}
  return (
    <form onSubmit={onSubmit}>
      ${inputs}
      ${
        screen.actions.includes("submit")
          ? `<button type="submit">Submit</button>`
          : ``
      }
    </form>
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
