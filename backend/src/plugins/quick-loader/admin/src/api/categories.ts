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

// ==================== CATEGORIES ====================

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  publishedAt: string | null;
  products?: { count: number };
}

export interface CategoryInput {
  name: string;
  slug: string;
}

export async function getCategories(): Promise<{ data: Category[] }> {
  return fetchWithAuth(
    `${API_BASE}/categories?populate=products&sort=name:asc`,
  );
}

export async function getCategory(
  documentId: string,
): Promise<{ data: Category }> {
  return fetchWithAuth(
    `${API_BASE}/categories/${documentId}?populate=products`,
  );
}

export async function createCategory(
  data: CategoryInput,
): Promise<{ data: Category }> {
  return fetchWithAuth(`${API_BASE}/categories`, {
    method: "POST",
    body: JSON.stringify({ data }),
  });
}

export async function updateCategory(
  documentId: string,
  data: Partial<CategoryInput>,
): Promise<{ data: Category }> {
  return fetchWithAuth(`${API_BASE}/categories/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export async function deleteCategory(documentId: string): Promise<void> {
  return fetchWithAuth(`${API_BASE}/categories/${documentId}`, {
    method: "DELETE",
  });
}
