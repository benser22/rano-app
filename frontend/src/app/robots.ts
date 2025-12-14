import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.FRONTEND_URL || "https://tu-tienda.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/checkout/", "/perfil/", "/pedidos/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
