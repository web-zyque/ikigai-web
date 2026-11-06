"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";
import type { Address, AddressInput } from "@/types/address.types";

export const addressKeys = {
  list: (userId: string) => ["addresses", userId] as const,
};

export function useUserAddresses(userId?: string, enabled = true) {
  return useQuery({
    queryKey: addressKeys.list(userId ?? "anonymous"),
    queryFn: addressService.getAll,
    enabled: Boolean(userId) && enabled,
    staleTime: 30_000,
  });
}

export function useCreateUserAddress(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => addressService.create(input),
    onSuccess: async () => {
      if (userId) await queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

export function useUpdateUserAddress(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AddressInput }) => addressService.update(id, input),
    onSuccess: async () => {
      if (userId) await queryClient.invalidateQueries({ queryKey: addressKeys.list(userId) });
    },
  });
}

export function useDeleteUserAddress(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.remove(id),
    onSuccess: (addresses: Address[]) => {
      if (userId) queryClient.setQueryData(addressKeys.list(userId), addresses);
    },
  });
}

export function useSetDefaultUserAddress(userId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.setDefault(id),
    onSuccess: (addresses: Address[]) => {
      if (userId) queryClient.setQueryData(addressKeys.list(userId), addresses);
    },
  });
}
