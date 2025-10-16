import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type BubbleState = Record<string, boolean>;
type BubbleContextType = {
  state: BubbleState;
  setActive: (activeKeys: string[]) => void;
};

const BubbleContext = createContext<BubbleContextType | undefined>(undefined);

// Provider --------------------------------------------------------
export function BubbleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BubbleState>({});

  const setActive = useCallback((activeKeys: string[]) => {
    const next: BubbleState = {};
    for (const k of activeKeys) next[k] = true;
    setState(next);
  }, []);

  return (
    <BubbleContext.Provider value={{ state, setActive }}>
      {children}
    </BubbleContext.Provider>
  );
}

// Hook ------------------------------------------------------------
export function useBubbleState(): [
  BubbleState,
  (activeKeys: string[]) => void
] {
  const ctx = useContext(BubbleContext);
  if (!ctx)
    throw new Error("useBubbleState must be used within BubbleProvider");
  return [ctx.state, ctx.setActive];
}

// Utility: derive bubble path -------------------------------------
function collectBubblePath(e: React.MouseEvent): string[] {
  const path: string[] = [];
  let node: HTMLElement | null = e.target as HTMLElement;
  while (node) {
    const id = node.dataset?.bubbleId;
    if (id) path.push(id);
    node = node.parentElement;
  }
  return path.reverse();
}

// Bubble Component ------------------------------------------------
export function Bubble({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const [state, setActive] = useBubbleState();
  const isActive = Boolean(state[id]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const pathIds = collectBubblePath(e);
    setActive(pathIds);
  };

  return (
    <div
      data-bubble-id={id}
      className={`bubble ${className}`}
      onClick={handleClick}
    >
      {isActive ? children : null}
    </div>
  );
}

// Global click handler helper -------------------------------------
export function handleBubbleClick(
  e: React.MouseEvent,
  setActive: (ids: string[]) => void
) {
  const ids = collectBubblePath(e);
  setActive(ids);
}
