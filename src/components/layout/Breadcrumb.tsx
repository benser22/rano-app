'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface IBreadcrumbProps {
  items: IBreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

export const Breadcrumb: React.FC<IBreadcrumbProps> = ({
  items,
  className,
  showHome = true,
}) => {
  const allItems = showHome
    ? [{ label: 'Inicio', href: '/' }, ...items]
    : items;

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1;
        const isHome = index === 0 && showHome;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
            )}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {isHome && <Home className="h-4 w-4 mr-1 text-muted-foreground" />}
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex items-center',
                  isLast
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                )}
              >
                {isHome && <Home className="h-4 w-4 mr-1" />}
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;