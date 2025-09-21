'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { MainLayout, ProductGrid } from '@/components/layout';
import { Button, Input, Select } from '@/components/common';
import { Modal, Loading } from '@/components/ui';
import { useProducts, useCategories, useProductSearch } from '@/hooks';

const CategoryPage: React.FC = () => {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { categories, getCategoryById } = useCategories();
  const category = categories.find(cat => cat.slug === slug);

  const { products, loading, totalPages, totalItems } = useProducts({
    page: currentPage,
    pageSize,
    sort: sortBy,
    filters: category ? { category: category.name } : {},
  });

  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredProducts,
    totalResults,
    isFiltering,
  } = useProductSearch({ products });

  const breadcrumbItems = [
    { label: 'Categorías', href: '/categorias' },
    { label: category?.name || 'Categoría', current: true },
  ];

  const sortOptions = [
    { value: 'createdAt:desc', label: 'Más recientes' },
    { value: 'createdAt:asc', label: 'Más antiguos' },
    { value: 'price:asc', label: 'Precio: menor a mayor' },
    { value: 'price:desc', label: 'Precio: mayor a menor' },
    { value: 'name:asc', label: 'Nombre: A-Z' },
    { value: 'name:desc', label: 'Nombre: Z-A' },
  ];

  const priceRanges = [
    { label: 'Todos los precios', min: undefined, max: undefined },
    { label: 'Menos de $25.000', min: undefined, max: 25000 },
    { label: '$25.000 - $50.000', min: 25000, max: 50000 },
    { label: '$50.000 - $100.000', min: 50000, max: 100000 },
    { label: 'Más de $100.000', min: 100000, max: undefined },
  ];

  const handlePriceRangeChange = (min?: number, max?: number) => {
    updateFilter('minPrice', min);
    updateFilter('maxPrice', max);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayProducts = isFiltering ? filteredProducts : products;
  const displayTotal = isFiltering ? totalResults : totalItems;

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
    clearFilters();
  }, [slug]);

  if (!category && categories.length > 0) {
    return (
      <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Categoría no encontrada</div>
          <p className="text-gray-600">La categoría que buscas no existe o ha sido eliminada.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
      <div className="space-y-6">
        {/* Category Header */}
        {category && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">
              {category.icon || '🏷️'}
            </div>
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <div className="mt-4 text-sm text-gray-500">
              {displayTotal} producto{displayTotal !== 1 ? 's' : ''} en esta categoría
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">
              {category?.name || 'Productos'}
            </h2>
            <span className="text-gray-500">
              ({displayTotal} producto{displayTotal !== 1 ? 's' : ''})
            </span>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar en esta categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              placeholder="Ordenar por"
              className="min-w-[180px]"
            />

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {isFiltering && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {isFiltering && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Búsqueda: &quot;{searchTerm}&quot;
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Precio: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loading size="lg" text="Cargando productos..." />
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-6">
              {isFiltering ? 'No se encontraron productos con los filtros aplicados' : 'No hay productos en esta categoría'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isFiltering ? 'Intenta ajustar tus filtros de búsqueda' : 'Explora otras categorías para encontrar lo que buscas.'}
            </p>
            {isFiltering && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <ProductGrid
            products={displayProducts}
            loading={loading}
            columns={viewMode === 'grid' ? 4 : 2}
          />
        )}

        {/* Pagination */}
        {!isFiltering && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Anterior
            </Button>
            
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10"
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtros"
        size="md"
      >
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-3">Rango de Precio</h3>
            <div className="space-y-2">
              {priceRanges.map((range, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={
                      filters.minPrice === range.min && filters.maxPrice === range.max
                    }
                    onChange={() => handlePriceRangeChange(range.min, range.max)}
                    className="mr-2"
                  />
                  {range.label}
                </label>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="font-semibold mb-3">Disponibilidad</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock === true}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? true : undefined)}
                  className="mr-2"
                />
                Solo productos en stock
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.onSale === true}
                  onChange={(e) => updateFilter('onSale', e.target.checked ? true : undefined)}
                  className="mr-2"
                />
                Solo productos en oferta
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1"
            >
              Limpiar
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              className="flex-1"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default CategoryPage;