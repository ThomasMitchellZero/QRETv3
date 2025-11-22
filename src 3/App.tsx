// src/App.tsx
// managed by AIDA
import "./style/style.scss";

import { PagesRouter } from "./components/Components";
import { TransactionProvider } from "./logic/Logic";
import { InterludeProvider } from "./logic/Interlude";

export default function App(): JSX.Element {
  return (
    <TransactionProvider>
      <InterludeProvider>
        <PagesRouter />
      </InterludeProvider>
    </TransactionProvider>
  );
}
