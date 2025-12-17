"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Package, Settings, Heart, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserDropdown() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 relative hover:bg-accent/80" aria-label="Menú de usuario">
            <User className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-border/50 shadow-xl">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Mi Cuenta
          </div>
          <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer focus:bg-accent/50">
            <Link href="/login" className="flex items-center gap-3 font-medium">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <LogIn className="h-4 w-4" />
              </div>
              Iniciar Sesión
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="p-2.5 rounded-lg cursor-pointer focus:bg-accent/50 mt-1">
            <Link href="/register" className="flex items-center gap-3 font-medium">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground">
                <UserPlus className="h-4 w-4" />
              </div>
              Crear Cuenta
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 relative hover:bg-accent/80" aria-label="Menú de usuario">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-border/50 shadow-xl">
        <div className="px-2 py-2 mb-1">
          <p className="font-medium truncate">{user.username || 'Usuario'}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil" className="cursor-pointer gap-2">
            <User className="h-4 w-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/pedidos" className="cursor-pointer gap-2">
            <Package className="h-4 w-4" />
            Mis Pedidos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/favoritos" className="cursor-pointer gap-2">
            <Heart className="h-4 w-4" />
            Favoritos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
