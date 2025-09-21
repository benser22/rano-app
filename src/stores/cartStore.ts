import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ICart, ICartItem, IProduct } from '@/types/store';

interface CartStore extends ICart {
  addItem: (
    product: IProduct,
    quantity: number,
    selectedSize: string,
    selectedColor: string
  ) => void;
  removeItem: (productId: string, selectedSize: string, selectedColor: string) => void;
  updateQuantity: (
    productId: string,
    selectedSize: string,
    selectedColor: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  getItemKey: (productId: string, selectedSize: string, selectedColor: string) => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      getItemKey: (productId: string, selectedSize: string, selectedColor: string) =>
        `${productId}-${selectedSize}-${selectedColor}`,

      addItem: (product, quantity, selectedSize, selectedColor) =>
        set(state => {
          const existingItemIndex = state.items.findIndex(
            item =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
          );

          let newItems: ICartItem[];

          if (existingItemIndex >= 0) {
            // Update existing item
            newItems = state.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item
            newItems = [
              ...state.items,
              {
                product,
                quantity,
                selectedSize,
                selectedColor,
              },
            ];
          }

          const total = newItems.reduce(
            (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total,
            itemCount,
          };
        }),

      removeItem: (productId, selectedSize, selectedColor) =>
        set(state => {
          const newItems = state.items.filter(
            item =>
              !(
                item.product.id === productId &&
                item.selectedSize === selectedSize &&
                item.selectedColor === selectedColor
              )
          );

          const total = newItems.reduce(
            (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total,
            itemCount,
          };
        }),

      updateQuantity: (productId, selectedSize, selectedColor, quantity) =>
        set((state: CartStore) => {
          if (quantity <= 0) {
            get().removeItem(productId, selectedSize, selectedColor);
            return state;
          }

          const newItems = state.items.map((item: ICartItem) =>
            item.product.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
              ? { ...item, quantity }
              : item
          );

          const total = newItems.reduce(
            (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
            0
          );

          const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

          return {
            items: newItems,
            total,
            itemCount,
          };
        }),

      clearCart: () =>
        set({
          items: [],
          total: 0,
          itemCount: 0,
        }),
    }),
    {
      name: 'rano-cart-storage',
    }
  )
);