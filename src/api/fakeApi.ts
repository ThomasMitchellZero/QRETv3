import type { Item, Invoice } from "../types/Types";

// Catalog entries = metadata only (not regular repo items)
export type CatalogEntry = Item & {
  description: string;
  picture: string;
  valueCents: number;
};

// Keep catalog metadata in a lookup
export const fakeCatalog: Record<string, CatalogEntry> = {
  "1001": {
    itemId: "1001",
    description: "Blue Widget",
    valueCents: 1299,
    picture: "/images/catalog/blue-widget.png",
  },
  "1002": {
    itemId: "1002",
    description: "Red Widget",
    valueCents: 1599,
    picture: "/images/catalog/red-widget.png",
  },
  "1003": {
    itemId: "1003",
    description: "Green Widget",
    valueCents: 999,
    picture: "/images/catalog/green-widget.png",
  },
  "1004": {
    itemId: "1004",
    description: "Widget Pro Max",
    valueCents: 3499,
    picture: "/images/catalog/widget-pro-max.png",
  },
  "1005": {
    itemId: "1005",
    description: "Mini Widget",
    valueCents: 499,
    picture: "/images/catalog/mini-widget.png",
  },
};

export const fakeInvoices: Record<string, Invoice> = {
  "999001": {
    invoId: "999001",
    items: [
      { itemId: "1001", qty: 2, valueCents: 1299 }, // Blue Widget
      { itemId: "1005", qty: 1, valueCents: 499 }, // Mini Widget
    ],
  },
  "999002": {
    invoId: "999002",
    items: [
      { itemId: "1003", qty: 3, valueCents: 999 }, // Green Widget
      { itemId: "1004", qty: 1, valueCents: 3499 }, // Widget Pro Max
    ],
  },
};
