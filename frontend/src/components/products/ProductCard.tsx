"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/api/strapi';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { ProductBadge } from '@/components/products/ProductBadge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.images && product.images.length > 0
    ? getMediaUrl(product.images[0].url)
    : '/avif/placeholder.avif';

  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  // Determine if user MUST make a selection (more than 1 option available)
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const hasMultipleOptions = sizes.length > 1 || colors.length > 1;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) return;

    // If there are multiple options, user must visit page to select
    if (hasMultipleOptions) {
      window.location.href = `/productos/${product.slug}`;
      return;
    }

    // Check stock limit for quick add
    const currentQuantityInCart = items
      .filter(item => item.productId === product.id.toString())
      .reduce((acc, item) => acc + item.quantity, 0);

    if (currentQuantityInCart + 1 > product.stock) {
      toast.error('No hay suficiente stock disponible', {
        description: `Solo quedan ${product.stock} unidades.`,
      });
      return;
    }

    // Auto-select the single available option if exists
    const autoSize = sizes.length === 1 ? sizes[0] : undefined;
    const autoColor = colors.length === 1 ? colors[0] : undefined;

    // Unique ID generation for stored item match
    const uniqueId = `${product.id}-${autoSize || 'nosize'}-${autoColor || 'nocolor'}`;

    addItem({
      id: uniqueId,
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      slug: product.slug,
      images: product.images,
      quantity: 1,
      selectedSize: autoSize,
      selectedColor: autoColor,
      stock: product.stock
    });

    toast.success('¡Agregado al carrito!', {
      description: `${product.name} ${autoSize ? `(${autoSize})` : ''}`,
    });
  };

  return (
    <Card className="overflow-hidden group relative border-0 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 pointer-events-none">
        {product.stock <= 0 && <ProductBadge type="outOfStock" className="relative" />}
        {hasDiscount && <ProductBadge type="sale" discount={discountPercent} className="relative" />}
      </div>

      {/* Wishlist button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <WishlistButton product={product} />
      </div>

      <Link href={`/productos/${product.slug}`} className="block relative">
        <div className="aspect-[3/4] overflow-hidden bg-muted relative">
          <ImageWithFallback
            src={imageUrl || ''}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover w-full h-full transition-transform duration-500 group-hover:scale-110",
              product.stock <= 0 && "opacity-60 grayscale"
            )}
          />

          {/* Out of Stock Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
              <span className="bg-foreground text-background font-bold px-3 py-1 rounded text-sm uppercase tracking-wider">
                Agotado
              </span>
            </div>
          )}

          {/* Hover overlay with quick actions (only if in stock) */}
          {product.stock > 0 && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          )}

          {/* Quick view button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shadow-lg pointer-events-none"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 flex-1">
        <Link href={`/productos/${product.slug}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-muted-foreground mt-1">
            {product.category.name}
          </p>
        )}

        <div className="mt-2">
          <PriceDisplay
            price={product.price}
            comparePrice={product.comparePrice}
            size="md"
          />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          className="w-full gap-2"
          onClick={handleQuickAdd}
          disabled={product.stock <= 0}
          variant={product.stock <= 0 ? 'secondary' : (hasMultipleOptions ? 'outline' : 'default')}
        >
          {product.stock <= 0 ? (
            'Sin Stock'
          ) : hasMultipleOptions ? (
            <>
              <Eye className="h-4 w-4" />
              Ver Opciones
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Agregar
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;

