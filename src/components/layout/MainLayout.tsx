'use client';

import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { cn } from '@/lib/utils';

interface IBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface IMainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: IBreadcrumbItem[];
  containerClassName?: string;
}

export const MainLayout: React.FC<IMainLayoutProps> = ({
  children,
  className,
  showBreadcrumb = false,
  breadcrumbItems = [],
  containerClassName,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'container mx-auto px-4 py-6',
        containerClassName
      )}>
        {/* Breadcrumb */}
        {showBreadcrumb && breadcrumbItems.length > 0 && (
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        
        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;