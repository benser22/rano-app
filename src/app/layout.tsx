import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ThemeProvider from '@/components/providers/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Rano Urban - Moda Urbana de Calidad',
  description: 'Descubre las últimas tendencias en moda urbana. Ropa streetwear de calidad para el estilo de vida moderno.',
  keywords: 'moda urbana, streetwear, ropa, tendencias, estilo',
  authors: [{ name: 'Rano Urban' }],
  openGraph: {
    title: 'Rano Urban - Moda Urbana de Calidad',
    description: 'Descubre las últimas tendencias en moda urbana.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
