import { z } from 'zod';

export const AddressIdSchema = z.string().uuid('Invalid address ID');

const addressFields = {
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(7).max(20),
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z.string().trim().max(255).optional().nullable(),
  landmark: z.string().trim().max(255).optional().nullable(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(1).max(100).default('India'),
  addressType: z.enum(['Home', 'Work']).default('Home'),
};

export const CreateAddressSchema = z.object({
  ...addressFields,
  isDefault: z.boolean().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
  message: 'At least one address field must be provided',
  },
);

export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;
