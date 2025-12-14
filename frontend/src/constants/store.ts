// Store categories - easily editable
// Using primary coral color from CSS variables
export const STORE_CATEGORIES = [
  {
    name: "Remeras",
    slug: "remeras",
    icon: "Shirt",
    gradient: "from-primary to-primary/90",
  },
  {
    name: "Jeans",
    slug: "jeans",
    icon: "Scissors",
    gradient: "from-primary to-primary/90",
  },
  {
    name: "Buzos",
    slug: "buzos",
    icon: "CloudSun",
    gradient: "from-primary to-primary/90",
  },
  {
    name: "Vestidos",
    slug: "vestidos",
    icon: "Sparkles",
    gradient: "from-primary to-primary/90",
  },
  {
    name: "Polleras",
    slug: "polleras",
    icon: "Flower2",
    gradient: "from-primary to-primary/95",
  },
  {
    name: "Camisas",
    slug: "camisas",
    icon: "Crown",
    gradient: "from-primary to-primary/95",
  },
] as const;

// Navbar categories (subset for main nav)
export const NAVBAR_CATEGORIES = [
  { name: "Remeras", slug: "remeras" },
  { name: "Jeans", slug: "jeans" },
  { name: "Buzos", slug: "buzos" },
  { name: "Vestidos", slug: "vestidos" },
  { name: "Polleras", slug: "polleras" },
  { name: "Camisas", slug: "camisas" },
] as const;

// Category translations for Spanish display
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  sale: "Ofertas",
  remeras: "Remeras",
  jeans: "Jeans",
  buzos: "Buzos",
  vestidos: "Vestidos",
  polleras: "Polleras",
  camisas: "Camisas",
  accesorios: "Accesorios",
};

// Social media links
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/ranosurb/",
  facebook: "https://www.facebook.com/p/Rano-Urban-61578961229095/",
  tiktok: "https://www.tiktok.com/@ranourban",
} as const;

// Store hours - can be overridden by env vars
export const STORE_HOURS = {
  weekdays:
    process.env.NEXT_PUBLIC_STORE_HOURS_WEEKDAYS ||
    "Lunes a Viernes: 9:00 - 20:00",
  saturday:
    process.env.NEXT_PUBLIC_STORE_HOURS_SATURDAY || "Sábados: 10:00 - 14:00",
} as const;

// Store info from env vars
export const STORE_INFO = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@ranourban.com",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "3815010399",
  phone: "+54 381 501-0399",
  address: "Av. Belgrano 3659, San Miguel de Tucumán",
  freeShippingMin: parseInt(
    process.env.NEXT_PUBLIC_FREE_SHIPPING_MIN || "50000",
  ),
} as const;

// Helper function to get category name
export function getCategoryName(slug: string): string {
  return (
    CATEGORY_TRANSLATIONS[slug] || slug.charAt(0).toUpperCase() + slug.slice(1)
  );
}
