'use client';

import React from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { Card } from '@/components/ui';
import { useCartStore } from '@/stores';
import { formatPrice } from '@/utils/formatPrice';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, total, itemCount, clearCart } = useCartStore();

  const breadcrumbItems = [
    { label: 'Carrito de Compras', current: true },
  ];

  const totalItems = itemCount;
  const totalPrice = total;
  const shipping = totalPrice > 50000 ? 0 : 5000; // Envío gratis por compras mayores a $50.000
  const finalTotal = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Parece que aún no has agregado ningún producto a tu carrito. 
              ¡Explora nuestros productos y encuentra algo que te guste!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Link href="/productos" className="flex items-center">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Ver Productos
                </Link>
              </Button>
              <Button variant="outline" size="lg">
                <Link href="/categorias">Explorar Categorías</Link>
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBreadcrumb breadcrumbItems={breadcrumbItems}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Carrito de Compras</h1>
            <p className="text-muted-foreground mt-1">
              {totalItems} producto{totalItems !== 1 ? 's' : ''} en tu carrito
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Vaciar Carrito
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <Card key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={item.product.images?.split(',')[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Talla: <span className="font-medium">{item.selectedSize}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Color: <span className="font-medium">{item.selectedColor}</span>
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Precio unitario: {formatPrice(item.product.discountPrice || item.product.price)}
                      </p>
                      <p className="text-lg font-bold text-primary mt-2">
                        {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                      </p>
                    </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, Math.max(0, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.product.id, item.selectedSize, item.selectedColor)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6 text-foreground">Resumen del Pedido</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-foreground">
                  <span>Envío</span>
                  <span className={shipping === 0 ? 'text-green-600' : ''}>
                    {shipping === 0 ? 'Gratis' : formatPrice(shipping)}
                  </span>
                </div>
                
                {shipping === 0 && (
                  <p className="text-sm text-green-600">
                    🎉 ¡Envío gratis por compras mayores a $50.000!
                  </p>
                )}
                
                <hr className="border-border" />
                
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button size="lg" className="w-full">
                  Proceder al Pago
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  <Link href="/productos" className="flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Seguir Comprando
                  </Link>
                </Button>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  🔒 Compra 100% segura
                  <br />
                  Tus datos están protegidos
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CartPage;