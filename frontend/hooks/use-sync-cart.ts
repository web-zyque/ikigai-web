"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/auth/use-me";
import { useServerCart } from "@/hooks/use-server-cart";
import {
  useCartStore,
  usePendingGuestCart,
} from "@/stores/cart-store";
import {
  applyAuthenticatedCart,
  synchronizeAuthenticatedCart,
} from "@/services/cart-sync.service";

export function useSyncCart() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading, error: userError } = useMe();
  const pendingGuestCart = usePendingGuestCart();
  const cartHydrated = useCartStore((state) => state.isHydrated);
  const serverCartQuery = useServerCart({
    enabled: !!user && cartHydrated && !pendingGuestCart,
  });
  const attemptedSync = useRef<string | null>(null);
  const appliedCart = useRef<unknown>(null);

  useEffect(() => {
    if (!user || !cartHydrated || !pendingGuestCart) {
      attemptedSync.current = null;
      return;
    }

    const syncKey = `${user.id}:${pendingGuestCart.guestCartId}`;
    if (attemptedSync.current === syncKey) return;
    attemptedSync.current = syncKey;

    void synchronizeAuthenticatedCart(user.id, queryClient).catch((error) => {
      console.error("Failed to synchronize guest cart:", error);
    });
  }, [user, pendingGuestCart, cartHydrated, queryClient]);

  useEffect(() => {
    if (!user || !cartHydrated || pendingGuestCart || !serverCartQuery.data) return;
    if (appliedCart.current === serverCartQuery.data) return;
    appliedCart.current = serverCartQuery.data;

    void applyAuthenticatedCart(user.id, serverCartQuery.data, queryClient).catch((error) => {
      console.error("Failed to apply authenticated cart:", error);
    });
  }, [user, pendingGuestCart, cartHydrated, serverCartQuery.data, queryClient]);

  useEffect(() => {
    if (!user && !userLoading) {
      useCartStore.getState().initializeGuestCart();
      useCartStore.getState().setHydrated(true);
    }
  }, [user, userLoading]);

  return {
    isLoading: userLoading || serverCartQuery.isLoading,
    error: serverCartQuery.error ?? userError,
    user,
    serverCart: serverCartQuery.data,
  };
}
