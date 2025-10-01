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
      <Floorplan
        topBar={<div>Top Bar</div>}
        leftColumn={<div>Left Column</div>}
        rightColumn={<div>Right Column</div>}
        pageTitle={<div>{title}</div>}
        navBar={<NavBar />}
        mainContent={<>{children}</>}
        footer={<div>Footer</div>}
      />
    </PhaseProvider>
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
  topBar?: React.ReactNode;
  leftColumn?: React.ReactNode;
  rightColumn?: React.ReactNode;
  pageTitle?: React.ReactNode;
  navBar?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
};

export function Floorplan(props: FloorplanProps): JSX.Element {
  return (
    <div className="floorplan">
      <div className="top-bar">{props.topBar}</div>
      <div className="left-column">{props.leftColumn}</div>
      <div className="right-column">{props.rightColumn}</div>
      <div className="main-column">
        <div className="page-title-row">{props.pageTitle}</div>
        <div className="nav-bar-row">{props.navBar}</div>
        <div className="main-content-row">{props.mainContent}</div>
        <div className="footer-row">{props.footer}</div>
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
        <strong>ID:</strong> {node.id}
      </div>
      <div className="phase-node-status">
        <strong>Status:</strong> {node.status}
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
//   Click Policy: propagates clicks (does not stop bubbling)
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
//   Click Policy: isolates clicks (stops bubbling)
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
  return (
    <div className="nav-bar">
      {transaction.phases.map((node) => {
        const isSelected = useIsSelected(node.id);
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
      return (
        <StartPhase>
          <div>📦 Shart Rear</div>
        </StartPhase>
      );
    case "return-items":
      return (
        <ReturnItemsPhase>
          <div>📦 Return Items content goes here</div>
        </ReturnItemsPhase>
      );
    case "receipts":
      return (
        <ReceiptsPhase>
          <div>🧾 Receipts content goes here</div>
        </ReceiptsPhase>
      );
    default:
      return (
        <div>⚠️ No page defined for phase: {transaction.currentPhase}</div>
      );
  }
}
