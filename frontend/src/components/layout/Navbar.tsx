"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, Heart, ChevronRight, Store, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { UserDropdown } from '@/components/auth/UserDropdown';
import { SearchCombobox } from '@/components/search/SearchCombobox';
import { MobileSearch } from '@/components/search/MobileSearch';
import { useStoreConfig } from '@/lib/useStoreConfig';

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getItemCount());
  const { config } = useStoreConfig();

  // Prevent hydration mismatch by only rendering counts after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        {/* Main navbar */}
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">

          {/* Left Section: Menu + Logo */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-accent/80 transition-all duration-200"
                    aria-label="Abrir menú"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] sm:w-[340px] p-0 bg-gradient-to-b from-background to-background/95"
                >
                  <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Image
                          src="/webp/rano_logo.webp"
                          alt="RANO"
                          width={28}
                          height={28}
                          className="h-7 w-7"
                        />
                      </div>
                      <SheetTitle className="text-left text-lg font-semibold">
                        RANO URBAN
                      </SheetTitle>
                    </div>
                  </SheetHeader>

                  <nav className="flex flex-col py-4">
                    {/* Main Link */}
                    <Link
                      href="/productos"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between px-6 py-3.5 hover:bg-accent/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Store className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-base font-medium">Todos los productos</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <div className="h-px bg-border/50 mx-6 my-2" />

                    {/* Categories */}
                    <div className="px-6 py-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Categorías
                      </span>
                    </div>

                    {config.navbarCategories.map((cat, index) => (
                      <Link
                        key={cat.slug}
                        href={`/productos?category=${cat.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="group flex items-center justify-between px-6 py-3 hover:bg-accent/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="text-base font-medium pl-12">{cat.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}

                    <div className="h-px bg-border/50 mx-6 my-2" />

                    {/* Favorites */}
                    <Link
                      href="/favoritos"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between px-6 py-3.5 hover:bg-accent/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                          <Heart className="h-4 w-4 text-rose-500" />
                        </div>
                        <span className="text-base font-medium">Favoritos</span>
                        {mounted && wishlistCount > 0 && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {wishlistCount}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>

                    <Link
                      href="/carrito"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between px-6 py-3.5 hover:bg-accent/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-base font-medium">Carrito</span>
                        {mounted && cartCount > 0 && (
                          <Badge className="h-5 px-1.5 text-xs bg-primary">
                            {cartCount}
                          </Badge>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </nav>

                  {/* Footer */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/40 bg-muted/30">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo - Always left aligned, hidden on very small screens */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0"
            >
              <Image
                src="/webp/rano_logo.webp"
                alt="RANO"
                width={36}
                height={36}
                className="h-8 w-8 sm:h-9 sm:w-9 hide-xxs"
              />
              <span className="hidden lg:inline-block text-xl font-bold tracking-tight">
                RANO URBAN
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <Link
              href="/productos"
              className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/60 hover:text-primary transition-all duration-200"
            >
              Tienda
            </Link>
            {config.navbarCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent/60 hover:text-primary transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Search - Desktop (only xl+) */}
            <SearchCombobox className="hidden xl:block w-56 2xl:w-64" />

            {/* Search - Mobile/Tablet */}
            <div className="xl:hidden">
              <MobileSearch />
            </div>

            {/* Wishlist */}
            <Link href="/favoritos" className="hidden sm:block">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 hover:bg-accent/80 transition-all duration-200"
                aria-label="Ver favoritos"
              >
                <Heart className="h-6 w-6" />
                {mounted && wishlistCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-rose-500 text-white border-2 border-background animate-in zoom-in-50 duration-200 shadow-sm"
                  >
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <UserDropdown />

            {/* Cart - Always visible */}
            <Link href="/carrito">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 hover:bg-accent/80 transition-all duration-200"
                aria-label="Ver carrito"
              >
                <ShoppingCart className="h-6 w-6" />
                {mounted && cartCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary font-bold border-2 border-background animate-in zoom-in-50 duration-200 shadow-sm"
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


