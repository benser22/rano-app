'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/stores/productStore';
import { IProduct } from '@/types/store';

interface IUseProductsParams {
  categoryId?: string;
  autoFetch?: boolean;
  page?: number;
  pageSize?: number;
  sort?: {
    field: keyof IProduct;
    direction: 'asc' | 'desc';
  };
}

interface IUseProductsReturn {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  totalItems: number;
  refetch: () => Promise<void>;
}

export const useProducts = ({
  categoryId,
  autoFetch = true,
  page = 1,
}: IUseProductsParams = {}): IUseProductsReturn => {
  const { products, loading, error, fetchProducts } = useProductStore();

  const refetch = async () => {
    await fetchProducts(categoryId);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchProducts(categoryId);
    }
  }, [categoryId, autoFetch, fetchProducts]);

  // Calcular paginación simple (mock para prototipo)
  const itemsPerPage = 12;
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    products,
    loading,
    error,
    totalPages,
    totalItems,
    refetch,
  };
};

export default useProducts;
