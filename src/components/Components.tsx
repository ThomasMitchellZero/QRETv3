import type { PhaseNode, Item } from "../types/Types";
import { StartPhase } from "../phases/050-Start";
import { ReturnItemsPhase } from "../phases/200-ReturnItems";
import { ReceiptsPhase } from "../phases/250-Receipts";
import { useDerivation } from "../logic/Derivation";
import { type CatalogEntry, fakeCatalog } from "../api/fakeApi";
import { ProductImage } from "../assets/product-images/ProductImage";

import React from "react";

import {
  useTransaction,
  useTransients,
  useNavigatePhase,
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
  preserve?: string[] | undefined; // no keyof restriction during prototype
  onClick?: React.MouseEventHandler;
};

export function Container(props: ContainerProps): JSX.Element {
  const [, dispatchTransients] = useTransients();
  const { children, className = "", preserve, onClick } = props;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchTransients({ kind: "CLEAR_TRANSIENTS", payload: { preserve: [] } });
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

const StageContext = React.createContext<object>({});
export function useStage() {
  return React.useContext(StageContext);
}

export function Stage({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const [transients] = useTransients();
  const activeSoloId = transients?.activeSolo?.[id];
  return (
    <StageContext.Provider value={{ stageId: id, activeSoloId }}>
      <Container className={`stage ${activeSoloId ? "solo-mode" : ""}`}>
        {children}
      </Container>
    </StageContext.Provider>
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
    <Container className={`vbox LV gap-0rpx ${className}`}>
      <div className={`text body ${textAlign}`}>{label} </div>
      <div className={`text title ${textAlign}`}>{value} </div>
    </Container>
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
  const { activeStageId, activeSoloId } = transients;
  const stageCtx = useStage() as { stageId?: string; activeSoloId?: string };
  const parentStageId = stageCtx.stageId || "defaultStage";
  const { id, headline, children, style, ...rest } = props;

  const tileState =
    activeSoloId === id
      ? "solo"
      : activeSoloId && activeStageId === parentStageId
      ? "hidden"
      : "default";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatchTransients({
      kind: "SET_SOLO",
      payload: {
        activeStageId: parentStageId,
        activeSoloId: id,
      },
    });
  };

  return (
    <Container
      id={id}
      className={`tile h-sm ${style} ${tileState}`}
      onClick={handleClick}
      {...rest}
    >
      <div className="vbox">{headline}</div>
      {tileState === "solo" && <div>{children}</div>}
    </Container>
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

// Internal: PhaseBase

/////////////////////////////////////////////////////////////////////////////////////

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

//********************************************************************
//  LAYOUT COMPS
//********************************************************************

export type FloorplanProps = {
  topBar?: React.ReactNode; // optional: ecosystem bar
  navBar?: React.ReactNode; // optional: navigation row
  pageTitle?: React.ReactNode; // page header
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Floorplan({
  topBar = <div className="ecosystem-bar">Ecosystem Placeholder</div>,
  navBar = <NavBar />,
  pageTitle,
  leftColumn,
  rightColumn,
  mainContent,
  footer = <Footer />,
}: FloorplanProps): JSX.Element {
  return (
    <>
      <div className="floorplan hbox fill">
        <div className="hbox fill">
          {leftColumn && <div className="column ">{leftColumn}</div>}
          <div className="vbox fill main-column">
            {topBar}
            {pageTitle}
            {navBar}
            {mainContent || <div className="fill" />}
            {footer}
          </div>
          {rightColumn && <div className="column">{rightColumn}</div>}
        </div>
      </div>
    </>
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

// Definition: Wrapper div for phase screens that resets transients on background click.
function PhaseBase({ children }: { children: React.ReactNode }) {
  const [, dispatchTransients] = useTransients();

  const handleBackgroundClick = () => {
    dispatchTransients({ kind: "RESET_TRANSIENTS" });
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

export function Footer({
  onContinue,
  label = "Refund Value",
}: FooterProps): JSX.Element {
  const [transaction] = useTransaction();
  const navigate = useNavigatePhase();

  const { aggregateAtoms, returnItemAtoms } = useDerivation();
  const totalReturnCents = aggregateAtoms(returnItemAtoms, "valueCents") || 0;
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
