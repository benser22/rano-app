import Link from 'next/link';
import { Metadata } from 'next';
import CartDetails from '@/components/cart/CartDetails';
import { ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Carrito',
  description: 'Revisa los productos en tu carrito de compras en Rano Urban.',
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Carrito</span>
          </nav>
          <h1 className="text-3xl font-bold">Carrito de Compras</h1>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-8">
        <CartDetails />
      </div>
    </div>
  );
}
