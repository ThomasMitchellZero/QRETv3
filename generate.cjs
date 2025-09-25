// generate.cjs
// managed by AIDA

const fs = require("fs");
const path = require("path");
const specialWord = "pony";

/* --- SPEC --- */
const rules = {
  noSkeletons: true,
  singleAsset: true,
  confirmBeforeGuess: true,
  managedByAida: true,
};

const screens = [
  {
    name: "HelloWorld",
    type: "page",
    content: "This is a generated component.",
  },
];
/* --- /SPEC --- */

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
