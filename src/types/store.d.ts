export interface IProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  discountPrice?: number;
  images?: string; // comma-separated URLs
  category?: ICategory;
  categoryId: string;
  sizes?: string; // comma-separated sizes
  colors?: string; // comma-separated colors
  stock?: number;
  featured?: boolean;
  slug?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  image?: string;
  icon?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;
  products?: IProduct[];
}

export interface ICartItem {
  product: IProduct;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface ICart {
  items: ICartItem[];
  total: number;
  itemCount: number;
}

export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  user: IUser;
  items: ICartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: IShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}
