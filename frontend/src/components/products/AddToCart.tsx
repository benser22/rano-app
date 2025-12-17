"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { toast } from 'sonner';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartProps {
  product: Product;
}

const AddToCart = ({ product }: AddToCartProps) => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  // State for selected options
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Parse available options (assuming they are strings in the array)
  // If your product model stores them differently, adjust here.
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const handleAddToCart = () => {
    // Validation
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Por favor, seleccioná un talle', {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    if (colors.length > 0 && !selectedColor) {
      toast.error('Por favor, seleccioná un color', {
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    // Check stock limit for this specific variant
    // We treat stock as global for the product ID, not per variant unless Strapi has a variant model.
    // Assuming product.stock is the total stock for this SKU/Product ID regardless of variant 
    // (a common simplified e-commerce model, though ideally variants have their own stock).
    // If variants share the same product ID, we must sum up all cart items with this product ID.
    // OR if uniqueId is distinct but stock is shared, check against product.stock.

    // Calculate total quantity of this product (across all variants) currently in cart
    const currentQuantityInCart = items
      .filter(item => item.productId === product.id.toString())
      .reduce((acc, item) => acc + item.quantity, 0);

    if (currentQuantityInCart + 1 > product.stock) {
      toast.error('No hay suficiente stock disponible', {
        description: `Solo quedan ${product.stock} unidades.`,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    setLoading(true);

    // Generate unique ID for cart item including options
    const uniqueId = `${product.id}-${selectedSize || 'nosize'}-${selectedColor || 'nocolor'}`;

    addItem({
      id: uniqueId,
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      slug: product.slug,
      images: product.images,
      quantity: 1,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      stock: product.stock,
    });

    // Show success feedback
    setTimeout(() => {
      setLoading(false);
      setAdded(true);

      toast.success('¡Agregado al carrito!', {
        description: `${product.name} ${selectedSize ? `- ${selectedSize}` : ''} ${selectedColor ? `- ${selectedColor}` : ''}`,
        action: {
          label: 'Ver carrito',
          onClick: () => window.location.href = '/carrito',
        },
      });

      // Reset button after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-foreground">Talle</h3>
            {/* Optional: Add size guide link here if needed */}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes
              .sort((a, b) => {
                // Intelligent sort for sizes
                const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                const aIndex = sizeOrder.indexOf(a.toUpperCase());
                const bIndex = sizeOrder.indexOf(b.toUpperCase());
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                const aNum = parseFloat(a);
                const bNum = parseFloat(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
              })
              .map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[3rem] h-10 px-3 flex items-center justify-center rounded-md border text-sm font-medium transition-all",
                    selectedSize === size
                      ? "text-black text-primary font-extrabold ring-3 ring-primary ring-offset-0"
                      : "bg-background hover:bg-muted text-foreground border-input hover:border-foreground/30"
                  )}
                >
                  {size}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.sort().map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  selectedColor === color
                    ? "text-black text-primary font-extrabold ring-3 ring-primary ring-offset-0"
                    : "bg-background hover:bg-muted text-foreground border-input hover:border-foreground/30"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={handleAddToCart}
        disabled={loading || product.stock <= 0}
        size="lg"
        className={cn(
          "w-full md:w-auto min-w-[200px] gap-2 transition-all duration-300",
          added ? "bg-green-600 hover:bg-green-700" : ""
        )}
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            Agregando...
          </>
        ) : added ? (
          <>
            <Check className="h-5 w-5" />
            ¡Agregado!
          </>
        ) : product.stock <= 0 ? (
          'Sin Stock'
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Agregar al Carrito
          </>
        )}
      </Button>
    </div>
  );
};

export default AddToCart;
