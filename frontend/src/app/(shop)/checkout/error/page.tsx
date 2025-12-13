"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  
  const externalReference = searchParams.get('external_reference');
  const errorMessage = searchParams.get('error');

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Error en el Pago</h1>
        <p className="text-muted-foreground mb-6">
          No pudimos procesar tu pago. Por favor intentá de nuevo o usá otro método de pago.
        </p>

        {errorMessage && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6 text-sm">
            {errorMessage}
          </div>
        )}

        {externalReference && (
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">Referencia</p>
            <p className="font-mono text-sm">{externalReference}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/checkout" className="w-full">
            <Button className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar Pago
            </Button>
          </Link>
          <Link href="/carrito" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              Volver al Carrito
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            ¿Necesitás ayuda?{' '}
            <Link href="/contacto" className="text-primary hover:underline inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Contactanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
