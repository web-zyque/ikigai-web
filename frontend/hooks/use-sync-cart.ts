"use client";

import { useEffect, useMemo } from "react";
import { useMe } from "@/hooks/auth/use-me";
import { useServerCart } from "@/hooks/use-server-cart";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { productsApi } from "@/services/products.service";


export function useSyncCart() {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: serverCart, isLoading: cartLoading, error: cartError } = useServerCart({
    enabled: !!user, // Only fetch if user is authenticated
  });

  useEffect(() => {
    // If user is authenticated and we have server cart data
    if (user && serverCart) {
      // Fetch product data for all items to enrich them
      const fetchAndEnrich = async () => {
        try {
          // Get unique product IDs
          const productIds = [...new Set(serverCart.items.map((item) => item.productId))];

          // Fetch product data for each product
          const productsData = await Promise.all(
            productIds.map((id) => productsApi.getById(id).catch(() => null))
          );

          // Create a map of product data
          const productsMap = new Map();
          productsData.forEach((product) => {
            if (product) {
              productsMap.set(product.id, product);
            }
          });

          // Convert backend cart items to frontend CartItem structure with product data
          const convertedItems: CartItem[] = serverCart.items.map((backendItem) => {
            const product = productsMap.get(backendItem.productId);
            return {
              // Use backend cart item ID for mutations
              id: backendItem.id,
              // Frontend properties populated from product data
              name: product?.name || "Unknown Product",
              price: parseFloat(product?.sellingPrice || "0"),
              image: product?.images?.[0]?.imageUrl || "",
              color: backendItem.variantId ? "Variant" : "Default",
              quantity: backendItem.quantity,
              variantId: backendItem.variantId || undefined,
            };
          });

          // Replace local cart with server cart (server is source of truth)
          useCartStore.setState({ cartItems: convertedItems, isHydrated: true });
        } catch (error) {
          console.error("Failed to enrich cart items:", error);
          // Still mark as hydrated even if enrichment fails
          useCartStore.setState({ isHydrated: true });
        }
      };

      fetchAndEnrich();
    } else if (!user && !userLoading) {
      // User is logged out - just mark as hydrated
      // They can continue using their local cart as a guest
      useCartStore.setState({ isHydrated: true });
    }
  }, [user, serverCart, userLoading]);

  return {
    isLoading: userLoading || cartLoading,
    error: cartError,
    user,
    serverCart,
  };
}
