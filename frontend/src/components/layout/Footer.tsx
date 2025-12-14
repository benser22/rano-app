import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Phone, MapPin } from 'lucide-react';
import { SOCIAL_LINKS, STORE_INFO } from '@/constants/store';

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/webp/rano_logo.webp"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-lg font-bold">RANO URBAN</span>
            </Link>
            <p className="text-sm text-secondary-foreground/70">
              Ropa urbana con estilo propio.
            </p>
            <div className="flex gap-3">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground/70 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground/70 hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-foreground/70 hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Contacto</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href={`https://wa.me/54${STORE_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  {STORE_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{STORE_INFO.address}</span>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Tienda</h3>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li>
                <Link href="/productos" className="hover:text-primary transition-colors">
                  Ver Productos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-primary transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-secondary-foreground/50">
            <p>© {new Date().getFullYear()} Rano Urban. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="/terminos" className="hover:text-secondary-foreground transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/privacidad" className="hover:text-secondary-foreground transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
