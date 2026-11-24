import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';
import { useSidebarStore } from './useSidebarStore';

// The cart lives in the browser. Prices and stock are re-checked by the CRM at checkout.

const toItem = (product, quantity) => {
  const id = String(product.product_id || product.id || product.slug);
  const price = parseFloat(product.unit_price) || parseFloat(product.discounted_price) || parseFloat(product.price) || 0;
  return {
    id,
    product_id: id,
    slug: product.slug || id,
    variant_id: product.variant_id || null,
    name: product.name || 'Product',
    unit: product.selected_unit || product.unit || '',
    price,
    image: product.image_url || product.first_image || product.images?.[0]?.image || '/placeholder.png',
    stock_qty: product.stock_qty ?? null,
    quantity,
  };
};

const clampQty = (item, qty) => (item.stock_qty != null ? Math.min(qty, Math.max(0, item.stock_qty)) : qty);

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Kept for compatibility with older callers; the cart is local now.
      initCart: async () => {},

      addItem: async (product, quantity = 1) => {
        if (!useUserStore.getState().isAuthenticated) {
          useSidebarStore.getState().openLoginModal();
          return { success: false, error: 'Not authenticated' };
        }
        if (product?.stock_status === 'Out of stock') {
          return { success: false, error: 'Out of stock' };
        }

        const incoming = toItem(product, Math.max(1, parseInt(quantity) || 1));
        const items = get().items;
        const existing = items.find((i) => i.id === incoming.id);

        set({
          items: existing
            ? items.map((i) => (i.id === incoming.id ? { ...i, quantity: clampQty(i, i.quantity + incoming.quantity) } : i))
            : [...items, { ...incoming, quantity: clampQty(incoming, incoming.quantity) }],
        });
        useSidebarStore.getState().openCart();
        return { success: true };
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) return get().removeItem(id);
        set({ items: get().items.map((i) => (i.id === id ? { ...i, quantity: clampQty(i, quantity) } : i)) });
      },

      removeItem: async (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      clearCart: async () => {
        set({ items: [] });
      },

      getCartTotal: () => get().items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (i.quantity || 1), 0),
    }),
    {
      name: 'betopia-cart-storage',
      version: 2,
      // Carts from the old backend used its own item IDs; start fresh
      migrate: () => ({ items: [] }),
    }
  )
);
