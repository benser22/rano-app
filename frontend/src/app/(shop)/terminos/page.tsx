import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de Rano Urban.',
};

export default function TerminosPage() {
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

        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground">
              Al acceder y utilizar el sitio web de Rano Urban, aceptás cumplir con estos términos y condiciones de uso. 
              Si no estás de acuerdo con alguna parte de estos términos, te pedimos que no utilices nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Uso del Sitio</h2>
            <p className="text-muted-foreground">
              Este sitio web está destinado para uso personal y no comercial. No está permitido:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Modificar o copiar los materiales del sitio</li>
              <li>Usar los materiales para fines comerciales sin autorización</li>
              <li>Intentar descompilar o aplicar ingeniería inversa al software</li>
              <li>Eliminar avisos de derechos de autor u otras indicaciones de propiedad</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Productos y Precios</h2>
            <p className="text-muted-foreground">
              Nos esforzamos por mantener la información de productos actualizada y precisa. Sin embargo, nos reservamos 
              el derecho de corregir errores, inexactitudes u omisiones, y de cambiar o actualizar la información en 
              cualquier momento sin previo aviso. Los precios están expresados en Pesos Argentinos (ARS) e incluyen IVA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Proceso de Compra</h2>
            <p className="text-muted-foreground">
              Al realizar una compra, proporcionarás información precisa y completa. Te comprometés a mantener 
              actualizada tu información de contacto y pago. Rano Urban se reserva el derecho de rechazar cualquier 
              pedido por cualquier motivo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Envíos</h2>
            <p className="text-muted-foreground">
              Los tiempos de envío son estimados y pueden variar según la ubicación. Los envíos se realizan a través 
              de servicios de mensajería confiables. El cliente es responsable de proporcionar una dirección de 
              envío correcta y completa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Propiedad Intelectual</h2>
            <p className="text-muted-foreground">
              Todos los contenidos del sitio, incluyendo textos, gráficos, logotipos, imágenes y software, son propiedad 
              de Rano Urban y están protegidos por las leyes de propiedad intelectual argentinas e internacionales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground">
              Rano Urban no será responsable por daños indirectos, incidentales, especiales o consecuentes que resulten 
              del uso o la imposibilidad de uso de los productos o servicios ofrecidos en este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modificaciones</h2>
            <p className="text-muted-foreground">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor 
              inmediatamente después de su publicación en el sitio. El uso continuado del sitio después de cualquier 
              modificación constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contacto</h2>
            <p className="text-muted-foreground">
              Si tenés preguntas sobre estos términos, podés contactarnos a través de nuestra página de{' '}
              <Link href="/contacto" className="text-primary hover:underline">contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
