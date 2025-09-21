'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { Loading } from '@/components/ui';
import { IProduct } from '@/types/store';

interface IProductGridProps {
  products: IProduct[];
  loading?: boolean;
  className?: string;
  columns?: 2 | 3 | 4;
  showQuickAdd?: boolean;
}

const columnClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const ProductGrid: React.FC<IProductGridProps> = ({
  products,
  loading = false,
  className,
  columns = 4,
  showQuickAdd = true,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" text="Cargando productos..." />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No se encontraron productos</div>
        <p className="text-gray-400">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        'grid gap-6',
        columnClasses[columns],
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={itemVariants}
          custom={index}
        >
          <ProductCard
            product={product}
            showQuickAdd={showQuickAdd}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductGrid;