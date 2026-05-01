import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => {
        const newOrder = {
          ...order,
          order_id: `ORD-${Math.floor(Math.random() * 10000)}`,
          order_number: `BD-2026-${String(get().orders.length + 1).padStart(3, '0')}`,
          created_at: new Date().toISOString(),
          status: 'Pending',
        };
        set({ orders: [newOrder, ...get().orders] });
        return newOrder;
      },
    }),
    {
      name: 'betopia-daily-orders',
    }
  )
);

