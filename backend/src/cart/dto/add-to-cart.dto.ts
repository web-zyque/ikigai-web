import { z } from 'zod';

export const AddToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional().nullable(),
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
