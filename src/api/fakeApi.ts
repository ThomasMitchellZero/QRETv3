import type { BaseItem } from "../types/Types";

// Catalog entries = metadata only (not regular repo items)
export type CatalogEntry = {
  id: string;
  description: string;
  picture: string;
  valueCents: number;
};

// Keep catalog metadata in a lookup
export const fakeCatalog: Record<string, CatalogEntry> = {
  "1001": {
    id: "1001",
    description: "Blue Widget",
    valueCents: 1299,
    picture: "/images/catalog/blue-widget.png",
  },
  "1002": {
    id: "1002",
    description: "Red Widget",
    valueCents: 1599,
    picture: "/images/catalog/red-widget.png",
  },
  "1003": {
    id: "1003",
    description: "Green Widget",
    valueCents: 999,
    picture: "/images/catalog/green-widget.png",
  },
  "1004": {
    id: "1004",
    description: "Widget Pro Max",
    valueCents: 3499,
    picture: "/images/catalog/widget-pro-max.png",
  },
  "1005": {
    id: "1005",
    description: "Mini Widget",
    valueCents: 499,
    picture: "/images/catalog/mini-widget.png",
  },
};

// Invoice = list of BaseItems with qty + valueCents
export type Invoice = {
  id: string;
  items: (BaseItem & { qty: number; valueCents: number })[];
};

export const fakeInvoices: Invoice[] = [
  {
    id: "INV-001",
    items: [
      { id: "1001", qty: 2, valueCents: 1299 }, // Blue Widget
      { id: "1005", qty: 1, valueCents: 499 }, // Mini Widget
    ],
  },
  {
    id: "INV-002",
    items: [
      { id: "1003", qty: 3, valueCents: 999 }, // Green Widget
      { id: "1004", qty: 1, valueCents: 3499 }, // Widget Pro Max
    ],
  },
];
