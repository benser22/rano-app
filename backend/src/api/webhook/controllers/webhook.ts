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

      await strapi.entityService.update("api::order.order", order.id, {
        data: {
          status: newStatus,
          paymentId: paymentData.id.toString(),
        } as any,
      });

      // Enviar email de confirmación (Optional / If email plugin active)
      if (newStatus === "paid") {
        try {
          await strapi.plugins["email"].services.email.send({
            to: order.email,
            subject: "Confirmación de compra",
            text: `Gracias por tu compra. Tu pedido ${order.id} ha sido confirmado.`,
            html: `<h1>Gracias por tu compra</h1><p>Tu pedido ${order.id} ha sido confirmado.</p>`,
          });
        } catch (err) {
          strapi.log.error("Failed to send email", err);
        }

        // Actualizar stock
        // Note: order.items is a component list. We loop and update.
        const orderAny = order as any;
        if (orderAny.items && Array.isArray(orderAny.items)) {
          // Refetch with population
          const orderWithItems = await strapi.entityService.findOne(
            "api::order.order",
            order.id,
            {
              populate: {
                items: {
                  populate: ["product"],
                },
              },
            },
          );

          const orderWithItemsAny = orderWithItems as any;
          for (const item of orderWithItemsAny.items) {
            if (item.product) {
              await strapi.entityService.update(
                "api::product.product",
                item.product.id,
                {
                  data: {
                    stock: (item.product.stock || 0) - item.quantity,
                  } as any,
                },
              );
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
