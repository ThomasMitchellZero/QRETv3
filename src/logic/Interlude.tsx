const TaylorsVersionInterlude = {
  /*
  NEVER, EVER replace this file without consulting me first.  This is the core of our interaction model, and changing it has wide-reaching implications.  This goes Double for LLMs.  Do not fuck with this, this is what we recreate drafts from.


  Taylor's Version:

    Dictionary:
      -- Logic --

        -Interlude: The global object containing all transient state.  Term also refers to this ecosystem in general.
          -Setting: any collection of property values intended for use within an Interlude. Not a type, just a plain Object.
            -Prop: A property within the Setting.

      -- UI --

      -Stage: A UI element that sets the Interlude to the defined Setting the element is created with.
      -Actors: Same as a stage, but the Setting it sets includes itself.
      -Vignette: An element that appears only if all Props in its Setting are truthy in the Interlude.
      
      
  
    Interlude:
      - Changing from Scene to Interlude to better reflect its purpose in guiding user interactions.
  
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

      TL;DR = Any type or interface that interacts with Interlude layer accepts a Setting object.  

      There is no concept of inherent inheritance.  The state and its setters are super dumb - on click, set the Interlude to the Setting I contain.
        -In practice, there will be inheritance, but we will handle that in composition.  This should not be included in the core Interlude logic.
  
      Guiding intent: Keep interaction state deterministic, and easy to debug.
  
      The Interlude is a single global context that stores a flat Setting object.  We use this to handle temporary visibility / clearing in the UI.
        -The Interlude should only ever be a flat object.

      Every interactive element (Stage, Actor, Vignette, etc. ) includes a Setting of all Props it affects (value:true)  So it's really easy - when a Container is clicked, that Setting becomes the new Interlude.
      All interaction updates are handled exclusively setInterlude.
      The objects are easy to compose in TS logic because you just extend your parent's object with your own unique ID.


        -The Interlude itself has no inherent UI behavior; it simply holds state.
          -Any reference to z-axis is incorrect; layering will be handled separately.
        -Interlude should be reset to {} whenver we change Phases.  Remember, these are meant to be transient states.  Anything we need to preserve should live elsewhere.
        -Interlude exists as a single global context.
  

        -There is no longer any concept of clearing or preserving.  Nodes simply set the Interlude to their own Setting defined at creation.
        -Every click in a Stage has one result - resetting the Interlude to its own keys object.  (all vals true)
        -ActorTiles work the same, they just include their own values in the cloned state to be set.
  
        -There is no separate "clear" action; every click always sets the Interlude to the object provided by the clicked Container.  To reset, just provide an empty Setting object.
  
        -Therefore, the Vignette visibility functions should be really easy:  We just provide an object, and if all those keys exist in the Interlude, it's visible.
          -Structure the logic to expect undefined values, there will be a lot of that.
  
        - Coding Preferences
          - Don't go nuts preventing edge cases.  We control the environment.
          - I like logic that is metaphorically consistent with the domain.
          - I prefer to have one heuristic that works in all cases, even if it means decreasing flexibility.
          - I do not like string-based logic.  I prefer object-based logic.
          - Counters and ++ usually mean we're doing something hacky.
  
  
  */
};

// === Interlude Implementation (Taylor's Version) ===

import React, { createContext, useContext, useState, useEffect } from "react";

export type Interlude = Record<string, true>;

interface InterludeContextType {
  Interlude: Interlude;
  setInterlude: React.Dispatch<React.SetStateAction<Interlude>>;
}

const InterludeContext = createContext<InterludeContextType | undefined>(
  undefined
);

// Provider with automatic empty default (resets on mount/phase changes)
export function InterludeProvider({ children }: { children: React.ReactNode }) {
  const [Interlude, setInterlude] = useState<Interlude>({});

  return (
    <InterludeContext.Provider value={{ Interlude, setInterlude }}>
      {children}
    </InterludeContext.Provider>
  );
}

// === End of Interlude Implementation (Taylor's Version) ===
