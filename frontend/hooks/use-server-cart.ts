"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService, type CartResponse, type AddToCartPayload, type UpdateCartItemPayload } from "@/services/cart.service";
import { cartKeys } from "@/hooks/auth/cart.keys";
import { ApiError } from "@/api/axios";

export interface UseServerCartOptions {
  enabled?: boolean;
}

export function useServerCart(options?: UseServerCartOptions) {
  const enabled = options?.enabled ?? (typeof window !== "undefined");

  return useQuery({
    queryKey: cartKeys.all,
    queryFn: cartService.getCart,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      /
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
     
      return failureCount < 3;
    },
  });
}

/**
 * Add an item to the server cart
 */
export function useAddToServerCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: (data: CartResponse) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
  });
}

/**
 * Update a cart item's quantity
 */
export function useUpdateServerCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateCartItem(cartItemId, payload),
    onSuccess: (data: CartResponse) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
  });
}

/**
 * Remove an item from the server cart
 */
export function useRemoveFromServerCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onSuccess: (data: CartResponse) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
  });
}

/**
 * Clear the server cart
 */
export function useClearServerCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data: CartResponse) => {
      queryClient.setQueryData(cartKeys.all, data);
    },
  });
}
