import React from "react";
import { Floorplan, Card } from "../components/Components";

export function Start(): JSX.Element {
  return (
    <Floorplan
      topBar={<div>Top Bar</div>}
      leftColumn={<div>Left Column</div>}
      rightColumn={<div>Right Column</div>}
      pageTitle={<div>Page Title</div>}
      navBar={<div>Nav Bar</div>}
      mainContent={
        <div>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
          <Card>Card 3</Card>
        </div>
      }
      footer={<div>Footer</div>}
    />
  );
}
