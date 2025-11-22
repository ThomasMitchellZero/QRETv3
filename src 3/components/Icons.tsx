// Icons.tsx — Central Icon Registry & Wrapper Component
// Intent: Provide a single entry point for all icon usage across QRET.
// Uses react-icons to import from multiple icon sets (FontAwesome, Material, AntDesign, etc.)
// Icons are sized and styled via utility classes, not inline styles.

import React from "react";
import * as Fa from "react-icons/fa";
import * as Md from "react-icons/md";
import * as Ai from "react-icons/ai";

// Central registry of available icons. Extend as needed.
const iconRegistry = {
  add: Fa.FaPlus,
  remove: Fa.FaTrash,
  edit: Md.MdEdit,
  confirm: Ai.AiOutlineCheckCircle,
  cancel: Ai.AiOutlineCloseCircle,
  search: Fa.FaSearch,
  left: Fa.FaArrowLeft,
  right: Fa.FaArrowRight,
  info: Ai.AiOutlineInfoCircle,
  warning: Ai.AiOutlineWarning,
  home: Fa.FaHome,
  settings: Fa.FaCog,
};

export type IconName = keyof typeof iconRegistry;

export type IconProps = {
  name: IconName;
  className?: string; // utility sizing like "icon-sm" or "icon-lg"
  color?: string;
  title?: string; // accessible label
  ariaHidden?: boolean;
};

export function Icon({
  name,
  className = "",
  color,
  ariaHidden = false,
}: IconProps): JSX.Element | null {
  const isValid = iconRegistry[name];
  if (!isValid) return null;

  return (
    <div
      className={`icon ${className}`}
      color={color}
      aria-hidden={ariaHidden}
    />
  );
}

export default Icon;
