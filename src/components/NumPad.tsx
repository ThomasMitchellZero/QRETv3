// START_SCOPER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

import type { PhaseNode, Item } from "../types/Types";
import { StartPhase } from "../phases/050-Start";
import { ReturnItemsPhase } from "../phases/200-ReturnItems";
import { ReceiptsPhase } from "../phases/250-Receipts";
import { useDerivation } from "../logic/Derivation";
import { type CatalogEntry, fakeCatalog } from "../api/fakeApi";
import { ProductImage } from "../assets/product-images/ProductImage";

import React, { useRef } from "react";
import {
  useNavigatePhase,
  useTransaction,
  PhaseProvider,
  isActive,
} from "../logic/Logic";

import { useInterlude, Stage, Actor } from "../logic/Interlude";

export type NumpadProps = {
  value?: number;
  onChange?: (val: number) => void;
  className?: string;
  showIncrementButtons?: boolean; // Optional; defaults to true
};

export function Numpad({
  value,
  onChange,
  className = "",
  showIncrementButtons = true,
}: NumpadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Auto-focus the input when the numpad mounts or its parent tile is clicked
  React.useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    focusInput(); // Focus immediately when mounted
    const parent = inputRef.current?.closest(".tile");
    if (parent) parent.addEventListener("mousedown", focusInput);
    return () => {
      if (parent) parent.removeEventListener("mousedown", focusInput);
    };
  }, []);
  const focusInput = () => inputRef.current?.focus();

  const handleDigit = (d: string) => {
    const next = `${value ?? ""}${d}`;
    onChange?.(Number(next) || 0);
    focusInput();
  };

  const handleBackspace = () => {
    const next = String(value ?? "").slice(0, -1);
    onChange?.(Number(next) || 0);
    focusInput();
  };

  const handleIncrement = (delta: number) => {
    const next = Math.max(0, (value ?? 0) + delta);
    onChange?.(next);
    focusInput();
  };

  // Only digits for grid
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

  const handleClick = (b: string) => {
    handleDigit(b);
  };

  return (
    <div className={`numpad ${className}`}>
      <div className="numpad-controls">
        {showIncrementButtons && (
          <button
            className="numpad-btn text title"
            onClick={() => handleIncrement(-1)}
          >
            -
          </button>
        )}
        <input
          id="numpad-input"
          ref={inputRef}
          value={value}
          onChange={(e) => onChange?.(Number(e.target.value) || 0)}
          className="numpad-input text title"
          inputMode="numeric"
        />
        {showIncrementButtons && (
          <button
            className="numpad-btn text title"
            onClick={() => handleIncrement(1)}
          >
            +
          </button>
        )}
        <button className="numpad-btn text title" onClick={handleBackspace}>
          ←
        </button>
      </div>
      <div className="numpad-grid">
        {buttons.map((b) => (
          <button
            key={b}
            className="numpad-btn text"
            onClick={() => handleClick(b)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Numpad;

// END_SCOPER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
