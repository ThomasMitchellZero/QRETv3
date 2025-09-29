import React from "react";

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
