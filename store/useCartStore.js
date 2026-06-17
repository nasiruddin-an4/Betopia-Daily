import { create } from 'zustand';
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

export const useCartStore = create((set, get) => ({
  id: null,
  items: [],
  subtotal: "0.00",
  total_discount: "0.00",
  grand_total: "0.00",
  isLoading: false,
  error: null,

  // Set internal state from API response
  _setCartData: (response) => {
    // Handle both wrapped { data: { id, items } } and unwrapped { id, items } responses
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

    // Check if item is already in cart
    const existingItem = get().items.find(item => item.slug === product_slug);
    if (existingItem) {
      // Just increment quantity via PUT
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
        
        // If the backend says it's already in the cart, let's sync and open the cart
        if (errMessage.toLowerCase().includes('already in cart')) {
           await get().initCart();
           useSidebarStore.getState().openCart();
           return { success: true };
        }
        
        console.error(`Cart API Error (${res.status} ${res.statusText}):`, text);
        set({ error: errMessage });
        return { success: false, error: errMessage };
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
        set({ error: 'Failed to clear cart' });
      }
    } catch (err) {
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
}));
