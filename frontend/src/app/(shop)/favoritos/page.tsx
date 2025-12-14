"use client";

import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlistStore';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/api/strapi';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';
import { Separator } from '@/components/ui/separator';
import { Heart, Trash2, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      id: item.id.toString(),
      productId: item.id.toString(),
      name: item.name,
      price: item.price,
      image: item.image ?? undefined,
      quantity: 1,
      slug: item.slug,
    });
    toast.success('Agregado al carrito', { description: item.name });
  };

  const handleRemove = (id: number, name: string) => {
    removeItem(id);
    toast.success('Eliminado de favoritos', { description: name });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <div className="bg-secondary text-secondary-foreground py-8">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
              <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-secondary-foreground">Favoritos</span>
            </nav>
            <h1 className="text-3xl font-bold">Mis Favoritos</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No tenés favoritos aún</h2>
            <p className="text-muted-foreground mb-6">
              Explorá productos y guardá los que más te gusten
            </p>
            <Link href="/productos">
              <Button size="lg">Ver Productos</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Favoritos</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Mis Favoritos</h1>
            <p className="text-secondary-foreground/70">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const imageUrl = item.image ? getMediaUrl(item.image) : '/avif/placeholder.avif';

            return (
              <div key={item.id} className="bg-card rounded-xl shadow-sm overflow-hidden group">
                {/* Image */}
                <Link href={`/productos/${item.slug}`}>
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    <ImgWithFallback
                      src={imageUrl || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemove(item.id, item.name);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <Link href={`/productos/${item.slug}`}>
                    <h3 className="font-semibold truncate hover:text-primary transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-primary mt-1">
                    ${item.price.toLocaleString('es-AR')}
                  </p>

                  <Button
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar al carrito
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => {
                clearWishlist();
                toast.success('Lista de favoritos vaciada');
              }}
            >
              Vaciar favoritos
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
