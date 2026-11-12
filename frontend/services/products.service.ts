import api from "@/api/axios";
import { CategoryResponse, CreateProductRequest, GetProductsParams, GetProductsResponse, ProductResponse } from "@/types/products.types";



export const productsApi = {
  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  getAll: async (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateProductRequest>): Promise<ProductResponse> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  addStock: async (id: string, quantity: number): Promise<ProductResponse> => {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const categoriesApi = {
  getAll: async (params?: { includeArchived?: boolean }): Promise<CategoryResponse[]> => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  create: async (data: { name: string; imageUrl: string }): Promise<CategoryResponse> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; imageUrl?: string }): Promise<CategoryResponse> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  archive: async (id: string): Promise<CategoryResponse> => {
    const response = await api.patch(`/categories/${id}/archive`);
    return response.data;
  },

  restore: async (id: string): Promise<CategoryResponse> => {
    const response = await api.patch(`/categories/${id}/restore`);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};