"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, User, Package, ShoppingBag, Loader2, MapPin, CreditCard, Truck } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getMediaUrl } from '@/lib/api/strapi';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    slug: string;
    images?: { url: string }[];
  };
}

interface Order {
  id: number;
  documentId: string;
  externalReference: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/pedidos');
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    try {
      const { strapi } = await import('@/lib/api/strapi');
      const { data } = await strapi.get('/orders/my-orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      paid: { label: 'Pagado', className: 'bg-green-100 text-green-800 border-green-200' },
      processing: { label: 'Procesando', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      delivered: { label: 'Entregado', className: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800 border-red-200' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Wait for hydration and authentication
  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-8 mb-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground transition-colors">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Mis Pedidos</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">Mis Pedidos</h1>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 shadow-sm sticky top-24 border border-border/50">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-3 shadow-md">
                  {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                </div>
                <h2 className="font-bold text-lg">{user.username || 'Usuario'}</h2>
                <p className="text-sm text-muted-foreground truncate max-w-full px-2" title={user.email}>{user.email}</p>
              </div>

              <Separator className="my-4" />

              <nav className="flex flex-col gap-2">
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <Link
                  href="/pedidos"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium pointer-events-none"
                >
                  <Package className="h-4 w-4" />
                  Mis Pedidos
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Historial de Pedidos
                </h2>
              </div>

              {loadingOrders ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No tenés pedidos aún</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Explorá nuestra colección y encontrá tu estilo ideal. Tus compras aparecerán aquí.
                  </p>
                  <Link href="/productos">
                    <Button size="lg" className="rounded-full px-8">Explorar Productos</Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {orders.map((order) => (
                      <AccordionItem
                        key={order.id}
                        value={`item-${order.id}`}
                        className="border rounded-lg px-4 hover:bg-muted/30 transition-colors data-[state=open]:bg-muted/30 data-[state=open]:border-primary/20"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono text-sm font-semibold text-primary">#{order.externalReference?.slice(-8) || order.id}</span>
                              <span className="text-sm text-muted-foreground capitalize">
                                {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 sm:gap-6">
                              {getStatusBadge(order.status)}
                              <span className="font-bold text-lg min-w-[80px] text-right">
                                ${order.total?.toLocaleString('es-AR')}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-2 pb-6">
                          <Separator className="mb-6" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Products List */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                Productos ({order.items?.length || 0})
                              </h4>
                              <div className="space-y-3">
                                {order.items?.map((item, index) => {
                                  const product = item.product;
                                  const imageUrl = product?.images?.[0]?.url
                                    ? getMediaUrl(product.images[0].url)
                                    : '/avif/placeholder.avif';

                                  return (
                                    <div key={index} className="flex gap-3 items-start">
                                      <div className="h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0 border border-border/50 relative">
                                        <ImgWithFallback
                                          src={imageUrl || ''}
                                          alt={product?.name || 'Producto'}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{product?.name || 'Producto eliminado'}</p>
                                        <div className="flex justify-between items-center mt-1">
                                          <p className="text-xs text-muted-foreground">Cant: {item.quantity}</p>
                                          <p className="font-semibold text-sm">${item.price?.toLocaleString('es-AR')}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Order Details */}
                            <div className="bg-muted/50 rounded-lg p-5 space-y-6 text-sm h-fit">
                              <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                  <Truck className="h-4 w-4 text-muted-foreground" />
                                  Envío
                                </h4>
                                {order.shippingAddress ? (
                                  <div className="text-muted-foreground pl-6">
                                    <p>{order.shippingAddress.street} {order.shippingAddress.number}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                    <p>CP {order.shippingAddress.zipCode}</p>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground pl-6">Retiro en local</p>
                                )}
                              </div>

                              <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  Resumen
                                </h4>
                                <div className="space-y-2 pl-6">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${order.total?.toLocaleString('es-AR')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Envío</span>
                                    <span>Gratis</span>
                                  </div>
                                  <Separator className="my-2" />
                                  <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary text-xl">${order.total?.toLocaleString('es-AR')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
