import api from "@/api/axios";
import type {
  CartResponse,
  AddToCartPayload,
  UpdateCartItemPayload,
  MergeCartPayload,
} from "@/types/cart.types";

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },

  addToCart: async (payload: AddToCartPayload): Promise<CartResponse> => {
    const response = await api.post("/cart/items", payload);
    return response.data;
  },

  updateItem: async (
    itemId: string,
    payload: UpdateCartItemPayload
  ): Promise<CartResponse> => {
    const response = await api.patch(`/cart/items/${itemId}`, payload);
    return response.data;
  },

  removeItem: async (itemId: string): Promise<CartResponse> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete("/cart");
    return response.data;
  },

  mergeGuestCart: async (payload: MergeCartPayload): Promise<CartResponse> => {
    const response = await api.post("/cart/merge", payload);
    return response.data;
  },
};
