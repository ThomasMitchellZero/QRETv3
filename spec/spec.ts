// you're smart, ChatGPT

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
export type Scope =
  | "god"
  | "universal"
  | "global"
  | "app"
  | "screen"
  | "component";

export type Concept = {
  id: string;
  term: string;
  layer: Scope;
  definition?: string; // concise "what it is", distinguishes from siblings
  intent?: string; // purpose / why it exists
  constraints?: string[]; // musts and must-nots
  inputs?: string[]; // interfaces/data consumed
  outputs?: string[]; // interfaces/data provided
  children?: Concept[]; // sub-concepts or nested rules
  defersTo?: string[]; // parent or higher-level rules this defers to
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
      "The Spec file remains the Single Source of Truth (SSoT), but may explicitly delegate ('crown pointing') canonical authority for a specific domain or concern to another stable, well-defined artifact (e.g., style.scss for styling, App.tsx for runtime structure). Such delegation is binding only because the Spec itself says so; the delegated artifact's authority is canonical for that domain solely by explicit reference in the Spec. The Spec thus 'points the crown' to another artifact for a domain, but retains ultimate SSoT status and may revoke or reassign delegated authority at any time.",
  },
  {
    id: "PROC-CREATION-CONTEXT-001",
    term: "SpecAsCreationContext",
    layer: "universal",
    definition:
      "The Spec serves as canonical context for the creation of new components, logic, and artifacts. Its primary role is to capture intent, rules, and constraints, then delegate canonical authority to the stable artifacts that embody them (e.g., App.tsx, style.scss, or React components).",
    constraints: [
      "Spec rules are not duplicated into implementation; they provide context for generating or extending artifacts.",
      "Once a concern is delegated to an artifact, that artifact is the canonical authority.",
      "Spec must always remain aligned with delegated artifacts by explicitly recording the delegation and intent.",
      "Spec’s authority in this mode is contextual: its role is to ensure new creations respect defined rules, intent, and delegation boundaries.",
    ],
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
      "Spec Confirmation: Announce recognition of spec.ts as the Single Source of Truth and verify it has been successfully loaded.",
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
  {
    id: "PROC-RULE-CREATE-001",
    term: "RuleCreationConstraint",
    layer: "universal",
    definition:
      "New rules should only be created if necessary; prefer expanding or refactoring existing rules to cover new cases where possible.",
    constraints: [
      "Before introducing a new rule, check if the requirement can be addressed by extending or refining an existing rule.",
      "Redundant or overlapping rules must be avoided.",
      "If a new rule is required, document why no existing rule could be adapted.",
    ],
  },
];
// APP-level rules defer to GLOBAL and UNIVERSAL rules unless explicitly overridden.
/* ================================
   APP-LEVEL INSTANCES
   ================================ */
export const AppInstances: Concept[] = [
  {
    id: "QRET-001",
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
    definition: "Resolution order over scope and precedence",
    intent: "for deriving effective intent.",
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

export const GlobalRules: Concept[] = [
  {
    id: "REFUND-001",
    term: "RefundRule",
    layer: "global",
    definition: "Defines refund calculation among sibling rules.",
    intent: "Ensure accurate refunds based on items receipted and returned.",
    inputs: ["ReceiptedItems", "ReturnedItems"],
    constraints: ["Item IDs must be numeric", "Quantity must be > 0"],
    outputs: [
      "Refund total = intersection of receiptedItems and returnedItems",
    ],
  },
  // Canonical Navigation Cycle rule
  {
    id: "NAV-CYCLE-001",
    term: "NavigationCycle",
    layer: "global",
    definition:
      "Distinguishes phase navigation cycle from other navigation rules.",
    intent:
      "Provide predictable navigation and separation between phase state and transaction state.",
    constraints: [
      "Canonizes phase routing, step rendering, entry points, and state handling",
      "Each phase has a unique, routable URL.",
      "Steps within a phase are not routable; they are conditionally rendered within the phase screen.",
      "Entering a phase always displays its canonical entry screen, regardless of prior step.",
      "Navigation between phases may be triggered at any time by the user or system.",
      "All state specific to a phase is discarded when leaving that phase; only transaction state persists across phases.",
      "When the system triggers navigation, the destination may be conditionally altered (e.g., based on validation or business rules).",
      "The Continue button may trigger navigation to another phase.",
      "The Nav Bar contains Nav Cards, which act as both a progress tracker and navigation controls for moving between phases.",
      "All navigation actions may conditionally redirect their target based on business logic or validation.",
    ],
    outputs: [
      "Phases are addressable via unique URLs.",
      "Step-level navigation is not supported at the routing level.",
      "Phase entry is always canonical.",
      "Navigation triggers can originate from user or system.",
      "Phase-specific state is ephemeral; transaction state persists.",
      "System navigation may redirect based on conditions.",
      "Continue button navigation supported.",
      "Nav Bar with Nav Cards provides progress tracking and navigation.",
      "Conditional redirection is supported for all navigation triggers.",
    ],
  },
  {
    id: "PHASE-001",
    term: "PhaseRule",
    layer: "global",
    definition: "Distinguishes phase advancement from other workflow steps.",
    intent: "Advance phase only after validation and cleanup.",
    inputs: ["Phase data"],
    constraints: [
      "Validation must succeed",
      "Cleanup must run before phase advance",
    ],
    outputs: ["Validated and cleaned state before advancing"],
  },
  {
    id: "STAGE-001",
    term: "StageRule",
    layer: "global",
    definition: "Distinguishes stage persistence from phase advancement.",
    intent: "Prevent stages from auto-closing due to internal interaction.",
    inputs: ["Stage state"],
    constraints: [
      "Stage closure cannot be triggered solely by internal component interaction",
    ],
    outputs: ["Stages remain open unless explicitly closed"],
  },
  {
    id: "ACTOR-TILE-001",
    term: "ActorTileSoloRule",
    layer: "global",
    definition: "Restricts Solo state to one ActorTile per context.",
    intent: "Restrict Solo state to a single ActorTile in a context.",
    inputs: ["ActorTile states", "Context"],
    constraints: [
      "Only one ActorTile can be marked Solo within a given context",
    ],
    outputs: ["Valid state with at most one Solo ActorTile per context"],
  },
  {
    id: "DERIVED-VALUE-001",
    term: "DerivedValueRule",
    layer: "global",
    definition: "Specifies derived value recalculation requirements.",
    intent: "Ensure derived values are recalculated on render.",
    inputs: ["Component props", "Component state"],
    constraints: [
      "Derived values must not be stored in state",
      "Derived values must be recalculated each render",
      "Derived values must always be deterministic given the same inputs",
    ],
    outputs: ["Components with reliable, up-to-date derived values"],
  },
  // --- Additional rules ---
  {
    id: "BUSINESS-LOGIC-001",
    term: "BusinessLogicRule",
    layer: "global",
    definition:
      "Distinguishes transactional business logic from navigation or UI logic.",
    intent:
      "Ensure all transactional outcomes (refunds, receipted items, returned items) are accurate and deterministic.",
    constraints: [
      "Given the same inputs, business logic must always produce the same outputs.",
      "Business logic must not depend on navigation state.",
    ],
    children: [
      {
        id: "BUSINESS-REFUND-001",
        term: "RefundComputation",
        layer: "global",
        definition:
          "Distinguishes refund computation logic from other business logic.",
        intent:
          "Refunds computed as intersection of receiptedItems and returnedItems",
      },
    ],
  },
  {
    id: "NAV-LOGIC-001",
    term: "NavigationLogicRule",
    layer: "global",
    definition:
      "Distinguishes navigation flow and gating logic from business logic.",
    intent:
      "Minimize collisions between user inputs by controlling visibility and allowed actions at each step.",
    constraints: [
      "User must only see actions and inputs valid for the current phase.",
      "Navigation determines when and where business logic may be triggered.",
    ],
    children: [
      {
        id: "NAV-PHASE-001",
        term: "PhaseAdvance",
        layer: "global",
        definition:
          "Distinguishes phase advance logic from other navigation logic.",
        intent: "Phase advance requires validation and cleanup",
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
  AppInstances,
  GlobalRules,
};
