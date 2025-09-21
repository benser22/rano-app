import React from 'react';
import { cn } from '@/lib/utils';

interface ILoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const colorClasses = {
  primary: 'border-blue-600',
  secondary: 'border-gray-600',
  white: 'border-white',
};

const Spinner: React.FC<{ size: 'sm' | 'md' | 'lg'; color: 'primary' | 'secondary' | 'white' }> = ({ size, color }) => (
  <div
    className={cn(
      'animate-spin rounded-full border-2 border-t-transparent',
      sizeClasses[size],
      colorClasses[color]
    )}
  />
);

export const Loading: React.FC<ILoadingProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className,
  fullScreen = false,
}) => {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Spinner size={size} color={color} />
      {text && (
        <p className={cn(
          'text-sm',
          color === 'white' ? 'text-white' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
        {content}
      </div>
    );
  }

  return content;
};

// Componente para botones con loading
export const ButtonLoading: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => (
  <Spinner size={size} color="white" />
);

export default Loading;