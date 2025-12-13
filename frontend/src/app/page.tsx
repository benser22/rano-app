import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAPI, getMediaUrl } from '@/lib/api/strapi';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/types';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';

async function getFeaturedProducts() {
  try {
    const data = await fetchAPI('/products', {
      populate: ['images', 'category'],
      filters: {
        featured: { $eq: true }
      },
      pagination: { limit: 8 }
    });
    return data.data as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

async function getCategories() {
  try {
    const data = await fetchAPI('/categories', {
      populate: ['products']
    });
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories()
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] w-full bg-secondary text-secondary-foreground flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary to-black/90" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  Nueva Colección 2025
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
                Estilo
                <span className="text-primary"> Urbano</span>
                <br />
                Sin Límites
              </h1>
              
              <p className="text-xl text-secondary-foreground/80 max-w-lg">
                Descubrí la nueva línea de ropa urbana. Diseños exclusivos que marcan tendencia.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/productos">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2 group">
                    Ver Colección
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/productos?category=sale">
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-secondary-foreground/30 hover:bg-secondary-foreground/10"
                  >
                    Ver Ofertas
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-75" />
                <Image
                  src="/rano_logo.png"
                  alt="Rano Urban"
                  width={400}
                  height={400}
                  className="relative z-10 drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-muted py-6 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center gap-3 text-center md:text-left">
              <Truck className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold">Envío Gratis</h3>
                <p className="text-sm text-muted-foreground">En compras +$50.000</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-center md:text-left">
              <Shield className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold">Compra Segura</h3>
                <p className="text-sm text-muted-foreground">Pago 100% protegido</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-center md:text-left">
              <RefreshCw className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold">Cambios Gratis</h3>
                <p className="text-sm text-muted-foreground">30 días para cambiar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Categorías</h2>
          <Link href="/productos" className="text-primary hover:underline text-sm font-medium">
            Ver todas →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Remeras', slug: 'remeras', emoji: '👕' },
            { name: 'Gorras', slug: 'gorras', emoji: '🧢' },
            { name: 'Buzos', slug: 'buzos', emoji: '🧥' },
            { name: 'Accesorios', slug: 'accesorios', emoji: '⌚' },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?category=${cat.slug}`}
              className="group relative h-40 md:h-52 overflow-hidden rounded-xl bg-muted flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <span className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <div className="absolute bottom-4 left-4 z-20">
                <span className="text-white text-xl font-bold">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Productos Destacados</h2>
              <p className="text-muted-foreground mt-1">Lo más vendido de la temporada</p>
            </div>
            <Link href="/productos" className="text-primary hover:underline text-sm font-medium hidden sm:block">
              Ver todos →
            </Link>
          </div>
          
          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Pronto agregaremos productos destacados.</p>
              <Link href="/productos">
                <Button className="mt-4">Ver todos los productos</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 sm:hidden">
            <Link href="/productos">
              <Button variant="outline">Ver todos los productos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unite a la comunidad <span className="text-primary">Rano Urban</span>
            </h2>
            <p className="text-secondary-foreground/80 mb-6">
              Suscribite y recibí un 15% de descuento en tu primera compra, 
              además de acceso exclusivo a nuevos lanzamientos y ofertas especiales.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Tu email"
                className="px-4 py-3 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 flex-1"
              />
              <Button size="lg" className="px-8">
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
