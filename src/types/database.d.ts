export interface ICategory {
  id: string
  name: string
  slug: string
  description?: string | null
  products?: IProduct[]
  createdAt: Date
  updatedAt: Date
}

export interface IProduct {
  id: string
  name: string
  price: number
  description?: string | null
  categoryId: string
  category?: ICategory
  createdAt: Date
  updatedAt: Date
}

export interface ICategoryCreate {
  name: string
  slug: string
  description?: string
}

export interface IProductCreate {
  name: string
  price: number
  description?: string
  categoryId: string
}