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
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { synchronizeAuthenticatedCart } from "@/services/cart-sync.service";
import { cartKeys } from "@/hooks/auth/cart.keys";
import type { CartResponse } from "@/services/cart.service";


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
  const [removingItems, setRemovingItems] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const removingItemsRef = useRef(new Set<string>());

  const addToCartAndWait = useCallback(
    async (product: AddToCartProduct, quantity: number = 1): Promise<boolean> => {
      if (pendingGuestCart) return false;
      if (user) {
        setIsLoading(true);
        try {
          await addToServerCart.mutateAsync({
            productId: String(product.id),
            variantId: product.variantId,
            quantity,
          });
          return true;
        } catch (error) {
          console.error("Failed to add to cart:", error);
          setError("Could not add the item to your cart. Please try again.");
          return false;
        } finally {
          setIsLoading(false);
        }
      } else {
        markAsGuestCart();
        addToCartAction(product, quantity);
        return true;
      }
    },
    [user, addToServerCart, addToCartAction, markAsGuestCart, pendingGuestCart]
  );

  const addToCart = useCallback(
    (product: AddToCartProduct, quantity: number = 1) => {
      void addToCartAndWait(product, quantity);
    },
    [addToCartAndWait],
  );

  const removeFromCart = useCallback(
    (id: string | number, variantId?: string) => {
      if (pendingGuestCart) return;
      if (user) {
        const itemIndex = cartItems.findIndex(
          (item) =>
            String(item.id) === String(id) &&
            (!variantId || item.variantId === variantId),
        );
        const item = cartItems[itemIndex];
        const itemId = String(id);
        if (
          !item ||
          removingItemsRef.current.has(itemId) ||
          updatingItems.includes(itemId)
        ) return;

        const cartQueryKey = cartKeys.user(user.id);
        const previousCart = queryClient.getQueryData<CartResponse>(cartQueryKey);
        const serverItem = previousCart?.items.find(
          (cartItem) => cartItem.id === itemId,
        );

        setError(null);
        removingItemsRef.current.add(itemId);
        setRemovingItems((current) => [...current, itemId]);
        // Keep Zustand and all its subscribers (badge, cart, checkout) in sync
        // while the server confirms deletion.
        useCartStore.setState((state) => ({
          cartItems: state.cartItems.filter(
            (cartItem) =>
              !(
                String(cartItem.id) === itemId &&
                (!variantId || cartItem.variantId === variantId)
              ),
          ),
        }));
        queryClient.setQueryData<CartResponse>(cartQueryKey, (current) =>
          current
            ? {
                ...current,
                items: current.items.filter((cartItem) => cartItem.id !== itemId),
              }
            : current,
        );

        removeFromServerCart.mutate(String(id), {
          onSuccess: () => {
            removingItemsRef.current.delete(itemId);
            setRemovingItems((current) => current.filter((currentId) => currentId !== itemId));
          },
          onError: (error) => {
            useCartStore.setState((state) => {
              const alreadyRestored = state.cartItems.some(
                (cartItem) =>
                  String(cartItem.id) === itemId &&
                  (!variantId || cartItem.variantId === variantId),
              );
              if (alreadyRestored) return state;
              const restoredItems = [...state.cartItems];
              restoredItems.splice(Math.min(itemIndex, restoredItems.length), 0, item);
              return { cartItems: restoredItems };
            });

            queryClient.setQueryData<CartResponse>(cartQueryKey, (current) => {
              if (!serverItem) return current ?? previousCart;
              if (!current) return previousCart;
              if (current.items.some((cartItem) => cartItem.id === itemId)) return current;
              return { ...current, items: [...current.items, serverItem] };
            });
            void queryClient.invalidateQueries({ queryKey: cartQueryKey });
            removingItemsRef.current.delete(itemId);
            setRemovingItems((current) => current.filter((currentId) => currentId !== itemId));
            setError("Could not remove the item from your cart. Please try again.");
            console.error("Failed to remove from cart:", error);
          },
        });
      } else {
        // Guest: use local cart
        markAsGuestCart();
        removeFromCartAction(id, variantId);
      }
    },
    [user, cartItems, queryClient, removeFromServerCart, removeFromCartAction, markAsGuestCart, pendingGuestCart, updatingItems]
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
    addToCartAndWait,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoading,
    isUpdating: (id: string | number) => updatingItems.includes(String(id)),
    isRemoving: (id: string | number) => removingItems.includes(String(id)),
    error,
    isAuthenticated: !!user,
    isCartSyncPending: Boolean(pendingGuestCart),
    cartSyncError: syncError,
    retryCartSync,
    discardGuestCartAndUseAccountCart,
  };
}

export type { CartItem, AddToCartProduct };
