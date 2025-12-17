export default {
  routes: [
    {
      method: "GET",
      path: "/products/filters",
      handler: "product.getFilters",
      config: {
        auth: false,
      },
    },
  ],
};
