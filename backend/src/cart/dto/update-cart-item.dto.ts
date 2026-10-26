import { z } from 'zod';

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int('Quantity must be an integer').min(1, 'Quantity must be at least 1').max(999, 'Quantity cannot exceed 999'),
});

export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
