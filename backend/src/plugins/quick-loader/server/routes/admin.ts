export default {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/stats",
      handler: "quickLoader.getStats",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "GET",
      path: "/low-stock",
      handler: "quickLoader.getLowStock",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "POST",
      path: "/products",
      handler: "quickLoader.createProduct",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};
