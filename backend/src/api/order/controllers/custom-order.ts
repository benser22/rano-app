import { factories } from "@strapi/strapi";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
  options: { timeout: 5000 },
});

const preference = new Preference(client);

export default {
  async checkout(ctx) {
    // Manually verify JWT if present (since auth: false)
    if (!ctx.state.user && ctx.request.header.authorization) {
      try {
        const token = ctx.request.header.authorization.split(" ")[1];
        if (token) {
          const decoded =
            await strapi.plugins["users-permissions"].services.jwt.verify(
              token,
            );
          if (decoded) {
            ctx.state.user = await strapi.entityService.findOne(
              "plugin::users-permissions.user",
              decoded.id,
            );
          }
        }
      } catch (err) {
        console.warn("Invalid token in checkout:", err);
      }
    }

    const { items, shippingAddress, email } = ctx.request.body;

    if (!items || items.length === 0) {
      return ctx.badRequest("No items in cart");
    }

    // Validate stock and calculate total (server side trust)
    let total = 0;
    const infoItems = []; // For MP

    const orderItems = [];

    for (const item of items) {
      // Use item.product (from frontend) or fallback to item.id
      const productId = item.product || item.id;

      const product = await strapi.entityService.findOne(
        "api::product.product",
        productId,
      );
      if (!product) {
        return ctx.badRequest(`Product ${productId} not found`);
      }
      if (product.stock < item.quantity) {
        return ctx.badRequest(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = Number(product.price) * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: product.id,
        quantity: item.quantity,
        price: product.price, // snapshot price
        size: item.size,
        color: item.color,
      });

      const productAny = product as any;
      const variantInfo = [item.size, item.color].filter(Boolean).join(" / ");

      infoItems.push({
        title: variantInfo ? `${product.name} (${variantInfo})` : product.name,
        unit_price: Number(product.price),
        quantity: item.quantity,
        currency_id: "ARS", // Assuming ARS or use configured currency
        picture_url:
          productAny.images && productAny.images.length > 0
            ? productAny.images[0].url.startsWith("http")
              ? productAny.images[0].url
              : `${process.env.STRAPI_URL || "http://localhost:1337"}${productAny.images[0].url}`
            : "",
      });
    }

    // Create Order in Pending State
    const orderData: any = {
      items: orderItems,
      total: total,
      status: "pending",
      shippingAddress,
      email,
      phone: shippingAddress?.phone || null,
      externalReference: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    // Add user relation if authenticated (Strapi v5 uses documentId for relations)
    if (ctx.state.user) {
      orderData.user = {
        connect: [ctx.state.user.documentId || ctx.state.user.id],
      };
    }

    // Create Order in Pending State using Strapi 5 Document Service
    const order = await strapi.documents("api::order.order").create({
      data: orderData,
      status: "published",
    });

    const orderService = strapi.service("api::order.order") as any;
    const orderId = order.id;

    // Send "Order Received" email
    try {
      await orderService.sendEmail(
        email,
        "Hemos recibido tu pedido - Rano Urban",
        `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h1 style="text-align: center; color: #000;">¡Gracias por tu pedido!</h1>
            <p>Hola, hemos recibido correctamente tu pedido <strong>#${orderId}</strong>.</p>
            <p>El siguiente paso es completar el pago para que podamos procesar tu envío.</p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Número de Pedido:</strong> #${orderId}</p>
              <p style="margin: 5px 0 0;"><strong>Total a pagar:</strong> $${total}</p>
            </div>
            
            <p>Si aún no has completado el pago en la ventana de MercadoPago, podés hacerlo ahora.</p>
            <p>Una vez confirmado el pago, te enviaremos otro email de confirmación.</p>
            
            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
              <p>Rano Urban - Calidad y Precio</p>
            </div>
          </div>
        `,
      );

      // WhatsApp Notification
      const phone = orderData.phone;
      if (phone) {
        await orderService.sendWhatsAppNotification(
          phone,
          `¡Hola! Gracias por tu pedido #${orderId} en Rano Urban. Estamos esperando la confirmación de tu pago por $${total}. ¡Te avisaremos cuando esté listo!`,
        );
      }
    } catch (err) {
      strapi.log.error("Failed to send initial notifications", err);
    }

    // Deduct stock (Reservation strategy)
    for (const item of orderItems) {
      try {
        // En Strapi v5, findOne suele requerir documentId. Si item.product es numerico (ID SQL),
        // es mas seguro usar db.query para obtener el documentId primero.

        // Intento buscar por ID SQL directo usando query engine que es agnóstico
        const productFound = await strapi.db
          .query("api::product.product")
          .findOne({
            where: { id: item.product },
            select: ["id", "documentId", "stock", "name"],
          });

        if (!productFound) {
          console.error(
            `Product not found during stock deduction: ${item.product}`,
          );
          continue;
        }

        const newStock = productFound.stock - item.quantity;
        const validStock = newStock >= 0 ? newStock : 0;

        // Analysis of logs showed 'invalid input syntax for type integer: "wr2c..."'
        // This means entityService.update is querying by ID (int) but received a string (documentId).
        // Switching to numeric ID.
        const idToUpdate = productFound.id;

        await strapi.db.query("api::product.product").update({
          where: { id: idToUpdate },
          data: {
            stock: validStock,
          },
        });
        strapi.log.info(
          `FAILSAFE STOCK UPDATE: ${productFound.name} -> New Stock: ${validStock}`,
        );
      } catch (err) {
        strapi.log.error(
          `Failed to update stock for product ${item.product}:`,
          err,
        );
        // Si falla el update de stock, es critico, deberíamos al menos alertar.
      }
    }

    // Update external reference with real ID if we want, or use the generated one.
    // Better to use database ID in Ref? Or UUID.
    // Let's use the externalReference generated above.

    try {
      let frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      // Remove trailing slash if exists
      if (frontendUrl.endsWith("/")) {
        frontendUrl = frontendUrl.slice(0, -1);
      }

      const webhookUrl = process.env.WEBHOOK_URL;

      strapi.log.info(`Creating MP Preference for Order #${orderId}`);
      strapi.log.info(`Frontend URL: ${frontendUrl}`);

      const preferenceBody = {
        items: infoItems,
        metadata: {
          order_id: orderId,
        },
        external_reference: order.externalReference || `ORDER-${orderId}`,
        notification_url: webhookUrl
          ? `${webhookUrl}/api/webhooks/mercadopago`
          : undefined,
        payer: {
          email: email,
        },
        back_urls: {
          success: `${frontendUrl}/checkout/success`,
          failure: `${frontendUrl}/checkout/error`,
          pending: `${frontendUrl}/checkout/pending`,
        },
        auto_return: "approved",
      };

      const result = await preference.create({
        body: preferenceBody,
      });

      return {
        id: result.id,
        init_point: result.init_point,
        orderId: orderId,
      };
    } catch (error: any) {
      strapi.log.error("MercadoPago Preference Error:");
      strapi.log.error(
        JSON.stringify(
          error?.response?.data || error?.message || error,
          null,
          2,
        ),
      );
      return ctx.internalServerError("Failed to create preference");
    }
  },

  async myOrders(ctx) {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("You must be logged in");
    }

    try {
      const orders = await strapi.entityService.findMany("api::order.order", {
        filters: {
          user: userId,
        },
        sort: { createdAt: "desc" },
        populate: {
          items: {
            populate: {
              product: {
                populate: ["images"],
              },
            },
          },
        },
      });

      return {
        data: orders,
      };
    } catch (error) {
      console.error("Error fetching orders:", error);
      return ctx.internalServerError("Failed to fetch orders");
    }
  },
};
