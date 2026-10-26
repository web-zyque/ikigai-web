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
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartPayload {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface MergeCartItem {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface MergeCartPayload {
  items: MergeCartItem[];
}
