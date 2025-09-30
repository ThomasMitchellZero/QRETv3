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

import type { NavNode } from "../types/Types";
import React from "react";

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
//  NAV NODE TILE
//********************************************************************
// Component: NavNodeTile
// Definition: Simple card/tile UI for displaying a NavNode's metadata.
// Intent: Render a styled summary of a navigation node (phase/step) for navigation UI or debugging.
// Constraints:
//   - Only displays id, url, and status fields.
//   - Styling is delegated to style.scss via className "nav-node-tile".
//   - Does not handle navigation logic or business logic.
// Inputs: { node: NavNode }
// Outputs: JSX element visually representing the node's id, url, and status.
export type NavNodeTileProps = {
  node: NavNode;
};

export function NavNodeTile({ node }: NavNodeTileProps): JSX.Element {
  return (
    <div className="nav-node-tile">
      <div className="nav-node-id">
        <strong>ID:</strong> {node.id}
      </div>
      <div className="nav-node-url">
        <strong>URL:</strong> {node.url}
      </div>
      <div className="nav-node-status">
        <strong>Status:</strong> {node.status}
      </div>
    </div>
  );
}
