import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  comparePrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  currency?: string;
}

/**
 * Displays price with optional compare/original price crossed out
 */
export function PriceDisplay({
  price,
  comparePrice,
  size = 'md',
  className,
  currency = '$',
}: PriceDisplayProps) {
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const compareSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn('font-bold', sizeClasses[size])}>
        {currency}{price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
      </span>
      
      {hasDiscount && (
        <>
          <span className={cn(
            'text-muted-foreground line-through',
            compareSizeClasses[size]
          )}>
            {currency}{comparePrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <span className={cn(
            'text-green-600 font-medium',
            compareSizeClasses[size]
          )}>
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  );
}
