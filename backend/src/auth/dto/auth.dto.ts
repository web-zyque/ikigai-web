import { z } from 'zod';

const normalizePhone = (value: string) => {
  const cleaned = value.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^91\d{10}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
};

const E164 = /^\+[1-9]\d{9,14}$/;

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((phone) => E164.test(phone), {
    message: 'Invalid phone number',
  });

export const VerifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().length(6),
});

export const SendOtpSchema = z.object({
  phone: phoneSchema,
});

export const SignupSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: phoneSchema,
  otp: z.string().length(6),
  password: z.string().min(8).max(72),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1), // Can be phone number or admin ID
  password: z.string().min(1),
});

export const CreateAdminSchema = z.object({
  adminId: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Admin ID can only contain letters, numbers, underscore and hyphen'),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type SendOtpDto = z.infer<typeof SendOtpSchema>;
export type SignupDto = z.infer<typeof SignupSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
