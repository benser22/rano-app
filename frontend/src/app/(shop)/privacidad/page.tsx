import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de Rano Urban.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
            <p className="text-muted-foreground">
              En Rano Urban recopilamos información que nos proporcionás directamente cuando:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Creás una cuenta en nuestro sitio</li>
              <li>Realizás una compra</li>
              <li>Te suscribís a nuestro newsletter</li>
              <li>Te ponés en contacto con nosotros</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Esta información puede incluir: nombre, dirección de correo electrónico, dirección postal, 
              número de teléfono e información de pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
            <p className="text-muted-foreground">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Procesar y gestionar tus pedidos</li>
              <li>Comunicarnos contigo sobre tu cuenta o pedidos</li>
              <li>Enviarte información promocional (si diste tu consentimiento)</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Prevenir fraudes y actividades no autorizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Compartir Información</h2>
            <p className="text-muted-foreground">
              No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Proveedores de servicios que nos ayudan a operar el negocio (envíos, pagos)</li>
              <li>Autoridades legales cuando sea requerido por ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Seguridad de los Datos</h2>
            <p className="text-muted-foreground">
              Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal 
              contra acceso no autorizado, alteración, divulgación o destrucción. Los pagos se procesan de forma 
              segura a través de Mercado Pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio. Las cookies 
              nos permiten recordar tus preferencias y analizar cómo se utiliza nuestro sitio. Podés configurar 
              tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Tus Derechos</h2>
            <p className="text-muted-foreground">
              De acuerdo con la Ley de Protección de Datos Personales (Ley 25.326), tenés derecho a:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Para ejercer estos derechos, contactanos a través de nuestra página de contacto.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Retención de Datos</h2>
            <p className="text-muted-foreground">
              Conservamos tu información personal mientras mantengas una cuenta con nosotros o según sea necesario 
              para cumplir con nuestras obligaciones legales, resolver disputas y hacer cumplir nuestros acuerdos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cambios a esta Política</h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta política de privacidad periódicamente. Te notificaremos sobre cambios 
              significativos publicando la nueva política en nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
            <p className="text-muted-foreground">
              Si tenés preguntas sobre esta política de privacidad, podés contactarnos a través de nuestra 
              página de <Link href="/contacto" className="text-primary hover:underline">contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
