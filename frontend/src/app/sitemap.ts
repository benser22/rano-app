import { MetadataRoute } from "next";
import { fetchAPI } from "@/lib/api/strapi";
import { Product } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.FRONTEND_URL || "https://tu-tienda.com";

  // Static routes
  const routes = [
    "",
    "/productos",
    "/contacto",
    // Add other static pages here
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch products
  let products: Product[] = [];
  try {
    const data = await fetchAPI("/products", {
      pagination: {
        limit: 1000,
      },
      fields: ["slug", "updatedAt"],
    });
    products = data.data || [];
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/productos/${product.slug}`,
    lastModified: product.updatedAt || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes];
}
