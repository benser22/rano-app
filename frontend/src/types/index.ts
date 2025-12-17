export interface Image {
  id: number;
  url: string;
  width: number;
  height: number;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images?: Image[];
  category?: Category;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}
