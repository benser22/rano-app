"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchAPI, getMediaUrl } from '@/lib/api/strapi';
import { Product } from '@/types';
import { ImgWithFallback } from '@/components/ui/image-with-fallback';

interface SearchComboboxProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
}

export function SearchCombobox({ 
  className = '', 
  placeholder = 'Buscar productos...',
  onClose 
}: SearchComboboxProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchAPI('/products', {
        filters: {
          $or: [
            { name: { $containsi: searchQuery } },
            { description: { $containsi: searchQuery } },
          ],
        },
        populate: ['images'],
        pagination: { limit: 5 },
      });
      setResults(data.data || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      onClose?.();
    } else if (e.key === 'Enter' && query.length >= 2) {
      router.push(`/productos?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const handleSearchSubmit = () => {
    if (query.length >= 2) {
      router.push(`/productos?search=${encodeURIComponent(query)}`);
      setIsOpen(false);
      onClose?.();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-9 pr-9 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-1"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-lg shadow-lg border z-50 overflow-hidden">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No se encontraron productos para "{query}"
            </div>
          ) : (
            <>
              <ul className="divide-y">
                {results.map((product) => {
                  const imageUrl = product.images?.[0]?.url 
                    ? getMediaUrl(product.images[0].url) 
                    : '/placeholder.png';
                  
                  return (
                    <li key={product.id}>
                      <Link
                        href={`/productos/${product.slug}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      >
                        <div className="w-12 h-12 bg-muted rounded overflow-hidden shrink-0">
                          <ImgWithFallback
                            src={imageUrl || ''}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-primary font-semibold">
                            ${product.price.toLocaleString('es-AR')}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="p-2 border-t bg-muted/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={handleSearchSubmit}
                >
                  Ver todos los resultados para "{query}"
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
