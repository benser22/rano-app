'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Package } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Card, Loading } from '@/components/ui';
import { useCategories } from '@/hooks';

const CategoriesPage: React.FC = () => {
  const { categories, loading, error } = useCategories();

  const breadcrumbItems = [
    { label: 'Categorías', current: true },
  ];

  if (loading) {
    return (
      <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" text="Cargando categorías..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-2">Error al cargar categorías</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Nuestras Categorías</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia selección de productos organizados por categorías. 
            Encuentra exactamente lo que buscas.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 text-lg mb-2">No hay categorías disponibles</div>
            <p className="text-gray-400">Las categorías se mostrarán aquí cuando estén disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categorias/${category.slug}`}>
                <Card className="h-64 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-blue-200">
                  <div className="h-full flex flex-col justify-between p-6">
                    {/* Icon and Title */}
                    <div className="text-center">
                      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {category.icon || '🏷️'}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>

                    {/* Product Count and Arrow */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-muted-foreground">
                        {category.productCount || 0} producto{(category.productCount || 0) !== 1 ? 's' : ''}
                      </span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Categories Section */}
        {categories.length > 0 && (
          <section className="bg-muted rounded-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Categorías Destacadas</h2>
              <p className="text-muted-foreground">
                Las categorías más populares entre nuestros clientes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((category) => (
                <Link key={`featured-${category.id}`} href={`/categorias/${category.slug}`}>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon || '🏷️'}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-center text-primary group-hover:text-primary/80">
                      <span className="text-sm font-medium">Explorar</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action */}
        <section className="text-center bg-primary text-primary-foreground rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-primary-foreground/80 mb-6">
            Explora todos nuestros productos o usa nuestro buscador para encontrar exactamente lo que necesitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/productos">
              <Card className="bg-background text-foreground hover:bg-accent transition-colors cursor-pointer px-6 py-3">
                <div className="flex items-center">
                  Ver Todos los Productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Card>
            </Link>
            <Link href="/contacto">
              <Card className="bg-primary/80 text-primary-foreground hover:bg-primary/70 transition-colors cursor-pointer px-6 py-3">
                <div className="flex items-center">
                  Contactar Soporte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CategoriesPage;