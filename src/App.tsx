// src/App.tsx
// managed by AIDA
import "./style/style.scss";

import React from "react";
import { PagesRouter } from "./components/Components";
import { TransactionProvider, PhaseProvider } from "./logic/Logic";

export default function App(): JSX.Element {
  return (
    <TransactionProvider>
      <PhaseProvider>
        <PagesRouter />
      </PhaseProvider>
    </TransactionProvider>
  );
}
