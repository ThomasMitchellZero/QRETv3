//********************************************************************
//  STAGE + ACTOR TILE
//********************************************************************
// Context-aware Stage and ActorTile components.
// Definition: Stage is a container that manages layout of ActorTiles.
// Intent: Provide standardized tile grid that supports "solo" expansion.
// Constraints:
//   - Solo state is stored in PhaseProvider (only one per Phase).
//   - Stage adds/removes "solo-mode" class based on solo state.
//   - ActorTile toggles soloId in Phase context on click.
//   - Styling delegated to style.scss.
//   - Click Policy: propagate (resets soloId on outside click)

import { useTransients } from "../logic/Logic";

export function Stage({ children }: { children: React.ReactNode }) {
  const [transients, dispatchTransients] = useTransients();
  const soloId = transients.soloId;

  const handleStageClick = () => {
    if (soloId) {
      dispatchTransients({ type: "SET_SOLO", soloId: undefined });
    }
  };

  return (
    <div
      className={`stage ${soloId ? "solo-mode" : ""}`}
      onClick={handleStageClick}
    >
      {children}
    </div>
  );
}

export function ActorTile({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode | ((ctx: { isSolo: boolean }) => React.ReactNode);
}) {
  const [transients, dispatchTransients] = useTransients();
  const isSolo = transients.soloId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSolo) {
      dispatchTransients({
        type: "CLEAR_TRANSIENTS_EXCEPT",
        preserve: ["soloId"],
      });
    } else {
      dispatchTransients({ type: "SET_SOLO", soloId: id });
    }
  };

  const content =
    typeof children === "function" ? (children as any)({ isSolo }) : children;

  return (
    <div className={`actor-tile ${isSolo ? "solo" : ""}`} onClick={handleClick}>
      {content}
    </div>
  );
}
// Constraints:
//   - Click Policy: isolate (stops bubbling; toggles soloId)

// ================================
// Components.tsx — Canonical Components Bucket
// Definition: Central repository of reusable UI components for QRET.
// Intent: Provide modular UI pieces (layouts, widgets, utilities) that can be composed into pages.
// Constraints:
//   - All components here must have artifact-level headers.
//   - Must not redefine canonical logic or styling (delegates to Logic.ts and style.scss).
// Inputs: Props as defined per component.
// Outputs: Rendered UI React elements.
// ================================

import type { PhaseNode } from "../types/Types";
import { StartPhase } from "../phases/050-Start";
import { ReturnItemsPhase } from "../phases/200-ReturnItems";
import { ReceiptsPhase } from "../phases/250-Receipts";

import React from "react";
import {
  useTransaction,
  useIsSelected,
  useNavigatePhase,
} from "../logic/Logic";

// PhaseProps type and Phase component are globalized here for all phases.

//********************************************************************
//  PHASE (GLOBAL WRAPPER)
//********************************************************************
// Type: PhaseProps
// Definition: Props for the global Phase wrapper component.
// Intent: Standardize per-phase layout and context.
// Inputs: phaseId (string), title (ReactNode), children (ReactNode)
// Outputs: JSX structure with PhaseProvider and Floorplan.
export type PhaseProps = {
  phaseId: string;
  title: React.ReactNode;
  children: React.ReactNode;
};

// Component: Phase
// Definition: Global wrapper for all phase screens, providing PhaseProvider and Floorplan.
// Intent: Ensure every phase screen uses consistent structure and context.
// Constraints: Must wrap children in PhaseProvider, render Floorplan with canonical slots.
// Inputs: PhaseProps
// Outputs: JSX layout for a phase screen.
import { PhaseProvider } from "../logic/Logic";
export function Phase({ phaseId, title, children }: PhaseProps): JSX.Element {
  return (
    <PhaseProvider phaseId={phaseId}>
      <PhaseBase>{children}</PhaseBase>
    </PhaseProvider>
  );
}

// Internal: PhaseBase
// Definition: Wrapper div for phase screens that resets transients on background click.
function PhaseBase({ children }: { children: React.ReactNode }) {
  const [, dispatchTransients] = useTransients();

  const handleBackgroundClick = () => {
    dispatchTransients({ type: "RESET_TRANSIENTS" });
  };

  return (
    <div className="phase-base" onClick={handleBackgroundClick}>
      {children}
    </div>
  );
}

//********************************************************************
//  FLOORPLAN
//********************************************************************

// Component: Floorplan
// Definition: High-level layout component for page structure.
// Intent: Provide consistent 3-column + header/footer layout for pages.
// Constraints: Sections rendered only if props are passed; styling delegated to style.scss.
// Inputs: FloorplanProps (topBar, leftColumn, rightColumn, pageTitle, navBar, mainContent, footer).
// Outputs: JSX layout with correct placement of sections.
export type FloorplanProps = {
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  pageTitle?: React.ReactNode;
  navBar?: React.ReactNode; // now required, but will default in destructure
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Floorplan({
  leftColumn,
  rightColumn,
  pageTitle,
  navBar = <NavBar />,
  mainContent,
  footer = <Footer />,
}: FloorplanProps): JSX.Element {
  return (
    <div className="floorplan">
      {<div className="top-bar"></div>}
      <div className="body-row">
        {leftColumn && <div className="left-column">{leftColumn}</div>}
        <div className="main-column">
          {pageTitle && <div className="page-title-row">{pageTitle}</div>}
          {navBar && <div className="nav-bar-row">{navBar}</div>}
          {<div className="main-content-row">{mainContent}</div>}
          {footer && <div className="footer-row">{footer}</div>}
        </div>
        {rightColumn && <div className="right-column">{rightColumn}</div>}
      </div>
    </div>
  );
}

//********************************************************************
//  PHASE NODE TILE
//********************************************************************
// Component: PhaseNodeTile
// Definition: Simple card/tile UI for displaying a PhaseNode's metadata.
// ...

//********************************************************************
//  PHASE NODE TILE
//********************************************************************
// Component: PhaseNodeTile
// Definition: Simple card/tile UI for displaying a PhaseNode's metadata.
// Intent: Show phase metadata in a compact, reusable UI.
// Constraints: Pure UI; no logic. Styling delegated to style.scss.
// Inputs: PhaseNodeTileProps { node }
// Outputs: JSX element for phase node.
export type PhaseNodeTileProps = {
  node: PhaseNode;
};

export function PhaseNodeTile({ node }: PhaseNodeTileProps): JSX.Element {
  return (
    <div className="tile">
      <div className="phase-node-id">
        <strong>{node.id}</strong>
      </div>
    </div>
  );
}

//********************************************************************
//  TILE
//********************************************************************
// Component: Tile
// Definition: Generic container component for displaying content in a tile-style UI.
// Intent: Provide a reusable, stylized tile wrapper for content blocks.
// Constraints: Styling delegated to style.scss. Accepts children and optional onClick.
//   - Click Policy: propagate (bubbles up)
// Inputs: TileProps { children, onClick }
// Outputs: JSX element wrapping children in a styled tile.
export type TileProps = {
  children: React.ReactNode;
  onClick?: () => void;
};

export function Tile({ children, onClick }: TileProps): JSX.Element {
  return (
    <div className="tile" onClick={onClick}>
      {children}
    </div>
  );
}

//********************************************************************
//  CARD
//********************************************************************
// Component: Card
// Definition: Generic container component for displaying content in a card-style UI.
// Intent: Provide a reusable, stylized card wrapper for content blocks, with optional custom styling and event isolation.
// Constraints: Styling delegated to style.scss. Accepts children and optional className for additional styling. Stops click event propagation from its contents.
//   - Click Policy: isolate (stops bubbling)
// Inputs: CardProps { children, className? }
// Outputs: JSX element wrapping children in a styled card that isolates click events.
export type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps): JSX.Element {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <div
      className={["card", className].filter(Boolean).join(" ")}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}

//********************************************************************
//  NAV BAR
//********************************************************************
// Component: NavBar
// Definition: Navigation bar for phase navigation.
// Intent: Render clickable navigation items for each phase in the transaction.
// Constraints: Uses useTransaction, useIsSelected, useNavigatePhase; wraps each PhaseNodeTile in a clickable div.
// Inputs: none (reads transaction context)
// Outputs: JSX navigation bar.
export function NavBar(): JSX.Element {
  const [transaction] = useTransaction();
  const navigate = useNavigatePhase();
  const selectedId = transaction.currentPhase; // derive once, no hooks-in-loop

  return (
    <div className="nav-bar">
      {transaction.phases.map((node) => {
        const isSelected = node.id === selectedId;
        return (
          <div
            key={node.id}
            onClick={() => navigate(node.id)}
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

//********************************************************************
//  FOOTER
//********************************************************************
// Component: Footer
// Definition: Footer bar with label and continue button to advance to the next phase.
// Intent: Provide a canonical footer with left-aligned label and right-aligned continue navigation.
// Constraints:
//   - Uses useTransaction and useNavigatePhase to determine and perform navigation.
//   - Styling follows .footer-row structure in style.scss.
// Inputs: FooterProps { onContinue?: () => void, label?: string }
// Outputs: JSX footer row with label and continue button.
export type FooterProps = {
  onContinue?: () => void;
  label?: string;
};

export function Footer({ onContinue, label }: FooterProps): JSX.Element {
  const [transaction] = useTransaction();
  const navigate = useNavigatePhase();
  const phases = transaction.phases;
  const currentIndex = phases.findIndex(
    (p) => p.id === transaction.currentPhase
  );
  const nextPhase =
    currentIndex >= 0 && currentIndex < phases.length - 1
      ? phases[currentIndex + 1]
      : undefined;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (nextPhase) {
      navigate(nextPhase.id);
    }
  };

  return (
    <div className="footer">
      <span>{label || "Refund Value"}</span>
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
