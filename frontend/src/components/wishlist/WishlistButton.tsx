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
      className={cn(
        'h-9 w-9 rounded-full transition-all',
        inWishlist 
          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
          : 'hover:bg-muted',
        className
      )}
      onClick={handleClick}
    >
      <Heart className={cn('h-5 w-5', inWishlist && 'fill-current text-primary')} />
    </Button>
  );
}
