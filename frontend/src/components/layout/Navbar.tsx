"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UserDropdown } from '@/components/auth/UserDropdown';
import { SearchCombobox } from '@/components/search/SearchCombobox';
import { MobileSearch } from '@/components/search/MobileSearch';

const categories = [
  { name: 'Remeras', slug: 'remeras' },
  { name: 'Gorras', slug: 'gorras' },
  { name: 'Buzos', slug: 'buzos' },
  { name: 'Accesorios', slug: 'accesorios' },
];

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());

  // Prevent hydration mismatch by only rendering counts after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        {/* Top bar - optional promo */}
        <div className="hidden md:block text-center py-1.5 text-xs text-muted-foreground border-b">
          🚚 Envío gratis en compras mayores a $50.000
        </div>
        
        {/* Main navbar */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menú</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/productos" className="text-lg font-medium hover:text-primary transition-colors">
                    Todos los productos
                  </Link>
                  <div className="h-px bg-border" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/productos?category=${cat.slug}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="h-px bg-border" />
                  <Link href="/favoritos" className="text-lg font-medium hover:text-primary transition-colors">
                    Favoritos
                  </Link>
                  <Link href="/login" className="text-lg font-medium hover:text-primary transition-colors">
                    Iniciar Sesión
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/rano_logo.png"
              alt="Rano Urban"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="hidden sm:inline-block text-xl font-bold tracking-tight">
              RANO URBAN
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/productos"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Tienda
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search - Desktop */}
            <SearchCombobox className="hidden lg:block w-64" />
            
            {/* Search - Mobile */}
            <MobileSearch />

            {/* Wishlist */}
            <Link href="/favoritos">
              <Button variant="ghost" size="icon" className="relative hidden sm:flex">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <Badge 
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <UserDropdown />

            {/* Cart */}
            <Link href="/carrito">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary"
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


