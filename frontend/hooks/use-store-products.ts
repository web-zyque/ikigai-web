import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/products.service';
import { GetProductsParams } from '@/types/products.types';


export const useStoreProducts = (params: GetProductsParams = {}) => {
  return useQuery({
    queryKey: ['store-products', params],
    queryFn: () => productsApi.getAll({
      ...params,
      publicationStatus: 'active', // Only show published products to users
    }),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
};


export const useStoreProduct = (id: string) => {
  return useQuery({
    queryKey: ['store-products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
