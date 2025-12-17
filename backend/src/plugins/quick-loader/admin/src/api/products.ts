import { PLUGIN_ID } from "../pluginId";

const API_BASE = `/api`;

// Helper para hacer requests autenticadas
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Error desconocido" }));
    throw new Error(
      error.error?.message || error.message || "Error en la petición",
    );
  }

  return response.json();
}

// ==================== PRODUCTS ====================

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  sku: string;
  stock: number;
  sizes: string[];
  colors: string[];
  tags: string[];
  featured: boolean;
  publishedAt: string | null;
  category?: {
    id: number;
    documentId: string;
    name: string;
    slug: string;
  };
  images?: {
    id: number;
    url: string;
    name: string;
  }[];
}

export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  featured?: boolean;
  category?: number;
}

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: Product[]; meta: { pagination: { total: number } } }> {
  const searchParams = new URLSearchParams();
  searchParams.set("populate", "category,images");
  searchParams.set("sort", "createdAt:desc");

  if (params?.search) {
    searchParams.set("filters[$or][0][name][$containsi]", params.search);
    searchParams.set("filters[$or][1][sku][$containsi]", params.search);
  }

  if (params?.category) {
    searchParams.set("filters[category][id][$eq]", params.category);
  }

  if (params?.page) {
    searchParams.set("pagination[page]", String(params.page));
  }

  if (params?.pageSize) {
    searchParams.set("pagination[pageSize]", String(params.pageSize));
  }

  return fetchWithAuth(`${API_BASE}/products?${searchParams.toString()}`);
}

export async function getProduct(
  documentId: string,
): Promise<{ data: Product }> {
  return fetchWithAuth(
    `${API_BASE}/products/${documentId}?populate=category,images`,
  );
}

export async function createProduct(
  data: ProductInput,
): Promise<{ data: Product }> {
  return fetchWithAuth(`${API_BASE}/products`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function updateProduct(
  documentId: string,
  data: Partial<ProductInput>,
): Promise<{ data: Product }> {
  return fetchWithAuth(`${API_BASE}/products/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export async function deleteProduct(documentId: string): Promise<void> {
  return fetchWithAuth(`${API_BASE}/products/${documentId}`, {
    method: "DELETE",
  });
}

export async function publishProduct(
  documentId: string,
): Promise<{ data: Product }> {
  return fetchWithAuth(`${API_BASE}/products/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { publishedAt: new Date().toISOString() } }),
  });
}

export async function unpublishProduct(
  documentId: string,
): Promise<{ data: Product }> {
  return fetchWithAuth(`${API_BASE}/products/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { publishedAt: null } }),
  });
}
