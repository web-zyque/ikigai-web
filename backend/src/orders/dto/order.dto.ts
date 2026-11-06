import { z } from 'zod';

export const CreateOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.literal('COD').default('COD'),
  couponCode: z.string().trim().min(1).max(40).optional().nullable(),
  idempotencyKey: z.string().uuid(),
  buyNowItem: z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullable().optional(),
    quantity: z.number().int().min(1).max(1000),
  }).optional(),
});

export const CreateCancellationRequestSchema = z.object({
  reason: z.string().trim().min(5).max(1000),
});

export const AdminOrderListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  search: z.string().trim().max(120).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const AdminOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'DELIVERED']),
  note: z.string().trim().max(1000).optional(),
});

export const AdminOrderRejectSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});

export const ReviewCancellationSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().trim().max(1000).optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type CreateCancellationRequestDto = z.infer<typeof CreateCancellationRequestSchema>;
export type AdminOrderListDto = z.infer<typeof AdminOrderListSchema>;
export type AdminOrderStatusDto = z.infer<typeof AdminOrderStatusSchema>;
export type AdminOrderRejectDto = z.infer<typeof AdminOrderRejectSchema>;
export type ReviewCancellationDto = z.infer<typeof ReviewCancellationSchema>;
