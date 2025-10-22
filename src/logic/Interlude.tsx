// 🐒
// 🦍
const swift = {
  /*
  NEVER, EVER replace this file without consulting me first.  This is the core of our interaction model, and changing it has wide-reaching implications.  This goes Double for LLMs.  Do not fuck with this, this is what we recreate drafts from.


  Taylor's Version:

    Dictionary:
      -- Logic --

        -Interlude: The global object containing all transient state.  Term also refers to this ecosystem in general.
          -Scene: any collection of property values intended for use within an Interlude. Not a type, just a plain Object.
            -Prop: A property within the Scene.

      -- UI --

      -Stage: A UI element that sets the Interlude to the defined Scene the element is created with.
      -Actor: Same as a stage, but the Scene it sets includes itself.
      -Dialog: An element that renders only if all Props in its Scene are truthy in the Interlude.
      
      
  
    Interlude:
      - Changing from Scene to Interlude to better reflect its purpose in guiding user interactions.
      - Core State logic to be a Reducer, even though we have just one use case FttB.  Here's my reasoning:
        -All our other state-setters use Reducer, and it helps me keep track of what is and isn't setting state.
        -I want to get better at Reducer, since it seems like a more powerful tool.
        -It seems to work more the way I intuitively think state-setting ought to.
      
      - Unless I'm misunderstanding something, we really should never have to provide Interlude as an argument.  It's coming from a known location.  Any checks should just use the current Interlude from context, and the only setting will be via the dispatch function.

  
      Example conceptual shape:
  
      Interlude = {
        "Phase-ReturnItems": true,
        "item-123": true,
        "service-abc": true
      }

      Key Things this model is NOT:
        In this model, there are no arrays.  Anything referencing arrays is WRONG.
        There is no layering or z-indexing.  Anything referencing layering is WRONG.
        The Interlude is always going to be a flat object.  Anything referencing nested objects or branches is WRONG.
        When naming properties, be sure to distinguish between Scene and Interlude.  A Scene is just a possible future Interlude, the Interlude is the current state.

      TL;DR = Any type or interface that interacts with Interlude layer accepts a Scene object.  

      There is no concept of inherent inheritance.  The state and its setters are super dumb - on click, set the Interlude to the Scene I contain.
        -In practice, there will be inheritance, but we will handle that in composition.  This should not be included in the core Interlude logic.
  
      Guiding intent: Keep interaction state deterministic, and easy to debug.
  
      The Interlude is a single global context that stores a flat Scene object.  We use this to handle temporary visibility / clearing in the UI.
        -The Interlude should only ever be a flat object.

      Every interactive element (Stage, Actor, Dialog, etc. ) includes a Scene of all Props it affects (value:true)  So it's really easy - when a Container is clicked, that Scene becomes the new Interlude.
      All interaction updates are handled exclusively setInterlude.
      The objects are easy to compose in TS logic because you just extend your parent's object with your own unique ID.


        -The Interlude itself has no inherent UI behavior; it simply holds state.
          -Any reference to z-axis is incorrect; layering will be handled separately.
        -Interlude should be reset to {} whenver we change Phases.  Remember, these are meant to be transient states.  Anything we need to preserve should live elsewhere.
        -Interlude exists as a single global context.
  

        -There is no longer any concept of clearing or preserving.  Nodes simply set the Interlude to their own Scene defined at creation.
        -Every click in a Stage has one result - reScene the Interlude to its own keys object.  (all vals true)
        -ActorTiles work the same, they just include their own values in the cloned state to be set.
  
        -There is no separate "clear" action; every click always sets the Interlude to the object provided by the clicked Container.  To reset, just provide an empty Scene object.
  
        -Therefore, the Dialog visibility functions should be really easy:  We just provide an object, and if all those keys exist in the Interlude, it's visible.
          -Structure the logic to expect undefined values, there will be a lot of that.
  
        - Coding Preferences
          - Don't go nuts preventing edge cases.  We control the environment.
          - I like logic that is metaphorically consistent with the domain.
          - I prefer to have one heuristic that works in all cases, even if it means decreasing flexibility.
          - I do not like string-based logic.  I prefer object-based logic.
          - Counters and ++ usually mean we're doing something hacky.

    
    -- UI Elements ---------------

    -Use flex for everything.  No z-indexing, absolute positioning, or Grid unless absolutely necessary.
    -Use standard CSS classes wherever possible.  Ideally, there are no class-unique styles other than those controlling Actor–Dialog positioning.

    Stage:
      -Defines the absolute horizontal boundary for any elements rendered within its tree.
      -All Dialogs and Actors inside a Stage must respect this boundary; nothing may render wider than the Stage.
      -Always uses normal flex flow (no absolute or fixed layout).
      -Preferred layout direction: column.
      -Acts as a viewport for local interactions — Dialogs may expand freely inside it but are never allowed to overflow it horizontally.

    Actor:
      -A clickable container that sets the Interlude to its Scene + self.
      -Has a limited horizontal footprint (tile-sized) to encourage progressive disclosure.
      -Uses flex layout and stays within its defined max-width (typically 12–16 rem).
      -May directly contain its Dialog as a child or prop, keyed off the same Scene.
      -Remains responsible for establishing its Dialog’s baseline position in normal flow (typically directly below).
      -Each Actor + Dialog pair behaves as one cohesive interaction unit.
      -Actors never change their own dimensions when activated; expansion occurs through their Dialog.

    Dialog:
      -Renders only if all keys in its Scene are truthy in the Interlude.
      -Appears immediately below its parent Actor in normal flex flow; it never overlaps or floats.
      -May expand horizontally beyond the Actor’s width but must remain fully inside the Stage boundary.
      -Horizontally aligns to the Actor’s centerline; width is determined by its contents up to the Stage’s max-width.
      -When visible, it pushes subsequent elements downward rather than layering above them.
      -Never introduces z-index or absolute positioning; layout changes are achieved purely through flow.
      -If horizontal centering would cause overflow, the Dialog must instead align within the Stage boundary (containment takes precedence over perfect centering).
  
  */
};

import React, { createContext, useReducer, useContext } from "react";

import type { ReactNode, Dispatch } from "react";

// === Types ===

// Scene = any object representing a possible Interlude
export type Scene = Record<string, boolean>;

// Core action types for all Interlude components
export type InterludeAction =
  | { kind: "SET_SCENE"; payload: Scene }
  | { kind: "CLEAR_SCENE" };

// Component-specific type contracts (unified family)
export type InterludeProps = {
  id: string;
  scene: Scene;
  children?: ReactNode;
  className?: string;
};

export type ActorProps = InterludeProps & {
  tileSlot?: ReactNode;
  dialog?: ReactNode;
};

// === Reducer ===

function interludeReducer(state: Scene, action: InterludeAction): Scene {
  switch (action.kind) {
    case "SET_SCENE":
      return action.payload;
    case "CLEAR_SCENE":
      return {};
    default:
      return state;
  }
}

// === Context + Provider ===

const InterludeContext = createContext<
  [Scene, Dispatch<InterludeAction>] | null
>(null);

export function InterludeProvider({ children }: { children: ReactNode }) {
  const [interlude, setInterlude] = useReducer(interludeReducer, {});
  return (
    <InterludeContext.Provider value={[interlude, setInterlude]}>
      {children}
    </InterludeContext.Provider>
  );
}

// === Hooks & Helpers ===

export function useInterlude(): [Scene, Dispatch<InterludeAction>] {
  const ctx = useContext(InterludeContext);
  if (!ctx)
    throw new Error("useInterlude must be used within InterludeProvider");
  return ctx;
}

export function useIsActive(scene: Scene): boolean {
  const [interlude] = useInterlude();
  return Object.keys(scene).every((key) => interlude[key]);
}

export function makeScene(parent: Scene, id: string): Scene {
  return { ...parent, [id]: true };
}

export function isSceneActive(interlude: Scene, scene: Scene): boolean {
  return Object.keys(scene).every((key) => interlude[key]);
}

// === UI Components ===

const swiftActorDialog = {
  /*
  -- INTERLUDE LAYOUT MODEL (Flex-Column Dialog System) --

    Intent:
    Use a two-axis flex structure to manage Actors and Dialogs with minimal layout logic.
    No absolute positioning, no manual margins, no z-index stacking.
    The container defines total width; flex rules handle all spacing and alignment.
    -All style should come from standard style primitives unless something unique is needed.  No inline-style, all class-based.

      Structure:
      Stage (style-agnostic)
        Tile (flex row)
          Actor (flex column)
            Dialog (optional, contains its own style.)

      Stage :
        - Stage defines total horizontal bounds of all Actors it contains.  No Actor or Dialog can ever exceed the width of the Stage.  Width: 100%. 
          -This should be style-agnostic.  The only requirement is that Stage sets the max width for its contents.
            -All other styling will be provided by contents or primitives.
          -This will be a component to handle background clicks, but afaict it needs no special styling.  That can come from existing style primitives.

      Actor Rules:
        - Actors remain fixed size and position; never resize on activation.
        - An actor itself is unclickable.  However, it contains a clickable Tile element that triggers its Scene change.
          - When an Actor's Tile is clicked:
          - It sets its Scene as the new Interlude 
            - Dialog visibility and Selected style applied by same condition - presence of its Scene in Interlude.
            -its Dialog becomes visible directly beneath it.
        - The Stage grows vertically to accommodate new Dialogs.
        - Other Actors retain position; only vertical expansion occurs.

      Dialog Rules:
        - Each Actor has a reserved “slot” for its Dialog in the flex column.
        - Dialogs can be any width up to the Stage’s width (container boundary).
          -This should happen automatically, no manual width calculations needed.
        - If the desired centered position would cause overflow, the browser naturally
          clamps the Dialog to remain fully within the Stage bounds.
        - Dialogs expand in flow, pushing content below downward (no overlap).


      Result:
      A self-contained, purely flex-driven vertical stack that handles progressive
      disclosure without any absolute positioning or grid math.  Dialogs expand below
      their Actors, can safely exceed the Actor’s width, and auto-clamp to fit within
      the container.  Entire system is predictable, fluid, and responsive by default.
        */
};

export function Stage({
  id,
  scene = {},
  className = "",
  children,
}: InterludeProps) {
  const [, dispatch] = useInterlude();
  // Stage boundary: flex column, full width by default, can be styled via className

  return (
    <div
      id={`stage-${id}`}
      className={`stage ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ kind: "SET_SCENE", payload: scene });
      }}
    >
      {children}
    </div>
  );
}

export function Actor({ id, scene, className, children }: InterludeProps) {
  const [, dispatch] = useInterlude();
  const isActive = useIsActive(scene);
  const activeClass = isActive ? "active" : "";
  // No Style is intentional: Style should be applied to tile and dialog slots as needed.
  return (
    <div
      id={`actor-${id}`}
      className={`tile ${className} ${activeClass} hug-main fill-cross`}
      onClick={(e) => {
        e.stopPropagation();
        console.log(`Actor ${id} clicked`); // For debugging purposes
        dispatch({ kind: "SET_SCENE", payload: scene });
      }}
    >
      {children}
    </div>
  );
}

/**
 * Dialog component
 *
 * - Accepts: {id, scene, className, children}
 * - Uses useIsActive(scene) to render only if active
 */

export type DialogProps = InterludeProps & {
  rowClassName?: string;
};
export function Dialog({
  id,
  scene,
  className = "",
  rowClassName = "",
  children,
}: DialogProps) {
  const isActive = useIsActive(scene);
  const activeClass = isActive ? "active" : "";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Dialog ${id} clicked`); // For debugging purposes
  };
  return (
    isActive && (
      <div className={`dialog-shell ${rowClassName}`}>
        <div
          onClick={(e) => handleClick(e)}
          id={`dialog-${id}`}
          className={`${className} ${activeClass} dialog`}
        >
          {children}
        </div>
      </div>
    )
  );
}
