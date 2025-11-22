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
            - skip checklist steps.
            - modify code unless told to Patch by The Ape.
            - modify code outside pairs of Start / End Scopers.
            - treat things outside of this Prompt as canoncial context.
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
  
    *Target *:  QRET Folder

    - Objetive 1:
        - Propose options for a standard, recursible format I can use for Components, Folders, and Indexes throughout the app.
        -A format that is easy for me to read and understand at a glance.
        -I should be able to easily move components around into folders with as little friction as possible.
        -It should be easy for me to identify names and lineages.  

    Objective 2:
        -Recreate the entire QRET folder, or at least the src file, with the new format.  


        Always
        --------
            -link the key files together through index.tsx files at each folder level.
        
        Never
        --------
            -Make any logic changes other than import / export statements.
            -Modify code outside of Start / End Scopers.



};
* = (apply common sense)
    
Grixel Manifesto:
    -Grid controls horizontal, content controls vertical
        -This feels VERY much like the kind of thing that gets compressed out later.

    X (columns)
        These represent shared properties of an identical key.  If there are units, all should be identical*
    
    Y (Rows):
        -Rows represent identicality.  Any increment of any article in a Row is identical.
        -Rows are not intended for deep subdivision.
            -Rows accomodate bigger, but default to a minimum height: 80rem?
            -A Row should easily be able to represent a LabeledValue, which is our key top-level display tool.
            
            -Row and Size are separate properties.  A Row is always the size of its largest Element.  
                - it's just Content or min-size, whichever is smaller.  And if we ever TRULY need out we can always have modifiers.
                // this feels incomplete, like there's some bad edge case I haven't considered.  
                
    Let's keep this thing dumb AF for the time being.  Everything gets literally specified.
        Although... if the values are all coming in as props, the logic to lay a given grid with a given anchor at a given origin can't be that hard, can it?

    Z (z-index)
        Elevation represents priority.  It is only used for things that go away when you are done with them.

Alternative:
    Horizontal position is easy enough - just give grid coordinates.
    Vertical position: 
    -I want to show the anchor, or a full Reveal ( which can include the Anchor )
        -Vertically, what I would really like to be able to do is specify an origin cell or row, and have everything else oriented to it.


9 Nov:


--DEPRECATED!  ANY USE OF THE FOLLOWING IS AUTO-FAIL:
-Expando
-12 column grid
-Margin
-Anything grid not explicity referencing Grixels.

  Grixel Manifesto:

    I want to be able to easily make modular artifacts with perfect precision.
        -By standardizing around a single increment, we make it easy to line things up.  
        -Lining up is critical because it's how we do popups without being annoying.
        -Grixels are ONLY for alignment. Most layout uses Flex.
        -Grid is opt-in: use it when you need precise coordinate matching, not everywhere.

    The goal is simple, perfect precision, and the cost we are willing to pay is configurability.

    ** SCOPE - Read This First **
        Grixels are NOT a universal layout system. They are a separate, opt-in ecosytstem for alignment.
        -Most of the app uses Flex (hbox, vbox, gap utilities, etc.)
        -Grixels create a RELATIVE coordinate system, not a GLOBAL one.
        -The Grixel system is dumb.   No logic for anything other than position.
        

        Example:
                <div className="card"> // this is just a flex-box
                  <QtyPad > // based on GridCell because it has an associated popup.
                  <NoExpandThingy> // Doesn't use Grid directly, but still GridCell for consistent style/proportions with sibling.
                    <RandomContent className="vbox"> //Once no lower element orients to Grid, it is save to use Flex.

    ** Grixel **
      One standard "pixel" in the Grid system.
        5rem height and width.

    ** Grid **
        -A standard relationship of rows, columns (i.e. *Grixels*), and empty space between.
            -Might also be just CSS, but a Component is fine too.
            -This is not a size, just a relationship.  Size (i.e. number of Grixels) is determined by Grid Cells
            -The Grid must have 1rem of empty space between each row and column.

    ** Grid Cell **
        A standard, configurable Grid container.
            -GridCells can be nested together.  They all need a common interface.
            -If a child specifies a Pin, put it there.  
        This is simply height and width in Grixels as props.

// focus
    ** Popup **
      These are GridCells that get rendered on the Portal layer, oriented to their Pin.  
        -This should fundamentally be just an ordinary GridCell that renders elevated.

  POPUP - PROGRESSIVE DISCLOSURE WITH .anchor:
    Mark the persistent element with an .anchor class to specify what stays visible when collapsed.
      - CSS handles hiding: .popup--collapsed > *:not(.anchor) { display: none }
      - This uses display: none which completely removes hidden elements from layout flow, interaction, and tab order
      - No ghost clicks, no space taken
      - Interlude state controls the collapsed/expanded className switching
        
        My dream is:

        <QtyPadFake yGrixels=4 xGrixels=2   `>
        //R1
            <PlusKey />
                <InputField yGrixels=2>
            <MinusKey />

        //R2
            </>
            <DeleteKey yGrixels=2>
        </QtyPad>
        



I want you to create another KeyPad.  This called SearchType.

This is 4 grixels wide.

AFAICT we no longer need to logically group search types.  All search types now just set their own value, so the reducer could be just one action.

//Col 1: 2grx wide.  Each entry is a full row.
-anchor, content is LV inside standard tile with label Search Type and the value as the current selection.  When in popup, label is "" and the value becomes SearchType.
-subtitle:  Basic:
-SelectionTile: Receipt #
-SelectionTile: Order #
-SelectionTile: Invoice #


//Col 2:
-2grx empty space.
-2grx wide subtitle:  Advanced:
-SelectionTile: Credit Card #
-SelectionTile: Phone #
  

**/
};
