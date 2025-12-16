import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { getStoreConfig } from '@/lib/api/strapi';
import { ContactForm } from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponete en contacto con Rano Urban. Estamos para ayudarte.',
};

export default async function ContactoPage() {
  const config = await getStoreConfig();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-secondary text-secondary-foreground py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold">Contacto</h1>
          <p className="text-secondary-foreground/70 mt-2 text-lg">
            Estamos acá para ayudarte. ¡Escribinos!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Contact Info */}
          <div className="bg-card border rounded-2xl p-8 flex flex-col">
            <div className="space-y-6 flex-1">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {config.contactEmail}
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Te respondemos en menos de 24hs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">WhatsApp</h3>
                  <a
                    href={`https://wa.me/54${config.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {config.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Local</h3>
                  <p className="text-muted-foreground">
                    {config.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Horarios de Atención</h3>
                  <p className="text-muted-foreground">{config.hoursWeekdays}</p>
                  <p className="text-muted-foreground">{config.hoursSaturday}</p>
                </div>
              </div>
            </div>

            {/* Social - at bottom */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold mb-4">Seguinos en redes</h3>
              <div className="flex gap-3">
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-muted border rounded-xl hover:border-primary transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={config.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-muted border rounded-xl hover:border-primary transition-colors"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border rounded-2xl p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-6">Envianos un mensaje</h2>
            <ContactForm />
          </div>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ubicación</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(config.address)}`}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de Rano Urban"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

