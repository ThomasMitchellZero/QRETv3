// generate.ts
// managed by AIDA

import { promises as fs } from "fs";
import path from "path";

import { type Concept } from "./spec/spec_base";
import {
  AppComponents,
  AppScreens,
  Dictionary,
  SpecBase,
  DomainRules,
} from "./spec/spec_base";

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

/* ================================
   VALIDATION (Spec Linter)
   ================================ */
function flattenConceptTree(root: Concept): Concept[] {
  const acc: Concept[] = [root];
  if (root.children && root.children.length) {
    for (const c of root.children) acc.push(...flattenConceptTree(c));
  }
  return acc;
}

function collectAllConcepts(): Concept[] {
  const dict = Object.values(Dictionary);
  const intents = SpecBase.WorkingAgreement ?? [];
  const domains = DomainRules ?? [];
  // Include AppComponents and AppScreens
  const components = AppComponents ?? [];
  const screens = AppScreens ?? [];
  // `screens` may include nested component trees (e.g., FloorplanComponent)
  const screenTrees = screens.flatMap((s) => flattenConceptTree(s));
  const componentTrees = components.flatMap((c) => flattenConceptTree(c));
  return [...dict, ...intents, ...domains, ...componentTrees, ...screenTrees];
}

function validateSpec(): void {
  const concepts = collectAllConcepts();
  const errors: string[] = [];

  // 1) Duplicate ID check across the entire prototype chain
  const idCounts = new Map<string, number>();
  for (const c of concepts) {
    idCounts.set(c.id, (idCounts.get(c.id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts.entries()) {
    if (count > 1) errors.push(`Duplicate id detected: ${id} (count=${count})`);
  }

  // 2) Ensure any declared outputs end with .tsx (TypeScript React only)
  for (const c of concepts) {
    if (!c.outputs) continue;
    for (const out of c.outputs) {
      if (!out.endsWith(".tsx")) {
        errors.push(
          `Output for ${c.term} (${c.id}) must be .tsx, found: ${out}`
        );
      }
    }
  }

  if (errors.length) {
    const details = errors.map((e) => ` - ${e}`).join("\n");
    throw new Error(
      `Spec validation failed with ${errors.length} issue(s):\n${details}`
    );
  }
}

/* --- MAIN --- */
async function main(): Promise<void> {
  validateSpec();
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
  for (const screen of AppScreens) {
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
