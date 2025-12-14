import type { Core } from "@strapi/strapi";

const config: Core.RouterConfig = {
  type: "content-api",
  routes: [
    {
      method: "POST",
      path: "/auth/google/callback",
      handler: "auth.googleCallback",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

export default config;
