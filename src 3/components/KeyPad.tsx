// START_SCOPER >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

import React from "react";
import { Expando, type Scene } from "../logic/Interlude";

export interface ControlProps {
  value: string | number;
  onChange?: (v: string | number) => void;
  onClick?: (v: string | number) => void;
  span?: number;
  order?: number;
  className?: string;
  display?: React.ReactNode;
  children?: React.ReactNode;
  scene?: Scene;
}

// Base Control — single source of truth for all behavior
export function UiControl({
  value,
  onClick = () => {},
  onChange = () => {},
  span = 1,
  order,
  className = "",
  display,
  children,
}: ControlProps) {
  // Only gridColumn uses inline style; rest is via className tokens
  const style: React.CSSProperties = { gridColumn: `span ${span}`, order };
  return (
    <button
      className={`ui-control text subtitle ${className}`}
      style={style}
      onClick={() => onClick(value ?? "")}
    >
      {display ?? children}
    </button>
  );
}

export function InputField(props: ControlProps) {
  const {
    value = "",
    span = 1,
    onChange = () => {},
    className = "",
    display,
  } = props;
  const style: React.CSSProperties = { gridColumn: `span ${span}` };
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <input
      id="keypadInput"
      ref={inputRef}
      className={`keypad-input text ${className}`}
      type="text"
      style={style}
      inputMode="numeric"
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      placeholder={String(display ?? "")}
    />
  );
}

// Digit Key
export function DigitKey(props: ControlProps & { digit: string }) {
  const { digit, value, onClick = () => {}, onChange = () => {} } = props;
  const next = `${value ?? ""}${digit}`;
  return (
    <UiControl
      {...props}
      display={digit}
      onClick={() => {
        onChange(next);
        onClick(next);
      }}
    />
  );
}

// Delete Key
export function DeleteKey(props: ControlProps) {
  const { value, onClick = () => {}, onChange = () => {} } = props;
  const next = String(value ?? "").slice(0, -1);
  return (
    <UiControl
      {...props}
      display="⌫"
      onClick={() => {
        onChange(next);
        onClick(next);
      }}
    />
  );
}

// Plus / Minus Keys
export function PlusKey(props: ControlProps) {
  const { value, onClick = () => {}, onChange = () => {} } = props;
  const next = Number(value ?? 0) + 1;
  return (
    <UiControl
      {...props}
      display="+"
      onClick={() => {
        onChange(next);
        onClick(next);
      }}
    />
  );
}

export function MinusKey(props: ControlProps) {
  const { value, onClick = () => {}, onChange = () => {} } = props;
  const next = Math.max(0, Number(value ?? 0) - 1);
  return (
    <UiControl
      {...props}
      display="-"
      onClick={() => {
        onChange(next);
        onClick(next);
      }}
    />
  );
}

// Submit Key
export function SubmitKey(props: ControlProps) {
  const { value, onClick = () => {}, onChange = () => {} } = props;
  return (
    <UiControl
      {...props}
      span={props.span ?? 2}
      display="↵"
      onClick={() => {
        onChange(value ?? "");
        onClick(value ?? "");
      }}
    />
  );
}

// Base Numeric Pad
export function EntryKeyPad(props: ControlProps) {
  const {
    value,
    onChange = () => {},
    onClick = () => {},
    display = "",
    className = "",
  } = props;
  return (
    <div className={`keypad-grid ${className}`}>
      <InputField
        value={value}
        onChange={onChange}
        display={display}
        span={2}
      />
      <DeleteKey value={value} onClick={onClick} onChange={onChange} />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="7" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="8" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="9" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="4" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="5" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="6" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="1" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="2" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="3" />
      <DigitKey
        value={value}
        onClick={onClick}
        onChange={onChange}
        digit="0"
        span={2}
      />
    </div>
  );
}

// Quantity Pad (adds + / −)
export function QtyPad(props: ControlProps) {
  const {
    value,
    onChange = () => {},
    onClick = () => {},
    className = "",
  } = props;
  return (
    <div className={`keypad-grid ${className}`}>
      <PlusKey value={value} onClick={onClick} onChange={onChange} />
      <InputField value={value} onChange={onChange} />
      <MinusKey value={value} onClick={onClick} onChange={onChange} />
      <DeleteKey value={value} onClick={onClick} onChange={onChange} />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="1" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="2" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="3" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="4" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="5" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="6" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="7" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="8" />
      <DigitKey value={value} onClick={onClick} onChange={onChange} digit="9" />
      <DigitKey
        value={value}
        onClick={onClick}
        onChange={onChange}
        digit="0"
        span={2}
      />
      <SubmitKey value={value} onClick={onClick} onChange={onChange} />
    </div>
  );
}

export function EntryKeyPadExpando({
  value,
  onChange = () => {},
  onClick = () => {},
  className = "",
  display = "",
  scene,
}: ControlProps) {
  return (
    <Expando
      id="entrykeypad-expando"
      scene={scene as Scene}
      className={`${className}`}
      headline={<div className="text subtitle">Enter Valuer</div>}
      reveal={
        <EntryKeyPad
          value={value}
          onChange={onChange}
          onClick={onClick}
          display={display}
        />
      }
    ></Expando>
  );
}

export function KeyPadMini({
  value,
  onChange = () => {},
  onClick = () => {},
  className = "",
  display = "",
  scene,
}: ControlProps) {
  return (
    <Expando
      id="entrykeypad-expando"
      scene={scene as Scene}
      className={`${className}`}
      headline={
        <div className={`keypad-grid ${className}`}>
          <InputField
            value={value}
            onChange={onChange}
            display={display}
            span={2}
          />
          <DeleteKey value={value} onClick={onClick} onChange={onChange} />
        </div>
      }
      reveal={
        <div className={`keypad-grid ${className}`}>
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="7"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="8"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="9"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="4"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="5"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="6"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="1"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="2"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="3"
          />
          <DigitKey
            value={value}
            onClick={onClick}
            onChange={onChange}
            digit="0"
            span={2}
          />
          <SubmitKey value={value} onClick={onClick} onChange={onChange} />
        </div>
      }
    ></Expando>
  );
}

// END_SCOPER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
