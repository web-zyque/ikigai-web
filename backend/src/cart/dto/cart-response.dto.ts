export interface CartItemResponse {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sellingPrice: string;
    mainImage?: {
      imageUrl: string;
      altText?: string;
    };
  };
  variantId?: string | null;
  variant?: {
    id: string;
    colorName: string;
  } | null;
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
