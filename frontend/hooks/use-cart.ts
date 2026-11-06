"use client";

import {
  useCartItems,
  useAddToCart,
  useRemoveFromCart,
  useUpdateQuantity,
  useClearCart,
  useCartStore,
  type CartItem,
  type AddToCartProduct,
} from "@/stores/cart-store";
import { useMe } from "@/hooks/auth/use-me";
import {
  useAddToServerCart,
  useRemoveFromServerCart,
  useUpdateServerCartItem,
  useClearServerCart,
} from "@/hooks/use-server-cart";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { synchronizeAuthenticatedCart } from "@/services/cart-sync.service";


export function useCart() {
  const { data: user } = useMe();
  const cartItems = useCartItems();
  const addToCartAction = useAddToCart();
  const removeFromCartAction = useRemoveFromCart();
  const updateQuantityAction = useUpdateQuantity();
  const clearCartAction = useClearCart();
  const queryClient = useQueryClient();
  const markAsGuestCart = useCartStore((state) => state.markAsGuestCart);
  const discardPendingGuestCart = useCartStore((state) => state.discardPendingGuestCart);
  const pendingGuestCart = useCartStore((state) => state.pendingGuestCart);
  const syncError = useCartStore((state) => state.syncError);

  // Server cart mutations
  const addToServerCart = useAddToServerCart();
  const removeFromServerCart = useRemoveFromServerCart();
  const updateServerCartItem = useUpdateServerCartItem();
  const clearServerCart = useClearServerCart();

  const [isLoading, setIsLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback(
    (product: AddToCartProduct, quantity: number = 1) => {
      if (pendingGuestCart) return;
      if (user) {
        // Authenticated: use server cart
        setIsLoading(true);
        addToServerCart.mutate(
          {
            productId: String(product.id),
            variantId: product.variantId,
            quantity,
          },
          {
            onSuccess: () => {
              setIsLoading(false);
            },
            onError: (error) => {
              setIsLoading(false);
              console.error("Failed to add to cart:", error);
            },
          }
        );
      } else {
        // Guest: use local cart
        markAsGuestCart();
        addToCartAction(product, quantity);
      }
    },
    [user, addToServerCart, addToCartAction, markAsGuestCart, pendingGuestCart]
  );

  const removeFromCart = useCallback(
    (id: string | number, variantId?: string) => {
      if (pendingGuestCart) return;
      if (user) {
      
        setIsLoading(true);
        removeFromServerCart.mutate(String(id), {
          onSuccess: () => {
            setIsLoading(false);
          },
          onError: (error) => {
            setIsLoading(false);
            console.error("Failed to remove from cart:", error);
          },
        });
      } else {
        // Guest: use local cart
        markAsGuestCart();
        removeFromCartAction(id, variantId);
      }
    },
    [user, removeFromServerCart, removeFromCartAction, markAsGuestCart, pendingGuestCart]
  );

  const updateQuantity = useCallback(
    (id: string | number, delta: number, variantId?: string) => {
      if (pendingGuestCart) return;
      if (user) {
        const item = cartItems.find(
          (i) => String(i.id) === String(id) && (!variantId || i.variantId === variantId)
        );
        if (!item) return;

        const newQuantity = Math.max(1, Math.min(1000, item.quantity + delta));
        if (newQuantity === item.quantity || updatingItems.includes(String(id))) return;

        setError(null);
        setUpdatingItems((current) => [...current, String(id)]);
        // Reflect the change immediately; restore the previous value if the API fails.
        updateQuantityAction(id, newQuantity - item.quantity, variantId);
        updateServerCartItem.mutate(
          {
            cartItemId: String(id),
            payload: { quantity: newQuantity },
          },
          {
            onSuccess: () => {
              setUpdatingItems((current) => current.filter((itemId) => itemId !== String(id)));
            },
            onError: (error) => {
              updateQuantityAction(id, item.quantity - newQuantity, variantId);
              setUpdatingItems((current) => current.filter((itemId) => itemId !== String(id)));
              setError("Could not update the cart. Please try again.");
              console.error("Failed to update cart item:", error);
            },
          }
        );
      } else {
        // Guest: use local cart
        markAsGuestCart();
        updateQuantityAction(id, delta, variantId);
      }
    },
    [user, cartItems, updateServerCartItem, updateQuantityAction, updatingItems, markAsGuestCart, pendingGuestCart]
  );

  const clearCart = useCallback(() => {
    if (pendingGuestCart) return;
    if (user) {
      // Authenticated: use server cart
      setIsLoading(true);
      clearServerCart.mutate(undefined, {
        onSuccess: () => {
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
          console.error("Failed to clear cart:", error);
        },
      });
    } else {
      // Guest: use local cart
      markAsGuestCart();
      clearCartAction();
    }
  }, [user, clearServerCart, clearCartAction, markAsGuestCart, pendingGuestCart]);

  const retryCartSync = useCallback(async () => {
    if (!user) return;
    await synchronizeAuthenticatedCart(user.id, queryClient);
  }, [user, queryClient]);

  const discardGuestCartAndUseAccountCart = useCallback(async () => {
    if (!user || !pendingGuestCart) return;
    discardPendingGuestCart();
    await synchronizeAuthenticatedCart(user.id, queryClient);
  }, [user, pendingGuestCart, discardPendingGuestCart, queryClient]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
    isUpdating: (id: string | number) => updatingItems.includes(String(id)),
    error,
    isAuthenticated: !!user,
    isCartSyncPending: Boolean(pendingGuestCart),
    cartSyncError: syncError,
    retryCartSync,
    discardGuestCartAndUseAccountCart,
  };
}

export type { CartItem, AddToCartProduct };
