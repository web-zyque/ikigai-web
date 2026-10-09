export interface CreateProductRequest {
  name: string;
  sku: string;
  categoryId: string;
  brand?: string;
  description?: string;
  sellingPrice: number;
  mrpPrice?: number;
  gstPercentage?: number;
  stockQuantity: number;
  lowStockThreshold: number;
  publicationStatus: 'active' | 'draft';
  vehicleCompatibility?: string[];
  productType?: string;
  color?: string;
  dimensions?: string;
  material?: string;
  warranty?: string;
  images: {
    imageUrl: string;
    isMainImage: boolean;
    altText?: string;
  }[];
}

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
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  products: ProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  publicationStatus?: 'active' | 'draft';
  inventoryStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  search?: string;
}