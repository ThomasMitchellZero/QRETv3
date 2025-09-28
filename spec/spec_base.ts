// spec_base.ts — AIDA/QRET shared spec foundation
// This file is the Single Source of Truth (SSoT).
// managed by AIDA

/* ================================
   TYPES
   ================================ */
export type Scope = "universal" | "global" | "screen" | "component" | "app";

export type Concept = {
  id: string;
  term: string;
  layer: Scope;
  definition?: string;
  goal?: string;
  inputs?: string[];
  constraints?: string[];
  outputs?: string[]; // paths or artifacts
  precedence?: number; // higher wins within same scope
  children?: Concept[];
  styleClass?: string;
};

/* ================================
   WORKING AGREEMENT (UNIVERSAL)
   ================================ */
// --- WORKING AGREEMENT (UNIVERSAL) ---
export const WorkingAgreement: Concept[] = [
  {
    id: "PROC-SSOT-001",
    term: "SpecIsOnlySource",
    layer: "universal",
    definition:
      "The spec is the only binding authority; chat is non-authoritative.",
    precedence: 100,
    constraints: [
      "All cross-thread rules must be in spec",
      "No silent fixes",
      "Ask until clear when ambiguity is non-trivial",
    ],
  },
  {
    id: "PROC-NOSILENT-001",
    term: "NoSilentFixes",
    layer: "universal",
    definition: "Never 'fix' spec or code silently; always surface changes.",
    precedence: 100,
  },
  {
    id: "PROC-TOOLING-001",
    term: "ToolingInSpec",
    layer: "universal",
    definition: "Tooling requirements must be explicitly declared in the spec.",
    precedence: 100,
  },
  {
    id: "PROC-WARN-CTX-001",
    term: "WarnOnContextRisk",
    layer: "universal",
    definition: "Must warn the user if there is any risk of losing context.",
    precedence: 100,
  },
  {
    id: "PROC-WARN-001",
    term: "StandardizedWarnings",
    layer: "universal",
    definition: "Auto decisions are annotated using a standard warning format.",
    constraints: ["Use // ⚠️ Warning: <reason>"],
    precedence: 100,
  },
  {
    id: "PROC-THREAD-RESET-001",
    term: "ThreadResetRule",
    layer: "universal",
    definition:
      "Spec persists across threads; chat context does not unless codified.",
    constraints: [
      "Spec persists and remains authoritative",
      "Thread-specific chat context is ephemeral",
      "Shorthand or temporary chat rules vanish on reset",
    ],
    precedence: 100,
  },
  // Consolidated diff/patch, binding authority, and ambiguity resolution rules:
  {
    id: "PROC-DIFF-REQSTD-001",
    term: "DiffsAreRequiredAndStandardized",
    layer: "universal",
    definition:
      "All changes must be delivered as standard diffs/patches, never as direct edits.",
    precedence: 100,
  },
  {
    id: "PROC-SPEC-BINDING-001",
    term: "SpecIsBindingChatIsAdvisory",
    layer: "universal",
    definition:
      "Spec is binding and authoritative; chat may clarify but is never binding.",
    precedence: 100,
  },
  {
    id: "PROC-AMBIGUITY-RES-001",
    term: "ResolveAmbiguityThroughClarification",
    layer: "universal",
    definition:
      "All ambiguity is resolved by asking clarifying questions until intent is clear.",
    precedence: 100,
  },
  // Scan/Sweepo rules (appear only here, not in Dictionary)
  {
    id: "PROC-SCAN-001",
    term: "Scan",
    layer: "universal",
    definition: "Analyze only the currently open file/tab.",
    precedence: 100,
    constraints: [
      "Scan must not refer to the entire repo",
      "Scan operates only on the active file in the editor",
    ],
  },
  {
    id: "PROC-SWEEPO-001",
    term: "Sweepo",
    layer: "universal",
    definition:
      "Quick, default repo-level inspection using only the state of currently open VS Code windows as authoritative. Sweepo does not fetch the remote repo; it assumes the open files in the editor reflect the true state.",
    precedence: 100,
    constraints: [
      "Sweepo may not replace Scan",
      "Sweepo is repo-level only",
      "Sweepo treats open VS Code windows as the single source of truth for the repo",
      "Sweepo does not perform remote fetch or drift detection",
      "Sweepo is fast and assumes user intent matches open editor state",
      "If files are not open, Sweepo cannot analyze them",
    ],
  },
  // DeepSweepo: full remote repo scan with drift detection and warnings
  {
    id: "PROC-DEEPSWEEPO-001",
    term: "DeepSweepo",
    layer: "universal",
    definition:
      "Comprehensive, full remote GitHub repo inspection that always fetches the latest remote state for authoritative analysis. DeepSweepo includes drift detection and explicit overwrite warnings if the local understanding differs from the remote.",
    precedence: 100,
    inputs: ["repoUrl", "branch"],
    constraints: [
      "DeepSweepo always pulls the latest state from the remote GitHub repo",
      "User must commit and push before DeepSweepo runs",
      "If remote metadata cannot be retrieved, DeepSweepo must explicitly state limitation",
      "If drift is detected between previous and new repo snapshots, model must warn the user before replacing prior understanding",
      "On drift warning, user may inspect differences or allow overwrite",
      "After overwrite, old repo understanding is fully replaced by the new snapshot",
      "DeepSweepo is slower and more authoritative than Sweepo",
      "DeepSweepo requires explicit repo URL and branch context",
    ],
  },
];
/* ================================
   APP-LEVEL INSTANCES
   ================================ */
export const AppInstances: Concept[] = [
  {
    id: "APP-QRET-001",
    term: "QRET-DeepSweepo",
    layer: "app",
    definition: "App-level binding of DeepSweepo to the QRET repo.",
    inputs: ["https://github.com/ThomasMitchellZero/QRETv3.git", "main"],
    precedence: 100,
  },
];

/* ================================
   UNIVERSAL POLICIES / STANDARDS
   ================================ */
export const Policies = {
  done: {
    buildPass: true,
    styleRequired: false,
    featureComplete: false,
  },
  tieBreaker: {
    rule: "scopeFirst",
    sameScopeResolution: "precedence",
    sameScopeAndPrecedence: "lastDefined",
  },
  optimization: { prioritize: "clarity" as const },
  naming: { enforceDictionary: true, onMissingTerm: "error" as const },
  // Planned upgrade: StrictTerminologyEnforcement
  // Universal policy to enforce consistent terminology across the spec.
  // Not yet active — dictionary pruning pass required before enabling.
  error: {
    trivial: "autoFill" as const,
    moderate: "warn" as const,
    critical: "ask" as const,
  },
  styling: {
    standard: {
      tool: "scss" as const,
      scope: "global" as const,
      units: "rem" as const,
      organization: "components-first" as const,
      sourceFile: "stable/style/style_base.scss",
      // All debug colors in SCSS are treated as final unless spec explicitly overrides.
      debugColorsTreatedAsFinal: true,
      // Inline style props (e.g., style={{}} in React) must not override class-based SCSS styling.
      noInlineStyleOverrides: true,
    },
  },
};

// --- DICTIONARY (UNIVERSAL TERMS) ---
export const Dictionary: Record<string, Concept> = {
  "PrototypeChain": {
    id: "DICT-PROTOTYPE-001",
    term: "PrototypeChain",
    layer: "universal",
    definition:
      "Resolution order over scope and precedence for deriving effective intent.",
  },
  "DerivedValue": {
    id: "DICT-DERIVED-001",
    term: "DerivedValue",
    layer: "universal",
    definition:
      "A value computed deterministically from current inputs; never stored in state.",
    constraints: [
      "Do not persist derived values",
      "Recompute on render or via hooks",
    ],
  },
  "Ambiguity": {
    id: "DICT-AMBIGUITY-001",
    term: "Ambiguity",
    layer: "universal",
    definition:
      "A lack of clarity in definitions, rules, or intent requiring resolution.",
  },
  "ActorTile": {
    id: "DICT-ACTOR-TILE-001",
    term: "ActorTile",
    layer: "global",
    definition:
      "A UI component representing an individual actor. Only one can be marked as 'Solo' within a given context.",
  },
  "Chat": {
    id: "DICT-CHAT-001",
    term: "Chat",
    layer: "universal",
    definition:
      "Interactive conversation between human and model, not authoritative.",
  },
  "Conditional": {
    id: "DICT-CONDITIONAL-001",
    term: "Conditional",
    layer: "universal",
    definition:
      "A step that is optional for developers to include in a phase. If implemented, it is mandatory for the user.",
  },
  "Configurable": {
    id: "DICT-CONFIGURABLE-001",
    term: "Configurable",
    layer: "universal",
    definition:
      "A design element whose behavior or presence can be toggled or adjusted by developers at build time.",
  },
  "Contradictions": {
    id: "DICT-CONTRADICTIONS-001",
    term: "Contradictions",
    layer: "universal",
    definition: "Conflicts between rules or definitions in the spec.",
  },
  "GeneratedCode": {
    id: "DICT-GENERATED-CODE-001",
    term: "GeneratedCode",
    layer: "universal",
    definition: "Code output produced deterministically from the spec.",
  },
  "Phase": {
    id: "DICT-PHASE-001",
    term: "Phase",
    layer: "global",
    definition:
      "A distinct step or stage in the QRET workflow consisting of required user interaction and supporting logic.",
  },
  "ReceiptedItems": {
    id: "DICT-RECEIPTED-ITEMS-001",
    term: "ReceiptedItems",
    layer: "global",
    definition: "Items listed on a receipt that are eligible for return.",
  },
  "Refund": {
    id: "DICT-REFUND-001",
    term: "Refund",
    layer: "global",
    definition: "The total amount to be returned to the customer.",
  },
  "ReturnedItems": {
    id: "DICT-RETURNED-ITEMS-001",
    term: "ReturnedItems",
    layer: "global",
    definition: "Items provided by the customer for return.",
  },
  "Spec": {
    id: "DICT-SPEC-001",
    term: "Spec",
    layer: "universal",
    definition: "The authoritative specification file (spec_base.ts).",
  },
};

// Defaults from generate.ts
export const Defaults = {
  sizeUnit: "rem",
  fontUnit: "rem",
  colorFormat: "hex",
  responsive: "mobileFirst",
};

// Domain rules from generate.ts
export const DomainRules: Concept[] = [
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
   UNIVERSAL CODING CONVENTIONS
   ================================ */
export const Conventions: Concept[] = [
  {
    id: "STD-FOLDERS-001",
    term: "FolderStructure",
    layer: "universal",
    definition: "Standard folders for React + TS + SCSS.",
    outputs: [
      "src/components",
      "src/screens",
      "src/layout",
      "src/hooks",
      "src/types",
      "spec/",
      "stable/",
    ],
    precedence: 100,
  },
  {
    id: "STD-NAMING-001",
    term: "NamingConventions",
    layer: "universal",
    definition:
      "PascalCase components/files, camelCase vars/functions, UPPER_SNAKE_CASE constants.",
    precedence: 100,
  },
  {
    id: "STD-WIRING-001",
    term: "ComponentWiring",
    layer: "universal",
    definition:
      "Screens compose layouts and components; props are typed; default exports per component.",
    precedence: 100,
  },
  {
    id: "STD-REFLOW-001",
    term: "RefactorSafety",
    layer: "universal",
    definition:
      "Use tsconfig path aliases; avoid deep relative imports; compute derived values in hooks.",
    precedence: 100,
  },
];

/* ================================
   STABLE VS GENERATED POLICY
   ================================ */
export const BuildTopology = {
  stableDir: "stable",
  generatedDir: "src", // never hand-edit; overwritten by generator
  rule: "Stable components live outside /src; generator only writes to /src",
};

/* ================================
   LIFECYCLE POLICY
   ================================ */
export const Lifecycle = {
  rule: "singleSourceId" as const, // An ID is defined in exactly one place at a time
  stages: [
    "specOnly", // defined only in spec as intent + constraints
    "stablePromoted", // implemented as React in /stable, spec references file only
    "deprecated", // optionally retired, with archival notes
  ],
  metadata: {
    storage: "adjacentMetaFile", // preserve original spec block in a .meta.json alongside promoted component
    requirement: true, // metadata must always travel with promoted components
  },
};

/* ================================
   BUCKET POLICY
   ================================ */
export const BucketPolicy = {
  rule: "bucketFilesOverGodFile" as const,
  definition:
    "Components, layouts, hooks, and types are organized into a small set of bucket files rather than one god file or many micro-files.",
  buckets: [
    "stable/components/index.tsx", // all leaf components together
    "stable/layouts/index.tsx", // layouts such as Floorplan, NavBar
    "stable/hooks/index.ts", // custom hooks together
    "stable/types/index.ts", // shared types/interfaces
  ],
  constraints: [
    "Most changes should only require one bucket open",
    "In rare cross-bucket breaks, at most two buckets need to be open simultaneously",
    "Spec continues to declare global intent; buckets implement it",
  ],
  precedence: 100,
  scope: "universal" as Scope,
};

/* ================================
   APP COMPONENTS AND SCREENS
   ================================ */

// AppComponents removed; Floorplan structure is now under AppScreens only.

export const AppScreens: Concept[] = [
  {
    id: "SCREEN-HOME-001",
    term: "Home",
    layer: "screen",
    definition: "The main home screen of the application.",
    precedence: 100,
  },
  {
    id: "SCREEN-FLOORPLAN-001",
    term: "Floorplan",
    layer: "screen",
    definition:
      "The global page layout: ecosystem top bar, optional side columns, main column rows.",
    precedence: 100,
    outputs: ["FloorplanComponent.tsx"],
    styleClass: "floorplan",
    children: [
      {
        id: "COMP-TOPBAR-001",
        term: "TopBar",
        layer: "component",
        definition: "Ecosystem top bar row.",
        outputs: ["TopBar.tsx"],
        styleClass: "top-bar",
      },
      {
        id: "COMP-LEFTCOL-001",
        term: "LeftColumn",
        layer: "component",
        definition: "Optional left-side column, 25% width.",
        outputs: ["LeftColumn.tsx"],
        styleClass: "left-column",
        children: [
          {
            id: "COMP-LEFTCOL-TITLE-001",
            term: "LeftColumnTitle",
            layer: "component",
            definition:
              "Title row within the LeftColumn for labeling or contextual heading.",
            outputs: ["LeftColumnTitle.tsx"],
            styleClass: "left-column-title",
          },
        ],
      },
      {
        id: "COMP-RIGHTCOL-001",
        term: "RightColumn",
        layer: "component",
        definition: "Optional right-side column, 25% width.",
        outputs: ["RightColumn.tsx"],
        styleClass: "right-column",
        children: [
          {
            id: "COMP-RIGHTCOL-TITLE-001",
            term: "RightColumnTitle",
            layer: "component",
            definition:
              "Title row within the RightColumn for labeling or contextual heading.",
            outputs: ["RightColumnTitle.tsx"],
            styleClass: "right-column-title",
          },
        ],
      },
      {
        id: "COMP-MAINCOL-001",
        term: "MainColumn",
        layer: "component",
        definition: "Main column that expands to fill remaining width.",
        outputs: ["MainColumn.tsx"],
        styleClass: "main-column",
        children: [
          {
            id: "COMP-PAGETITLE-001",
            term: "PageTitleRow",
            layer: "component",
            definition: "Row containing the page title and exit button.",
            outputs: ["PageTitleRow.tsx"],
            styleClass: "page-title-row",
          },
          {
            id: "COMP-NAVBAR-001",
            term: "NavigationBarRow",
            layer: "component",
            definition: "Row containing navigation nodes.",
            outputs: ["NavigationBarRow.tsx"],
            styleClass: "nav-bar-row",
          },
          {
            id: "COMP-MAINCONTENT-001",
            term: "MainContentRow",
            layer: "component",
            definition: "Configurable main content row.",
            outputs: ["MainContentRow.tsx"],
            styleClass: "main-content-row",
          },
          {
            id: "COMP-FOOTER-001",
            term: "FooterRow",
            layer: "component",
            definition:
              "Footer row with refund display (left) and continuation button (right).",
            outputs: ["FooterRow.tsx"],
            styleClass: "footer-row",
          },
        ],
      },
    ],
  },
];

/* ================================
   EXPORT AGGREGATE SPEC BASE
   ================================ */
export const SpecBase = {
  WorkingAgreement,
  Policies,
  Dictionary,
  Conventions,
  BuildTopology,
  Lifecycle,
  BucketPolicy,
  AppScreens,
  AppInstances,
};
