"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronRight, User, Mail, Calendar, Shield, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (isHydrated && !isAuthenticated) {
      router.push('/login?redirect=/perfil');
    }
  }, [isAuthenticated, isHydrated, router]);

  // Wait for hydration and authentication
  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-8">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-secondary-foreground/60 mb-2">
            <Link href="/" className="hover:text-secondary-foreground">Inicio</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-secondary-foreground">Mi Perfil</span>
          </nav>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
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
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
                <Link
                  href="/pedidos"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                >
                  <Shield className="h-4 w-4" />
                  Mis Pedidos
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Información Personal</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={user.username || ''}
                      readOnly
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email}
                      readOnly
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">Método de acceso</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="provider"
                      value={user.provider === 'google' ? 'Google' : 'Email'}
                      readOnly
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createdAt">Miembro desde</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="createdAt"
                      value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : 'N/A'}
                      readOnly
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-end">
                <Button variant="outline" disabled>
                  Editar Perfil (Próximamente)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
