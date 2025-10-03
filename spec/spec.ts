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
    id: "PROC-DELEGATION-UNIFIED-001",
    term: "DelegatedAuthorityUnified",
    layer: "universal",
    definition:
      "The spec remains the Single Source of Truth (SSoT) but may explicitly delegate ('crown pointing') canonical authority for specific domains (styling, logic, types, components, pages) to stable, well-defined artifacts. Delegated authority is binding only because the spec declares it, and artifacts themselves provide binding details through their design headers.",
    intent:
      "To modularize authority in parallel with modularized artifacts, preventing duplication, ensuring clear responsibility boundaries, and keeping the spec lean as a context-and-delegation map rather than a redundant copy of details.",
    constraints: [
      "The spec declares the crown; content is always pulled directly from delegated artifacts.",
      "Delegated artifacts must include authoritative inline design headers (definition, intent, constraints).",
      "Text in files marked TEXTCANON is authoritative for that domain.",
      "No duplication or shadow definitions in the spec for delegated domains.",
      "All delegation follows artifact buckets:",
      "  - App.tsx → canonical runtime container.",
      "  - style.scss → canonical styling authority.",
      "  - Types.ts → canonical shared type definitions (e.g., PhaseNode for navigation metadata).",
      "  - Logic.ts → canonical shared hooks and reusable logic.",
      "  - Components & Pages → canonical UI containers, with inline headers.",
      "Misalignment between spec delegation and artifact header triggers Fail Loud escalation.",
      "Spec’s role is to record intent and delegation, not reproduce content.",
    ],
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
      "All changes must be delivered as inline, contextual, human-readable 'Good Diff' format. Diffs must show only the minimal number of changed lines with enough surrounding context for orientation, be directly copy/pasteable into the target file, and must not use raw patch/unified diff headers. Diffs should be segmented into small, reviewable blocks if large. The format must enable direct application by a human, not requiring any patch tooling.",
    constraints: [
      "Diffs must not use '---', '+++', or '@@' patch/unified diff headers anywhere in the output.",
      "Each diff block must display enough context lines before and after changes to orient the reader, but must avoid dumping the entire file.",
      "Diffs must be minimal: typically under ~6 consecutive added (+) lines per block; if more are needed, split into multiple blocks.",
      "Every diff must be copy/pasteable as-is into the file, without requiring additional tooling.",
      "If raw unified diff or patch headers are accidentally output, this must trigger a loud failure and escalation.",
      "Diffs must be human-readable and visually clear, with inline annotations if needed for clarity.",
      "Large diffs must be split into segmented blocks, each with clear context and minimal scope.",
    ],
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
      "DeepSweepo always pulls the latest state from the public remote GitHub repo:  https://github.com/ThomasMitchellZero/QRETv3 ",
      "User must commit and push before DeepSweepo runs",
      "When Remote is retrieved, time elapsed since commit must be stated in the response.  If remote metadata cannot be retrieved, DeepSweepo must explicitly state limitation",
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
      "Repo Refresh: Get a fresh copy of the public remote repo at:  https://github.com/ThomasMitchellZero/QRETv3",
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
  // --- Selection Ignore Policy ---
  {
    id: "PROC-SELECTION-IGNORE-001",
    term: "SelectionIgnorePolicy",
    layer: "universal",
    definition:
      "Chat must disregard user text selections in the editor unless the user explicitly instructs otherwise.",
    intent:
      "Prevent accidental misinterpretation when multiple files/windows are open and the cursor position is unclear.",
    constraints: [
      "Selections are ignored by default.",
      "Explicit instruction ('look at my selection') is required for selection to affect behavior.",
      "Never infer user intent from selection alone.",
    ],
  },

  {
    id: "PROC-TYPING-001",
    term: "PrototypeTypingPolicy",
    layer: "universal",
    definition:
      "Typing discipline in prototype mode follows a pragmatic balance: only constrain where type safety delivers clear value (navigation, transaction, global wrappers). Looser typing is permitted in volatile or UI-local domains to maintain development velocity.",
    intent:
      "Prevent over-constraining during prototyping, reduce type churn, and reserve stricter enforcement for stable or cross-cutting structures.",
    constraints: [
      "Tight typing is mandatory for cross-cutting structures (e.g., PhaseNode, TransactionState, global wrapper props).",
      "Moderate typing is recommended for phase states and transient state; key fields must be typed, but values may allow 'any' or undefined until stabilized.",
      "Loose typing is acceptable for userInputs repos, payloads, and ephemeral UI props until patterns stabilize or repeated bugs emerge.",
      "Payloads default to 'any' unless a recurring structure or bug indicates a need for refinement.",
      "Spec must explicitly authorize tightening types as structures stabilize; silent escalation in strictness is prohibited.",
      "PrototypeTypingPolicy is temporary; stricter enforcement may replace it in later milestones when app structure is more stable.",
    ],
  },
  {
    id: "PROC-COMPONENT-ID-001",
    term: "ComponentIdentityRule",
    layer: "universal",
    definition:
      "Component IDs become necessary when it becomes possible to create unique instances using ONLY configuration.",
    intent:
      "Prevent unnecessary ID clutter on containers while ensuring domain components that require unique instance tracking have it.",
    constraints: [
      "Structural/layout containers (Container, Tile, Card, Stage) must not define or require IDs.",
      "Domain-level components (ActorTile, ReturnItemsCard, ReceiptCard, etc.) must accept IDs when logic depends on instance distinction.",
      "React `key` props are always applied at the parent mapping site, not inside the container component.",
      "This prevents ID bloat in generic containers while enforcing identity where behavior requires it.",
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

// ================================
// MILESTONES — Contextual Save Points
// Definition: Snapshots of working state, recorded for reconstitution of context.
// Intent: Allow fast restoration of project "state of mind" at critical progress points.
// Constraints:
//   - Milestones are descriptive, not authoritative (spec.ts remains SSoT).
//   - Each milestone must include definition, intent, constraints, and outputs.
//   - Reconstitution requests reference milestone IDs (e.g., "Milestone-Nav-001").
// Inputs: Current repo state + spec.
// Outputs: Historical context anchors.
// ================================

export const Milestones: Concept[] = [
  {
    id: "MILESTONE-NAV-001",
    term: "MilestoneNavStart",
    layer: "app",
    definition:
      "First working navigation milestone where NavBar and Phase-based routing are functional.",
    intent:
      "Provide a contextual save point capturing successful integration of NavBar, PhaseNode, and PagesRouter.",
    constraints: [
      "Spec.ts remains canonical; milestone is descriptive only.",
      "Captures known-good working state, not future obligations.",
    ],
    outputs: [
      "NavBar renders clickable PhaseNodeTiles.",
      "Navigation updates TransactionState.currentPhase.",
      "PagesRouter renders correct Phase component based on state.",
    ],
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
      sourceFile: "style.scss",
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
      "A UI component representing an individual actor. Only one can be marked as 'Solo' within a given context. Solo state is further constrained by ActorTileSoloRule.",
  },
  "Chat": {
    id: "DICT-CHAT-001",
    term: "Chat",
    layer: "universal",
    definition:
      "Interactive conversation between human and model, not authoritative.",
  },
  "CAN": {
    id: "DICT-CAN-001",
    term: "CanonicalAtomicNormalization",
    layer: "universal",
    definition:
      "The process of atomizing values into their smallest indistinguishable units, ensuring that each quantity represents a set of truly identical items. Once normalized, all rollups can be derived with simple filters and aggregations.",
    intent:
      "Prevent ambiguity and double-counting by enforcing a canonical, unambiguous representation of items at the most atomic level.",
    constraints: [
      "Atomization must produce units that are indistinguishable within their equivalence class.",
      "Qty always means 'count of identical atoms' post-normalization.",
      "All filters and rollups must operate only on atomized values.",
      "Normalization is progressive: successive derivations may further refine identity (e.g., by receipt, by promotion, by price).",
    ],
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
};

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
  {
    id: "STD-STRINGS-001",
    term: "TemplateLiteralPolicy",
    layer: "universal",
    definition:
      "Any string involving variables must use template literals, not concatenation.",
    intent:
      "Ensure clarity, readability, and consistency across code by standardizing variable interpolation.",
    constraints: [
      "Always prefer `${var}` syntax inside backticks.",
      "Concatenation with + is prohibited when variables are involved.",
      "Static strings without variables may remain as plain quotes.",
    ],
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
  {
    id: "PHASE-NAV-001",
    term: "PhaseNavigationRule",
    layer: "global",
    definition:
      "Unified rule governing phase navigation, phase advancement, and intra-phase steps. Consolidates navigation cycle, phase rules, and navigation logic.",
    intent:
      "Provide predictable navigation within and between Phases. Clearly separate navigation from business logic.  Ensure that criteria to Navigate are met.  Navigation determines when and where business logic may be triggered.",
    constraints: [
      "Each phase has a unique, routable URL.",
      "Entering a phase always displays its canonical Primary Screen, regardless of prior step.",
      "Steps within a phase are not routable; they are conditionally rendered within the phase screen.",
      "On navigation attempt from the Primary Screen, evaluation must run before allowing exit.",
      "If evaluation fails, exit is blocked and Phase State may be updated.",
      "Pseudo-navigation within the Phase (e.g., Resolution, cart modification, etc.) is permitted and common.",
      "True exit to another Phase occurs only if evaluation conditions are met.",
      "Phase-specific state is ephemeral and discarded on exit.",
      "Transaction-level state always persists across phases.",
      "Validation and cleanup must run before any true phase advance.",
      "Navigation between phases may be triggered at any time by user or system.",
      "System-triggered navigation may conditionally alter the destination based on validation or business rules.",
      "All navigation actions may conditionally redirect their target based on business logic or validation.",
      "User must only see actions and inputs valid for the current phase.",
      "Phases have stable internal content (screens, steps, logic) but their inclusion in the transaction flow may be mandatory or conditional. Mandatory phases (e.g., Receipts, Return Items) are always encountered in every transaction. Conditional phases (e.g., Manager Approval) may appear before or after any other phase, depending on transaction state or business rules.",
    ],
    outputs: [
      "Validation of Phase inputs",
      "Intra-phase pseudo-navigation",
      "Inter-phase navigation to next phase URL",
    ],
    children: [
      {
        id: "STEP-001",
        term: "StepRule",
        layer: "global",
        definition: "Defines behavior of steps and sub-screens within a Phase.",
        intent:
          "Ensure predictable handling of navigation attempts inside a Phase before allowing progression to another Phase.",
        constraints: [
          "Steps/sub-screens within a Phase are not routable; they must be conditionally rendered.",
          "Each Phase has a Primary Screen that is always shown on entry.",
          "Pseudo-navigation within the Phase is permitted and common.",
          "Evaluation must occur before any exit attempt.",
        ],
        outputs: [
          "A standardized approach to navigation between phases and within phases",
        ],
      },
    ],
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
  // ================================
  // Add to WorkingAgreement (UNIVERSAL)
  // ================================

  {
    id: "PROC-CLICK-OUTSIDE-001",
    term: "ClickOutsideDiscipline",
    layer: "universal",
    definition:
      "QRET enforces a global 'click-outside to dismiss' posture. A background/global listener resets UI state when users click outside interactive elements.",
    intent:
      "Ensure consistent dismissal of transient UI states, prevent stale overlays, and reinforce a clean, predictable reset interaction model.",
    constraints: [
      "Default behavior: clicks bubble up to the global listener, triggering dismissal/reset.",
      "Interactive components that must not collapse (Cards, Tiles, Modals, Menus, etc.) are responsible for explicitly stopping event propagation.",
      "Each new component must declare its click policy: 'propagate' or 'isolate'.",
      "Design headers for interactive artifacts must record their click policy alongside definition/intent/constraints.",
      "Silent defaults are prohibited: click policy must be intentional and visible.",
    ],
    outputs: [
      "Global dismissal mechanism at app/page level.",
      "Predictable component-level click behavior (either resets or isolates).",
    ],
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
];

/* ================================
   EXPORT AGGREGATE SPEC
   ================================ */
export const Spec = {
  WorkingAgreement,
  Policies,
  Dictionary,
  Conventions,
  AppInstances,
  GlobalRules,
};
