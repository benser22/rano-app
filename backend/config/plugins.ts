export default ({ env }) => ({
  // Plugin Quick Loader - Carga rápida de productos
  "quick-loader": {
    enabled: true,
    resolve: "./src/plugins/quick-loader",
  },
  // Configuración del Upload
  upload: {
    config: {
      sizeLimit: 3 * 1024 * 1024, // 3MB en bytes
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
    },
  },
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST", "smtp.gmail.com"),
        port: env.int("SMTP_PORT", 587),
        secure: env.bool("SMTP_SECURE", false),
        auth: {
          user: env("SMTP_USER"),
          pass: env("SMTP_PASS"),
        },
      },
      settings: {
        defaultFrom: env("SMTP_FROM", "noreply@ranourban.com"),
        defaultReplyTo: env("SMTP_REPLY_TO", "info@ranourban.com"),
      },
    },
  },
});
