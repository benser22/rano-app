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

      const initialOrder = Array.isArray(orders) ? orders[0] : orders;

      // Fetch full order with phone
      const order = await strapi.entityService.findOne(
        "api::order.order",
        initialOrder.id,
      );

      if (!order) {
        strapi.log.warn(
          `Order not found for payment ${paymentId} ref ${paymentData.external_reference}`,
        );
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
      const orderService = strapi.service("api::order.order") as any;

      // --- Notificaciones por Email ---

      if (newStatus === "paid" && oldStatus !== "paid") {
        // 1. Al Cliente: Confirmación
        try {
          await orderService.sendEmail(
            order.email,
            "¡Gracias por tu compra! - Rano Urban",
            `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h1 style="color: #000; margin-bottom: 5px;">Pedido Confirmado</h1>
                  <p style="color: #666;">¡Hola! Tu pago ha sido procesado exitosamente.</p>
                </div>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 0;"><strong>Número de Pedido:</strong> #${order.id}</p>
                  <p style="margin: 5px 0 0;"><strong>Estado:</strong> Pagado</p>
                  <p style="margin: 5px 0 0;"><strong>Total:</strong> $${order.total}</p>
                </div>
                
                <p>Estamos preparando tus productos. Te avisaremos cuando el pedido sea enviado.</p>
                
                <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
                  <p>Rano Urban - Calidad y Precio</p>
                </div>
              </div>
            `,
          );
        } catch (err) {
          strapi.log.error("Failed to send client success email", err);
        }

        // WhatsApp: Pago Confirmado
        try {
          if (order.phone) {
            await orderService.sendWhatsAppNotification(
              order.phone,
              `✅ ¡Buenas noticias! Tu pago del pedido #${order.id} por $${order.total} ha sido confirmado. Estamos preparando tu envío. ¡Gracias por elegir Rano Urban!`,
            );
          }
        } catch (err) {
          strapi.log.error("Failed to send client success WhatsApp", err);
        }

        // 2. Al Administrador: Nueva Venta
        try {
          await orderService.sendEmail(
            adminEmail,
            `Nueva Venta: Pedido #${order.id}`,
            `
              <div style="font-family: sans-serif; padding: 20px;">
                <h1 style="color: #22c55e;">¡Nueva venta recibida!</h1>
                <p>Se ha confirmado el pago del pedido <strong>#${order.id}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p><strong>Cliente:</strong> ${order.email}</p>
                <p><strong>Total:</strong> $${order.total}</p>
                <p><strong>Referencia MP:</strong> ${paymentId}</p>
                <div style="margin-top: 25px;">
                  <a href="${process.env.STRAPI_URL || "http://localhost:1337"}/admin/content-manager/collection-types/api::order.order/${order.id}" 
                     style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Ver Pedido en Strapi
                  </a>
                </div>
              </div>
            `,
          );
        } catch (err) {
          strapi.log.error("Failed to send admin notification email", err);
        }
      } else if (newStatus === "pending") {
        // Notificar al cliente sobre el pago pendiente (ej: Rapipago)
        try {
          await orderService.sendEmail(
            order.email,
            "Pedido Recibido - Esperando Pago | Rano Urban",
            `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="text-align: center;">Estamos esperando tu pago</h1>
                <p>Hola, hemos recibido tu pedido <strong>#${order.id}</strong>.</p>
                <p>El mismo se encuentra en estado <strong>Pendiente</strong> hasta que se acredite el pago solicitado (por ejemplo, si elegiste Rapipago o Pago Fácil).</p>
                <p>Una vez acreditado, te enviaremos un email de confirmación y prepararemos tu envío.</p>
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px;">
                  <p style="margin: 0; color: #92400e;"><strong>Importante:</strong> Si ya realizaste el pago, recordá que puede tardar hasta 24hs hábiles en acreditarse.</p>
                </div>
              </div>
            `,
          );
        } catch (err) {
          strapi.log.error("Failed to send pending email", err);
        }
      } else if (newStatus === "rejected" || newStatus === "cancelled") {
        // Notificar al cliente sobre el pago fallido
        try {
          await orderService.sendEmail(
            order.email,
            "Problema con tu pago - Rano Urban",
            `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px;">
                <h1 style="color: #e11d48; text-align: center;">Tu pago no pudo procesarse</h1>
                <p>Hola, te informamos que el pago para el pedido <strong>#${order.id}</strong> ha sido ${newStatus === "rejected" ? "rechazado" : "cancelado"}.</p>
                <p>Si el problema persiste, podés intentar con otro medio de pago o contactarnos para ayudarte.</p>
                <div style="text-align: center; margin-top: 25px;">
                  <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout" 
                     style="background: #e11d48; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Intentar de nuevo
                  </a>
                </div>
              </div>
            `,
          );
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
