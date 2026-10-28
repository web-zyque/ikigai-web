import api from "@/api/axios";

export interface CartItemResponse {
  id: string;
  productId: string;
  variantId?: string | null;
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

export interface AddToCartPayload {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export const cartService = {

  getCart: () =>
    api.get<CartResponse>("/cart").then((r) => r.data),


  addToCart: (payload: AddToCartPayload) =>
    api.post<CartResponse>("/cart/items", payload).then((r) => r.data),

 
  updateCartItem: (cartItemId: string, payload: UpdateCartItemPayload) =>
    api.patch<CartResponse>(`/cart/items/${cartItemId}`, payload).then((r) => r.data),


  removeFromCart: (cartItemId: string) =>
    api.delete<CartResponse>(`/cart/items/${cartItemId}`).then((r) => r.data),

  
  clearCart: () =>
    api.delete<CartResponse>("/cart").then((r) => r.data),
};
