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
import { useCallback, useEffect, useState } from "react";


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
          (i) => String(i.id) === String(id)
        );
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity < 1) {
          removeFromCart(id, variantId);
          return;
        }

        setIsLoading(true);
        updateServerCartItem.mutate(
          {
            cartItemId: String(id),
            payload: { quantity: newQuantity },
          },
          {
            onSuccess: () => {
              setIsLoading(false);
            },
            onError: (error) => {
              setIsLoading(false);
              console.error("Failed to update cart item:", error);
            },
          }
        );
      } else {
        // Guest: use local cart
        updateQuantityAction(id, delta, variantId);
      }
    },
    [user, cartItems, updateServerCartItem, updateQuantityAction, removeFromCart]
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
    isAuthenticated: !!user,
  };
}

export type { CartItem, AddToCartProduct };
