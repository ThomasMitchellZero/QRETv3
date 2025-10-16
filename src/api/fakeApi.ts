import type { Item, Invoice, Customer, Payment } from "../types/Types";
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
    invoId: undefined,
    picture: PLACEHOLDER,
  } as CatalogEntry,
  "1122": {
    itemId: "1122",
    description:
      "Kobalt Hammer 12-inch 16oz. Fiberglass grip.  Lifetime Warranty-eligible",
    valueCents: 1299,
    invoId: undefined,
    picture: kobalt_hammer,
  } as CatalogEntry,
  "2233": {
    itemId: "2233",
    description: "Craftsman 8-inch Adjustable Wrench",
    valueCents: 1599,
    invoId: undefined,
    picture: craftsman_wrench,
  } as CatalogEntry,
  "3344": {
    itemId: "3344",
    description: "18-inch hoses with 1/4-inch fittings",
    valueCents: 999,
    picture: hoses,
    invoId: undefined,
  } as CatalogEntry,
  "4455": {
    itemId: "4455",
    description: "Window Scraper Pro Max plus refill blades",
    valueCents: 3499,
    invoId: undefined,
    picture: window_scraper,
  } as CatalogEntry,
  "5566": {
    itemId: "5566",
    description: "12-inch balsa wood paint stirrer.  4 count",
    valueCents: 499,
    invoId: undefined,
    picture: paintstick,
  } as CatalogEntry,
};

// Post-process to ensure each item includes its parent invoId
export const fakeInvoices: Record<string, Invoice> = {
  "99988": {
    invoId: "99988",
    customer: {
      name: "Alice Smith",
      phone: 1112223333,
      email: "alice@example.com",
    } as Customer,
    payment: {
      cc: "4111111111111111",
      method: "credit",
      authCode: "AUTH99988",
    } as Payment,
    items: [
      { itemId: "1122", qty: 3, valueCents: 1298, invoId: "99988" } as Item,
      { itemId: "2233", qty: 2, valueCents: 1398, invoId: "99988" } as Item,
    ],
  },
  "99977": {
    invoId: "99977",
    customer: {
      name: "Bob Johnson",
      phone: 2223334444,
      email: "bob@example.com",
    } as Customer,
    payment: {
      cc: "4222222222222222",
      method: "credit",
      authCode: "AUTH99977",
    } as Payment,
    items: [
      { itemId: "3344", qty: 4, valueCents: 999, invoId: "99977" } as Item,
      { itemId: "2233", qty: 5, valueCents: 3499, invoId: "99977" } as Item,
    ],
  },
  "99966": {
    invoId: "99966",
    customer: {
      name: "Charlie Davis",
      phone: 3334445555,
      email: "charlie@example.com",
    } as Customer,
    payment: {
      cc: "4333333333333333",
      method: "debit",
      authCode: "AUTH99966",
    } as Payment,
    items: [
      { itemId: "4455", qty: 1, valueCents: 3499, invoId: "99966" } as Item,
      { itemId: "5566", qty: 6, valueCents: 499, invoId: "99966" } as Item,
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

// --- Types ---
export type SearchType = "phone" | "email" | "cc";

export type InvoiceSearchQuery = {
  type: SearchType;
  value: string | number; // numeric for phone, string for others
};

// --- Search ---
export function findInvoices(query: InvoiceSearchQuery): Invoice[] {
  const { type, value } = query;
  const normStr = String(value).trim().toLowerCase();

  return Object.values(fakeInvoices).filter((inv) => {
    const c = inv.customer;
    const p = inv.payment;

    switch (type) {
      case "phone":
        // phone stored as integer → direct numeric compare
        return c?.phone === Number(value);
      case "email":
        return c?.email?.toLowerCase() === normStr;
      case "cc":
        return p?.cc === normStr;
      default:
        return false;
    }
  });
}
