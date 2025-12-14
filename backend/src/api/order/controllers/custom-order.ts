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
      const product = await strapi.entityService.findOne(
        "api::product.product",
        item.id,
      );
      if (!product) {
        return ctx.badRequest(`Product ${item.id} not found`);
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
      });

      const productAny = product as any;
      infoItems.push({
        title: product.name,
        unit_price: Number(product.price),
        quantity: item.quantity,
        currency_id: "ARS", // Assuming ARS or use configured currency
        picture_url:
          productAny.images && productAny.images.length > 0
            ? productAny.images[0].url.startsWith("http")
              ? productAny.images[0].url
              : `${process.env.URL || "http://localhost:1337"}${productAny.images[0].url}`
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
      externalReference: `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    // Add user relation if authenticated (Strapi v5 uses documentId for relations)
    if (ctx.state.user) {
      orderData.user = {
        connect: [ctx.state.user.documentId || ctx.state.user.id],
      };
    }

    const order = await strapi.entityService.create("api::order.order", {
      data: orderData,
    });

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

        await strapi.entityService.update("api::product.product", idToUpdate, {
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
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const webhookUrl = process.env.WEBHOOK_URL;

      // Creando preferencia de MP con frontendUrl y webhookUrl (logs removidos)

      const result = await preference.create({
        body: {
          items: infoItems,
          metadata: {
            order_id: order.id,
          },
          external_reference: order.externalReference,
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
        },
      });

      return {
        id: result.id,
        init_point: result.init_point,
        orderId: order.id,
      };
    } catch (error) {
      console.error(error);
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
