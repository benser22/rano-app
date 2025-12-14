import type { Core } from "@strapi/strapi";

const config: Core.RouterConfig = {
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/webhooks/mercadopago",
      handler: "webhook.handleMercadoPago",
      config: {
        auth: false,
        middlewares: ["global::verifyMPSignature"],
      },
    },
  ],
};

export default config;
