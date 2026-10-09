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

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const categoriesApi = {
  getAll: async (): Promise<CategoryResponse[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: { name: string; description?: string }): Promise<CategoryResponse> => {
    const response = await api.post('/categories', data);
    return response.data;
  },
};