import axios from "axios";
import qs from "qs";

// Use different URLs for server-side (Docker internal) vs client-side (browser)
const isServer = typeof window === "undefined";
const STRAPI_URL = isServer
  ? process.env.API_URL || "http://localhost:1337"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

export const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { encodeValuesOnly: true }),
  },
});

export const getMediaUrl = (url: string | null) => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("//")) return url;

  // Always use public URL - images are displayed in the browser
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001"}${url}`;
};

export const fetchAPI = async (path: string, params: any = {}) => {
  try {
    const { data } = await strapi.get(path, { params });
    return data;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
};

// Client-side fetch that always uses the public URL (for use client components)
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export const clientFetchAPI = async (path: string, params: any = {}) => {
  try {
    const queryString = qs.stringify(params, { encodeValuesOnly: true });
    const url = `${PUBLIC_API_URL}/api${path}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    throw error;
  }
};

// Default navbar categories (fallback)
const DEFAULT_NAVBAR_CATEGORIES = [
  { name: "Remeras", slug: "remeras" },
  { name: "Jeans", slug: "jeans" },
  { name: "Buzos", slug: "buzos" },
  { name: "Vestidos", slug: "vestidos" },
  { name: "Polleras", slug: "polleras" },
  { name: "Camisas", slug: "camisas" },
];

export interface NavbarCategory {
  name: string;
  slug: string;
}

export interface StoreConfigData {
  storeName: string;
  navbarCategories: NavbarCategory[];
  freeShippingMin: number;
  shippingCost: number;
  address: string;
  whatsappNumber: string;
  phone: string;
  contactEmail: string;
  hoursWeekdays: string;
  hoursSaturday: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
}

/**
 * Get store config for Server Components
 * Use this instead of useStoreConfig hook in server components
 */
export async function getStoreConfig(): Promise<StoreConfigData> {
  try {
    const data = await fetchAPI("/store-config");

    if (data.data) {
      return {
        storeName: data.data.storeName || "Rano Urban",
        navbarCategories:
          Array.isArray(data.data.navbarCategories) &&
          data.data.navbarCategories.length > 0
            ? data.data.navbarCategories
            : DEFAULT_NAVBAR_CATEGORIES,
        freeShippingMin: data.data.freeShippingMin ?? 30000,
        shippingCost: data.data.shippingCost ?? 0,
        address:
          data.data.address || "Av. Belgrano 3659, San Miguel de Tucumán",
        whatsappNumber: data.data.whatsappNumber || "3815010399",
        phone: "+54 381 501-0399",
        contactEmail: data.data.contactEmail || "info@ranourban.com",
        hoursWeekdays:
          data.data.hoursWeekdays || "Lunes a Viernes: 9:00 - 20:00",
        hoursSaturday: data.data.hoursSaturday || "Sábados: 10:00 - 14:00",
        instagramUrl:
          data.data.instagramUrl || "https://www.instagram.com/ranosurb/",
        facebookUrl:
          data.data.facebookUrl ||
          "https://www.facebook.com/p/Rano-Urban-61578961229095/",
        tiktokUrl: data.data.tiktokUrl || "https://www.tiktok.com/@ranourban",
      };
    }
  } catch (error) {
    console.warn("Using default store config:", error);
  }

  return {
    storeName: "Rano Urban",
    navbarCategories: DEFAULT_NAVBAR_CATEGORIES,
    freeShippingMin: 30000,
    shippingCost: 0,
    address: "Av. Belgrano 3659, San Miguel de Tucumán",
    whatsappNumber: "3815010399",
    phone: "+54 381 501-0399",
    contactEmail: "info@ranourban.com",
    hoursWeekdays: "Lunes a Viernes: 9:00 - 20:00",
    hoursSaturday: "Sábados: 10:00 - 14:00",
    instagramUrl: "https://www.instagram.com/ranosurb/",
    facebookUrl: "https://www.facebook.com/p/Rano-Urban-61578961229095/",
    tiktokUrl: "https://www.tiktok.com/@ranourban",
  };
}
