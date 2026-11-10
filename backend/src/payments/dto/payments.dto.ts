import { z } from 'zod';

export const CashfreeAttemptSchema = z.object({
  orderId: z.string().uuid(),
  idempotencyKey: z.string().uuid(),
});

export const CashfreeRetrySchema = z.object({
  idempotencyKey: z.string().uuid(),
});

export type CashfreeAttemptDto = z.infer<typeof CashfreeAttemptSchema>;
export type CashfreeRetryDto = z.infer<typeof CashfreeRetrySchema>;
