"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Get tokens from URL params
      const accessToken = searchParams.get('access_token');
      const idToken = searchParams.get('id_token');
      
      if (!idToken && !accessToken) {
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setError(`Error de Google: ${errorParam}`);
          return;
        }
        setError('No se recibieron tokens de Google');
        return;
      }

      try {
        // Call our custom backend endpoint to exchange Google tokens for Strapi JWT
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_token: idToken,
              access_token: accessToken,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Error ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.jwt || !data.user) {
          throw new Error('Respuesta inválida del servidor');
        }

        // Set user in store with Strapi JWT
        setUser(data.user, data.jwt);
        
        // Redirect to home
        router.push('/');
      } catch (err) {
        console.error('Error during Google callback:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="bg-card rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">Error de autenticación</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/login">
            <Button>Volver al login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
        <p className="text-lg font-medium">Iniciando sesión con Google...</p>
        <p className="text-sm text-muted-foreground mt-2">
          Por favor esperá un momento
        </p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
