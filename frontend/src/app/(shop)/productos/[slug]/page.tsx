import { fetchAPI, getMediaUrl } from '@/lib/api/strapi';
import { Product } from '@/types';
import AddToCart from '@/components/products/AddToCart';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Truck, RefreshCw, Shield, ChevronRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/products/ProductCard';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const data = await fetchAPI('/products', {
    filters: {
      slug: {
        $eq: slug
      }
    },
    populate: ['images', 'category']
  });

  if (!data.data || data.data.length === 0) return null;
  return data.data[0] as Product;
}

async function getRelatedProducts(categorySlug: string, currentProductId: number) {
  try {
    const data = await fetchAPI('/products', {
      filters: {
        category: {
          slug: { $eq: categorySlug }
        },
        id: { $ne: currentProductId }
      },
      populate: ['images', 'category'],
      pagination: { limit: 4 }
    });
    return data.data as Product[];
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.category 
    ? await getRelatedProducts(product.category.slug, product.id)
    : [];

  const mainImage = product.images && product.images.length > 0 
    ? getMediaUrl(product.images[0].url) 
    : '/placeholder.png';

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/productos" className="hover:text-foreground transition-colors">Productos</Link>
            {product.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link 
                  href={`/productos?category=${product.category.slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              <ImgWithFallback
                src={mainImage || ''}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                </span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 ${
                      idx === 0 ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <ImgWithFallback
                      src={getMediaUrl(img.url) || ''}
                      alt={`${product.name} - ${idx + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Category */}
            {product.category && (
              <Link 
                href={`/productos?category=${product.category.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
            
            {/* Price */}
            <PriceDisplay
              price={product.price}
              comparePrice={product.comparePrice}
              size="xl"
            />

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm text-green-600 font-medium">
                    En stock ({product.stock} disponibles)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 font-medium">Sin stock</span>
                </>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div className="prose max-w-none text-muted-foreground">
              <h3 className="text-foreground font-semibold text-lg mb-2">Descripción</h3>
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>
                  Producto de alta calidad de la línea Rano Urban. 
                  Diseño exclusivo con materiales premium para máxima comodidad.
                </p>
              )}
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              <AddToCart product={product} />
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Envío gratis</p>
                  <p className="text-muted-foreground">+$50.000</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Cambios</p>
                  <p className="text-muted-foreground">30 días</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Compra segura</p>
                  <p className="text-muted-foreground">100% protegido</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground space-y-1 pt-4">
              <p><span className="font-medium text-foreground">SKU:</span> {product.slug.toUpperCase()}</p>
              {product.category && (
                <p><span className="font-medium text-foreground">Categoría:</span> {product.category.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-8 border-t">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Productos Relacionados</h2>
              {product.category && (
                <Link 
                  href={`/productos?category=${product.category.slug}`}
                  className="text-primary hover:underline text-sm"
                >
                  Ver más →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
