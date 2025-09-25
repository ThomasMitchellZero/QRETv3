// generate.cjs
// managed by AIDA

const fs = require("fs");
const path = require("path");
const specialWord = "pony";

/* --- SPEC --- */
const workingAgreementRules = {
  managedByAida: true, // every generated file must carry // managed by AIDA
  confirmBeforeGuess: true, // only one clarifying question if ambiguity
  noSilentFixes: true, // never “fix” spec silently
};

const appRules = {
  noSkeletons: true, // no placeholder UIs, real logic only
  singleAsset: true, // generator is the one canonical source
};

const tempRules = {
  // put temporary process rules here, remove later
};

const screens = [
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

/* --- TEMPLATES --- */
function renderPage(screen) {
  return `// managed by AIDA
import React from "react";

export default function ${screen.name}() {
  return <div>${screen.content}</div>;
}
`;
}
/* --- /TEMPLATES --- */

/* --- MAIN --- */
function main() {
  const outDir = path.join(process.cwd(), "src");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const screen of screens) {
    if (screen.type === "page") {
      const code = renderPage(screen);
      fs.writeFileSync(path.join(outDir, `${screen.name}.tsx`), code, "utf8");
    }
  }
  console.log("Generated:", screens.map((s) => `src/${s.name}.tsx`).join(", "));
}

main();
/* --- /MAIN --- */
