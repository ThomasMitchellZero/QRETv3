import { fakeCatalog } from "../../api/fakeApi";

import PLACEHOLDER from "./PLACEHOLDER.png";
import kobalt_hammer from "./kobalt_hammer.png";
import craftstman_wrench from "./craftsman_wrench.png";
import hoses from "./hoses.png";
import window_scraper from "./window_scraper.png";

export type ProductImageProps = {
  itemId: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  alt?: string;
  className?: string;
};

export function ProductImage({
  itemId,
  size = "md",
  alt,
  className = "",
}: ProductImageProps) {
  const entry = fakeCatalog[itemId] ?? fakeCatalog["0000"];
  const imgSrc = entry?.picture || kobalt_hammer;

  const sizeMap: Record<string, string> = {
    xs: "var(--64rpx)",
    sm: "var(--96rpx)",
    md: "var(--128rpx)",
    lg: "var(--160rpx)",
    xl: "var(--256rpx)",
  };

  const dimension = sizeMap[size];

  return (
    <img
      src={imgSrc}
      alt={alt || entry?.description}
      className={`product-image ${className}`}
      style={{
        width: dimension,
        height: dimension,
        objectFit: "cover",
        borderRadius: "var(--radius-s)",
      }}
    />
  );
}
