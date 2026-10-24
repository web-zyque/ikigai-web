import { Address } from "@/types/address.types";

export const INITIAL_ADDRESSES: Address[] = [];

const STORAGE_KEY = "ikigai_user_addresses";

export function getStoredAddresses(): Address[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item === "object" && item.name !== "Alex Jander"
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function saveStoredAddresses(addresses: Address[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  } catch {}
}
