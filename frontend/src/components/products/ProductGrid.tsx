"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAPI } from '@/lib/api/strapi';
import { Product } from '@/types';
import { ArrowDown, ArrowUp, ArrowUpAZ, Clock, Grid3X3, LayoutGrid, Loader2, Search, SearchIcon, SearchXIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCategoryName } from '@/constants/store';

interface ProductGridProps {
  initialProducts: Product[];
  category?: string;
  search?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
}

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const PRODUCTS_PER_PAGE = 12;

export function ProductGrid({
  initialProducts,
  category,
  search,
  priceRange,
  minPrice,
  maxPrice,
  sizes,
  colors,
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

  // Products are already sorted from the server
  const sortedProducts = products;

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

  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      // For array params (size, color)
      const currentValues = params.getAll(key);
      params.delete(key);
      currentValues.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      // For single value params
      params.delete(key);
    }

    // Reset page on filter change
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const getPriceLabel = (range: string) => {
    const labels: Record<string, string> = {
      '0-5000': 'Hasta $5.000',
      '5000-10000': '$5.000 - $10.000',
      '10000-25000': '$10.000 - $25.000',
      '25000-50000': '$25.000 - $50.000',
      '50000': 'Más de $50.000',
    };
    return labels[range] || range;
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

      if (sizes && sizes.length > 0) {
        const sizeConditions = sizes.map(s => ({ sizes: { $containsi: s } }));
        if (!filters.$and) filters.$and = [];
        filters.$and.push({ $or: sizeConditions });
      }

      if (colors && colors.length > 0) {
        const colorConditions = colors.map(c => ({ colors: { $containsi: c } }));
        if (!filters.$and) filters.$and = [];
        filters.$and.push({ $or: colorConditions });
      }

      // Determine sort order for loadMore
      let sortParam: string | string[] = 'publishedAt:desc';

      switch (sortBy) {
        case 'price-asc':
          sortParam = 'price:asc';
          break;
        case 'price-desc':
          sortParam = 'price:desc';
          break;
        case 'name-asc':
          sortParam = 'name:asc';
          break;
        case 'name-desc':
          sortParam = 'name:desc';
          break;
        case 'recent':
        default:
          sortParam = 'publishedAt:desc';
          break;
      }

      const data = await fetchAPI('/products', {
        populate: ['images', 'category'],
        filters,
        sort: sortParam,
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



  return (
    <div className="flex-1">
      {/* Sort & View Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-card rounded-lg p-3 shadow-sm border gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <span className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">Ordenar:</span>
          <Select value={sortBy} onValueChange={(value: SortOption) => handleSortChange(value)}>
            <SelectTrigger className="w-[180px] bg-background">
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

              <SelectItem value="name-desc" className="flex items-center gap-2">
                <ArrowUpAZ size={16} className="rotate-180" />
                Nombre Z–A
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 items-center ml-0 sm:ml-4 border-l pl-0 sm:pl-4 border-border/50">
            {category && (
              <Badge variant="outline" className="gap-1 p-1 h-6 font-normal bg-background text-foreground hover:bg-accent border-input shadow-none">
                <span className="text-muted-foreground mr-0.5">Cat:</span>
                <span className="font-medium">{getCategoryName(category)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3.5 w-3.5 ml-1 p-0 hover:bg-muted rounded-full"
                  onClick={() => removeFilter('category')}
                >
                  <X size={10} />
                </Button>
              </Badge>
            )}

            {search && (
              <Badge variant="outline" className="gap-1 pr-1 pl-2 h-6 font-normal bg-background text-foreground hover:bg-accent border-input shadow-none">
                <span className="text-muted-foreground mr-0.5">Bus:</span>
                <span className="font-medium">"{search}"</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3.5 w-3.5 ml-1 p-0 hover:bg-muted rounded-full"
                  onClick={() => removeFilter('search')}
                >
                  <X size={10} />
                </Button>
              </Badge>
            )}

            {priceRange && (
              <Badge variant="outline" className="gap-1 pr-1 pl-2 h-6 font-normal bg-background text-foreground hover:bg-accent border-input shadow-none">
                <span className="text-muted-foreground mr-0.5">$</span>
                <span className="font-medium">{getPriceLabel(priceRange)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3.5 w-3.5 ml-1 p-0 hover:bg-muted rounded-full"
                  onClick={() => removeFilter('price')}
                >
                  <X size={10} />
                </Button>
              </Badge>
            )}

            {sizes?.map((size) => (
              <Badge key={`size-${size}`} variant="outline" className="gap-1 pr-1 pl-2 h-6 font-normal bg-background text-foreground hover:bg-accent border-input shadow-none">
                <span className="text-muted-foreground mr-0.5">T:</span>
                <span className="font-medium">{size}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3.5 w-3.5 ml-1 p-0 hover:bg-muted rounded-full"
                  onClick={() => removeFilter('size', size)}
                >
                  <X size={10} />
                </Button>
              </Badge>
            ))}

            {colors?.map((color) => (
              <Badge key={`color-${color}`} variant="outline" className="gap-1 pr-1 pl-2 h-6 font-normal bg-background text-foreground hover:bg-accent border-input shadow-none">
                <span className="text-muted-foreground mr-0.5">C:</span>
                <span className="font-medium">{color}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3.5 w-3.5 ml-1 p-0 hover:bg-muted rounded-full"
                  onClick={() => removeFilter('color', color)}
                >
                  <X size={10} />
                </Button>
              </Badge>
            ))}

            {(category || search || priceRange || (sizes && sizes.length > 0) || (colors && colors.length > 0)) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  router.push(pathname);
                }}
              >
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
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


      {/* Product Grid or Empty State */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm border">
          {/* <div className="text-6xl mb-4">🔍</div> */}
          {/* icono lucide de lupa */}
          <div className="w-full h-full flex items-center justify-center">
            <SearchXIcon size={64} className="mb-2 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            No hubo resultados que coincidan con los filtros seleccionados.
            Probá con otros o explorá todas las categorías.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              // Clear all filters
              router.push(pathname);
            }}
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
