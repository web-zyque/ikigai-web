"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: string;
  color?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: { id: string | number; name: string; price: string; image: string; color?: string }) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastVisible, setToastVisible] = useState(false);

  // Optional: Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(saved));
      } catch {
        // ignore JSON parse error
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const addToCart = (product: { id: string | number; name: string; price: string; image: string; color?: string }) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      
      // Parse price string to number, removing any currency symbol and commas
      const priceStr = product.price.replace(/[^0-9.-]+/g, "");
      const numericPrice = parseFloat(priceStr) || 0;

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: numericPrice,
          image: product.image,
          color: product.color || "Default",
          quantity: 1,
        },
      ];
    });
    showToast();
  };

  const removeFromCart = (id: string | number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
      {toastVisible && (
        <div className="fixed top-4 right-4 sm:right-6 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="bg-[#2a2a2a] border border-white/10 shadow-xl shadow-black/50 text-white px-5 py-3 rounded-xl flex items-center gap-3 min-w-[250px]">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
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
