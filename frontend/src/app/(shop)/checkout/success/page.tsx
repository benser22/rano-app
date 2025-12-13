"use client";

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Package, Home, ShoppingBag } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  // Clear cart on successful payment
  useEffect(() => {
    if (status === 'approved') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h1>
        <p className="text-muted-foreground mb-6">
          Tu pedido fue procesado correctamente. Te enviamos un email con los detalles.
        </p>

        {externalReference && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Número de pedido</p>
            <p className="font-mono font-bold text-lg">{externalReference}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-left">
            <Package className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Preparando tu pedido</p>
              <p className="text-xs text-muted-foreground">
                Te notificaremos cuando sea despachado
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <Link href="/pedidos" className="w-full">
            <Button className="w-full gap-2">
              <ShoppingBag className="h-4 w-4" />
              Ver Mis Pedidos
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
