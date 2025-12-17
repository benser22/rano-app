import { ProductGrid } from '@/components/products/ProductGrid';
import { fetchAPI } from '@/lib/api/strapi';
import { Category, Product } from '@/types';
import { Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getCategoryName } from '@/constants/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Explorá nuestra colección de ropa urbana. Remeras, gorras, buzos y accesorios con diseños exclusivos de streetwear.',
  openGraph: {
    title: 'Productos | Rano Urban',
    description: 'Catálogo completo de streetwear y ropa urbana.',
  },
};

const PRODUCTS_PER_PAGE = 12;

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  sizes?: string[];
  colors?: string[];
}

async function getProducts({ category, search, minPrice, maxPrice, sort, sizes, colors }: ProductFilters) {
  const filters: any = {};

  if (category) {
    filters.category = {
      slug: {
        $eq: category
      }
    };
  }

  if (search) {
    filters.$or = [
      { name: { $containsi: search } },
      { description: { $containsi: search } },
    ];
  }

  // Price filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    filters.price = {};
    if (minPrice !== undefined) {
      filters.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filters.price.$lte = maxPrice;
    }
  }

  // Size filtering (OR logic logic: product having ANY of selected sizes)
  if (sizes && sizes.length > 0) {
    const sizeConditions = sizes.map(s => ({ sizes: { $containsi: s } }));
    if (!filters.$and) filters.$and = [];
    filters.$and.push({ $or: sizeConditions });
  }

  // Color filtering (OR logic: product having ANY of selected colors)
  if (colors && colors.length > 0) {
    const colorConditions = colors.map(c => ({ colors: { $containsi: c } }));
    if (!filters.$and) filters.$and = [];
    filters.$and.push({ $or: colorConditions });
  }

  // Determine sort order
  let sortParam: string | string[] = 'publishedAt:desc'; // Default to newest

  if (sort) {
    switch (sort) {
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
  }

  const data = await fetchAPI('/products', {
    populate: ['images', 'category'],
    filters,
    sort: sortParam,
    pagination: { limit: PRODUCTS_PER_PAGE }
  });

  const products = data.data as Product[];

  return products;
}

// Fetch available sizes and colors from the dedicated backend endpoint
async function getAvailableFilters() {
  try {
    const data = await fetchAPI('/products/filters');
    // The endpoint returns { sizes: [...], colors: [...] } directly
    return {
      sizes: data.sizes || [],
      colors: data.colors || []
    };
  } catch (error) {
    console.error('Error fetching available filters:', error);
    return { sizes: [], colors: [] };
  }
}

async function getCategories() {
  try {
    const data = await fetchAPI('/categories', {});
    return data.data as Category[];
  } catch {
    return [];
  }
}

// Helper to build URL with applied filters
const buildFilterUrl = (
  baseUrl: string,
  params: { [key: string]: any },
  key: string,
  value: string,
  checked: boolean
) => {
  const newParams = new URLSearchParams();

  // Preserve existing params
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      v.forEach(val => newParams.append(k, val));
    } else if (v !== undefined) {
      newParams.append(k, String(v));
    }
  });

  // Modify target param
  const currentValues = newParams.getAll(key);
  if (checked) {
    if (!currentValues.includes(value)) {
      newParams.append(key, value);
    }
  } else {
    const newValues = currentValues.filter(v => v !== value);
    newParams.delete(key);
    newValues.forEach(v => newParams.append(key, v));
  }

  // Reset page if needed? (here handled by component state usually, but URL change resets state)

  return `${baseUrl}?${newParams.toString()}`;
};

// Price filter options
const priceFilters = [
  { label: 'Todos', value: '', minPrice: undefined, maxPrice: undefined },
  { label: 'Hasta $5.000', value: '0-5000', minPrice: 0, maxPrice: 5000 },
  { label: '$5.000 - $10.000', value: '5000-10000', minPrice: 5000, maxPrice: 10000 },
  { label: '$10.000 - $25.000', value: '10000-25000', minPrice: 10000, maxPrice: 25000 },
  { label: '$25.000 - $50.000', value: '25000-50000', minPrice: 25000, maxPrice: 50000 },
  { label: 'Más de $50.000', value: '50000', minPrice: 50000, maxPrice: Infinity }, // Example of adding more options
];

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;

  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined;
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;
  const priceRange = typeof resolvedSearchParams.price === 'string' ? resolvedSearchParams.price : undefined;
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined;

  // Handle array params for multi-select
  const sizes = typeof resolvedSearchParams.size === 'string' ? [resolvedSearchParams.size] : (Array.isArray(resolvedSearchParams.size) ? resolvedSearchParams.size : []);
  const colors = typeof resolvedSearchParams.color === 'string' ? [resolvedSearchParams.color] : (Array.isArray(resolvedSearchParams.color) ? resolvedSearchParams.color : []);

  // Parse price filter
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  const selectedFilter = priceFilters.find(f => f.value === priceRange);

  if (selectedFilter) {
    minPrice = selectedFilter.minPrice;
    maxPrice = selectedFilter.maxPrice;
  }

  const [products, categories, availableFilters] = await Promise.all([
    getProducts({ category, search, minPrice, maxPrice, sort, sizes, colors }),
    getCategories(),
    getAvailableFilters()
  ]);

  // Static categories as fallback
  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Remeras', slug: 'remeras', documentId: '1' },
    { id: 2, name: 'Gorras', slug: 'gorras', documentId: '2' },
    { id: 3, name: 'Buzos', slug: 'buzos', documentId: '3' },
    { id: 4, name: 'Accesorios', slug: 'accesorios', documentId: '4' },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-12">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-secondary-foreground/60 mb-4">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-secondary-foreground">Productos</span>
            {category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-secondary-foreground">{getCategoryName(category)}</span>
              </>
            )}
            {search && (
              <>
                <span className="mx-2">/</span>
                <span className="text-secondary-foreground">Búsqueda: "{search}"</span>
              </>
            )}
          </nav>
          <h1 className="text-4xl font-bold">
            {search ? (
              <span className="flex items-center gap-2">
                <Search className="h-8 w-8" />
                Resultados para "{search}"
              </span>
            ) : (
              <span>{category ? getCategoryName(category) : 'Todos los Productos'}</span>
            )}
          </h1>
          <p className="text-secondary-foreground/70 mt-2">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} encontrados
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
              {/* Categories */}
              <div className="bg-card rounded-lg p-5 shadow-sm">
                <h2 className="font-bold text-lg mb-4">
                  Categorías
                </h2>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/productos"
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${!category
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted'
                      }`}
                  >
                    Todas
                  </Link>
                  {displayCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/productos?category=${cat.slug}`}
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${category === cat.slug
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted'
                        }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-card rounded-lg p-5 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Precio</h3>
                <div className="flex flex-col gap-1">
                  {priceFilters.map((filter) => {
                    // Build URL preserving category if exists
                    const href = category
                      ? filter.value
                        ? `/productos?category=${category}&price=${filter.value}`
                        : `/productos?category=${category}`
                      : filter.value
                        ? `/productos?price=${filter.value}`
                        : '/productos';

                    const isActive = (priceRange || '') === filter.value;

                    return (
                      <Link
                        key={filter.value || 'all'}
                        href={href}
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {filter.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              {availableFilters.sizes.length > 0 && (
                <div className="bg-card rounded-lg p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Talles</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.sizes
                      .sort((a: string, b: string) => {
                        const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                        const aIndex = sizeOrder.indexOf(a.toUpperCase());
                        const bIndex = sizeOrder.indexOf(b.toUpperCase());

                        // If both are standard letter sizes
                        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                        // If only a is standard
                        if (aIndex !== -1) return -1;
                        // If only b is standard
                        if (bIndex !== -1) return 1;

                        // Try numeric sort
                        const aNum = parseFloat(a);
                        const bNum = parseFloat(b);
                        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

                        // Fallback alphabetical
                        return a.localeCompare(b);
                      })
                      .map((size: string) => {
                        const isChecked = sizes.includes(size);

                        const newParams = new URLSearchParams();
                        if (category) newParams.set('category', category);
                        if (search) newParams.set('search', search);
                        if (priceRange) newParams.set('price', priceRange);
                        if (sort) newParams.set('sort', sort);

                        colors.forEach(c => newParams.append('color', c));

                        const newSizes = isChecked
                          ? sizes.filter(s => s !== size)
                          : [...sizes, size];

                        newSizes.forEach(s => newParams.append('size', s));

                        const href = `/productos?${newParams.toString()}`;

                        return (
                          <Link
                            key={size}
                            href={href}
                            className={`
                            min-w-[2.5rem] h-9 px-2 flex items-center justify-center rounded-md border text-sm font-medium transition-all
                            ${isChecked
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-background hover:bg-muted border-input hover:border-foreground/20 text-foreground/80'
                              }
                          `}
                          >
                            {size}
                          </Link>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Color Filter */}
              {availableFilters.colors.length > 0 && (
                <div className="bg-card rounded-lg p-5 shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Colores</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableFilters.colors.sort().map((color: string) => {
                      const isChecked = colors.includes(color);

                      const newParams = new URLSearchParams();
                      if (category) newParams.set('category', category);
                      if (search) newParams.set('search', search);
                      if (priceRange) newParams.set('price', priceRange);
                      if (sort) newParams.set('sort', sort);

                      sizes.forEach(s => newParams.append('size', s));

                      const newColors = isChecked
                        ? colors.filter(c => c !== color)
                        : [...colors, color];

                      newColors.forEach(c => newParams.append('color', c));

                      const href = `/productos?${newParams.toString()}`;

                      return (
                        <Link
                          key={color}
                          href={href}
                          className={`
                            px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                            ${isChecked
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-1 ring-primary ring-offset-1'
                              : 'bg-background hover:bg-muted border-input text-foreground/80 hover:text-foreground'
                            }
                          `}
                        >
                          {color}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* Product Grid */}
          <ProductGrid
            initialProducts={products}
            category={category}
            search={search}
            priceRange={priceRange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sizes={sizes}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
}

