export const InvoSearchCard = () => {

    // VERY rough sketch.
    const brief = {
      /*
  
    ** DO NOT DELETE.  FOR APE MODIFICATION ONLY **
  
    Ignore error handling for now.  We will add that later.
  
    Search is going to be a Card that is placed in the Receipts column.  The card is titled Search Receipts.
    if invoice cart is empty, Card fills entire column and centers the content in the vertical axis.  if invoice cart has items, Card instead shrinks to fit content.
  
    Try to keep the logic minimal and direct.  I am the only one working on this and I am using only local data.  We don't need a hardened app that can handle weird cases.
  
    Branching logic should be implemented through mode objects rather than conditional branches. Each mode encapsulates all necessary state, handlers, and UI config (e.g., Mode[modeName].property), allowing the system to treat modes as data rather than control flow.
    
    Create a new class for mini-tiles.  We will use these again.
  
    ** Shared Cared Properties **
  
    Search is going to contain 2 rows, a Tile row and a Content column. In Content column, show 2 Mini tiles to select mode. 
      -If expanded, show a [ - ] button to collapse the content.
      -Any click within the content area expands it if it is not already expanded.
      -Only a click on the [ - ] button collapses it.
      -The card’s size always hugs the vertical content.  Hugging and flex logic still apply normally.  
  
    -I would like a configuration for numPad for entering key names instead of qty.  This would be similar but it would not have + or - buttons.  It would have a backspace button.  
  
    ---------------------------------------------------------------
  
    ** Enter Transaction# Mode **
  
    First selection tile triggers the first mode: "Enter Transaction#". When active, Content is an hbox containing the following:
      -A vertical list of mini-tiles to select search type: Receipt# and Order#.  For this demo, no logic is needed.  We will search by invoId no matter what the user enters.  
      -The Numpad entry field is the only number-entry input visible.  
      -There should be no separate <input type="text"> field when the numpad is active; the numpad handles all numeric entry and editing.  
          
  
      -The numpad configured for entering key names.
        -The numpad's value is bound to the local state for this component.
  
      -A button to "Add" the receipt to the cart.
        -When clicked, this searches fakeInvoices for the matching invoId.
        -On Add (if valid), the numpad dispatches an action to add the invoice to the Receipts repo.
  
    ----------------------------------------------------------------
  
    ** Search Receipt Mode **
  
    Second Selection Tile is triggers the second mode: Receipt Search.
      -When active, Content contains the following:
        a row of:
          -vertical column containing Tiles for Search Phone and Search Email.  May add more later.
          -An input field to enter the phone, CC# or email, title varies to match selection.
            -When searching by Phone or Card#, show the numpad entry field only (no extra text input).  
            -When searching by Email, do not render the numpad at all — just a single text input field. Input will be physical keyboard.  
          -A 'Search' button.  When clicked, this searches fakeInvoices for the matching criteria
        -A column to display the search results.
  
    If search is successful, show a list of the matching invoices.
      -CRITICAL DISTINCTION:
        -Added invoices work exactly the same as adding them by any other means.
          -The Receipts repo is the SSoT for invoices in the transaction.
          -ALL other information is derived from fakeInvoices using the invoId from the Receipts repo.
          
      -The list items are unstyled hBoxes with the following info:
        -Invoice #
        -Stage:
          -Actor Tile:
            total SKUs sold
            total sale amount
            -When solo:
              -A divider
              -A list of SKUs sold with qty and price as a Component.  Will add to later.
        Conditionally, one of the following:
          -A button that adds that receipt directly to the transaction if it is not already present.
          or:
          -Text saying 'Added' if that receipt is already in the cart.
    
  
    ---------------------------------------------------------------
  
    ** State Handling **
  
    -For our Mode Setters (means inputs where user is choosing an option - e.g. Search Type, Search Mode, parameters), we are just setting local state.
      -Using objects to encapsulate all mode-specific config and handlers.
      -What gets rendered should be dumb - just routes to the appropriate mode object.
  
    -Full / Vs. Mini Card state:
      -Any click inside the content area expands the card if it is not already expanded.
      -Any click outside the content area collapses the card if it is not already collapsed.
        -this may need to be handled in Phase transient state.
      -The [ - ] also button collapses the card if it is not already collapsed.
      -In Mini State, only the mode selection tiles are visible.
        -As a result, we should make every effort to ensure that Mode tiles do not change position when switching Card Modes.
      -ANY click inside the card (including any child element) sets the card to Full state.  
      -In Full state, the card still hugs its contents; it simply reveals more of them.   
  
    -Local state for mode and numpad value.
    -Local state should be completely flat.
    -ALL independent local state elements should have their own field.
      -Search Mode (Trxn # vs. multi-result)
      -Search Parameters 
        -user selections like Order# vs. Receipt#, 
        -search type (phone, email, cc)
  
    -All stable inputs set local state.
    -Numpad sets local state
    -All actions that affect the transaction dispatch to the transaction context.
    -Logic for 2 modes should have a similar shape, but specific configuration should be encapsulated in the mode objects.
      
    */
    };
    const designOutline = {
      // Common handlers
      /*
  
      !!!!!!!!!!!  NEVER, ever delete design Outline, this means LLMs too.  No touchy !!!!!!!!!!
  
    -All state parameters should have default values.  The user should be be able to switch choices at any time without losing data, but their choices are defined for
    -Local state should be a single, object.
    -Transaction state - add validated Invo via standard dispatch.
    -Transient state 
      - Card expand / collapse
    
    <Container>
      <// Mode Selection Tiles // keyed to local state.  Always visibile.  />
      <ExpandedContent >
      isExpanded // keyed to Phase State ??
       <// Mode Content row > 
        < Parameter Selection Column />
        < Parameter-Conditional Children />
        < Action Button />
  
    */
    };