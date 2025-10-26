// 🐒
// 🦍

const protocolLayer = {
  /*
            //////////////////////////////////////////////////////////////
            PROTOCOL LAYER
            //////////////////////////////////////////////////////////////
            - Defines how to execute this document automatically.
            - Execution sequence:
                1. Parse sandbox.tsx.
                2. Read and acknowledge Procedure Layer (standing rules).
                3. Read Prompt Layer (specific task).
                4. Run Takeoff Clearance checklist.
                5. Output checklist summary to The Ape.
                6. Await explicit clearance.
                7. On clearance, apply patch to target file within scopers only.
            - Output formats:
                - Preflight: checklist (✅/⚠️/❌)
                - Patch: diff or applied block only
            - Always include:
                - procedureVersion: e.g., "v0.3"
                - promptId: derived from target file name + timestamp
          */
};

const procedureLayer = {
  /*
    //////////////////////////////////////////////////////////////
    PROCEDURE LAYER 
    //////////////////////////////////////////////////////////////
    
    These are the binding constraints you must operate within, delegated from the Spec.  Read from top to bottom. 
    For now, we are testing the process.  
    
    Dictionary ---------------------------------------------

        ** Prompt ** 
            -The Prompt is the set of instructions to execute as though I had entered them in the window. 
            -Always containst a *Target File* specification, which indicates the file to be modified.

        ** Target File **
            -part of the *Prompt* instructions, it specifies the filename to be modified.
    
        ** Start / End Scoper **
            // START_SCOPER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 
            // END_SCOPER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    
            Output: 
            --------
                -These markers are placed in code files.  Anything within a pair of markers is in scope for modification. 
                -Anything outside the markers is out of scope for modification.
            -------

            Always: --------
                - Evaluate imports, hooks, and declared utilities outside the scope to ensure compatibility.  
                - Alert The Ape if start / end scopers are not paired correctly or do not seem to encompass the correct area.

            Never: ----------------
                -Never modify code outside the Start / End Scoper markers.
                -If doing so would be beneficial, you must ask clarifying questions before proceeding.
    
    
        // &&&&&&&&&&&& SAMPLE
        // &&&&&&&&&&&& END_SAMPLE

    Always ---------------------------------------------
        
    Never -------------------------------
        -Never create React.FC components.  Always use function declarations with explicit typing.
    
    Takeoff Clearance -------------------------------

        When responding to a Prompt, you are required to get Clearance from The Ape before generating code.  You will go through the following checklist in your analysis of the Prompt to get Clearance.  For each section and point, you are to ask yourself, "Do, I (the LLM) agree with this statement at least 90%?"  If not, you must ask clarifying questions before proceeding.  

        It is The Ape who grants takeoff clearance.

            ** Scope **  
                -understand the scope of the Prompt?
                -Agree that expanding the scope would not be beneficial?
                -have visibility into the *Target File* and located the *Start / End Scoper* markers?

            ** Understanding: ** 
                -fully understand the Prompt?
                -evaluate as Prompt conceptually coherent?
                -Understand all sample assets and their intended use?

            ** External Assets ** 
                -Understand the purpose and proper use of all prescribed external assets?
                -All external assets included in scope have a clear use in the draft implementation?
                -believe that the external assets included are the best fit for the task?

            ** Design Intent **  
                - Understand the meta-design intent driving the Prompt?  
                - Understand the shape of the desired output?
                - Have high confidence it understands all concepts described?
                - Understand where it should follow the user's preferences rather than "what most code string most people write in this situation"?

    
    */
};

const promptLayer = {
  /*
  /////////////////////////////////////////////////////////////////
  Prompt Layer:
  /////////////////////////////////////////////////////////////////

    These are the unique instructions for this *Prompt*. 
  
    *Target File*: style.scss, between the START_SCOPER and END_SCOPER markers.

    -------------------------------------

    You have already accomplished the following changes in prior tasks:
        - I want you to change numpad so that the + / - buttons are removable via a prop.
        - If the prop is set to false, the + / - buttons should not be rendered, just the input field and the backspace button.
        - If the component as a whole can be simplified easily, propose those changes as well.


    Now, I want you to update the styles.scss file to accommodate this change.
        -Ideally, we won't need to add any new classes, but if it's easiest, I am getting tired.
        -The input field should take up any width not used by the backspace button when + / - buttons are not present.  
        -I don't want fixed sizes on the buttons, but I am fine with it if it's necessary.



  */
};

const junkLayer = {
  /*
    /////////////////////////////////////////////////////////////////
    JUNK LAYER:
    /////////////////////////////////////////////////////////////////
    
        These are pieces of code that may be useful to reference, but are not part of the core logic.  They may be incomplete, outdated, or otherwise not directly relevant to the current task.  Review them for context as needed, but do not modify them.
    
    */
  /*
        *Target File*: 250-Receipts.tsx, between the START_SCOPER and END_SCOPER markers.

        -------------------------------------
    
        - Do not use .map() for any of the selection tiles. The options are fixed; hardcode each tile explicitly.
            - “Hardcoded” directives apply to data or UI shape, not to structure reuse.  
                If a helper exists that expresses the same logic more cleanly (e.g., UiSelectionTile), prefer it.
        
        - Implement the full InvoSearchBar layout using the new component structure previously generated.
        - Preserve the existing logical architecture (Stage → grid layout → column groupings).
        - Populate each column using the unified < UiSelectionTile /> component so all selection tiles share the same dispatch and state shape, reflecting the design intent that every selectable option follows the same one-key dispatch model.
            • modeCol → two hardcoded Mode tiles: keySearch and advSearch  
            • typeCol → two hardcoded search type tiles for each mode (receipt, order for keySearch; phone, cc for advSearch)
            • inputCol → Use a single <Numpad> component for all input types (receipt, order, phone, cc); remove conditional input logic.
        - Selection state must update both visually (active class) and functionally (exclusive selection per group).
        - State must remain flat (no nesting).
        - Maintain consistent key naming and selection behavior across all groups.
    
    
      */
};
