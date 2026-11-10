"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ordersService,
  type CreateOrderPayload,
  type OrderStatusValue,
} from "@/services/orders.service";
import { cartKeys } from "@/hooks/auth/cart.keys";
import { useMe } from "@/hooks/auth/use-me";

export const orderKeys = {
  mine: ["orders", "mine"] as const,
  detail: (id: string) => ["orders", id] as const,
  admin: ["admin", "orders"] as const,
  stats: ["admin", "orders", "stats"] as const,
  cancellations: ["admin", "orders", "cancellations"] as const,
};

export function useMyOrders() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: [...orderKeys.mine, user?.id],
    queryFn: ordersService.mine,
    enabled: Boolean(user?.id),
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersService.mineById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const { data: user } = useMe();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      ordersService.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: orderKeys.mine });

      if (user?.id) {
        await qc.invalidateQueries({ queryKey: cartKeys.user(user.id) });
      }
    },
  });
}

export function useRequestOrderCancellation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersService.requestCancellation(id, reason),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: orderKeys.detail(vars.id) }),
  });
}

export function useAdminOrders(
  params: Record<string, string | number | undefined> = {}
) {
  return useQuery({
    queryKey: [...orderKeys.admin, params],
    queryFn: () => ordersService.adminList(params),
  });
}

export function useAdminOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats,
    queryFn: ordersService.adminStats,
  });
}

export function useAdminOrderAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      action:
        | { type: "status"; id: string; status: OrderStatusValue }
        | {
            type: "review";
            id: string;
            decision: "APPROVED" | "REJECTED";
            adminNote?: string;
          }
    ) =>
      action.type === "status"
        ? ordersService.updateStatus(action.id, action.status)
        : ordersService.reviewCancellation(
            action.id,
            action.decision,
            action.adminNote
          ),

    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: orderKeys.admin }),
        qc.invalidateQueries({ queryKey: orderKeys.stats }),
        qc.invalidateQueries({ queryKey: orderKeys.cancellations }),
      ]);
    },
  });
}

export function useAdminCancellationRequests() {
  return useQuery({
    queryKey: orderKeys.cancellations,
    queryFn: ordersService.cancellations,
  });
}
