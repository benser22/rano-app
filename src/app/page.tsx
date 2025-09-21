'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Truck, Shield, Headphones } from 'lucide-react';
import { MainLayout, ProductGrid } from '@/components/layout';
import { Button } from '@/components/common';
import { Card } from '@/components/ui';
import { useProducts, useCategories } from '@/hooks';

const HomePage: React.FC = () => {
  const { products: featuredProducts, loading: productsLoading } =
    useProducts();

  const { categories, loading: categoriesLoading } = useCategories();

  const features = [
    {
      icon: Truck,
      title: 'Envío Gratis',
      description: 'En compras mayores a $50.000',
    },
    {
      icon: Shield,
      title: 'Compra Segura',
      description: 'Protección en todas tus transacciones',
    },
    {
      icon: Headphones,
      title: 'Soporte 24/7',
      description: 'Atención al cliente siempre disponible',
    },
    {
      icon: Star,
      title: 'Calidad Premium',
      description: 'Productos seleccionados cuidadosamente',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 mb-12 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubre la Moda
            <span className="block text-yellow-300">que te Define</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Encuentra las últimas tendencias en ropa y accesorios. Calidad
            premium, precios increíbles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <Link href="/productos" className="flex items-center">
                Ver Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white hover:bg-white hover:text-primary"
            >
              <Link href="/categorias">Explorar Categorías</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <IconComponent className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Categorías Populares</h2>
          <Button variant="outline">
            <Link href="/categorias" className="flex items-center">
              Ver Todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse bg-muted rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map(category => (
              <Link key={category.id} href={`/categorias/${category.id}`}>
                <Card className="h-48 bg-gradient-to-br from-muted to-accent hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="h-full flex flex-col justify-center items-center p-6">
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                      🏷️
                    </div>
                    <h3 className="text-lg font-semibold text-center">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {category.description || 'Categoría de productos'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Productos Destacados</h2>
          <Button variant="outline">
            <Link href="/productos" className="flex items-center">
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ProductGrid
          products={featuredProducts}
          loading={productsLoading}
          columns={4}
        />
      </section>

      {/* Newsletter Section */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Mantente al Día
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Suscríbete a nuestro newsletter y recibe las últimas novedades,
          ofertas exclusivas y tendencias de moda directamente en tu email.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <input
            type="email"
            placeholder="Tu email"
            className="flex-1 px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Suscribirse
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
