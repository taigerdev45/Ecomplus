import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem, Devis, ShippingMethod } from '@ecom/types';
import api from '@/lib/axios';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: (exchangeRate: number) => number;
  getTotalItems: () => number;
  getQuotePreview: (shippingMethod: ShippingMethod, address: string, city: string, whatsapp: string) => Promise<Devis>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: (exchangeRate) => {
        return get().items.reduce((acc, item) => {
          const priceXaf = (item.product.prix_cny / 100) * exchangeRate;
          return acc + priceXaf * item.quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getQuotePreview: async (shippingMethod, address, city, whatsapp) => {
        const res = await api.post<Devis>('/orders/quote-preview', {
          items: get().items,
          shippingMethod,
          address,
          city,
          whatsapp,
        });
        return res.data;
      },
    }),
    {
      name: 'ecom-cart-storage',
    }
  )
);
