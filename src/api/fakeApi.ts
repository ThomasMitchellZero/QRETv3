import type { Item, Invoice } from "../types/Types";
import PLACEHOLDER from "../assets/product-images/PLACEHOLDER.png";
import kobalt_hammer from "../assets/product-images/kobalt_hammer.png";
import craftsman_wrench from "../assets/product-images/craftsman_wrench.png";
import hoses from "../assets/product-images/hoses.png";
import window_scraper from "../assets/product-images/window_scraper.png";
import paintstick from "../assets/product-images/paintstick.png";

// Catalog entries = metadata only (not regular repo items)
export type CatalogEntry = Item & {
  description: string;
  picture: string;
  valueCents: number;
};

// Keep catalog metadata in a lookup
export const fakeCatalog: Record<string, CatalogEntry> = {
  "0000": {
    itemId: "_placeholder",
    description: "Unknown Item",
    valueCents: 0,
    picture: PLACEHOLDER,
  },
  "1122": {
    itemId: "1122",
    description:
      "Kobalt Hammer 12-inch 16oz. Fiberglass grip.  Lifetime Warranty-eligible",
    valueCents: 1299,
    picture: kobalt_hammer,
  },
  "2233": {
    itemId: "2233",
    description: "Craftsman 8-inch Adjustable Wrench",
    valueCents: 1599,
    picture: craftsman_wrench,
  },
  "3344": {
    itemId: "3344",
    description: "18-inch hoses with 1/4-inch fittings",
    valueCents: 999,
    picture: hoses,
  },
  "4455": {
    itemId: "4455",
    description: "Window Scraper Pro Max plus refill blades",
    valueCents: 3499,
    picture: window_scraper,
  },
  "5566": {
    itemId: "5566",
    description: "12-inch balsa wood paint stirrer.  4 count",
    valueCents: 499,
    picture: paintstick,
  },
};

// Post-process to ensure each item includes its parent invoId
export const fakeInvoices: Record<string, Invoice> = {
  "99988": {
    invoId: "99988",
    items: [
      { itemId: "1122", qty: 2, valueCents: 1298, invoId: "99988" } as Item, // Blue Widget
      { itemId: "2233", qty: 1, valueCents: 1398, invoId: "99988" } as Item, // Mini Widget
    ],
  },
  "99977": {
    invoId: "99977",
    items: [
      { itemId: "3344", qty: 3, valueCents: 999, invoId: "99977" } as Item, // Green Widget
      { itemId: "2233", qty: 99, valueCents: 3499, invoId: "99977" } as Item, // Widget Pro Max
    ],
  },
};

// Helper exports to get Map views of the fake data
export function getFakeCatalogMap(): Map<string, CatalogEntry> {
  return new Map(Object.entries(fakeCatalog));
}

export function getFakeInvoicesMap(): Map<string, Invoice> {
  return new Map(Object.entries(fakeInvoices));
}
