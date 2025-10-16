import React, {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";

// ================================
// Bubble Transient Domain
// ================================

// ----- Types -----
export type BubbleState = Record<string, any>;

export type BubbleAction =
  | { type: "SET"; key: string; value: any }
  | { type: "CLEAR"; preserve?: string[] }
  | { type: "RESET" };

export type BubbleProps = {
  children?: React.ReactNode;
  className?: string;
  preserve?: string[];
  onClick?: React.MouseEventHandler;
  style?: React.CSSProperties;
};

// ----- Reducer -----
function bubbleReducer(state: BubbleState, action: BubbleAction): BubbleState {
  switch (action.type) {
    case "SET":
      return { ...state, [action.key]: action.value };
    case "CLEAR": {
      const preserve = action.preserve ?? [];
      if (!preserve.length) return {};
      // Only keep preserved keys
      return Object.fromEntries(
        Object.entries(state).filter(([k]) => preserve.includes(k))
      );
    }
    case "RESET":
      return {};
    default:
      return state;
  }
}

// ----- Context -----
const BubbleContext = createContext<
  [BubbleState, Dispatch<BubbleAction>] | undefined
>(undefined);

// ----- Provider -----
export function BubbleProvider({ children }: { children: ReactNode }) {
  const value = useReducer(bubbleReducer, {});
  return (
    <BubbleContext.Provider value={value}>{children}</BubbleContext.Provider>
  );
}

// ----- Hook -----
export function useBubble(): [BubbleState, Dispatch<BubbleAction>] {
  const ctx = useContext(BubbleContext);
  if (!ctx) {
    throw new Error("useBubble must be used within BubbleProvider");
  }
  return ctx;
}

// ----- Bubble Component -----
export function Bubble(props: BubbleProps): JSX.Element {
  const [, dispatch] = useBubble();
  const { children, className = "", preserve, onClick, style } = props;

  const handleClick = (e: React.MouseEvent) => {
    dispatch({ type: "CLEAR", preserve: preserve || [] });
    if (onClick) onClick(e);
  };

  return (
    <div className={className} style={style} onClick={handleClick}>
      {children}
    </div>
  );
}
