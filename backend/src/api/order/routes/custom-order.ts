import type { Core } from "@strapi/strapi";

const config: Core.RouterConfig = {
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/orders/checkout",
      handler: "custom-order.checkout",
      config: {
        auth: false,
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

export default config;
