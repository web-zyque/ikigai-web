// ─────────────────────────────────────────────────────────────────
// Product Type Definitions
// These types reflect the expected shape of the product API response.
// Currently backed by mock data; wire up to the API service when available.
// ─────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string;
  color?: string;
  /** Hex or CSS color for the swatch, e.g. "#1a1a1a" */
  colorHex?: string;
  size?: string;
  stock: number;
  /** Gallery images for this color variant; falls back to product.images */
  images?: string[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface VehicleCompatibility {
  make: string;
  model: string;
  yearFrom: number;
  yearTo?: number;
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  brand: string;
  sku: string;
  description: string;
  /** Primary + gallery images */
  images: string[];
  /** Selling / current price in INR */
  price: number;
  /** Original / MRP – present when there is a discount */
  originalPrice?: number;
  /** Total stock when no variants are used */
  stock?: number;
  lowStockThreshold?: number;
  material?: string;
  warranty?: string;
  variants?: ProductVariant[];
  specifications?: ProductSpec[];
  compatibility?: VehicleCompatibility[];
}
