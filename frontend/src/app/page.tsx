import { FeaturedCarousel } from '@/components/products/FeaturedCarousel';
import { Button } from '@/components/ui/button';
import { STORE_CATEGORIES } from '@/constants/store';
import { fetchAPI } from '@/lib/api/strapi';
import { Product } from '@/types';
import { ArrowRight, Flame, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

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
      <section className="relative min-h-[80vh] w-full flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/webp/hero.webp"
            alt="Rano Urban Hero"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-primary/20 text-muted rounded-full text-sm font-medium backdrop-blur-sm">
                  ¡Precios que sorprenden!
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-white drop-shadow-lg">
                Estilo
                <span className="text-primary"> Urbano</span>
                <br />
                Sin Límites
              </h1>

              <p className="text-xl text-white/90 max-w-lg drop-shadow-md">
                Vestite con calidad, pagá menos y disfrutá de las últimas tendencias
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/productos">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2 group">
                    Ver Prendas
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/productos?category=sale">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-white/90 text-black hover:bg-white font-semibold"
                  >
                    Ver Ofertas
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Logo */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-75" />
                <Image
                  src="/webp/rano_logo.webp"
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

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Explorá por <span className="text-primary">Categoría</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Encontrá el estilo perfecto para cada ocasión
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4">
          {STORE_CATEGORIES.map((cat) => {
            return (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl py-8 flex flex-col items-center justify-center p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} group-hover:opacity-100 transition-opacity`} />

                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

                {/* Content */}
                <div className="relative z-10 text-center text-white">
                  <h3 className="font-semibold text-lg drop-shadow-md">{cat.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 px-4">
            <div>
              <h2 className="text-3xl font-bold">Productos
                <span className="text-primary"> Destacados</span>
              </h2>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <span role="img" aria-label="fire"><Flame className="h-6 w-6 text-primary" /></span>
                Nuestros Recomendados
              </p>
            </div>
            <Link href="/productos" className="text-primary hover:underline text-sm font-medium hidden sm:inline-flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
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
            <FeaturedCarousel products={featuredProducts} />
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/productos">
              <Button variant="outline">Ver todos los productos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Visitanos en nuestro <span className="text-primary">Local</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <p className="text-lg">Av. Belgrano 3659, San Miguel de Tucumán</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-border mx-4">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.1234567890123!2d-65.2092!3d-26.8241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225c0e2e3d8f0f%3A0x1234567890abcdef!2sAv.%20Belgrano%203659%2C%20San%20Miguel%20de%20Tucum%C3%A1n%2C%20Tucum%C3%A1n!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Rano Urban"
              className="w-full"
            />
          </div>

          <div className="mt-6 text-center">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Belgrano+3659,+San+Miguel+de+Tucuman"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <MapPin className="h-4 w-4" />
              Abrir en Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
