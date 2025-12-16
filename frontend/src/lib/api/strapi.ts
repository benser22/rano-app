import axios from "axios";
import qs from "qs";

const STRAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";

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
  return `${STRAPI_URL}${url}`;
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
  address: string;
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
        address:
          data.data.address || "Av. Belgrano 3659, San Miguel de Tucumán",
      };
    }
  } catch (error) {
    console.warn("Using default store config:", error);
  }

  return {
    storeName: "Rano Urban",
    navbarCategories: DEFAULT_NAVBAR_CATEGORIES,
    freeShippingMin: 30000,
    address: "Av. Belgrano 3659, San Miguel de Tucumán",
  };
}
