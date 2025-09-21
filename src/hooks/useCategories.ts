'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/stores/productStore';
import { ICategory } from '@/types/store';

interface IUseCategoriesReturn {
  categories: ICategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCategoryById: (id: string) => ICategory | undefined;
}

export const useCategories = (
  autoFetch: boolean = true
): IUseCategoriesReturn => {
  const { categories, loading, error, fetchCategories } = useProductStore();

  const refetch = async () => {
    await fetchCategories();
  };

  const getCategoryById = (id: string): ICategory | undefined => {
    return categories.find(category => category.id === id);
  };

  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [autoFetch, fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch,
    getCategoryById,
  };
};

export default useCategories;
