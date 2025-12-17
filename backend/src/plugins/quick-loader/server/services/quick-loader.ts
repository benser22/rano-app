import type { Core } from "@strapi/strapi";

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  // Servicio para obtener stats del dashboard
  async getStats() {
    const [productsCount, categoriesCount, lowStockCount, noStockCount] =
      await Promise.all([
        strapi.documents("api::product.product").count({}),
        strapi.documents("api::category.category").count({}),
        strapi.documents("api::product.product").count({
          filters: {
            stock: { $gt: 0, $lt: 5 },
          },
        }),
        strapi.documents("api::product.product").count({
          filters: {
            stock: { $eq: 0 },
          },
        }),
      ]);

    return {
      products: productsCount,
      categories: categoriesCount,
      lowStock: lowStockCount,
      noStock: noStockCount,
    };
  },
});

export default service;
