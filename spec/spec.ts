// ==========================================================
// NOTE: The following sections were deliberately removed:
//   1. BuildTopology
//   2. Lifecycle
//   3. BucketPolicy
// These sections are now explicitly deprecated and should NOT be referenced.
// Their prior functional roles (promotion logic, stable/src boundaries, bucket file organization)
// have been replaced by the new explicit delegation model, where:
//   - App.tsx is canonical for runtime structure
//   - style.scss is canonical for styling
//   - All promotion, organization, and lifecycle concerns are delegated to stable, well-defined artifacts
//   - The spec only delegates, it does not enforce or describe bucket/stable/src boundaries itself
// If you need the prior logic, refer to the new delegation policies in WorkingAgreement and Conventions.
// ==========================================================
// spec.ts — AIDA/QRET project specification
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
  children?: Concept[];
  styleClass?: string;
  defersTo?: string[]; // Higher-level rules this rule defers to
};

// UNIVERSAL rules defer to TEMP rules where explicitly defined.
// Otherwise, UNIVERSAL supersedes GLOBAL and APP.
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
      "The spec is the only binding authority; chat is non-authoritative. This rule enforces the hierarchy God > Universal > Global > App > Component unless explicitly overridden by God rules.",
    constraints: [
      "All cross-thread rules must be in spec",
      "No silent fixes",
      "Ask until clear when ambiguity is non-trivial",
      "This hierarchy must always be respected unless God rules override",
      "Temporary or shorthand chat rules are automatically discarded on thread reset",
    ],
  },
  {
    id: "PROC-DELEGATION-001",
    term: "DelegatedAuthority",
    layer: "universal",
    definition:
      "The Spec file is the Single Source of Truth (SSoT), but may delegate canonical authority for specific concerns to stable, well-defined artifacts (e.g., style.scss for styling, App.tsx for runtime structure). Such delegation is explicit in the spec and binding for those domains.",
  },
  // Consolidated fail loud/escalation rule
  {
    id: "PROC-FAILLOUD-001",
    term: "FailLoudEscalation",
    layer: "universal",
    definition:
      "All unexpected, underspecified, or potentially unsafe conditions must fail loud using a standardized escalation path. Silent fixes are prohibited.",
    constraints: [
      "Use standardized warnings: // ⚠️ Warning: <reason>",
      "If ambiguity or underspecification exists, ask until intent is clear",
      "If risk of losing context, issue explicit warning",
      "If drift detected (e.g., DeepSweepo mismatch), surface differences and require confirmation before overwrite",
      "Trivial issues may autofill, but must still be visible in output",
    ],
  },
  {
    id: "PROC-DIFF-REQSTD-001",
    term: "DiffsAreRequiredAndStandardized",
    layer: "universal",
    definition:
      "All changes must be delivered as standard diffs/patches, never as direct edits.",
  },
  {
    id: "PROC-SPEC-SIMPLIFY-001",
    term: "SpecSimplificationAndStandardization",
    layer: "universal",
    definition:
      "The spec must be actively simplified and standardized by merging overlapping concepts, normalizing properties, and consolidating types. Extensions of existing concepts are permitted, but redundant or conflicting concepts are not.",
    constraints: [
      "Seek overlaps across rules, policies, and definitions",
      "Normalize property names and structures to avoid drift (e.g., constraints vs. rules)",
      "Consolidate types where possible to reduce duplication",
      "Fail loud if ambiguity or potential conflict is detected during simplification",
      "Do not silently merge or discard; escalate when intent is unclear",
    ],
  },
  // Scan/Sweepo rules (appear only here, not in Dictionary)
  {
    id: "PROC-SCAN-001",
    term: "Scan",
    layer: "universal",
    definition: "Analyze only the currently open file/tab.",
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
    constraints: [
      "Sweepo may not replace Scan",
      "Sweepo is repo-level only",
      "Sweepo treats open VS Code windows as the single source of truth for the repo",
      "Sweepo does not perform remote fetch or drift detection",
      "Sweepo is fast and assumes user intent matches open editor state",
      "If files are not open, Sweepo cannot analyze them",
    ],
  },
  // DeepSweepo: full remote repo scan (drift escalation now handled by PROC-FAILLOUD-001)
  {
    id: "PROC-DEEPSWEEPO-001",
    term: "DeepSweepo",
    layer: "universal",
    definition:
      "Comprehensive, full remote GitHub repo inspection that always fetches the latest remote state for authoritative analysis.",
    inputs: ["repoUrl", "branch"],
    constraints: [
      "DeepSweepo always pulls the latest state from the remote GitHub repo",
      "User must commit and push before DeepSweepo runs",
      "If remote metadata cannot be retrieved, DeepSweepo must explicitly state limitation",
      "DeepSweepo is slower and more authoritative than Sweepo",
      "DeepSweepo requires explicit repo URL and branch context",
    ],
  },
  {
    id: "PROC-TRACE-001",
    term: "DecisionTraceRequired",
    layer: "universal",
    definition:
      "Before acting on underspecified or ambiguous instructions, the model must generate a decision trace that follows rule application step-by-step until either confirmation or disagreement emerges.",
    constraints: [
      "Trace must explicitly show: (1) Trigger, (2) SSoT alignment, (3) Rule path, (4) Interpretation, (5) Resolution.",
      "If disagreement or underspecification is detected during trace, escalate by asking the user for clarification (fail loud).",
      "If trace reaches a consistent resolution with spec and user input, proceed with generation.",
      "Traces may be condensed when all steps are trivial, but omission is not allowed on ambiguous or novel cases.",
    ],
  },
  {
    id: "PROC-STARTUP-SEQ-001",
    term: "StartupSequence",
    layer: "universal",
    definition:
      "Every new working session begins with a standardized startup sequence to guarantee alignment, trust, and consistency across spec, repo, and interaction.",
    constraints: [
      "Repo Refresh: Perform the standard repo pull/refresh sequence (equivalent to DeepSweepo: git fetch + git pull), ensuring local state matches remote.",
      "If remote unreachable: issue ⚠️ loud warning and continue on local state.",
      "If local changes would be overwritten: fail loud until resolved.",
      "User must commit and push before startup sequence can be declared complete.",
      "Litany Recital: Recite the Litany (L1–Lx) verbatim as the second step, confirming alignment with rules and SSoT.",
      "Spec Confirmation: Announce recognition of spec_base.ts as the Single Source of Truth and verify it has been successfully loaded.",
      "Context Report: Surface the current commit hash, branch, and timestamp as the final startup checkpoint.",
      "Quick Sweepo: Perform a Sweepo immediately after repo refresh to confirm open window state matches repo state.",
    ],
  },
  {
    id: "PROC-DEPRECATION-001",
    term: "DeprecatedBoundary",
    layer: "universal",
    definition:
      "Any section of the spec explicitly marked as deprecated is treated as non-canonical and read-only. It must never override current WorkingAgreement, Conventions, or delegated artifacts.",
    constraints: [
      "Deprecated sections may only be referenced for historical context.",
      "If a conflict arises between deprecated content and active rules, the deprecated content is ignored.",
      "Any attempt to use deprecated definitions must surface a ⚠️ warning.",
    ],
  },
];
// APP-level rules defer to GLOBAL and UNIVERSAL rules unless explicitly overridden.
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
  },
];

// UNIVERSAL policies: apply globally unless explicitly overridden.
/* ================================
   UNIVERSAL POLICIES / STANDARDS
   ================================ */
export const Policies = {
  done: {
    buildPass: true,
    styleRequired: false,
    featureComplete: false,
  },
  // Universal rule ordering policy
  rulesOrdered:
    "Rules are interpreted strictly in descending list order; no precedence field or critical flag is used.",
  optimization: { prioritize: "clarity" as const },
  naming: { enforceDictionary: true, onMissingTerm: "error" as const },
  // Planned upgrade: StrictTerminologyEnforcement
  // Universal policy to enforce consistent terminology across the spec.
  // Not yet active — dictionary pruning pass required before enabling.
  error: {},
  styling: {
    standard: {
      tool: "scss" as const,
      scope: "global" as const,
      units: "rem" as const,
      organization: "components-first" as const,
      sourceFile: "style_base.scss",
      // All debug colors in SCSS are treated as final unless spec explicitly overrides.
      debugColorsTreatedAsFinal: true,
      // Inline style props (e.g., style={{}} in React) must not override class-based SCSS styling.
      noInlineStyleOverrides: true,
    },
    constraints: [
      "The file style.scss is the canonical authority for all styling; no other file may override its definitions except by explicit spec rule.",
    ],
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
    definition: "The authoritative specification file (spec.ts).",
  },
};

// Defaults from generate.ts
export const Defaults = {
  sizeUnit: "rem",
  fontUnit: "rem",
  colorFormat: "hex",
  responsive: "mobileFirst",
};

// UNIVERSAL coding conventions: apply globally unless explicitly overridden.
/* ================================
   UNIVERSAL CODING CONVENTIONS
   ================================ */
export const Conventions: Concept[] = [
  {
    id: "STD-CONTAINER-001",
    term: "AppContainerAuthority",
    layer: "universal",
    definition:
      "The file App.tsx is the canonical container for runtime wiring and application-level structure; all app-level wiring must be reflected in App.tsx unless explicitly delegated in the spec.",
  },
  {
    id: "STD-NAMING-001",
    term: "NamingConventions",
    layer: "universal",
    definition:
      "PascalCase components/files, camelCase vars/functions, UPPER_SNAKE_CASE constants.",
  },
  {
    id: "STD-WIRING-001",
    term: "ComponentWiring",
    layer: "universal",
    definition:
      "Screens compose layouts and components; props are typed; default exports per component.",
  },
];

// APP components and screens defer to GLOBAL and UNIVERSAL rules unless explicitly overridden.

////////////////////////////////////////////////////////////////////

// Reference: Domain rules and screen/component structure.

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
  },
];

/////////////////////////////////////////////////////////////////
//   Deprecated soon, make no new references to anything past here.
/////////////////////////////////////////////////////////////////

export const AppScreens: Concept[] = [
  {
    id: "SCREEN-START-001",
    term: "Start",
    layer: "screen",
    definition:
      "The first phase page where users set options before beginning the return process.",
  },
  {
    id: "SCREEN-FLOORPLAN-001",
    term: "Floorplan",
    layer: "screen",
    definition:
      "The global page layout: ecosystem top bar, optional side columns, main column rows.",
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
  AppScreens,
  AppInstances,
};
