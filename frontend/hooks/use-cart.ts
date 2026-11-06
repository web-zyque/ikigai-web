"use client";

import {
  useCartItems,
  useAddToCart,
  useRemoveFromCart,
  useUpdateQuantity,
  useClearCart,
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


export function useCart() {
  const { data: user } = useMe();
  const cartItems = useCartItems();
  const addToCartAction = useAddToCart();
  const removeFromCartAction = useRemoveFromCart();
  const updateQuantityAction = useUpdateQuantity();
  const clearCartAction = useClearCart();

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
        addToCartAction(product, quantity);
      }
    },
    [user, addToServerCart, addToCartAction]
  );

  const removeFromCart = useCallback(
    (id: string | number, variantId?: string) => {
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
        removeFromCartAction(id, variantId);
      }
    },
    [user, removeFromServerCart, removeFromCartAction]
  );

  const updateQuantity = useCallback(
    (id: string | number, delta: number, variantId?: string) => {
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
        updateQuantityAction(id, delta, variantId);
      }
    },
    [user, cartItems, updateServerCartItem, updateQuantityAction, updatingItems]
  );

  const clearCart = useCallback(() => {
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
      clearCartAction();
    }
  }, [user, clearServerCart, clearCartAction]);

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
  };
}

export type { CartItem, AddToCartProduct };
