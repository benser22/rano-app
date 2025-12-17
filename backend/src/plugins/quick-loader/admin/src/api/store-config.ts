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

// ==================== STORE CONFIG ====================

export interface StoreConfig {
  id: number;
  documentId: string;
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
  navbarCategories: { name: string; slug: string }[];
}

export type StoreConfigInput = Partial<Omit<StoreConfig, "id" | "documentId">>;

export async function getStoreConfig(): Promise<{ data: StoreConfig }> {
  return fetchWithAuth(`${API_BASE}/store-config`);
}

export async function updateStoreConfig(
  data: StoreConfigInput,
): Promise<{ data: StoreConfig }> {
  return fetchWithAuth(`${API_BASE}/store-config`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}
