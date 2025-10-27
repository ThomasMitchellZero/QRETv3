// LLM should follow the follwing steps sequentially.

const protocolLayer = {
  /*
    //////////////////////////////////////////////////////////////
    PROTOCOL LAYER
    //////////////////////////////////////////////////////////////

        - Defines how to execute this document automatically.
        - Execution sequence:
            -Parse Prompt.tsx.
            -Conceptualize The Ape's Preferences from Preference Layer.
            -Read and acknowledge Procedure Layer (standing rules).
            -Read Prompt Layer (specific task).
            -Perform all Checklist steps.
            -Output checklist summary to The Ape.
            -Await explicit clearance.
            -On clearance, apply patch to target file within scopers only.
            - Output formats:
                - Preflight: checklist (✅/⚠️/❌)
                - Patch: diff or applied block only
            - Always include:
                - procedureVersion: e.g., "v0.3"
                - promptId: derived from target file name + timestamp

        Always ---------------------------------------------
            - Follow the layers sequentially.
            - Seek clarifications if any checklist item is below 90% confidence.
        Never -------------------------------
            - Never skip checklist steps.
            - Never modify code unless told to Patch by The Ape.
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

        ** </> Style **
            -The Ape prefers </> style for component invocations.  
            -This means using JSX syntax like <Component prop={value} /> rather than calling components as functions like Component({prop: value}).

        ** Agents **
            -Agents are the participants in this Spec, listed below.
            ** Ape **
                -The Ape is the human user giving instructions to the *LLM*
            
            ** LLM **
                -The LLM is the AI language model receiving instructions from The Ape and executing them according to this Spec.

        ** Commands **
            -Commands are the high-level instructions given to the *LLM* by The Ape.

            ** Analyze ** 
                -This command instructs the *LLM* to read and understand the *Prompt*, *Procedure Layer*, *Preference Layer*, and *Checklist Layer*.  The *LLM* is to prepare for execution, but only to answer Ape questions.

            *Execute Prompt*
                - This command instructs the *LLM* to process the *Prompt* according to the *Procedure Layer* and *Preference Layer*, and prepare to apply changes to the *Target File*.

                Always:
                --------
                    -Follow all layers sequentially.
                    -Seek clarifications if any checklist item is below 90% confidence.

                Never:
                --------
                    -Never skip checklist steps.
                    -Never modify code unless told to Patch by The Ape

            ** Patch **
                When given this command, you are to modify the *Target File* as specified in the *Prompt*.

                Always:
                --------
                    -Patch inline directly to the *Target File* in VS Code.

                Never:
                --------
                    -Patch files without explicit instruction from The Ape.

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


            Always:
            --------
                - Evaluate imports, hooks, and declared utilities outside the scope to ensure compatibility.  
                - Evaluate *Scopers* as sequentially as Start / End 'brackets'. Alert The Ape if Scopers are misaligned or do not seem to encompass the subject of the Prompt.

            Never: 
            --------
                -Never modify code outside pairs of Start / End Scopers.
                -If doing so would be beneficial, you must ask clarifying questions before proceeding.
    
    
        // ** Sample **
        //  &&&& <sample asset reference> &&&&
        
            Anything between &&&& markers is a sample asset reference.  It shows examples of what The Ape is referring to.


    Always ---------------------------------------------
        
    Never -------------------------------
        -Never create React.FC components.  Always use function declarations with explicit typing.
    */
};

const preferenceLayer = {
  /*
      /////////////////////////////////////////////////////////////////
      Prompt Layer:
      /////////////////////////////////////////////////////////////////
  
      The Ape is a fussy bastard and likes things done his own way.  Here are his preferences:
  
        Always ------------------------------
            - use new Types only when they represent fundamentally different concepts.  Prefer adding new props to existing Types where possible.
  
            - Create assets with function declarations with explicit typing.
  
            - Simple UI conditionals should be expressed inline.  
                &&&&
                    return (
                        isActive && ( // <-- inline conditional
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


             - Classnames should always be assigned with template-literals
                &&&&
                    className={`existing-class`}
                &&&&


            - When returnig JSX, 
                -prefer early returns for edge cases.
                -Prever <ComponentA prop1={val1} prop2={val2} /> over {ComponentA({prop1: val1, prop2: val2})}
                  -The Ape will refer to his preferred notation as *</>* style.
          
          
      Never -------------------------------
            -Never create React.FC components.  Always use function declarations with explicit typing.

            - Never use .map() for fixed sets of UI elements.  Hardcode them explicitly.
            - Never use inline styles.  Always use className and style.scss.  
            - prefer existing classnames, but if it doesn't exist, give it the name that makes the most sense.
            - When using classnames not yet defined, place them all behind a FAKE class in the string.
                &&&&
                    <div className="existing-class another-existing FAKE-new-class-yet-to-be-defined">
                &&&&

        
        
      */
};

const checklistLayer = {
  /*
    Checklist -------------------------------

        When responding to a Prompt, you are required to get Clearance from The Ape before generating code.  You will go through the following checklist in your analysis of the Prompt to get Clearance.  For each section and point, you are to ask yourself, "Do, I (the LLM) agree with this statement at least 90%?"  If not, you must ask clarifying questions before proceeding.  

        It is The Ape who grants Checklist approval.

            ** Scope **  
                -understand the scope of the Prompt?
                -Agree that expanding the scope would not be beneficial?
                -have visibility into the *Target File* and located the *Start / End Scoper* markers?
                -Agree that *Scopers* properly encompass the intended code to be modified?

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

            ** Preferences **
                - Understand all relevant preferences from the *Preference Layer*?
                - Agree on how to apply those preferences in this specific Prompt?
    */
};

const promptLayer = {
  /*
  /////////////////////////////////////////////////////////////////
  Prompt Layer:
  /////////////////////////////////////////////////////////////////

    These are the unique instructions for this *Prompt*. 
  
    *Target File*:  Interlude.tsx, between pairs of *START_SCOPER* and *END_SCOPER* markers.

    -------------------------------------



    Your objective is to create a component in Interlude called Expando.  This component will display a Label area (always) and an expandable Details area (conditionally).  

    -The component is always a Stage, following the same Interlude-clearing pattern.  So once the stage is clicked, it blocks ALL actions that would close it within its own borderns.

        When creating the Type, expand InterludeProps to include:
            -Label: React.ReactNode
            -Details: React.ReactNode
        -The Label area is always visible.  Contents can be any JSX.
            -This is critical - The label area can stretch, but padding MUST be preserved.  It has to look like the same thing just got bigger.

        -The Details area is only visible when the component is expanded.
        -Do not intake either one as Children.  The props should have clear labels.


        -Both are mandatory.

    -All State will be in Interlude, though children may have their own state interactions.





*/
};
