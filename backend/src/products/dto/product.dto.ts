import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  categoryId: z.string().uuid(),
  brand: z.string().optional(),
  description: z.string().optional(),
  
  sellingPrice: z.number().positive(),
  mrpPrice: z.number().positive().optional(),
  gstPercentage: z.number().min(0).max(100).default(18),
  
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(1).default(5),
  
  publicationStatus: z.enum(['active', 'draft']).default('active'),
  
  vehicleCompatibility: z.array(z.string()).optional(),
  
  productType: z.string().optional(),
  color: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  warranty: z.string().optional(),
  
  images: z.array(z.object({
    imageUrl: z.string().url(),
    isMainImage: z.boolean().default(false),
    altText: z.string().optional(),
  })).min(1, 'At least one image is required'),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  id: z.string().uuid(),
});

export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  publicationStatus: z.enum(['active', 'draft']).optional(),
  inventoryStatus: z.enum(['in_stock', 'low_stock', 'out_of_stock']).optional(),
  search: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type GetProductsQueryDto = z.infer<typeof GetProductsQuerySchema>;
export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;


export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: string;
  description?: string;
  sellingPrice: string;
  mrpPrice?: string;
  gstPercentage: string;
  stockQuantity: number;
  lowStockThreshold: number;
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  publicationStatus: 'active' | 'draft';
  vehicleCompatibility?: string[];
  productType?: string;
  color?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  images: {
    id: string;
    imageUrl: string;
    isMainImage: boolean;
    displayOrder: number;
    altText?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}