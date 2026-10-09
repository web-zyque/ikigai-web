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
      queryClient.setQueryData(['products', updatedProduct.id], updatedProduct);
      console.log('Product updated successfully');
    },
    onError: (error: any) => {
      console.error('Failed to update product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      console.log('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('Failed to delete product:', error);
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
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