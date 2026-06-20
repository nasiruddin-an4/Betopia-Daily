import { create } from 'zustand';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/';

export const useOrderStore = create((set, get) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),
  fetchOrders: async (accessToken) => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${BASE_URL}orders/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      });
      if (res.ok) {
        const data = await res.json();
        set({ orders: data.data || data || [] });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  },
  placeOrder: async (accessToken) => {
    if (!accessToken) return null;
    try {
      const res = await fetch(`${BASE_URL}orders/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        // Refetch orders
        get().fetchOrders(accessToken);
        return data.data || data;
      }
      return null;
    } catch (error) {
      console.error('Failed to place order:', error);
      return null;
    }
  }
}));
