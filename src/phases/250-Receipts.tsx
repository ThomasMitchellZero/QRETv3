import React from "react";
import { cloneDeep, set } from "lodash";

import {
  Phase,
  LabeledValue,
  Floorplan,
  Numpad,
  SelectionTile,
} from "../components/Components";
import { useTransaction, dollarize } from "../logic/Logic";
import type {
  Invoice,
  PhaseState,
  TransactionState,
  Item,
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

const swift_InvoSearch = {
  /*
  === Monkey Comments (FOR APE MODIFICATION ONLY) ===
  Taylor's Version.
  ** DO NOT DELETE.  FOR APE MODIFICATION ONLY **


  For Types, reference Types.tsx file.  Use existing types where practical.
  For Existing Logic, read from Logic.tsx.
  For Existing Derivation, read from Derivation.tsx.
  For Existing Components, read from Components.tsx.
  For Existing API, read from fakeApi.tsx.
  For Style, read from styles.css.

  
  Ignore error handling for now.  We will add that later.

  There will be multiple configurations possible: 
    -A 'standby' mode for when the control is not being interacted with.  This is the only part that will touch Interlude state.
    -A 'keySearch' mode for when the control is active and the user is doing a keySearch for a single record.
    -A 'advSearch' mode for when the user is doing an advanced search.

  ---------------------------------------------------------------

  ** General Layout and Behavior **
    -At the top, this is a Stage containing a Form.  The only internal logic that touches Interlude state is whether the card is active or inactive.
      -The stage is just to prevent clearing itself from the interlude.
    -All logic for all states other than Interacting / Not are local state only.
      -Clicking outside the card removes it from the interlude, and thus it is inactive.
    -If the card goes back to inactive state, it resets to default local state.  
    -I want our horizontal elements to line up.  Clicking on the bar should feel like "Oh, same thing but with more options"
    -Under the hood, this is really just a <form> with different inputs showing / hiding based on mode.

    -I want to use oConfig to define all mode-specific configuration.
      -We shouldn't have to do any conditionals - just route to the appropriate object for a given key.
      -This component's structure is well-suited to nesting conditionals inside objects rather than using if / switch statements.

    -I want all modes of the card to use the same column layout so that the mode tiles do not move around when switching modes.
      -Icon column (All have the column, but it is ONLY filled in the top row.
      -Mode Tile column
        -When contents are visible, their order does not change, but their Active class always checks against local state.
      -Type Tile column
        -Same content behavior as Mode Tile column.
      -Input column
        -Input column will contain both the input field(s) and the "Search" button.
        -Search button is the ONLY trigger for a search action.
        
    -Top-level component should probably be an hBox with 2 rows:
      -All Inputs
      -Container for search results (advSearch only)

  ---------------------------------------------------------------

  -- Configuration Object (oConfig) --
  -oConfig{} is the primary configuration object for the component.
    -oConfig contains all setting-specific configuration - style, default values, strings, props passed.  oConfig is the single source of truth for all mode-specific configuration.
      -It should be kept clean of any non-configuration logic.
        -ideally, all values are simple keys or strings that are passed directly into logic or components as props. 
        -If() statements are code smell.  Logic should be more along the lines of oConfig.[local.mode].searchTypes[local.type]
    -There should be no conditional logic required in the render tree - just route to the appropriate object in oConfig based on local state.

    -oConfig and the Local state intersect each other: any oConfig key that is user-settable has a corresponding local state key.
      -localState can contain keys that are not in oConfig, but not vice versa.
        -these are keys that do not affect the configuration - e.g. search results, input values.



   State Handling --

  Search execution is triggered only by pressing the Search button.
  Typing, Numpad input, or focus changes never automatically initiate a search.

  There are 2 kinds of local state in this component:
    localSettings - tracks user-settable configuration (mode, type)
      -these DO NOT get reset when the Interlude ends.
    localInputs - tracks user-settable input values (numpad entry, text entry)
      -These can vary based on mode / type selected.
        -We can probably address this by having all possible input keys in localInputs, and only rendering the relevant ones based on mode / type.
        -Alternatively, we could have set the localInputs object dynamically based on mode / type, but that seems more complex.
        -In either case, the contents should be clear when the mode changes.

  -For our Setting Handlers (i.e. inputs where user is choosing a branch - e.g.  Type,  Mode), we are just setting local state.  Local state tracks:
    -Mode
    -Type


  -localSettings and localInputs should always be flat.  It should accept props that correspond with the oConfig structure, never nested.

  -In this context, localSettings should always have default values.  The only way to change values is user interaction.
    -This means we do not have to include conditions for undefined values in our render tree.

  
  -All stable inputs set localInputs state
  -Numpad sets localInputs state
  -All actions that affect the transaction dispatch to the transaction context via standard handlers.

  ** Always / Never for State and oConfig **
    Always:
    Derive all mode-specific configuration from oConfig routed valuess.
    use localSettings to track user-settable values.
      User-settable values correspond with the keys that route to a corresponding oConfig structure.
    use localInputs to track user-settable input values.

  Never:
    Use conditional logic in the render tree to determine mode-specific configuration.
    Store nested objects in local state.
    Store non-configuration values in oConfig.
    use arrays in oConfig.  If it doesn't have a unique key, it doesn't belong in oConfig.

  ** Sample Shapes **

const oConfig = {
  mode: {
    keySearch: {
      label: "Key Search",
      types: {
        receipt: {
          label: "Receipt #",
          inputKind: "numpad",
          onSearch: (val, dispatch) => dispatch({ type: "SEARCH_RECEIPT", val }),
        },
        order: {
          label: "Order #",
          inputKind: "numpad",
          onSearch: (val, dispatch) => dispatch({ type: "SEARCH_ORDER", val }),
        },
      },
    },
    advSearch: {
      label: "Advanced Search",
      types: {
        phone: {
          label: "Phone",
          inputKind: "numpad",
          onSearch: (val, dispatch) => dispatch({ type: "SEARCH_PHONE", val }),
        },
        cc: {
          label: "Credit Card",
          inputKind: "text",
          onSearch: (val, dispatch) => dispatch({ type: "SEARCH_CC", val }),
        },
      },  
    },
  },
};

    const localSettings = {
      mode: "keySearch",
      searchType: "receipt",
    };

    const local inputs = {
      entryValue: 0,
      differentFieldValue: "",
      // these are examples
  }



  ---------------------------------------------------------------
  
  -StandbyMode.
    -This is a 5px high bar with the title "Search Receipts".
      -An 8rem Search icon.
      -The currently selected Mode tile.
      -The currently selected Type file.
      -an empty input field.


  -keySearch Mode: 
    -A column of all modes available, currently "keySearch" and "advSearch".
    -A column of all types available for the selected mode.
    -A column of input fields for the selected type.  For now, just keySearch with numpad.
      -Numpad input field.  (Use existing Numpad component from Components.tsx)
    -If a result is found, add it directly to the transactionState.receipts  In this mode, it will be the only potential match.

  -advSearch Mode:
    - same layout as keySearch mode, but different types and input fields.
    - In this mode, the results area is visible, though not rendered until it is populated.
      -Populated can be either a successful search or a "no results found" message.
      -A column to display the search results.  For now, just invoId of matching invoices.
    If search is successful, show a list of the matching invoices.
      -DO NOT automatically add to transactionState.receipts.  We will do this manually later.

    Fttb, if no result is found, just do nothing.
    
    

*/
};

const swift_SearchResults = {
  /*
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
  */
};

export function InvoSearchBar() {
  // --- Main InvoSearchCard logic ---

  const [transaction, dispatchTransaction] = useTransaction();

  const stageId = "invo-search-card";
  const scene = { [stageId]: true } as Scene;
  const isActive = useIsActive(scene);

  type Mode = "keySearch" | "advSearch";
  type KeySearch = "receipt" | "order";
  type AdvSearch = "phone" | "cc";

  type LocalSettings = {
    mode: Mode;
    keySearch: KeySearch;
    advSearch: AdvSearch;
  };

  type LocalSettingsAction =
    | { type: "SET_MODE"; payload: Mode }
    | { type: "SET_KEYSEARCH"; payload: KeySearch }
    | { type: "SET_ADVSEARCH"; payload: AdvSearch };

  const localSettingsReducer = (
    state: LocalSettings,
    action: LocalSettingsAction
  ): LocalSettings => {
    switch (action.type) {
      case "SET_MODE":
        return { ...state, mode: action.payload };
      case "SET_KEYSEARCH":
        return { ...state, keySearch: action.payload };
      case "SET_ADVSEARCH":
        return { ...state, advSearch: action.payload };
      default:
        return state;
    }
  };

  const [localSettings, dispatchSettings] = React.useReducer(
    localSettingsReducer,
    { mode: "keySearch", keySearch: "receipt", advSearch: "phone" }
  );

  const [localInputs, setLocalInputs] = React.useState({
    entryValue: null as number | null,
  });

  function handleInputChange(val: number) {
    setLocalInputs({ entryValue: val });
  }

  // START_SCOPER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // END_SCOPER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  type UiSelectionTileProps = {
    group: keyof LocalSettings;
    value: string; // this is supposed to be the value it sets AND checks against
  };

  function UiSelectionTile({ group, value }: UiSelectionTileProps) {
    const valInState = localSettings[group];
    console.log("group:", group, "value:", value, "valInState:", valInState);
    const isSelected = valInState === value;
    console.log("isSelected:", isSelected);

    const actionType =
      group === "mode"
        ? "SET_MODE"
        : group === "keySearch"
        ? "SET_KEYSEARCH"
        : "SET_ADVSEARCH";

    return (
      <SelectionTile
        key={`${group}-${value}`}
        isSelected={isSelected}
        isDisabled={false}
        onClick={() =>
          dispatchSettings({ type: actionType as any, payload: value } as any)
        }
      >
        {value}
      </SelectionTile>
    );
  }

  return (
    <Stage className={`receipts hbox`} id={stageId} scene={scene}>
      {/* Icon column (placeholder for visual alignment) */}

      {!isActive ? (
        <Actor
          id={`${stageId}-bar`}
          scene={scene}
          className="tile hbox align-center"
        >
          <div className={`card`}>
            <div className="text subtitle">Search Receipts</div>
            <div className="icon sm">🔍</div>
          </div>
        </Actor>
      ) : (
        <Dialog
          scene={scene}
          id={`${stageId}-dialog`}
          className={`receipts search-grid`}
          rowClassName={`align-start`}
        >
          {/* Mode column */}
          <div className="modeCol vbox">
            <UiSelectionTile group="mode" value="keySearch" />
            <UiSelectionTile group="mode" value="advSearch" />
          </div>

          {/* Type column */}
          <div className="typeCol vbox">
            {localSettings.mode === "keySearch" && (
              <>
                <UiSelectionTile group="keySearch" value="receipt" />
                <UiSelectionTile group="keySearch" value="order" />
              </>
            )}

            {localSettings.mode === "advSearch" && (
              <>
                <UiSelectionTile group="advSearch" value="phone" />
                <UiSelectionTile group="advSearch" value="cc" />
              </>
            )}
          </div>

          {/* Input column */}
          <div className="inputCol vbox">
            <Numpad
              value={localInputs.entryValue || 0}
              onChange={handleInputChange}
              showIncrementButtons={false}
            />
          </div>
        </Dialog>
      )}
    </Stage>
  );
}

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
        className={`align-start fill-main blooble`}
        id={`receipt-${invoId}`}
        scene={{}}
      >
        <Actor
          scene={scene}
          className={`hbox w-md ActorItself`}
          id={`receipt-${invoId}-tile`}
        >
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
      <InvoSearchBar />
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
