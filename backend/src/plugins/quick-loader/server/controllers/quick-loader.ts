import type { Core } from "@strapi/strapi";

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  // Obtener estadísticas del dashboard
  async getStats(ctx: any) {
    try {
      // Estadísticas de productos (siempre deberían funcionar)
      let productsCount = 0;
      let categoriesCount = 0;
      let lowStockCount = 0;
      let noStockCount = 0;

      try {
        [productsCount, categoriesCount, lowStockCount, noStockCount] =
          await Promise.all([
            strapi.documents("api::product.product").count({}),
            strapi.documents("api::category.category").count({}),
            strapi.documents("api::product.product").count({
              filters: { stock: { $gt: 0, $lt: 5 } },
            }),
            strapi.documents("api::product.product").count({
              filters: { stock: { $eq: 0 } },
            }),
          ]);
      } catch (err) {
        strapi.log.warn("Error counting products/categories:", err);
      }

      // Estadísticas de órdenes (pueden fallar si no existe el content-type)
      let paidOrdersCount = 0;
      let monthlyOrdersCount = 0;
      let totalSales = 0;
      let monthlySales = 0;

      try {
        const now = new Date();
        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();

        // Verificar si existe el content-type order
        const orderContentType = strapi.contentTypes["api::order.order"];
        if (orderContentType) {
          [paidOrdersCount, monthlyOrdersCount] = await Promise.all([
            strapi.documents("api::order.order").count({
              filters: { status: { $in: ["paid", "completed"] } },
            }),
            strapi.documents("api::order.order").count({
              filters: { createdAt: { $gte: startOfMonth } },
            }),
          ]);

          // Calcular ventas
          const paidOrders = await strapi.db
            .query("api::order.order")
            .findMany({
              where: { status: { $in: ["paid", "completed"] } },
              select: ["total"],
            });
          totalSales = paidOrders.reduce(
            (sum: number, order: any) => sum + (order.total || 0),
            0,
          );

          const monthlyOrders = await strapi.db
            .query("api::order.order")
            .findMany({
              where: {
                status: { $in: ["paid", "completed"] },
                createdAt: { $gte: startOfMonth },
              },
              select: ["total"],
            });
          monthlySales = monthlyOrders.reduce(
            (sum: number, order: any) => sum + (order.total || 0),
            0,
          );
        }
      } catch (err) {
        strapi.log.warn(
          "Error getting order stats (order content-type may not exist):",
          err,
        );
      }

      ctx.body = {
        data: {
          products: productsCount,
          categories: categoriesCount,
          lowStock: lowStockCount,
          noStock: noStockCount,
          paidOrders: paidOrdersCount,
          monthlyOrders: monthlyOrdersCount,
          totalSales,
          monthlySales,
        },
      };
    } catch (error) {
      strapi.log.error("Error getting stats:", error);
      ctx.throw(500, error);
    }
  },

  // Obtener productos con stock bajo
  async getLowStock(ctx: any) {
    try {
      const products = await strapi.documents("api::product.product").findMany({
        filters: {
          stock: { $lt: 5 },
        },
        populate: ["category"],
        sort: { stock: "asc" },
        limit: 20,
      });

      ctx.body = { data: products };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Crear producto y publicarlo directamente
  async createProduct(ctx: any) {
    try {
      const data = ctx.request.body;

      const product = await strapi.documents("api::product.product").create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          price: data.price,
          comparePrice: data.comparePrice || null,
          sku: data.sku,
          stock: data.stock || 0,
          sizes: data.sizes || [],
          colors: data.colors || [],
          tags: data.tags || [],
          featured: data.featured || false,
          category: data.category || null,
          images: data.images || [],
        },
        status: "published",
      });

      ctx.body = { data: product };
    } catch (error) {
      strapi.log.error("Error creating product:", error);
      ctx.throw(500, error);
    }
  },
});

export default controller;
