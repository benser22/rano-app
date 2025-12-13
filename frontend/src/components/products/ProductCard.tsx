"use client";

import Link from 'next/link';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMediaUrl } from '@/lib/api/strapi';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';
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
    : '/placeholder.png';
  
  const addItem = useCartStore((state) => state.addItem);
  
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      toast.error('Producto sin stock');
      return;
    }
    
    addItem({
      id: product.id.toString(),
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      slug: product.slug,
      images: product.images,
      quantity: 1,
    });
    
    toast.success('¡Agregado al carrito!', {
      description: product.name,
    });
  };
  
  return (
    <Card className="overflow-hidden group relative border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.stock <= 0 && <ProductBadge type="outOfStock" className="relative" />}
        {hasDiscount && <ProductBadge type="sale" discount={discountPercent} className="relative" />}
        {product.featured && <ProductBadge type="featured" className="relative" />}
      </div>
      
      {/* Wishlist button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <WishlistButton product={product} />
      </div>
      
      <Link href={`/productos/${product.slug}`}>
        <div className="aspect-[3/4] overflow-hidden bg-muted relative">
          <ImgWithFallback
            src={imageUrl || ''}
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Hover overlay with quick actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Quick view button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 shadow-lg"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </Button>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
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
      
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          onClick={handleQuickAdd}
          disabled={product.stock <= 0}
          variant={product.stock <= 0 ? 'secondary' : 'default'}
        >
          {product.stock <= 0 ? (
            'Sin Stock'
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

