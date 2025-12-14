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
}

async function getProducts({ category, search, minPrice, maxPrice }: ProductFilters) {
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

  const data = await fetchAPI('/products', {
    populate: ['images', 'category'],
    filters,
    pagination: { limit: PRODUCTS_PER_PAGE }
  });

  return data.data as Product[];
}

async function getCategories() {
  try {
    const data = await fetchAPI('/categories', {});
    return data.data as Category[];
  } catch {
    return [];
  }
}

// Price filter options
const priceFilters = [
  { label: 'Todos', value: '', minPrice: undefined, maxPrice: undefined },
  { label: 'Hasta $10.000', value: '0-10000', minPrice: 0, maxPrice: 10000 },
  { label: '$10.000 - $25.000', value: '10000-25000', minPrice: 10000, maxPrice: 25000 },
  { label: 'Más de $25.000', value: '25000-max', minPrice: 25000, maxPrice: undefined },
];

export default async function ProductsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const category = Array.isArray(resolvedSearchParams.category) 
    ? resolvedSearchParams.category[0] 
    : resolvedSearchParams.category;
  const search = Array.isArray(resolvedSearchParams.search)
    ? resolvedSearchParams.search[0]
    : resolvedSearchParams.search;
  const priceRange = Array.isArray(resolvedSearchParams.price)
    ? resolvedSearchParams.price[0]
    : resolvedSearchParams.price;
  
  // Parse price filter
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  const selectedFilter = priceFilters.find(f => f.value === priceRange);
  
  if (selectedFilter) {
    minPrice = selectedFilter.minPrice;
    maxPrice = selectedFilter.maxPrice;
  }
  
  const [products, categories] = await Promise.all([
    getProducts({ category, search, minPrice, maxPrice }),
    getCategories()
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
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Categories */}
              <div className="bg-card rounded-lg p-5 shadow-sm">
                <h2 className="font-bold text-lg mb-4">
                  Categorías
                </h2>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/productos" 
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      !category 
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
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        category === cat.slug 
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
                        className={`px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive
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
          />
        </div>
      </div>
    </div>
  );
}

