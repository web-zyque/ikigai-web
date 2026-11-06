"use client";

import { useSyncCart } from "@/hooks/use-sync-cart";

export function CartInitializer() {
 
  useSyncCart();

  return null;
}
