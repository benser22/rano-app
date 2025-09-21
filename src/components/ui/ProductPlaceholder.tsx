'use client';

import React from 'react';
import { Package } from 'lucide-react';

interface IProductPlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductPlaceholder: React.FC<IProductPlaceholderProps> = ({
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.1)" />
          </linearGradient>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--brand-orange))" />
            <stop offset="100%" stopColor="hsl(var(--brand-purple))" />
          </linearGradient>
        </defs>
        
        {/* Background */}
        <rect width="200" height="200" fill="url(#bgGradient)" />
        
        {/* Decorative circles */}
        <circle cx="40" cy="40" r="20" fill="hsl(var(--muted-foreground) / 0.05)" />
        <circle cx="160" cy="160" r="25" fill="hsl(var(--muted-foreground) / 0.05)" />
        <circle cx="170" cy="30" r="15" fill="hsl(var(--muted-foreground) / 0.05)" />
        
        {/* Main icon container */}
        <circle cx="100" cy="100" r="35" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="2" />
        
        {/* Package icon */}
        <g transform="translate(100, 100)">
          <rect x="-12" y="-12" width="24" height="24" fill="none" />
          <path
            d="M-8 -8 L8 -8 L8 8 L-8 8 Z M-8 -8 L0 -12 L8 -8 M0 -12 L0 8"
            stroke="url(#iconGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Subtle pattern */}
        <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
          <circle cx="10" cy="10" r="1" fill="hsl(var(--muted-foreground) / 0.1)" />
        </pattern>
        <rect width="200" height="200" fill="url(#dots)" />
      </svg>
    </div>
  );
};

export default ProductPlaceholder;