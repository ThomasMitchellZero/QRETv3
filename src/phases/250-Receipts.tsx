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
  Expando,
  type Scene,
} from "../logic/Interlude";
import { ProductImage } from "../assets/product-images/ProductImage";

import { KeyPad } from "../components/KeyPad";

// ================================
// INVOICE SEARCH CARD
// ================================

// START_SCOPER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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
    entryValue: null as number | string | null,
  });

  function handleInputChange(val: string | number) {
    const parsed = Number(val);
    setLocalInputs({ entryValue: isNaN(parsed) ? val : parsed });
  }

  const activeSearch = localSettings[localSettings.mode];

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
    <Expando
      className={`receipts card vbox`}
      id={stageId}
      scene={scene}
      headline={
        <div className={`hbox align-center`}>
          <div className="text subtitle">Search Receipts</div>
          <div className="icon sm">🔍</div>
        </div>
      }
    >
      <div id={`${stageId}-dialog`} className={`receipts search-grid`}>
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
          <KeyPad
            value={localInputs.entryValue || ""}
            onChange={handleInputChange}
            display={`Enter ${activeSearch} #`}
          />
        </div>
      </div>
    </Expando>
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
        //rightColumn={<ReceiptEntry />}
      />
    </Phase>
  );
}
