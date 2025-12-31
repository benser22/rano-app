import { factories } from "@strapi/strapi";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Initialize MP client
// Note: We access env here. Ensure MP_ACCESS_TOKEN is set.
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

const payment = new Payment(client);

export default {
  async handleMercadoPago(ctx) {
    try {
      const { type, data } = ctx.request.body;

      // Solo procesar notificaciones de payment
      if (type !== "payment") {
        return ctx.send({ received: true });
      }

      if (!data || !data.id) {
        return ctx.badRequest("Missing payment data");
      }

      const paymentId = data.id;

      // Obtener detalles del pago desde MP
      const paymentData = await payment.get({ id: paymentId });

      // Buscar orden por external_reference
      const orders = await strapi.entityService.findMany("api::order.order", {
        filters: { externalReference: paymentData.external_reference },
      });

      const order = Array.isArray(orders) ? orders[0] : orders;

      if (!order) {
        // Log locally, but return 200 to MP to stop retries if logic dictates
        strapi.log.warn(
          `Order not found for payment ${paymentId} ref ${paymentData.external_reference}`,
        );
        // Return 200 to acknowledge hooked
        return ctx.send({ received: true });
      }

      // Actualizar estado según resultado
      const statusMap: Record<string, string> = {
        approved: "paid",
        rejected: "rejected",
        cancelled: "cancelled",
        refunded: "refunded",
      };

      const newStatus = statusMap[paymentData.status] || "pending";
      const oldStatus = order.status;

      await strapi.entityService.update("api::order.order", order.id, {
        data: {
          status: newStatus,
          paymentId: paymentData.id.toString(),
        } as any,
      });

      // Fetch store config for contact email
      const storeConfig: any = await strapi.entityService.findMany(
        "api::store-config.store-config",
      );
      const adminEmail = storeConfig[0]?.contactEmail || "info@ranourban.com";

      // --- Notificaciones por Email ---

      if (newStatus === "paid" && oldStatus !== "paid") {
        // 1. Al Cliente: Confirmación
        try {
          await strapi.plugins["email"].services.email.send({
            to: order.email,
            subject: "¡Gracias por tu compra! - Rano Urban",
            html: `
              <h1>Pedido Confirmado</h1>
              <p>Hola, tu pedido <strong>#${order.id}</strong> ha sido pagado exitosamente.</p>
              <p>Estamos preparando tus productos para el envío.</p>
            `,
          });
        } catch (err) {
          strapi.log.error("Failed to send client success email", err);
        }

        // 2. Al Administrador: Nueva Venta
        try {
          await strapi.plugins["email"].services.email.send({
            to: adminEmail,
            subject: `Nueva Venta: Pedido #${order.id}`,
            html: `
              <h1>¡Nueva venta recibida!</h1>
              <p>Se ha confirmado el pago del pedido <strong>#${order.id}</strong>.</p>
              <p>Cliente: ${order.email}</p>
              <p>Total: $${order.total}</p>
              <p>Revisar en el panel de Strapi para gestionar el envío.</p>
            `,
          });
        } catch (err) {
          strapi.log.error("Failed to send admin notification email", err);
        }
      } else if (newStatus === "pending") {
        // Notificar al cliente sobre el pago pendiente (ej: Rapipago)
        try {
          await strapi.plugins["email"].services.email.send({
            to: order.email,
            subject: "Pedido Recibido - Esperando Pago | Rano Urban",
            html: `
              <h1>Estamos esperando tu pago</h1>
              <p>Hola, hemos recibido tu pedido <strong>#${order.id}</strong>.</p>
              <p>El mismo se encuentra en estado <strong>Pendiente</strong> hasta que se acredite el pago solicitado.</p>
              <p>Una vez acreditado, te enviaremos un email de confirmación y prepararemos tu envío.</p>
            `,
          });
        } catch (err) {
          strapi.log.error("Failed to send pending email", err);
        }
      } else if (newStatus === "rejected" || newStatus === "cancelled") {
        // Notificar al cliente sobre el pago fallido
        try {
          await strapi.plugins["email"].services.email.send({
            to: order.email,
            subject: "Problema con tu pago - Rano Urban",
            html: `
              <div style="font-family: sans-serif; color: #333;">
                <h1 style="color: #e11d48;">Tu pago no pudo procesarse</h1>
                <p>Hola, lamentablemente el pago de tu pedido <strong>#${order.id}</strong> fue ${newStatus === "rejected" ? "rechazado" : "cancelado"}.</p>
                <p>No te preocupes, tus productos han sido reservados por un breve momento, pero el stock se liberará pronto si no se completa la compra.</p>
                <p>Puedes intentar realizar el pago nuevamente desde nuestra web.</p>
                <br>
                <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/productos" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Volver a la tienda</a>
              </div>
            `,
          });
        } catch (err) {
          strapi.log.error("Failed to send failure email", err);
        }

        // RESTAURAR STOCK (Ya que se descontó al crear la orden)
        // Solo restauramos si no se ha restaurado antes (evitar duplicados si MP manda varios webhooks)
        if (oldStatus === "pending") {
          const orderWithItems = await strapi.entityService.findOne(
            "api::order.order",
            order.id,
            { populate: { items: { populate: ["product"] } } },
          );

          const orderWithItemsAny = orderWithItems as any;
          if (orderWithItemsAny.items) {
            for (const item of orderWithItemsAny.items) {
              if (item.product) {
                await strapi.db.query("api::product.product").update({
                  where: { id: item.product.id },
                  data: { stock: (item.product.stock || 0) + item.quantity },
                });
                strapi.log.info(
                  `STOCK RESTORED: ${item.product.name} (+${item.quantity})`,
                );
              }
            }
          }
        }
      }

      ctx.send({ received: true });
    } catch (error) {
      strapi.log.error("MP Webhook error:", error);
      ctx.throw(500, "Webhook processing failed");
    }
  },
};
