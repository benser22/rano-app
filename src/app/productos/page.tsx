'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { MainLayout, ProductGrid } from '@/components/layout';
import { Button, Input, Select } from '@/components/common';
import { Modal } from '@/components/ui';
import { useProducts, useCategories } from '@/hooks';

const ProductsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { products, loading } = useProducts({ categoryId: selectedCategory || undefined });
  const { categories } = useCategories();

  // Simple client-side filtering
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const breadcrumbItems = [
    { label: 'Productos', current: true },
  ];

  const displayProducts = filteredProducts;
  const displayTotal = filteredProducts.length;

  return (
    <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-gray-600 mt-1">
              {displayTotal} producto{displayTotal !== 1 ? 's' : ''} encontrado{displayTotal !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value || null)}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              placeholder="Filtrar por categoría"
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
              {(searchTerm || selectedCategory) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {(searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {searchTerm && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Búsqueda: &quot;{searchTerm}&quot;
              </span>
            )}
            {selectedCategory && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Categoría: {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
              className="text-red-600 hover:text-red-700"
            >
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {displayProducts.length === 0 && !loading ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-6">No hay productos disponibles</h2>
            <p className="text-gray-600 mb-8">Intenta ajustar tus filtros de búsqueda o explora otras categorías.</p>
          </div>
        ) : (
          <ProductGrid
            products={displayProducts}
            loading={loading}
            columns={viewMode === 'grid' ? 4 : 2}
          />
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
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-3">Categorías</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={!selectedCategory}
                  onChange={() => setSelectedCategory(null)}
                  className="mr-2"
                />
                Todas las categorías
              </label>
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className="mr-2"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(null);
              }}
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

export default ProductsPage;