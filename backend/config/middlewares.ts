export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  "strapi::security",
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  {
    name: "strapi::session",
    config: {
      secure: env.bool("COOKIE_SECURE", false),
    },
  },
  "strapi::favicon",
  "strapi::public",
];
