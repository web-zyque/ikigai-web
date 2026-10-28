"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Cart item interface matching existing CartContext structure
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  color?: string;
  quantity: number;
  variantId?: string; // Support for product variants
}

// Product data needed when adding to cart
export interface AddToCartProduct {
  id: string | number;
  name: string;
  price: string;
  image: string;
  color?: string;
  variantId?: string;
}

interface CartState {
  cartItems: CartItem[];
  isHydrated: boolean;
}

interface CartActions {
  addToCart: (product: AddToCartProduct, quantity?: number) => void;
  removeFromCart: (id: string | number, variantId?: string) => void;
  updateQuantity: (id: string | number, delta: number, variantId?: string) => void;
  clearCart: () => void;
  setHydrated: (hydrated: boolean) => void;
}

// Computed selectors
interface CartSelectors {
  getTotalItems: () => number;
  getSubtotal: () => number;
  isInCart: (id: string | number, variantId?: string) => boolean;
}

type CartStore = CartState & CartActions & CartSelectors;

// Helper function to generate a stable cart line key
const getCartLineKey = (id: string | number, variantId?: string): string => {
  return variantId ? `${id}-${variantId}` : String(id);
};

// Helper to find cart item by product ID and optional variant
const findCartItem = (
  items: CartItem[],
  id: string | number,
  variantId?: string
): CartItem | undefined => {
  return items.find((item) => {
    const itemKey = getCartLineKey(item.id, item.variantId);
    const searchKey = getCartLineKey(id, variantId);
    return itemKey === searchKey;
  });
};

// Parse price string to number
const parsePriceString = (price: string): number => {
  const priceStr = price.replace(/[^0-9.-]+/g, "");
  return parseFloat(priceStr) || 0;
};

// Validate and constrain quantity
const validateQuantity = (quantity: number, min = 1, max = 999): number => {
  return Math.max(min, Math.min(max, Math.floor(quantity)));
};

export interface ServerCartItem {
  id: string; // This is the backend cart item ID
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // State
      cartItems: [],
      isHydrated: false,

      // Actions
      addToCart: (product, quantity = 1) => {
        const validQuantity = validateQuantity(quantity);
        
        set((state) => {
          const existing = findCartItem(state.cartItems, product.id, product.variantId);
          
          if (existing) {
            // Update existing item quantity
            return {
              cartItems: state.cartItems.map((item) => {
                const itemKey = getCartLineKey(item.id, item.variantId);
                const productKey = getCartLineKey(product.id, product.variantId);
                
                if (itemKey === productKey) {
                  const newQuantity = validateQuantity(item.quantity + validQuantity);
                  return { ...item, quantity: newQuantity };
                }
                return item;
              }),
            };
          }

          // Add new item
          const numericPrice = parsePriceString(product.price);
          const newItem: CartItem = {
            id: product.id,
            name: product.name,
            price: numericPrice,
            image: product.image,
            color: product.color || "Default",
            quantity: validQuantity,
            variantId: product.variantId,
          };

          return {
            cartItems: [...state.cartItems, newItem],
          };
        });
      },

      removeFromCart: (id, variantId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => {
            const itemKey = getCartLineKey(item.id, item.variantId);
            const removeKey = getCartLineKey(id, variantId);
            return itemKey !== removeKey;
          }),
        }));
      },

      updateQuantity: (id, delta, variantId) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) => {
            const itemKey = getCartLineKey(item.id, item.variantId);
            const updateKey = getCartLineKey(id, variantId);
            
            if (itemKey === updateKey) {
              const newQuantity = validateQuantity(item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      // Selectors
      getTotalItems: () => {
        return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().cartItems.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
      },

      isInCart: (id, variantId) => {
        return !!findCartItem(get().cartItems, id, variantId);
      },
    }),
    {
      name: "ikigai-cart-storage",
      storage: createJSONStorage(() => {
        // Only access localStorage on client side
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // Migration strategy: try to load from old "cart" key if new key is empty
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
        }

        // Attempt to migrate from old cart storage
        if (typeof window !== "undefined") {
          try {
            const newStorage = localStorage.getItem("ikigai-cart-storage");
            const oldStorage = localStorage.getItem("cart");

            // Only migrate if new storage is empty and old storage exists
            if (!newStorage && oldStorage) {
              const oldCart = JSON.parse(oldStorage);
              if (Array.isArray(oldCart) && oldCart.length > 0) {
                // Store the old cart in new format
                const migratedState = {
                  state: { cartItems: oldCart, isHydrated: true },
                  version: 0,
                };
                localStorage.setItem(
                  "ikigai-cart-storage",
                  JSON.stringify(migratedState)
                );
                
                // Set the state directly
                if (state) {
                  state.cartItems = oldCart;
                }
                
                console.log("✓ Cart migrated from old storage");
              }
            }
          } catch (error) {
            console.warn("Failed to migrate old cart:", error);
          }
        }
      },
      // Only persist the cart items, not computed values
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    }
  )
);

// Selector hooks for optimal re-render performance
export const useCartItems = () => useCartStore((state) => state.cartItems);

// Use individual action selectors instead of creating new objects
export const useAddToCart = () => useCartStore((state) => state.addToCart);
export const useRemoveFromCart = () => useCartStore((state) => state.removeFromCart);
export const useUpdateQuantity = () => useCartStore((state) => state.updateQuantity);
export const useClearCart = () => useCartStore((state) => state.clearCart);

// For components that need multiple actions - returns stable references
export const useCartActions = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  
  // These are stable references from Zustand
  return { addToCart, removeFromCart, updateQuantity, clearCart };
};

export const useCartTotalItems = () => useCartStore((state) => state.getTotalItems());
export const useCartSubtotal = () => useCartStore((state) => state.getSubtotal());
export const useIsInCart = (id: string | number, variantId?: string) =>
  useCartStore((state) => state.isInCart(id, variantId));
export const useCartHydrated = () => useCartStore((state) => state.isHydrated);
