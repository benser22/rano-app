export default {
  routes: [
    {
      method: "POST",
      path: "/orders/checkout",
      handler: "custom-order.checkout",
      config: {
        auth: false, // Or true if requiring login
      },
    },
    {
      method: "GET",
      path: "/orders/my-orders",
      handler: "custom-order.myOrders",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

export const type = "content-api";
