import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, demandDate = null) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.product.product_id === product.product_id);

        if (existingItem) {
          // Check max order logic here if needed
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            product.max_order_qty || Infinity
          );
          
          set({
            items: currentItems.map((item) =>
              item.product.product_id === product.product_id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          // Check MOQ logic here if needed
          const initialQuantity = Math.max(quantity, product.moq || 1);
          set({ items: [...currentItems, { product, quantity: initialQuantity, demandDate }] });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.product_id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map((item) => {
            if (item.product.product_id === productId) {
               const maxAllowed = item.product.max_order_qty || Infinity;
               const minAllowed = item.product.moq || 1;
               const safeQuantity = Math.max(minAllowed, Math.min(quantity, maxAllowed));
               return { ...item, quantity: safeQuantity };
            }
            return item;
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.product.unit_price * item.quantity, 0);
      },
    }),
    {
      name: 'betopia-daily-cart',
    }
  )
);

