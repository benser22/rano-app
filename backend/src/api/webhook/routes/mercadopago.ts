export default {
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

export const type = "content-api";
