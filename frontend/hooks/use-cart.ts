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
import { useCallback } from "react";

export function useCart() {
  const cartItems = useCartItems();
  const addToCartAction = useAddToCart();
  const removeFromCartAction = useRemoveFromCart();
  const updateQuantityAction = useUpdateQuantity();
  const clearCartAction = useClearCart();

  const addToCart = useCallback(
    (product: AddToCartProduct) => {
      addToCartAction(product, 1);
    },
    [addToCartAction]
  );

  const removeFromCart = useCallback(
    (id: string | number, variantId?: string) => {
      removeFromCartAction(id, variantId);
    },
    [removeFromCartAction]
  );

  const updateQuantity = useCallback(
    (id: string | number, delta: number, variantId?: string) => {
      updateQuantityAction(id, delta, variantId);
    },
    [updateQuantityAction]
  );

  const clearCart = useCallback(() => {
    clearCartAction();
  }, [clearCartAction]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}

export type { CartItem, AddToCartProduct };
