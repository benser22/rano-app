"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { Product } from '@/types';
import { toast } from 'sonner';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartProps {
  product: Product;
}

const AddToCart = ({ product }: AddToCartProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    setLoading(true);
    
    addItem({
      id: product.id.toString(),
      productId: product.id.toString(),
      name: product.name,
      price: product.price,
      slug: product.slug,
      images: product.images,
      quantity: 1,
    });
    
    // Show success feedback
    setTimeout(() => {
      setLoading(false);
      setAdded(true);
      
      toast.success('¡Agregado al carrito!', {
        description: product.name,
        action: {
          label: 'Ver carrito',
          onClick: () => window.location.href = '/carrito',
        },
      });
      
      // Reset button after 2 seconds
      setTimeout(() => setAdded(false), 2000);
    }, 300);
  };

  return (
    <Button 
      onClick={handleAddToCart} 
      disabled={loading || product.stock <= 0} 
      size="lg" 
      className={`w-full md:w-auto gap-2 transition-all duration-300 ${
        added ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
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
  );
};

export default AddToCart;
