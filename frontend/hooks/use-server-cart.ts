"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartService, type CartResponse, type AddToCartPayload, type UpdateCartItemPayload } from "@/services/cart.service";
import { cartKeys } from "@/hooks/auth/cart.keys";
import { ApiError } from "@/api/axios";
import { useMe } from "@/hooks/auth/use-me";

export interface UseServerCartOptions {
  enabled?: boolean;
}

export function useServerCart(options?: UseServerCartOptions) {
  const { data: user } = useMe();
  // Admins and staff have no cart — never fetch for them
  const isAdminRole = user?.role === "ADMIN" || user?.role === "STAFF";
  const enabled = !isAdminRole && (options?.enabled ?? (typeof window !== "undefined"));

  return useQuery({
    queryKey: cartKeys.user(user?.id ?? "anonymous"),
    queryFn: cartService.getCart,
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
}

/**
 * Add an item to the server cart
 */
export function useAddToServerCart() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addToCart(payload),
    onSuccess: (data: CartResponse) => {
      if (user) queryClient.setQueryData(cartKeys.user(user.id), data);
    },
  });
}

/**
 * Update a cart item's quantity
 */
export function useUpdateServerCartItem() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateCartItem(cartItemId, payload),
    onSuccess: (data: CartResponse) => {
      if (user) queryClient.setQueryData(cartKeys.user(user.id), data);
    },
  });
}

/**
 * Remove an item from the server cart
 */
export function useRemoveFromServerCart() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  return useMutation({
    mutationFn: (cartItemId: string) => cartService.removeFromCart(cartItemId),
    onSuccess: (data: CartResponse) => {
      if (user) queryClient.setQueryData(cartKeys.user(user.id), data);
    },
  });
}

/**
 * Clear the server cart
 */
export function useClearServerCart() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data: CartResponse) => {
      if (user) queryClient.setQueryData(cartKeys.user(user.id), data);
    },
  });
}
