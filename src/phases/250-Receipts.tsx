import React from "react";
import { cloneDeep } from "lodash";

import {
  Phase,
  LabeledValue,
  Floorplan,
  Numpad,
} from "../components/Components";
import { useTransaction, dollarize } from "../logic/Logic";
import type {
  Invoice,
  TransientState,
  PhaseState,
  TransactionState,
  Item,
  refInvoice,
  refTransactionState,
  refPhaseState,
  refTransientState,
  refItem,
} from "../types/Types";

import { fakeInvoices, findInvoices } from "../api/fakeApi";

import { useDerivation } from "../logic/Derivation";
import {
  useInterlude,
  useIsActive,
  Stage,
  Actor,
  Dialog,
  type Scene,
} from "../logic/Interlude";
import { ProductImage } from "../assets/product-images/ProductImage";

// ================================
// INVOICE SEARCH CARD
// ================================

const brief = {
  /*
  === Monkey Comments (FOR APE MODIFICATION ONLY) ===
  ** DO NOT DELETE.  FOR APE MODIFICATION ONLY **


  For Types, reference Types.tsx file.  Use existing types where practical.
  For Existing Logic, read from Logic.tsx.
  For Existing Derivation, read from Derivation.tsx.
  For Existing Components, read from Components.tsx.
  For Existing API, read from fakeApi.tsx.
  For Style, read from styles.css.

  
  Ignore error handling for now.  We will add that later.
  Search is going to be a Card that is placed in the Receipts column.  The card is titled Search Receipts.
  if invoice cart is empty, Card fills entire column and centers the content in the vertical axis.  if invoice cart has items, Card instead shrinks to fit content.
  Try to keep the logic minimal and direct.  I am the only one working on this and I am using only local data.  We don't need a hardened app that can handle weird cases.
  Branching logic should be implemented through mode objects rather than conditional branches. Each mode encapsulates all necessary state, handlers, and UI config (e.g., Mode[modeName].property), allowing the system to treat modes as data rather than control flow.
  -div Component should only be used for clickables.  For layout, use div with className="hbox" or "vbox" and appropriate flex/hug classes.
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
        -vertical column containing Tiles for Search Phone and Search CC#.  May add more later.
        -An input field to enter the phone or CC# title varies to match selection.
          -When searching by Phone or Card#, show the numpad entry field only (no extra text input).  

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
    <div>
      <// Mode Selection Tiles // keyed to local state.  Always visibile.  />
      <ExpandedContent >
      isExpanded // keyed to Phase State ??
       <// Mode Content row > 
        < Parameter Selection Column />
        < Parameter-Conditional Children />
        < Action Button />
  */
};

// --- Main InvoSearchCard logic ---
export const InvoSearchCard = () => {
  const [transaction, dispatchTransaction] = useTransaction();
  const stageId = "invo-search-card";
  const scene = { [stageId]: true } as Scene;
  const isActive = useIsActive(scene);

  // local flat state
  const [local, setLocal] = React.useState({
    mode: "enterTrxn", // 'enterTrxn' | 'search'
    entryValue: 0,
    searchType: "receipt", // 'receipt' | 'order'
  });

  // toggle expand
  const handleToggleExpand = (e?: React.MouseEvent) => {};

  // handle mode select
  const handleModeSelect = (mode: string) =>
    setLocal((p) => ({
      ...p,
      mode,
      searchType: mode === "enterTrxn" ? "receipt" : "phone",
    }));

  // handle numpad change
  const handleNumpadChange = (val: number) =>
    setLocal((p) => ({ ...p, entryValue: val }));

  // add invoice to receipts
  const handleAdd = () => {
    const id = String(local.entryValue);
    if (!id) return;
    const next = new Map(transaction.receipts ?? new Map());
    if (next.has(id)) return;
    const inv = fakeInvoices[id];
    if (inv) {
      next.set(id, inv);
      dispatchTransaction({
        kind: "SET_INPUT",
        payload: { key: "receipts", value: next },
      });
    }
  };

  return (
    <Stage id={"invo-search-card"} className={``} scene={scene}>
      {/* Mode selection tiles */}
      <div className="hbox fill-cross hug-main gap-8rpx">
        <div
          className={`tile ${local.mode === "enterTrxn" ? "active" : ""}`}
          onClick={() => handleModeSelect("enterTrxn")}
        >
          Enter Transaction #
        </div>
        <div
          className={`tile ${local.mode === "search" ? "active" : ""}`}
          onClick={() => handleModeSelect("search")}
        >
          Search Receipts
        </div>
        {isActive && (
          <button
            className="tile text body"
            onClick={handleToggleExpand}
            aria-label="Collapse"
          >
            -
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isActive && (
        <div className="hbox gap-8rpx padding-8rpx">
          {local.mode === "enterTrxn" && (
            <div className="hbox gap-8rpx align-center">
              <div className="vbox w-md gap-8rpx">
                <div className="vbox w-md gap-8rpx">
                  <div
                    className={`tile ${
                      local.searchType === "receipt" ? "active" : ""
                    }`}
                    onClick={() =>
                      setLocal((p) => ({ ...p, searchType: "receipt" }))
                    }
                  >
                    Receipt #
                  </div>
                  <div
                    className={`tile ${
                      local.searchType === "order" ? "active" : ""
                    }`}
                    onClick={() =>
                      setLocal((p) => ({ ...p, searchType: "order" }))
                    }
                  >
                    Order #
                  </div>
                </div>
              </div>
              <div className="fill vbox gap-8rpx">
                <Numpad
                  value={local.entryValue}
                  onChange={handleNumpadChange}
                />
                <button className="tile" onClick={handleAdd}>
                  Add
                </button>
              </div>
            </div>
          )}
          {local.mode === "search" && (
            <div className="vbox gap-8rpx">
              <div className="hbox gap-8rpx">
                <div className="tile active">Search Phone</div>
                <div className="tile">Search CC#</div>
              </div>
              <Numpad value={local.entryValue} onChange={handleNumpadChange} />
              <div className="vbox">
                <div className="tile">Search Results (stub)</div>
              </div>
            </div>
          )}
        </div>
      )}
    </Stage>
  );
};

// ================================
// RECEIPT CARD
// ================================

const receiptCardSceneId = (invoId: string) => `receipt-card-${invoId}`;
const receiptCardScene = (invoId: string) => {
  const next = {
    [receiptCardSceneId(invoId)]: true,
  } as Scene;
  return next;
};

type ReceiptCardProps = { invoice: Invoice };

function ReceiptCard({ invoice }: ReceiptCardProps) {
  const [transaction, dispatch] = useTransaction();
  const { invoId, items } = invoice;
  const scene = receiptCardScene(invoId);

  const totalQty = items.reduce((sum, item) => sum + (item.qty ?? 0), 0);
  const totalValueCents = items.reduce(
    (sum, item) => sum + (item.valueCents ?? 0),
    0
  );

  const handleRemove = () => {
    const receipts = transaction.receipts ?? new Map();
    const next = cloneDeep(receipts);
    next.delete(invoId);
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: next },
    });
  };

  return (
    <div className="card hbox">
      <LabeledValue label="Receipt #" value={invoId} className="w-sm" />

      <Stage
        className={`align-start fill-main gap-16rpx`}
        id={`receipt-${invoId}`}
        scene={scene}
      >
        <Actor scene={scene} className={`w-md`} id={`receipt-${invoId}-tile`}>
          <div className="hbox space-between">
            <LabeledValue
              className="fill-main"
              label="Items Sold:"
              textAlign="left"
              value={String(totalQty)}
            />
            <LabeledValue
              className="w-sm"
              textAlign="right"
              label="Receipt Value:"
              value={dollarize(totalValueCents)}
            />
          </div>
        </Actor>
        <Dialog
          id={`receipt-${invoId}-dialog`}
          scene={scene}
          rowClassName={`align-start`}
        >
          <div className="vbox">
            {items.map((item) => (
              <div key={item.itemId} className="hbox space-between">
                <span>ID: {item.itemId}</span>
                <span>Qty: {item.qty}</span>
              </div>
            ))}
          </div>
        </Dialog>
      </Stage>

      <button onClick={handleRemove} aria-label="Remove receipt">
        🗑️
      </button>
    </div>
  );
}

// ================================
// RECEIPT LIST
// ================================
function ReceiptList() {
  const [transaction] = useTransaction();
  const receipts = transaction.receipts ?? new Map();
  // <InvoSearchCard />
  return (
    <div className="card-ctnr">
      {Array.from(receipts.values()).map((invoice: Invoice) => (
        <ReceiptCard key={invoice.invoId} invoice={invoice} />
      ))}
    </div>
  );
}

// ================================
// RECEIPT ENTRY
// ================================
function ReceiptEntry() {
  const [transaction, dispatch] = useTransaction();
  const [id, setId] = React.useState("");

  const handleAdd = () => {
    if (!id) return;
    const receipts = transaction.receipts ?? new Map();
    if (receipts.has(id)) return; // ignore duplicates
    const next = cloneDeep(receipts);
    next.set(id, fakeInvoices[id] ?? { invoId: id, items: [] });
    dispatch({
      kind: "SET_INPUT",
      payload: { key: "receipts", value: next },
    });
    setId("");
  };

  return (
    <>
      <div className="text body">
        Available Receipt IDs: {Object.keys(fakeInvoices).join(", ")}
      </div>
      <div className="hbox">
        <input
          type="text"
          placeholder="Receipt #"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </div>
    </>
  );
}

export function UiMissingReceipt() {
  const { rollupAll, returnItemAtoms } = useDerivation();
  const nrrAtoms = returnItemAtoms.filter((item) => !item.invoId);
  const grouped = rollupAll(nrrAtoms, ["itemId"]);

  const uiNonReceiptedList = grouped.map((item) => (
    <div key={item.itemId} className="hbox tile fill-cross hug-main  gap-8rpx">
      <ProductImage
        size="sm"
        itemId={item.itemId}
        className="product-image-sm"
      />
      <div className="vbox fill-main hug-cross">
        <div className="text fill-cross hug-main body">{`#${item.itemId}`}</div>
        <div className="text fill-cross hug-main text-critical title">{`x ${item.qty}`}</div>
      </div>
    </div>
  ));

  return nrrAtoms.length ? (
    <div className="vbox gap-16rpx fill">
      <div className="text subtitle center">Receipts Missing</div>
      {uiNonReceiptedList}
    </div>
  ) : null;
}

// ================================
// RECEIPTS PHASE
// ================================
export function ReceiptsPhase() {
  return (
    <Phase phaseId="receipts" title="Receipts">
      <Floorplan
        pageTitle="Receipts"
        leftColumn={<UiMissingReceipt />}
        mainContent={<ReceiptList />}
        rightColumn={<ReceiptEntry />}
      />
    </Phase>
  );
}
