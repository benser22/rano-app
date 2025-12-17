import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::product.product",
  ({ strapi }) => ({
    async getFilters(ctx) {
      try {
        const products = await strapi.entityService.findMany(
          "api::product.product",
          {
            fields: ["sizes", "colors"],
            limit: -1, // Fetch all to get accurate filters
          },
        );

        const allSizes = new Set<string>();
        const allColors = new Set<string>();

        // @ts-ignore
        products.forEach((product) => {
          if (Array.isArray(product.sizes)) {
            product.sizes.forEach((s: string) => allSizes.add(s));
          }
          if (Array.isArray(product.colors)) {
            product.colors.forEach((c: string) => allColors.add(c));
          }
        });

        return {
          sizes: Array.from(allSizes).sort(),
          colors: Array.from(allColors).sort(),
        };
      } catch (err) {
        ctx.body = err;
      }
    },
  }),
);
