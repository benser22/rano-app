"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAPI } from '@/lib/api/strapi';
import { Product } from '@/types';
import { ArrowDown, ArrowUp, ArrowUpAZ, Clock, Grid3X3, LayoutGrid, Loader2 } from 'lucide-react';

interface ProductGridProps {
  initialProducts: Product[];
  category?: string;
  search?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
}

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'name-asc';

const PRODUCTS_PER_PAGE = 12;

export function ProductGrid({
  initialProducts,
  category,
  search,
  priceRange,
  minPrice,
  maxPrice,
}: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length >= PRODUCTS_PER_PAGE);
  const [page, setPage] = useState(1);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'recent'
  );

  // Update products when initialProducts change (filters change)
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length >= PRODUCTS_PER_PAGE);
  }, [initialProducts]);

  // Sort products client-side
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'recent':
      default:
        return 0; // Keep original order (most recent from API)
    }
  });

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    // Update URL with sort param
    const params = new URLSearchParams(searchParams.toString());
    if (newSort !== 'recent') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const filters: any = {};

      if (category) {
        filters.category = { slug: { $eq: category } };
      }

      if (search) {
        filters.$or = [
          { name: { $containsi: search } },
          { description: { $containsi: search } },
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filters.price = {};
        if (minPrice !== undefined) filters.price.$gte = minPrice;
        if (maxPrice !== undefined) filters.price.$lte = maxPrice;
      }

      const data = await fetchAPI('/products', {
        populate: ['images', 'category'],
        filters,
        pagination: {
          start: page * PRODUCTS_PER_PAGE,
          limit: PRODUCTS_PER_PAGE
        },
      });

      const newProducts = data.data as Product[];

      if (newProducts.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }

      setProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sortedProducts.length === 0) {
    return (
      <div className="flex-1">
        <div className="text-center py-16 bg-card rounded-lg shadow-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            No hay productos que coincidan con los filtros seleccionados.
            Probá con otros filtros o explorá todas las categorías.
          </p>
          <Link href="/productos">
            <Button size="lg">Ver todos los productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Sort & View Options */}
      <div className="flex items-center justify-between mb-6 bg-card rounded-lg p-3 shadow-sm border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">Ordenar:</span>
          <Select value={sortBy} onValueChange={(value: SortOption) => handleSortChange(value)}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent" className="flex items-center gap-2">
                <Clock size={16} />
                Más recientes
              </SelectItem>

              <SelectItem value="price-asc" className="flex items-center gap-2">
                <ArrowDown size={16} />
                Precio: menor
              </SelectItem>

              <SelectItem value="price-desc" className="flex items-center gap-2">
                <ArrowUp size={16} />
                Precio: mayor
              </SelectItem>

              <SelectItem value="name-asc" className="flex items-center gap-2">
                <ArrowUpAZ size={16} />
                Nombre A–Z
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={gridCols === 3 ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setGridCols(3)}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={gridCols === 2 ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setGridCols(2)}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols === 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-2'} gap-6`}>
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más productos'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
