"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Default values (fallback if API fails)
const DEFAULT_CONFIG = {
  storeName: "Rano Urban",
  whatsappNumber: "3815010399",
  contactEmail: "info@ranourban.com",
  freeShippingMin: 30000,
  shippingCost: 1500,
  hoursWeekdays: "Lunes a Viernes: 9:00 - 20:00",
  hoursSaturday: "Sábados: 10:00 - 14:00",
  instagramUrl: "https://www.instagram.com/ranosurb/",
  facebookUrl: "https://www.facebook.com/p/Rano-Urban-61578961229095/",
  address: "Av. Belgrano 3659, San Miguel de Tucumán",
  phone: "+54 381 501-0399",
  navbarCategories: [
    { name: "Remeras", slug: "remeras" },
    { name: "Jeans", slug: "jeans" },
    { name: "Buzos", slug: "buzos" },
    { name: "Vestidos", slug: "vestidos" },
    { name: "Polleras", slug: "polleras" },
    { name: "Camisas", slug: "camisas" },
  ] as NavbarCategory[],
};

export interface NavbarCategory {
  name: string;
  slug: string;
}

export interface StoreConfig {
  storeName: string;
  whatsappNumber: string;
  contactEmail: string;
  freeShippingMin: number;
  shippingCost: number;
  hoursWeekdays: string;
  hoursSaturday: string;
  instagramUrl: string;
  facebookUrl: string;
  address: string;
  phone: string;
  navbarCategories: NavbarCategory[];
}

interface StoreConfigContextType {
  config: StoreConfig;
  isLoading: boolean;
}

const StoreConfigContext = createContext<StoreConfigContextType>({
  config: DEFAULT_CONFIG,
  isLoading: true,
});

export function StoreConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337";
        const response = await fetch(`${API_URL}/api/store-config`, {
          cache: "no-store", // Always get fresh data
        });

        if (!response.ok) {
          throw new Error("Failed to fetch store config");
        }

        const data = await response.json();

        // Merge with defaults (Strapi v5 response format)
        if (data.data) {
          setConfig({
            storeName: data.data.storeName || DEFAULT_CONFIG.storeName,
            whatsappNumber:
              data.data.whatsappNumber || DEFAULT_CONFIG.whatsappNumber,
            contactEmail: data.data.contactEmail || DEFAULT_CONFIG.contactEmail,
            freeShippingMin:
              data.data.freeShippingMin ?? DEFAULT_CONFIG.freeShippingMin,
            shippingCost: data.data.shippingCost ?? DEFAULT_CONFIG.shippingCost,
            hoursWeekdays:
              data.data.hoursWeekdays || DEFAULT_CONFIG.hoursWeekdays,
            hoursSaturday:
              data.data.hoursSaturday || DEFAULT_CONFIG.hoursSaturday,
            instagramUrl: data.data.instagramUrl || DEFAULT_CONFIG.instagramUrl,
            facebookUrl: data.data.facebookUrl || DEFAULT_CONFIG.facebookUrl,
            address: data.data.address || DEFAULT_CONFIG.address,
            phone: DEFAULT_CONFIG.phone, // Phone is derived from whatsapp
            navbarCategories:
              Array.isArray(data.data.navbarCategories) && data.data.navbarCategories.length > 0
                ? data.data.navbarCategories
                : DEFAULT_CONFIG.navbarCategories,
          });
        }
      } catch (err) {
        console.warn("Using default store config:", err);
        // Keep using defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return (
    <StoreConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </StoreConfigContext.Provider>
  );
}

export function useStoreConfig() {
  const context = useContext(StoreConfigContext);
  if (!context) {
    throw new Error("useStoreConfig must be used within StoreConfigProvider");
  }
  return context;
}

// Export defaults for components that need immediate values (SSR/build time)
export { DEFAULT_CONFIG };
