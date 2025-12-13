"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, User, Package, ShoppingBag } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  // TODO: Fetch orders from API
  const orders: any[] = [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Mis Pedidos</span>
          </nav>
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-3">
                  {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-bold text-lg">{user.username || 'Usuario'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              
              <Separator className="my-4" />
              
              <nav className="flex flex-col gap-2">
                <Link 
                  href="/perfil" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <Link 
                  href="/pedidos" 
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <Package className="h-4 w-4" />
                  Mis Pedidos
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Historial de Pedidos</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No tenés pedidos aún</h3>
                  <p className="text-muted-foreground mb-6">
                    Cuando realices tu primera compra, aparecerá aquí.
                  </p>
                  <Link href="/productos">
                    <Button>Explorar Productos</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">Pedido #{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('es-AR')}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-muted">
                          {order.status}
                        </span>
                      </div>
                      <p className="font-bold">${order.total?.toLocaleString('es-AR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
