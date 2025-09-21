'use client';

import { ICategory, IProduct } from '@/types/database';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface IApiError {
  error: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData: IApiError = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Productos
  async getProducts(params?: {
    categoryId?: string;
  }): Promise<IProduct[]> {
    const searchParams = new URLSearchParams();

    if (params?.categoryId) {
      searchParams.append('categoryId', params.categoryId);
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<IProduct[]>(endpoint);
  }

  async getProduct(id: string): Promise<IProduct> {
    return this.request<IProduct>(`/products/${id}`);
  }

  async createProduct(productData: {
    name: string;
    price: number;
    description?: string;
    categoryId: string;
  }): Promise<IProduct> {
    return this.request<IProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Categorías
  async getCategories(): Promise<ICategory[]> {
    return this.request<ICategory[]>('/categories');
  }

  async getCategory(id: string): Promise<ICategory> {
    return this.request<ICategory>(`/categories/${id}`);
  }

  async createCategory(categoryData: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<ICategory> {
    return this.request<ICategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  // Métodos adicionales se pueden agregar aquí según sea necesario
}

export const apiService = new ApiService();
export default apiService;
