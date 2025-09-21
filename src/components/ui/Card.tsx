import React from 'react';
import { cn } from '@/lib/utils';

interface ICardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
};

export const Card: React.FC<ICardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  rounded = 'md',
  border = true,
}) => {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground',
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        border && 'border border-border',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;