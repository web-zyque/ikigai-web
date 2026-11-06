import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must not exceed 1000'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must not exceed 1000'),
});

export const MergeGuestCartSchema = z.object({
  guestCartId: z.string().uuid('Invalid guest cart ID'),
  items: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        variantId: z.string().uuid('Invalid variant ID').nullable().optional(),
        quantity: z
          .number()
          .int()
          .min(1, 'Quantity must be at least 1')
          .max(1000, 'Quantity must not exceed 1000'),
      }),
    )
    .max(500, 'A cart can contain at most 500 lines'),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
export type MergeGuestCartDto = z.infer<typeof MergeGuestCartSchema>;

export interface CartItemResponse {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}
