import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';
import { useSidebarStore } from './useSidebarStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/';

const getAuthHeaders = () => {
  const token = useUserStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      id: null,
      items: [],
      subtotal: "0.00",
      total_discount: "0.00",
      grand_total: "0.00",
      isLoading: false,
      error: null,

      // Set internal state from API response
      _setCartData: (response) => {
        const data = response.data || response;
        set({
          id: data.id || null,
          items: data.items || [],
          subtotal: data.subtotal || "0.00",
          total_discount: data.total_discount || "0.00",
          grand_total: data.grand_total || "0.00",
          error: null
        });
      },

      // GET /cart/
      initCart: async () => {
        const { isAuthenticated, accessToken, logout } = useUserStore.getState();
        if (!isAuthenticated || !accessToken) {
          if (isAuthenticated && !accessToken) {
            logout();
          }
          set({ items: [], subtotal: "0.00", total_discount: "0.00", grand_total: "0.00", id: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}cart/`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            get()._setCartData(data);
          } else {
            set({ error: 'Failed to fetch cart' });
          }
        } catch (err) {
          set({ error: 'Network error' });
        } finally {
          set({ isLoading: false });
        }
      },

      // POST /cart/items/
      addItem: async (product) => {
        const { isAuthenticated, accessToken, logout } = useUserStore.getState();
        if (!isAuthenticated || !accessToken) {
          if (isAuthenticated && !accessToken) {
            logout();
          }
          useSidebarStore.getState().openLoginModal();
          return { success: false, error: 'Not authenticated' };
        }

        const product_slug = typeof product === 'string' 
          ? product 
          : (product.slug || product.product_slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : null) || product.product_id || product.id);

        const existingItem = get().items.find(item => item.slug === product_slug);
        if (existingItem) {
          await get().updateQuantity(existingItem.id, existingItem.quantity + 1);
          useSidebarStore.getState().openCart();
          return { success: true };
        }

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}cart/items/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ product_slug })
          });
          
          if (res.ok) {
            await get().initCart(); 
            useSidebarStore.getState().openCart();
            return { success: true };
          } else {
            const text = await res.text();
            let errMessage = 'Failed to add item';
            try {
              const errData = JSON.parse(text);
              errMessage = errData.message || errMessage;
            } catch(e) {}
            
            if (errMessage.toLowerCase().includes('already in cart')) {
               await get().initCart();
               useSidebarStore.getState().openCart();
               return { success: true };
            }
            
            console.warn(`Cart API Warning (${res.status} ${res.statusText}):`, text);
            
            const existingItemLocal = get().items.find(item => item.slug === product_slug);
            if (existingItemLocal) {
               set({ items: get().items.map(item => item.slug === product_slug ? { ...item, quantity: item.quantity + 1 } : item) });
            } else {
               set({ 
                 items: [...get().items, {
                   id: Math.random().toString(36).substring(7),
                   slug: product_slug,
                   name: product?.name || 'Product',
                   price: product?.unit_price || product?.price || 0,
                   quantity: 1,
                   product: product,
                   image: product?.first_image || product?.image_url || '/placeholder.png'
                 }]
               });
            }
            useSidebarStore.getState().openCart();
            return { success: true, warning: errMessage };
          }
        } catch (err) {
          set({ error: 'Network error' });
          return { success: false, error: 'Network error' };
        } finally {
          set({ isLoading: false });
        }
      },

      // PUT /cart/items/<uuid>/
      updateQuantity: async (uuid, quantity) => {
        if (quantity <= 0) {
          return get().removeItem(uuid);
        }
        
        // Optimistic update for local fallback items
        const isLocalItem = !uuid.includes('-'); // UUIDs from backend usually have hyphens, our local math.random doesn't
        if (isLocalItem) {
           set({ items: get().items.map(item => item.id === uuid ? { ...item, quantity } : item) });
           return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}cart/items/${uuid}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity })
          });
          if (res.ok) {
            await get().initCart();
          } else {
            set({ error: 'Failed to update quantity' });
          }
        } catch (err) {
          set({ error: 'Network error' });
        } finally {
          set({ isLoading: false });
        }
      },

      // DELETE /cart/items/<uuid>/delete/
      removeItem: async (uuid) => {
        // Optimistic update for local fallback items
        const isLocalItem = !uuid.includes('-');
        if (isLocalItem) {
           set({ items: get().items.filter(item => item.id !== uuid) });
           return;
        }

        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}cart/items/${uuid}/delete/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            await get().initCart();
          } else {
            set({ error: 'Failed to remove item' });
          }
        } catch (err) {
          set({ error: 'Network error' });
        } finally {
          set({ isLoading: false });
        }
      },

      // DELETE /cart/clear/
      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${BASE_URL}cart/clear/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
          if (res.ok) {
            await get().initCart();
          } else {
            // Local fallback clear
            set({ items: [], subtotal: "0.00", total_discount: "0.00", grand_total: "0.00", id: null });
            set({ error: 'Failed to clear cart remotely' });
          }
        } catch (err) {
          set({ items: [], subtotal: "0.00", total_discount: "0.00", grand_total: "0.00", id: null });
          set({ error: 'Network error' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Helper to calculate total if backend returns 0.00
      getCartTotal: () => {
        const items = get().items || [];
        return items.reduce((sum, item) => {
          const itemPrice = item.quantity_wise_price ? parseFloat(item.quantity_wise_price) : (parseFloat(item.price || 0) * (item.quantity || 1));
          return sum + (itemPrice || 0);
        }, 0);
      }
    }),
    {
      name: 'betopia-cart-storage',
    }
  )
);
