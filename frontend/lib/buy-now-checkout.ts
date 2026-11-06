export interface BuyNowSelection {
  productId: string;
  variantId: string | null;
  quantity: number;
}

const BUY_NOW_STORAGE_KEY = "ikigai-buy-now-checkout";

export function saveBuyNowSelection(selection: BuyNowSelection): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(BUY_NOW_STORAGE_KEY, JSON.stringify(selection));
}

export function getBuyNowSelection(): BuyNowSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(window.sessionStorage.getItem(BUY_NOW_STORAGE_KEY) ?? "null");
    if (!value || typeof value !== "object") return null;
    const selection = value as Partial<BuyNowSelection>;
    if (
      typeof selection.productId !== "string" ||
      !selection.productId ||
      typeof selection.quantity !== "number" ||
      !Number.isInteger(selection.quantity) ||
      selection.quantity < 1 ||
      !(selection.variantId === null || typeof selection.variantId === "string")
    ) return null;
    return selection as BuyNowSelection;
  } catch {
    return null;
  }
}

export function clearBuyNowSelection(): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(BUY_NOW_STORAGE_KEY);
  }
}
