import type { PhaseNode, Item } from "../types/Types";
import { StartPhase } from "../phases/050-Start";
import { ReturnItemsPhase } from "../phases/200-ReturnItems";
import { ReceiptsPhase } from "../phases/250-Receipts";
import { useDerivation } from "../logic/Derivation";
import { type CatalogEntry, fakeCatalog } from "../api/fakeApi";
import { ProductImage } from "../assets/product-images/ProductImage";

import React, { useRef } from "react";
import {
  useTransients,
  useNavigatePhase,
  useTransaction,
  isActive,
} from "../logic/Logic";

//********************************************************************
//  CONTAINER (BASE PRIMITIVE)
//********************************************************************
/*

*/

export type ContainerProps = {
  id?: string | undefined;
  children?: React.ReactNode;
  className?: string;
  preserve?: string[] | undefined;
  onClick?: React.MouseEventHandler;
};

export function Container(props: ContainerProps): JSX.Element {
  const [, dispatchTransients] = useTransients();
  const { children, className = "", preserve, onClick } = props;

  const handleClick = (e: React.MouseEvent) => {
    dispatchTransients({
      kind: "CLEAR_TRANSIENT",
      preserve: preserve || [],
    });
    if (onClick) onClick(e);
  };

  return (
    <div className={className} onClick={handleClick}>
      {children}
    </div>
  );
}

export type TileProps = ContainerProps & {
  children: React.ReactNode;
};

export function Tile(props: TileProps): JSX.Element {
  return (
    <Container className="tile" {...props}>
      {props.children}
    </Container>
  );
}

export function Stage({
  id,
  children,
  className,
}: {
  id: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const [, dispatchTransients] = useTransients();

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatchTransients({ kind: "CLEAR_TRANSIENT" });
    }
  };

  return (
    <Container
      id={id}
      className={`stage transient-scope ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </Container>
  );
}

////////////////////////////////////////////////////////////////////////////////////
//  UI COMPS
////////////////////////////////////////////////////////////////////////////////////

export type LabeledValueprops = {
  label?: string;
  value?: string | number;
  className?: string;
  textAlign?: "left" | "center" | "right";
};

export function LabeledValue({
  label,
  value,
  className = "",
  textAlign = "left",
}: LabeledValueprops) {
  return (
    <div className={`vbox LV gap-0rpx ${className}`}>
      <div className={`text body ${textAlign}`}>{label} </div>
      <div className={`text title ${textAlign}`}>{value} </div>
    </div>
  );
}
export type ActorTileProps = {
  id: string;
  headline: React.ReactNode;
  children?: React.ReactNode;
  style?: string | React.CSSProperties | undefined;
};

export function ActorTile(props: ActorTileProps) {
  const [transients, dispatchTransients] = useTransients();
  const { id, headline, children, style, ...rest } = props;

  // Simplified state: isSolo is true if this tile is the active overlay
  const isSolo = isActive(transients, "activeOverlayId", id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchTransients({
      kind: "SET_TRANSIENT",
      payload: { activeOverlayId: id },
    });
  };

  return (
    <Container
      id={id}
      className={`tile ${style} ${isSolo ? "solo layer-top" : ""}`}
      onClick={handleClick}
      {...rest}
    >
      {headline}
      {isSolo && <div>{children}</div>}
    </Container>
  );
}

export type ProductDetailsTileProps = {
  item: Item;
  extraContent?: React.ReactNode; // Optional slot for custom info or actions
  hasPrice?: boolean; // Whether to show price (default: true)
};

export function ProductDetailsTile({
  item,
  extraContent,
  hasPrice = true,
}: ProductDetailsTileProps) {
  // Lookup still fine for description/value

  const catalogEntry = (fakeCatalog[item.itemId] ??
    fakeCatalog["0000"]) as CatalogEntry;

  const uiPrice = hasPrice ? (
    <div className="">${(catalogEntry.valueCents / 100).toFixed(2)}</div>
  ) : null;

  return (
    <Container className="product-details">
      <ProductImage itemId={item.itemId} alt={catalogEntry.description} />
      <div className="vbox fill item-details">
        <div className="">Item #{item.itemId}</div>
        <div className="">{catalogEntry.description}</div>

        {uiPrice}
        {extraContent && (
          <div className="item-details__extra">{extraContent}</div>
        )}
      </div>
    </Container>
  );
}

export type NumpadProps = {
  value?: number;
  onChange?: (val: number) => void;
  className?: string;
};

export const Numpad: React.FC<NumpadProps> = ({
  value = 0,
  onChange,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // Auto-focus the input when the numpad mounts or its parent tile is clicked
  React.useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput(); // Focus immediately when mounted
    const parent = inputRef.current?.closest(".tile");
    if (parent) parent.addEventListener("mousedown", focusInput);
    return () => {
      if (parent) parent.removeEventListener("mousedown", focusInput);
    };
  }, []);
  const focusInput = () => inputRef.current?.focus();

  const handleDigit = (d: string) => {
    const next = `${value ?? ""}${d}`;
    onChange?.(Number(next) || 0);
    focusInput();
  };

  const handleBackspace = () => {
    const next = String(value ?? "").slice(0, -1);
    onChange?.(Number(next) || 0);
    focusInput();
  };

  const handleIncrement = (delta: number) => {
    const next = Math.max(0, (value ?? 0) + delta);
    onChange?.(next);
    focusInput();
  };

  // Only digits for grid
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const handleClick = (b: string) => {
    handleDigit(b);
  };

  return (
    <div
      className={`vbox numpad ${className || ""}`}
      style={{ minWidth: "200px", width: "100%" }}
    >
      <div
        className="hbox space-between align-center pad-xs"
        style={{ gap: "0.5rem", padding: "0.5rem", alignItems: "center" }}
      >
        <button
          className="fill-main text title "
          style={{ minHeight: "2.5rem" }}
          onClick={() => handleIncrement(-1)}
        >
          -
        </button>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value) || 0)}
          className=" fill-main text-center"
          inputMode="numeric"
          style={{
            textAlign: "center",
            minHeight: "2.5rem",
          }}
        />
        <button
          className="fill-main text title "
          style={{ minWidth: "2.5rem", minHeight: "2.5rem" }}
          onClick={() => handleIncrement(1)}
        >
          +
        </button>
        <button
          className="fill-main text title "
          style={{ minHeight: "2.5rem" }}
          onClick={handleBackspace}
        >
          ←
        </button>
      </div>

      <div className="vbox pad-xs">
        <div
          className="grid numpad-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
            justifyItems: "center",
            alignItems: "center",
            padding: "0.5rem",
          }}
        >
          {buttons.map((b) => (
            <button
              key={b}
              className="tile center"
              style={{
                width: "100%",
                minHeight: "3.5rem",
                height: "3.5rem",
                fontSize: "1.25rem",
                justifyContent: "center",
                alignItems: "center",
                padding: "0.25rem",
                display: "flex",
              }}
              onClick={() => handleClick(b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Numpad;

// Overlay participates in the transient z-axis model and uses .layer-top.blocking for correct stacking.
export function Overlay({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return <div className="overlay layer-top blocking fill">{children}</div>;
}

//********************************************************************
//  LAYOUT COMPS
//********************************************************************

export type FloorplanProps = {
  navBar?: React.ReactNode; // optional: navigation row
  pageTitle?: React.ReactNode; // page header
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Floorplan({
  navBar = <NavBar />,
  pageTitle,
  leftColumn,
  rightColumn,
  mainContent,
  footer = <Footer />,
}: FloorplanProps): JSX.Element {
  return (
    <div className="vbox fill gap-0rpx floorplan">
      <div className="hbox fill-cross bg-brand text-white">
        Ecosystem Placeholder
      </div>
      <div className="hbox gap-0rpx fill">
        {leftColumn && <div className="column bg-bg-main">{leftColumn}</div>}
        <div className="vbox fill main-column">
          <h1 className={`text title`}>{pageTitle}</h1>
          {navBar}
          {mainContent || <div className="fill" />}
          {footer}
        </div>
        {rightColumn && <div className="column bg-bg-main">{rightColumn}</div>}
      </div>
    </div>
  );
}

export function NavBar(): JSX.Element {
  const [transaction] = useTransaction();
  const navigate = useNavigatePhase();
  const selectedId = transaction.currentPhase; // derive once, no hooks-in-loop

  return (
    <div className="hbox">
      {transaction.phases.map((node) => {
        const isSelected = node.phaseId === selectedId;
        return (
          <div
            key={node.phaseId}
            onClick={() => navigate(node.phaseId)}
            style={{
              border: isSelected ? "2px solid blue" : "1px solid #ccc",
              cursor: "pointer",
              borderRadius: "4px",
              padding: "0.25rem",
            }}
          >
            <PhaseNodeTile node={node} />
          </div>
        );
      })}
    </div>
  );
}

export type PhaseProps = {
  phaseId: string;
  title: React.ReactNode;
  children: React.ReactNode;
};

import { PhaseProvider } from "../logic/Logic";
export function Phase({ phaseId, title, children }: PhaseProps): JSX.Element {
  return (
    <PhaseProvider phaseId={phaseId}>
      <PhaseBase>{children}</PhaseBase>
    </PhaseProvider>
  );
}

// Definition: Wrapper div for phase screens that resets transients on background click.
function PhaseBase({ children }: { children: React.ReactNode }) {
  const [, dispatchTransients] = useTransients();

  const handleBackgroundClick = () => {
    dispatchTransients({ kind: "RESET_TRANSIENT" });
    // Also collapse the InvoSearch card if open
    dispatchTransients({
      kind: "SET_TRANSIENT",
      payload: { invoSearchExpanded: false },
    });
  };

  return (
    <div className="hbox Fill" onClick={handleBackgroundClick}>
      {children}
    </div>
  );
}

export type PhaseNodeTileProps = {
  node: PhaseNode;
};

export function PhaseNodeTile({ node }: PhaseNodeTileProps): JSX.Element {
  return (
    <div className="tile">
      <strong>{node.phaseId}</strong>
    </div>
  );
}

export type FooterProps = {
  onContinue?: () => void;
  label?: string;
};

export function Footer({ onContinue }: FooterProps): JSX.Element {
  const [transaction] = useTransaction();
  const navigate = useNavigatePhase();

  const { rollupByKey, aggregateAtoms, returnItemAtoms } = useDerivation();
  const totalReturnCents = aggregateAtoms(returnItemAtoms, "valueCents");

  console.log("Footer returnItemAtoms", returnItemAtoms);
  console.log("Footer totalReturnCents", totalReturnCents);
  const phases = transaction.phases;
  const currentIndex = phases.findIndex(
    (p) => p.phaseId === transaction.currentPhase
  );
  const nextPhase =
    currentIndex >= 0 && currentIndex < phases.length - 1
      ? phases[currentIndex + 1]
      : undefined;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (nextPhase) {
      navigate(nextPhase.phaseId);
    }
  };

  // Convert cents → dollars with 2 decimals
  const refundDollars = (totalReturnCents / 100).toFixed(2);

  return (
    <div className="hbox">
      <div className="vbox fill-main">
        <span>{`Refund Value: $${refundDollars}`}</span>
      </div>
      <button onClick={handleContinue} disabled={!nextPhase}>
        Continue
      </button>
    </div>
  );
}

//********************************************************************
//  Pages Router
//********************************************************************

// ================================
// PagesRouter.tsx — Temporary Phase Router
// Definition: Fake router component that renders pages based on TransactionState.currentPhase.
// Intent: Provide simple conditional rendering as a placeholder for future real routing.
// Constraints:
//   - Reads TransactionState.currentPhase.
//   - Must be wrapped in TransactionProvider.
//   - No URL changes yet; state-only.
// Inputs: TransactionState.currentPhase
// Outputs: Page component (e.g., <Start />)
// ================================

export function PagesRouter(): JSX.Element {
  const [transaction] = useTransaction();

  switch (transaction.currentPhase || "start") {
    case "start":
      return <StartPhase />;
    case "return-items":
      return <ReturnItemsPhase />;
    case "receipts":
      return <ReceiptsPhase />;
    default:
      return (
        <div>⚠️ No page defined for phase: {transaction.currentPhase}</div>
      );
  }
}

//********************************************************************
//  DEPRECATED
//********************************************************************
