'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common';
import { Card, ProductPlaceholder } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { IProduct } from '@/types/store';

interface IProductCardProps {
  product: IProduct;
  className?: string;
  showQuickAdd?: boolean;
}

export const ProductCard: React.FC<IProductCardProps> = ({
  product,
  className,
  showQuickAdd = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.split(',')[0]?.trim() || 'M'
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.split(',')[0]?.trim() || 'Negro'
  );
  const [isFavorite, setIsFavorite] = useState(false);

  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1, selectedSize, selectedColor);
  };

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  return (
    <motion.div
      className={cn('group', className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.split(',')[0]?.trim() ? (
            <Image
              src={product.images.split(',')[0].trim()}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ProductPlaceholder className="w-full h-full" />
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-brand-orange text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute top-2 right-2 p-2 bg-card rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-accent"
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-colors',
                isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </button>

          {/* Quick Add Button */}
          {showQuickAdd && (
            <motion.div
              className="absolute bottom-2 left-2 right-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={handleAddToCart}
                className="w-full bg-foreground text-background hover:bg-foreground/90"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Agregar al carrito
              </Button>
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.category?.name || 'Sin categoría'}
          </p>

          {/* Name */}
          <h3 className="font-medium text-foreground mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({product.rating})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              ${product.discountPrice || product.price}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.price}
              </span>
            )}
          </div>

          {/* Size and Color Selection */}
          <div className="space-y-2">
            {product.sizes && product.sizes.trim().length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Talla:
                </label>
                <div className="flex gap-1">
                  {product.sizes.split(',').map((size: string) => (
                    <button
                      key={size.trim()}
                      onClick={() => setSelectedSize(size.trim())}
                      className={cn(
                        'px-2 py-1 text-xs border rounded transition-colors',
                        selectedSize === size.trim()
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground/50'
                      )}
                    >
                      {size.trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.trim().length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Color:
                </label>
                <div className="flex gap-1">
                  {product.colors.split(',').map((color: string) => (
                    <button
                      key={color.trim()}
                      onClick={() => setSelectedColor(color.trim())}
                      className={cn(
                        'px-2 py-1 text-xs border rounded transition-colors',
                        selectedColor === color.trim()
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border hover:border-foreground/50'
                      )}
                    >
                      {color.trim()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
