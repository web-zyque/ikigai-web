import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productsApi,
  categoriesApi,
} from '@/services/products.service';
import { CreateProductRequest, GetProductsParams, ProductResponse } from '@/types/products.types';


export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      console.log('Product created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create product:', error);
    },
  });
};

export const useProducts = (params: GetProductsParams = {}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductRequest> }) =>
      productsApi.update(id, data),
    onSuccess: (updatedProduct: ProductResponse) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.setQueryData(['products', updatedProduct.id], updatedProduct);
      queryClient.setQueryData(['store-products', updatedProduct.id], updatedProduct);
      console.log('Product updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update product:', error);
    },
  });
};

export const useAddStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      productsApi.addStock(id, quantity),
    onSuccess: (updatedProduct: ProductResponse) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      queryClient.setQueryData(['products', updatedProduct.id], updatedProduct);
      queryClient.setQueryData(['store-products', updatedProduct.id], updatedProduct);
      console.log('Stock added successfully');
    },
    onError: (error: any) => {
      console.error('Failed to add stock:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
      console.log('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete product:', error);
    },
  });
};

export const useCategories = (params?: { includeArchived?: boolean }) => {
  return useQuery({
    queryKey: ['categories', params?.includeArchived ? 'all' : 'active'],
    queryFn: () => categoriesApi.getAll(params),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; imageUrl: string }) =>
      categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      console.log('Category created successfully');
    },
    onError: (error: any) => {
      console.error('Failed to create category:', error);
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; imageUrl?: string } }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      console.log('Category updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update category:', error);
    },
  });
};

export const useArchiveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      console.error('Failed to archive category:', error);
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      console.error('Failed to restore category:', error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete category:', error);
    },
  });
};