const TaylorsVersionScene = {
  /*
  NEVER, EVER replace this file without consulting me first.  This is the core of our interaction model, and changing it has wide-reaching implications.  This goes Double for LLMs.  Do not fuck with this, this is what we recreate drafts from.


  Taylor's Version:
  
    Scene:
      - Changing from DialogTree to Scene to better reflect its purpose in guiding user interactions.
  
      Example conceptual shape:
  
      Scene = {
        "Phase-ReturnItems": true,
        "item-123": true,
        "service-abc": true
      }

      In this model, there are no arrays.  Anything referencing arrays is WRONG.

      TL;DR = Any type or interface that interacts with Scene layer accepts an object.  When clicked, it sets the global Scene state to that object.  

      There is no concept of inherent inheritance.  The state and its setters are super dumb - on click, set the SceneState to the object in my props.
        -In practice, there will be inheritance, but we will handle that in composition.  This should not be included in the core Scene logic.
  
      Guiding intent: Keep interaction state deterministic, and easy to debug.
  
      The Scene is a single global context that stores a flat object describing all active dialogs.
        -The Scene should only ever be a flat object.

      Every interactive element—Stage, Actor, or Dialog—derives includes an object of all keys it affects (value:true)  So it's really easy - when a Container is clicked, that object becomes the new Scene.
      All interaction updates are handled exclusively setScene.
      The objects are easy to create in TS logic because you just extend your parent's object with your own unique ID.
  
      Everything that can go wrong in this model happens in a single place—the branch helpers—so once those are correct, the entire routing mechanism is stable.

        -The Script Tree itself has no inherent UI behavior; it simply holds state.
          -Any reference to z-axis is incorrect; layering will be handled separately.
        -Scene should be reset to {} whenver we change phases.  Remember, these are meant to be transient states.  Anything we need to preserve should live elsewhere.
        -Scene exists as a single global context.
  
        -Stage and Actors are both instances of the Container type.  The key element of the Container is that it interacts with the Scene layer.
          -Stage clicks set their own branch of the Scene to {}.  
          -Actor clicks add their own node to their parent's branch.
        -There is no longer any concept of clearing or preserving.  The only action is setting the value of a given node to {}.  Stages set their parent node to {}, Actors set their own node to {} within their parent's branch.
  
        -Every click in a Stage has one result - resetting the Scene to its own keys object.  (all vals true)
          -ActorTiles work the same, they just include their own values in the cloned state to be set.
  
        -There is no separate "clear" action; every click always sets the Scene to the object provided by the clicked Container.
  
        -Therefore, the Stage Dialog visibility functions should be really easy:  We just provide an object, and if all those keys exist in the Scene, it's visible.
          -Structure the logic to expect undefined values, there will be a lot of that.
  
        - Coding Preferences
          - Don't go nuts preventing edge cases.  We control the environment.
          - I like logic that is metaphorically consistent with the domain.
          - I prefer to have one heuristic that works in all cases, even if it means decreasing flexibility.
          - I do not like string-based logic.  I prefer object-based logic.
          - Counters and ++ usually mean we're doing something hacky.
  
  
  */
};

// === Scene Implementation (Taylor's Version) ===

import React, { createContext, useContext, useState, useEffect } from "react";

export type Scene = Record<string, true>;

interface SceneContextType {
  Scene: Scene;
  setScene: React.Dispatch<React.SetStateAction<Scene>>;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

// Provider with automatic empty default (resets on mount/phase changes)
export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [Scene, setScene] = useState<Scene>({});

  return (
    <SceneContext.Provider value={{ Scene, setScene }}>
      {children}
    </SceneContext.Provider>
  );
}

// === Hooks ===

// Core access
export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error("useScene must be used within a SceneProvider");
  return ctx;
}

// Visibility helper
export function useIsVisible(requiredBranch: Scene): boolean {
  const { Scene } = useScene();
  return Object.keys(requiredBranch).every((k) => Scene[k]);
}

// Branch composition helper
export function useMakeBranch(parent?: Scene, selfId?: string): Scene {
  return {
    ...(parent ?? {}),
    ...(selfId ? { [selfId]: true } : {}),
  };
}

// === End of Scene Implementation (Taylor's Version) ===
