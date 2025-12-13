import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistItem {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
}

interface WishlistActions {
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  getItemCount: () => number;
}

type WishlistStore = WishlistState & WishlistActions;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        const { items } = get();
        
        // Check if already in wishlist
        if (items.some((item) => item.id === product.id)) {
          return;
        }

        const imageUrl = product.images?.[0]?.url || null;

        set({
          items: [
            ...items,
            {
              id: product.id,
              documentId: product.documentId,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: imageUrl,
              addedAt: new Date().toISOString(),
            },
          ],
        });
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      isInWishlist: (productId: number) => {
        return get().items.some((item) => item.id === productId);
      },

      toggleItem: (product: Product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
