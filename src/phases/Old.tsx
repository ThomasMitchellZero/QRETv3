// VERY rough sketch.
import React from "react";
import { Phase, Numpad } from "../components/Components";
import { fakeCatalog } from "../api/fakeApi";
import { cloneDeep } from "lodash";

import {
  Floorplan,
  ProductDetailsTile,
  LabeledValue,
  type ProductDetailsTileProps,
} from "../components/Components";

import { Stage, Actor, useInterlude, Dialog } from "../logic/Interlude";
import { useTransaction, useReturnItemsPhase, dollarize } from "../logic/Logic";

import type { Item } from "../types/Types";

import { useDerivation } from "../logic/Derivation";

//********************************************************************
//  RETURN QTY
//********************************************************************

function ReturnQtyTile({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId, qty } = item;

  const scene = { [`return-qty-${itemId}`]: true };

  return <Actor id={`return-qty-${itemId}`} scene={scene} className={`w-sm`} />;
}

export function ReturnQtyDialog({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId, qty } = item;

  return (
    <Dialog
      id={`return-qty-dialog-${itemId}`}
      className={`dialog align-start`}
      scene={{ [`return-qty-${itemId}`]: true }}
    >
      <LabeledValue label="Return Qty" textAlign="left" value={`${qty}`} />
      <Numpad
        value={transaction.returnItems?.get(itemId)?.qty ?? 0}
        onChange={(v) => {
          const next = new Map(transaction.returnItems);
          const existing = next.get(itemId);
          if (existing) next.set(itemId, { ...existing, qty: v });
          dispatch({
            kind: "SET_INPUT",
            payload: { key: "returnItems", value: next },
          });
        }}
      />
    </Dialog>
  );
}

//********************************************************************
//  Refund Details
//********************************************************************

const refundDetailsSwift = {
  /*

  You’re focused solely on RefundDetailsTile and RefundDetailsDialog in 200-ReturnItems.
Both currently share intertwined logic—data, state, and rendering responsibilities mixed together.
Your goal:
  •	Split the Tile (the clickable Actor) and the Dialog (the expanding detail view).
  •	Preserve all working logic (refund data, calculations, interactivity).
  •	Avoid duplicating or desynchronizing shared logic.
  •	Limit work to ~15 minutes, prioritizing reliability over elegance.

Target outcome:
  •	RefundDetailsTile = lightweight trigger (renders summary info, dispatches Interlude scene).
  •	RefundDetailsDialog = separate component (renders full details, reads same props/context).
  •	Shared logic (e.g. refund total computation) lives in a pure helper function or a custom hook—whichever is faster to extract.

Constraints:
  •	No changes to global architecture.
  •	Must remain consistent with current Interlude (Scene-driven visibility).
  •	Keep refactor local to 200-ReturnItems.

Approach summary:
  1.	Identify shared logic inside RefundDetailsTile (like calculations).
  2.	Extract that logic to a useRefundDetails() helper/hook file in the same directory. (~5 min)
  3.	Pass the hook’s return values into both components. (~5 min)
  4.	Replace Dialog conditional rendering with isActive(sceneKey) from Interlude. (~3–5 min)

End result: two clean, independent components connected by one small shared logic module.

*/
};

const refundDetailsScene = (itemId: string) => ({
  [`refund-details-${itemId}`]: true,
});

export function RefundDetailsTile({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );

  const receiptedAtoms = thisItemsAtoms.filter((a) => a.invoId != null);

  const totalQty = aggregateAtoms(thisItemsAtoms, "qty");
  const receiptedQty = aggregateAtoms(receiptedAtoms, "qty");
  const itemRefunds = aggregateAtoms(thisItemsAtoms, "valueCents");
  const scene = refundDetailsScene(itemId);

  return (
    <Actor
      id={`refund-details-${itemId}`}
      scene={scene}
      className={`w-md  align-center`}
    >
      <div className="hbox w-md">
        <LabeledValue
          label="Receipted"
          value={`${receiptedQty} / ${totalQty}`}
          className="fill-main"
        />
        <LabeledValue
          label="Total Refund"
          value={dollarize(itemRefunds)}
          textAlign="right"
        />
      </div>
    </Actor>
  );
}

export function RefundDetailsDialog({ item }: { item: Item }) {
  const { itemId } = item;
  const { returnItemAtoms, aggregateAtoms } = useDerivation();

  const thisItemsAtoms = returnItemAtoms.filter(
    (atom) => atom.itemId === item.itemId
  );
  const keyOf = (v: string | number | undefined) =>
    v === undefined ? "__NO_RECEIPT__" : String(v);

  const receiptKeys = [...new Set(thisItemsAtoms.map((a) => keyOf(a.invoId)))];

  const scene = { [`refund-details-${itemId}`]: true };

  const refundRows = receiptKeys.map((rk) => {
    const atomsForKey = thisItemsAtoms.filter((a) => keyOf(a.invoId) === rk);
    const thisInvoQty = aggregateAtoms(atomsForKey, "qty");
    const thisInvoValue = aggregateAtoms(atomsForKey, "valueCents");
    const label = rk === "__NO_RECEIPT__" ? "No Receipt" : `Rcpt. #${rk}`;
    const labelStyle = rk === "__NO_RECEIPT__" ? "text-critical" : "";
    const valueStyle =
      rk === "__NO_RECEIPT__" ? "text-critical" : "text-success";

    return (
      <div key={rk} className="hbox gap-8rpx fill-main">
        <div
          className={`fill-main ${labelStyle}`}
        >{`${label} x ${thisInvoQty}`}</div>
        <div className={`text ${valueStyle} subtitle bold`}>
          {dollarize(thisInvoValue)}
        </div>
      </div>
    );
  });

  return (
    <Dialog
      id={`refund-details-dialog-${itemId}`}
      scene={scene}
      className={`w-md  align-center`}
    >
      {refundRows}
    </Dialog>
  );
}

export function ReturnItemsCard({ item }: { item: Item }) {
  const [transaction, dispatch] = useTransaction();
  const { itemId } = item;

  // Local interaction boundary for this item
  const scene = { [`item-${itemId}`]: true };

  return (
    <div className="card hbox gap-16rpx">
      {/* Static header: not part of Interlude */}
      <ProductDetailsTile item={item} hasPrice={false} />

      {/* Localized interaction zone */}
      <Stage
        id={`stage-${itemId} `}
        scene={scene}
        className="hbox gap-8rpx fill-main"
      >
        <div className={`hbox`}>
          <ReturnQtyTile item={item} />
          <RefundDetailsTile item={item} />
        </div>
        {/* Dialogs */}
        <div className={`dialog-row`}>
          <RefundDetailsDialog item={item} />
          <ReturnQtyDialog item={item} />
        </div>
      </Stage>

      {/* Cleanup actions (non-Interlude) */}
      <div className="hbox justify-end align-start">
        <button
          className="btn--outline h-sm text"
          onClick={() => {
            const next = new Map(transaction.returnItems);
            next.delete(itemId);
            dispatch({
              kind: "SET_INPUT",
              payload: { key: "returnItems", value: next },
            });
          }}
        >
          🗑️ Remove
        </button>
      </div>
    </div>
  );
}
// ================================
// RETURN ITEMS LIST
// ================================

function ReturnItemsList() {
  const [transaction] = useTransaction();
  const repo = transaction.returnItems;
  const itemsMap: Map<string, Item> =
    repo instanceof Map ? repo : new Map(Object.entries(repo || {}));
  return (
    <div className="card-ctnr gap-16rpx">
      {Array.from(itemsMap.values()).map((item: Item) => (
        <ReturnItemsCard key={item.itemId} item={item} />
      ))}
    </div>
  );
}

// ================================
// ITEM ENTRY
// ================================

function ItemEntry() {
  const [, dispatch] = useTransaction();
  const [phase, dispatchPhase] = useReturnItemsPhase();

  const pendingItemId = phase.pendingItemId || "";
  const pendingQty = phase.pendingQty || 1;

  const handleAdd = () => {
    if (!pendingItemId || pendingQty <= 0) return;
    const newItem: Item = {
      itemId: pendingItemId,
      qty: pendingQty,
      valueCents: undefined,
      invoId: undefined,
    };
    dispatch({ kind: "ADD_ITEM", payload: newItem });
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingItemId", value: "" },
    });
    dispatchPhase({
      kind: "SET_LOCAL",
      payload: { key: "pendingQty", value: 1 },
    });
  };

  // Why is the Muggle's model of the time involved in UI work so skewed?
  return (
    <>
      <div className="catalog-items-list">
        Available Item IDs: {Object.keys(fakeCatalog).join(", ")}
      </div>
      <div className="item-entry">
        <input
          type="text"
          placeholder="Item #"
          value={pendingItemId}
          onChange={(e) =>
            dispatchPhase({
              kind: "SET_LOCAL",
              payload: { key: "pendingItemId", value: e.target.value },
            })
          }
        />
        <input
          type="number"
          min={1}
          value={pendingQty}
          onChange={(e) =>
            dispatchPhase({
              kind: "SET_LOCAL",
              payload: {
                key: "pendingQty",
                value: parseInt(e.target.value, 10) || 1,
              },
            })
          }
        />
        <button onClick={handleAdd}>Add Item</button>
      </div>
    </>
  );
}

//********************************************************************
//  RETURN ITEMS PHASE SCAFFOLD
//********************************************************************

export function ReturnItemsPhase() {
  return (
    <Phase phaseId="return-items" title="Return Items">
      <Floorplan
        pageTitle="Return Items"
        mainContent={<ReturnItemsList />}
        rightColumn={<ItemEntry />}
      />
    </Phase>
  );
}

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

const SwiftScriptTree = {
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
