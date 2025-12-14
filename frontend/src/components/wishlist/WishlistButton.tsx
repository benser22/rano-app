"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/store/wishlistStore';
import { Product } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  product: Product;
  variant?: 'icon' | 'button';
  className?: string;
}

export function WishlistButton({ product, variant = 'icon', className }: WishlistButtonProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleItem(product);

    if (inWishlist) {
      toast.success('Eliminado de favoritos', { description: product.name });
    } else {
      toast.success('Agregado a favoritos', { description: product.name });
    }
  };

  if (variant === 'button') {
    return (
      <Button
        variant={inWishlist ? 'default' : 'outline'}
        size="lg"
        className={cn('gap-2', className)}
        onClick={handleClick}
      >
        <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
        {inWishlist ? 'En favoritos' : 'Agregar a favoritos'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={inWishlist ? 'Eliminar de favoritos' : 'Agregar a favoritos'}
      className={cn(
        'h-10 w-10 rounded-full transition-all shadow-sm bg-white/90 hover:bg-white',
        inWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-600 hover:text-red-500',
        className
      )}
      onClick={handleClick}
    >
      <Heart className={cn('h-6 w-6', inWishlist && 'fill-current')} />
    </Button>
  );
}
