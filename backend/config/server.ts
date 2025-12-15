export default ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  url: env("STRAPI_URL", "https://rano-api.22studios.xyz"), // Fallback to explicitly secure URL
  proxy: true,
  app: {
    keys: env.array("APP_KEYS"),
  },
});
