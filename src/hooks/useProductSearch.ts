'use client';

import { IProduct } from '@/types/store';
import { useState, useMemo } from 'react';

interface IProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  sizes?: string[];
  colors?: string[];
}

interface IUseProductSearchProps {
  products: IProduct[];
  initialFilters?: IProductFilters;
}

interface IUseProductSearchReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: IProductFilters;
  setFilters: (filters: IProductFilters) => void;
  updateFilter: <K extends keyof IProductFilters>(
    key: K,
    value: IProductFilters[K]
  ) => void;
  clearFilters: () => void;
  filteredProducts: IProduct[];
  totalResults: number;
  isFiltering: boolean;
}

export const useProductSearch = ({
  products,
  initialFilters = {},
}: IUseProductSearchProps): IUseProductSearchReturn => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<IProductFilters>(initialFilters);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term)
      );
    }

    // Filtrar por categoría
    if (filters.category) {
      result = result.filter(
        product =>
          product.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Filtrar por precio mínimo
    if (filters.minPrice !== undefined) {
      result = result.filter(product => product.price >= filters.minPrice!);
    }

    // Filtrar por precio máximo
    if (filters.maxPrice !== undefined) {
      result = result.filter(product => product.price <= filters.maxPrice!);
    }

    // Filtrar por stock
    if (filters.inStock !== undefined) {
      result = result.filter(product =>
        filters.inStock ? product.stock > 0 : product.stock === 0
      );
    }

    // Filtrar por productos en oferta
    if (filters.onSale !== undefined) {
      result = result.filter(product =>
        filters.onSale
          ? product.discount && product.discount > 0
          : !product.discount || product.discount === 0
      );
    }

    // Filtrar por tallas
    if (filters.sizes && filters.sizes.length > 0) {
      result = result.filter(product =>
        product.sizes?.some(size => filters.sizes!.includes(size))
      );
    }

    // Filtrar por colores
    if (filters.colors && filters.colors.length > 0) {
      result = result.filter(product =>
        product.colors?.some(color => filters.colors!.includes(color))
      );
    }

    return result;
  }, [products, searchTerm, filters]);

  const updateFilter = <K extends keyof IProductFilters>(
    key: K,
    value: IProductFilters[K]
  ): void => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = (): void => {
    setFilters({});
    setSearchTerm('');
  };

  const isFiltering = useMemo(() => {
    return (
      searchTerm.trim() !== '' ||
      Object.keys(filters).some(key => {
        const value = filters[key as keyof IProductFilters];
        return (
          value !== undefined &&
          value !== null &&
          (Array.isArray(value) ? value.length > 0 : true)
        );
      })
    );
  }, [searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredProducts,
    totalResults: filteredProducts.length,
    isFiltering,
  };
};

export default useProductSearch;
