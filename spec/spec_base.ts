// spec_base.ts — AIDA/QRET shared spec foundation
// managed by AIDA

/* ================================
   TYPES
   ================================ */
export type Scope = "universal" | "global" | "screen" | "component";

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
};

/* ================================
   WORKING AGREEMENT (UNIVERSAL)
   ================================ */
export const WorkingAgreement: Concept[] = [
  {
    id: "PROC-SSOT-001",
    term: "SpecIsOnlySource",
    layer: "universal",
    definition:
      "The spec is the sole binding authority; chat is non-authoritative.",
    precedence: 100,
    constraints: [
      "All cross-thread rules must be in spec",
      "No silent fixes",
      "Ask until clear when ambiguity is non-trivial",
    ],
  },
  {
    id: "PROC-DIFF-001",
    term: "DiffOnlyEdits",
    layer: "universal",
    definition: "All code changes are delivered as diffs/patches.",
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
  {
    id: "SCAN-001",
    term: "Scan",
    layer: "universal",
    definition: "Analyze only the currently open file/tab.",
    precedence: 100,
  },
  {
    id: "SWEEPO-001",
    term: "Sweepo",
    layer: "universal",
    definition:
      "Repo-level inspection that refreshes from the remote to ensure model and user see the same state.",
    constraints: [
      "Sweepo must refresh against the remote repo to guarantee latest state",
    ],
    precedence: 100,
  },
  {
    id: "PROC-SWEEPO-002",
    term: "SweepoAlwaysRemote",
    layer: "universal",
    definition:
      "Sweepo must always pull the most current state from the remote GitHub repo, never from memory or local context.",
    constraints: [
      "User commits and pushes first",
      "Sweepo fetches fresh state from remote repo",
      "This guarantees both model and user are aligned to the same authoritative source",
    ],
    precedence: 100,
  },
  {
    id: "PROC-SWEEPO-003",
    term: "SweepoReportUpdate",
    layer: "universal",
    definition:
      "Sweepo must, when possible, report the timestamp or identifier of the most recent update from the remote GitHub repo.",
    constraints: [
      "Report last commit hash or timestamp if available",
      "If remote metadata cannot be retrieved, explicitly state limitation",
      "Purpose: ensure user visibility into freshness of fetched repo state",
    ],
    precedence: 100,
  },
];

/* ================================
   UNIVERSAL POLICIES / STANDARDS
   ================================ */
export const Policies = {
  done: {
    compilePass: true,
    runPass: true,
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
  error: {
    trivial: "autoFill" as const,
    moderate: "warn" as const,
    critical: "ask" as const,
  },
  styling: {
    tool: "scss" as const,
    scope: "global" as const,
    units: "rem" as const,
    organization: "components-first" as const, // colocate .scss with components
  },
};

/* ================================
   DICTIONARY (UNIVERSAL TERMS)
   ================================ */
export const Dictionary: Record<string, Concept> = {
  PrototypeChain: {
    id: "DICT-PROTOTYPE-001",
    term: "PrototypeChain",
    layer: "universal",
    definition:
      "Resolution order over scope and precedence for deriving effective intent.",
  },
  DerivedValue: {
    id: "DICT-DERIVED-001",
    term: "DerivedValue",
    layer: "universal",
    definition:
      "A value computed deterministically from current inputs; never stored.",
    constraints: [
      "Do not persist derived values",
      "Recompute on render or via hooks",
    ],
  },
  Floorplan: {
    id: "DICT-FLOORPLAN-001",
    term: "Floorplan",
    layer: "global",
    definition:
      "Global page layout: ecosystem top bar, optional side columns, main column rows.",
  },
};

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
   EXPORT (AGGREGATE SPEC BASE)
   ================================ */
export const SpecBase = {
  WorkingAgreement,
  Policies,
  Dictionary,
  Conventions,
  BuildTopology,
  Lifecycle,
  BucketPolicy,
};
