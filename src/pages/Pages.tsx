import React from "react";
import { Floorplan } from "../components/Components";

export function Start(): JSX.Element {
  return (
    <Floorplan
      topBar={<div>Top Bar</div>}
      leftColumn={<div>Left Column</div>}
      rightColumn={<div>Right Column</div>}
      pageTitle={<div>Page Title</div>}
      navBar={<div>Nav Bar</div>}
      mainContent={<div>Main Content</div>}
      footer={<div>Footer</div>}
    />
  );
}
