import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: {
    default: 'Rano Urban | Streetwear con Estilo',
    template: '%s | Rano Urban',
  },
  description: 'Tienda de ropa urbana argentina. Remeras, gorras, buzos y accesorios con diseños exclusivos de streetwear.',
  keywords: ['ropa urbana', 'streetwear', 'remeras', 'gorras', 'moda urbana', 'tienda online', 'ropa argentina'],
  authors: [{ name: 'Rano Urban' }],
  creator: 'Rano Urban',
  publisher: 'Rano Urban',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Rano Urban | Streetwear con Estilo',
    description: 'Tienda de ropa urbana argentina. Remeras, gorras, buzos y accesorios con diseños exclusivos.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Rano Urban',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rano Urban | Streetwear con Estilo',
    description: 'Tienda de ropa urbana argentina. Diseños exclusivos de streetwear.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
        <WhatsAppButton />
        <Toaster 
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </body>
    </html>
  );
}
