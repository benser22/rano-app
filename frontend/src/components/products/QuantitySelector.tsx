"use client";

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Quantity selector with +/- buttons
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const sizeClasses = {
    sm: {
      button: 'h-7 w-7',
      icon: 'h-3 w-3',
      text: 'w-8 text-sm',
    },
    md: {
      button: 'h-9 w-9',
      icon: 'h-4 w-4',
      text: 'w-10 text-base',
    },
    lg: {
      button: 'h-11 w-11',
      icon: 'h-5 w-5',
      text: 'w-12 text-lg',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex items-center border rounded-md', className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(sizes.button, 'rounded-r-none')}
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus className={sizes.icon} />
      </Button>
      
      <span className={cn(
        'text-center font-medium select-none',
        sizes.text
      )}>
        {value}
      </span>
      
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(sizes.button, 'rounded-l-none')}
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus className={sizes.icon} />
      </Button>
    </div>
  );
}
