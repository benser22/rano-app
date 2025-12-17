// Talles predefinidos para ropa
export const PREDEFINED_SIZES = [
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  // Numéricos
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
  "48",
  // Únicos
  "Único",
];

// Colores predefinidos con sus códigos hex
export const PREDEFINED_COLORS = [
  { name: "Negro", hex: "#000000" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Gris", hex: "#808080" },
  { name: "Gris Claro", hex: "#D3D3D3" },
  { name: "Gris Oscuro", hex: "#404040" },
  { name: "Rojo", hex: "#FF0000" },
  { name: "Bordo", hex: "#800020" },
  { name: "Rosa", hex: "#FFC0CB" },
  { name: "Fucsia", hex: "#FF00FF" },
  { name: "Naranja", hex: "#FFA500" },
  { name: "Coral", hex: "#FF7F50" },
  { name: "Amarillo", hex: "#FFFF00" },
  { name: "Dorado", hex: "#FFD700" },
  { name: "Verde", hex: "#008000" },
  { name: "Verde Militar", hex: "#4B5320" },
  { name: "Verde Agua", hex: "#00FFFF" },
  { name: "Azul", hex: "#0000FF" },
  { name: "Azul Marino", hex: "#000080" },
  { name: "Celeste", hex: "#87CEEB" },
  { name: "Turquesa", hex: "#40E0D0" },
  { name: "Violeta", hex: "#8B00FF" },
  { name: "Lila", hex: "#C8A2C8" },
  { name: "Marrón", hex: "#8B4513" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Crudo", hex: "#FFFDD0" },
  { name: "Plateado", hex: "#C0C0C0" },
  {
    name: "Multicolor",
    hex: "linear-gradient(45deg, red, orange, yellow, green, blue, purple)",
  },
  { name: "Animal Print", hex: "#C4A35A" },
  { name: "Jean", hex: "#4169E1" },
];

// Función para generar slug desde nombre
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales
    .replace(/(^-|-$)/g, ""); // Remover guiones al inicio/final
};

// Función para generar SKU automático
export const generateSKU = (name: string, category?: string): string => {
  const prefix = category ? category.substring(0, 3).toUpperCase() : "PRD";
  const namePart = name.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${namePart}-${random}`;
};

// Etiquetas predefinidas para productos
export const PREDEFINED_TAGS = [
  "Nuevo",
  "Oferta",
  "Destacado",
  "Liquidación",
  "Edición Limitada",
  "Verano",
  "Invierno",
  "Tendencia",
  "Exclusivo",
  "Black Friday",
];
