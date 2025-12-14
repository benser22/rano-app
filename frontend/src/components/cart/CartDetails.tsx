"use client";

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/api/strapi';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CartDetails = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.success('Producto eliminado', { description: name });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-muted-foreground mb-6">
          ¿No sabés qué comprar? ¡Miles de productos te esperan!
        </p>
        <Link href="/productos">
          <Button size="lg" className="gap-2">
            <ShoppingBag className="h-5 w-5" />
            Explorar productos
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              clearCart();
              toast.success('Carrito vaciado');
            }}
          >
            Vaciar carrito
          </Button>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-card p-4 rounded-xl shadow-sm"
          >
            {/* Image */}
            <Link href={`/productos/${item.slug}`} className="shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-lg overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <ImgWithFallback
                    src={getMediaUrl(item.images[0].url) || ''}
                    alt={item.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform"
                  />
                ) : (
                  <ImgWithFallback
                    src="/avif/placeholder.avif"
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
            </Link>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <Link href={`/productos/${item.slug}`}>
                  <h3 className="font-semibold hover:text-primary transition-colors truncate">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toLocaleString('es-AR')} c/u
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(item.id, item.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <p className="font-bold text-lg">
                ${(item.price * item.quantity).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl p-6 shadow-sm sticky top-24">
          <h2 className="text-xl font-bold mb-6">Resumen del Pedido</h2>

          {/* Coupon */}
          <div className="flex gap-2 mb-6">
            <Input placeholder="Código de descuento" className="flex-1" />
            <Button variant="outline">Aplicar</Button>
          </div>

          <Separator className="mb-6" />

          {/* Totals */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                {shipping === 0 ? 'Gratis' : `$${shipping.toLocaleString('es-AR')}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted-foreground">
                ¡Agregá ${(50000 - subtotal).toLocaleString('es-AR')} más para envío gratis!
              </p>
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between text-lg font-bold mb-6">
            <span>Total</span>
            <span>${total.toLocaleString('es-AR')}</span>
          </div>

          <Link href="/checkout" className="block">
            <Button className="w-full" size="lg">
              Finalizar Compra
            </Button>
          </Link>

          <Link href="/productos" className="block mt-3">
            <Button variant="outline" className="w-full">
              Seguir Comprando
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            <p>🔒 Pago 100% seguro</p>
            <p className="mt-1">💳 Aceptamos todas las tarjetas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
