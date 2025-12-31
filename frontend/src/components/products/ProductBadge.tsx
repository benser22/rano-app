import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

type BadgeType = 'new' | 'sale' | 'outOfStock' | 'featured' | 'limited';

interface ProductBadgeProps {
  type: BadgeType;
  discount?: number;
  className?: string;
}

/**
 * Product badge for status indicators (New, Sale, Out of Stock, etc.)
 */
export function ProductBadge({ type, discount, className }: ProductBadgeProps) {
  // Special render for featured badge - just a star icon
  if (type === 'featured') {
    return (
      <div
        className={cn(
          'absolute z-10 w-8 h-8 rounded-full bg-amber-500/90 backdrop-blur-sm flex items-center justify-center shadow-lg',
          className
        )}
      >
        <Star className="w-4 h-4 text-white fill-white" />
      </div>
    );
  }

  const badgeConfig: Record<Exclude<BadgeType, 'featured'>, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    new: {
      label: 'Nuevo',
      variant: 'default',
    },
    sale: {
      label: discount ? `-${discount}%` : 'Oferta',
      variant: 'destructive',
    },
    outOfStock: {
      label: 'Sin Stock',
      variant: 'secondary',
    },
    limited: {
      label: 'Edición Limitada',
      variant: 'outline',
    },
  };

  const config = badgeConfig[type];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'absolute z-10 font-semibold',
        type === 'sale' && 'bg-red-500 hover:bg-red-600',
        type === 'new' && 'bg-primary hover:bg-primary/90',
        type === 'limited' && 'border-primary text-primary',
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

/**
 * Container for multiple badges on a product card
 */
export function ProductBadges({
  isNew,
  isFeatured,
  discount,
  stock,
  className,
}: {
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  stock?: number;
  className?: string;
}) {
  const hasBadges = isNew || isFeatured || discount || stock === 0;

  if (!hasBadges) return null;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {stock === 0 && <ProductBadge type="outOfStock" />}
      {discount && discount > 0 && <ProductBadge type="sale" discount={discount} />}
      {isNew && <ProductBadge type="new" />}
      {isFeatured && <ProductBadge type="featured" />}
    </div>
  );
}
