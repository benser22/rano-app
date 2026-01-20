"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { getMediaUrl } from "@/lib/api/strapi";
import { ImgWithFallback } from "@/components/ui/image-with-fallback";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useStoreConfig } from "@/lib/useStoreConfig";

const CartDetails = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const { config } = useStoreConfig();

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast.success("Producto eliminado", { description: name });
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
  const freeMin = config?.freeShippingMin ?? Infinity;
  const isFreeShipping = subtotal >= freeMin;
  const total = subtotal;
  const remaining = Math.max(0, freeMin - subtotal);
  const progress =
    freeMin === Infinity ? 0 : Math.min((subtotal / freeMin) * 100, 100);

  // Helper para mostrar moneda consistente
  const formatCurrency = (value: number) => `$${value.toLocaleString("es-AR")}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {items.length} {items.length === 1 ? "producto" : "productos"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              clearCart();
              toast.success("Carrito vaciado");
            }}
            aria-label="Vaciar carrito"
          >
            Vaciar carrito
          </Button>
        </div>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row gap-4 bg-card p-4 rounded-xl shadow-sm"
          >
            {/* Image */}
            <Link href={`/productos/${item.slug}`} className="shrink-0">
              <div className="w-full md:w-28 h-28 md:h-28 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                {item.images && item.images.length > 0 ? (
                  <ImgWithFallback
                    src={getMediaUrl(item.images[0].url) || ""}
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

                {(item.selectedSize || item.selectedColor) && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-1">
                    {item.selectedSize && (
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground ring-1 ring-inset ring-gray-500/10">
                        Talle: {item.selectedSize}
                      </span>
                    )}
                    {item.selectedColor && (
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground ring-1 ring-inset ring-gray-500/10">
                        Color: {item.selectedColor}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-sm text-muted-foreground mt-1">
                  {formatCurrency(item.price)} c/u
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Disminuir cantidad de ${item.name}`}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={() => {
                      const currentQuantityInCart = items
                        .filter((i) => i.productId === item.productId)
                        .reduce((acc, i) => acc + i.quantity, 0);

                      const limit = item.stock ?? 9999;

                      if (currentQuantityInCart + 1 > limit) {
                        toast.error("No hay más stock disponible", {
                          description: `Solo hay ${limit} unidades en stock.`,
                        });
                        return;
                      }
                      updateQuantity(item.id, item.quantity + 1);
                    }}
                    aria-label={`Aumentar cantidad de ${item.name}`}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(item.id, item.name)}
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="ml-auto text-right">
                  <p className="font-bold text-base">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-xl p-6 shadow-sm sticky top-6">
          <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <Input placeholder="Código de descuento" className="flex-1" />
            <Button variant="outline">Aplicar</Button>
          </div>

          <Separator className="mb-4" />

          {/* Totals */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Envío</span>
                <Truck className="h-4 w-4 text-muted-foreground/70" />
              </div>

              <div className="text-right">
                {isFreeShipping ? (
                  <span className="text-green-600 font-medium">¡Gratis!</span>
                ) : (
                  <span className="text-sm">A convenir</span>
                )}
              </div>
            </div>

            {/* Progress hacia envío gratis */}
            {!isFreeShipping && freeMin !== Infinity && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-muted-foreground italic text-center w-full">
                    ¡Agregá <strong>{formatCurrency(remaining)}</strong> más
                    para envío gratis!
                  </p>
                </div>

                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg,#ef4444,#f97316,#f59e0b,#10b981)", // rainbow-ish gradient
                    }}
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                  />
                </div>
              </div>
            )}

            {isFreeShipping && (
              <p className="text-xs text-green-600 font-medium">
                ¡Tu pedido califica para envío gratis!
              </p>
            )}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Link href="/checkout" className="block">
            <Button className="w-full mb-2" size="lg">
              Finalizar Compra
            </Button>
          </Link>

          <Link href="/productos" className="block">
            <Button variant="outline" className="w-full">
              Seguir Comprando
            </Button>
          </Link>

          {/* Trust badges */}
          <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <span>🔒</span>
              Pago 100% seguro
            </p>
            <p className="mt-1 flex items-center justify-center gap-2">
              <span>💳</span>
              Aceptamos todas las tarjetas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetails;
