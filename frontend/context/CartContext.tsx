"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useMe } from "@/hooks/auth";
import { cartApi } from "@/services/cart.service";
import type { MergeCartItem } from "@/types/cart.types";

export interface CartItem {
  id: string; // backend cart_item.id
  productId: string;
  name: string;
  price: number; // fetched fresh from backend
  image: string;
  variantId?: string;
  color?: string; // variant.colorName
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  isAuthenticated: boolean;
  addToCart: (product: { productId: string; name: string; price: string; image: string; variantId?: string; color?: string }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: authLoading } = useMe();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    if (isHydrated && !user && !authLoading) {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try {
          const parsedCart = JSON.parse(saved);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        } catch (e) {
          console.warn("Failed to parse cart from localStorage:", e);
        }
      }
    }
  }, [isHydrated, user, authLoading]);

  // Load authenticated cart from backend on login
  useEffect(() => {
    if (isHydrated && user && !authLoading) {
      loadAuthenticatedCart();
    }
  }, [isHydrated, user?.id, authLoading]);

  const loadAuthenticatedCart = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await cartApi.getCart();
      const items = response.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: parseFloat(item.product.sellingPrice),
        image: item.product.mainImage?.imageUrl || "",
        variantId: item.variantId || undefined,
        color: item.variant?.colorName,
        quantity: item.quantity,
      }));
      setCartItems(items);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save guest cart to localStorage when items change (for guest users only)
  useEffect(() => {
    if (isHydrated && !user && cartItems.length >= 0) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated, user]);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const addToCart = useCallback(
    async (product: {
      productId: string;
      name: string;
      price: string;
      image: string;
      variantId?: string;
      color?: string;
    }) => {
      const priceStr = product.price.replace(/[^0-9.-]+/g, "");
      const numericPrice = parseFloat(priceStr) || 0;

      if (user) {
        // Authenticated: call backend API
        setIsLoading(true);
        try {
          const response = await cartApi.addToCart({
            productId: product.productId,
            variantId: product.variantId || null,
            quantity: 1,
          });
          const items = response.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            price: parseFloat(item.product.sellingPrice),
            image: item.product.mainImage?.imageUrl || "",
            variantId: item.variantId || undefined,
            color: item.variant?.colorName,
            quantity: item.quantity,
          }));
          setCartItems(items);
          showToast();
        } catch (error) {
          console.error("Failed to add to cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: add to localStorage cart
        setCartItems((prev) => {
          const existing = prev.find(
            (item) =>
              item.productId === product.productId &&
              item.variantId === (product.variantId || undefined)
          );
          if (existing) {
            return prev.map((item) =>
              item.id === existing.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          }

          return [
            ...prev,
            {
              id: `guest-${Date.now()}-${Math.random()}`,
              productId: product.productId,
              name: product.name,
              price: numericPrice,
              image: product.image,
              variantId: product.variantId,
              color: product.color || "Default",
              quantity: 1,
            },
          ];
        });
        showToast();
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (user) {
        // Authenticated: call backend API
        setIsLoading(true);
        try {
          const response = await cartApi.removeItem(itemId);
          const items = response.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            price: parseFloat(item.product.sellingPrice),
            image: item.product.mainImage?.imageUrl || "",
            variantId: item.variantId || undefined,
            color: item.variant?.colorName,
            quantity: item.quantity,
          }));
          setCartItems(items);
        } catch (error) {
          console.error("Failed to remove from cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: remove from localStorage cart
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      if (user) {
        // Authenticated: call backend API
        setIsLoading(true);
        try {
          const response = await cartApi.updateItem(itemId, { quantity });
          const items = response.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            price: parseFloat(item.product.sellingPrice),
            image: item.product.mainImage?.imageUrl || "",
            variantId: item.variantId || undefined,
            color: item.variant?.colorName,
            quantity: item.quantity,
          }));
          setCartItems(items);
        } catch (error) {
          console.error("Failed to update cart:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      } else {
        // Guest: update localStorage cart
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )
        );
      }
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      // Authenticated: call backend API
      setIsLoading(true);
      try {
        await cartApi.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error("Failed to clear cart:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest: clear localStorage cart
      setCartItems([]);
    }
  }, [user]);

  // Merge guest cart into authenticated cart when user logs in
  useEffect(() => {
    if (isHydrated && user && !authLoading && cartItems.length > 0) {
      mergeGuestCart();
    }
  }, [isHydrated, user?.id, authLoading]);

  const mergeGuestCart = useCallback(async () => {
    if (!user || cartItems.length === 0) return;

    setIsLoading(true);
    try {
      const guestItems: MergeCartItem[] = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }));

      const response = await cartApi.mergeGuestCart({ items: guestItems });
      const items = response.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        price: parseFloat(item.product.sellingPrice),
        image: item.product.mainImage?.imageUrl || "",
        variantId: item.variantId || undefined,
        color: item.variant?.colorName,
        quantity: item.quantity,
      }));
      setCartItems(items);

      // Clear guest cart from localStorage
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Failed to merge cart:", error);
      // Don't throw - let user continue shopping with guest cart
    } finally {
      setIsLoading(false);
    }
  }, [user, cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading: isLoading || authLoading,
        isAuthenticated: !!user,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
      {toastVisible && (
        <div className="fixed top-4 right-4 sm:right-6 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-[#2a2a2a] border border-white/10 shadow-xl shadow-black/50 text-white px-5 py-3 rounded-xl flex items-center gap-3 min-w-[250px]">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="font-medium text-sm">Added to the cart successfully</p>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
