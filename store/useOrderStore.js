import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { getAccessToken } from '../lib/msal';
import { useUserStore } from './useUserStore';

// A fresh Microsoft token (MSAL renews it), falling back to the one from login
async function token() {
  return (await getAccessToken()) || useUserStore.getState().msalToken;
}

const toLines = (items) => items.map((i) => ({ slug: i.slug, variant_id: i.variant_id || null, quantity: i.quantity }));

export const useOrderStore = create(
  persist(
    (set, get) => ({
      // CRM guest orders can only be read back by reference + phone, so remember them
      placed: [], // [{ reference, phone, email }]
      orders: [],
      isLoading: false,

      fetchOrders: async () => {
        const email = useUserStore.getState().user?.email;
        const refs = get().placed.filter((p) => p.email === email).map(({ reference, phone }) => ({ reference, phone }));
        if (!refs.length) return set({ orders: [] });

        const t = await token();
        if (!t) return;
        set({ isLoading: true });
        const res = await api.lookupOrders(t, refs);
        set({ orders: res?.success ? res.data || [] : get().orders, isLoading: false });
      },

      /** Live subtotal / tax / total from the CRM. Returns { totals } or { error }. */
      validateCart: async (items, phone) => {
        const t = await token();
        if (!t) return { error: 'Your session has expired. Please sign in again.' };
        const res = await api.validateCart(t, { lines: toLines(items), phone });
        return res?.success ? { totals: res.data } : { error: res?.message || 'Could not check prices.' };
      },

      /**
       * Places a cash order in the CRM. Reuse the same idempotencyKey when retrying
       * the same checkout so a double-click can't create two orders.
       * Returns { order } or { error }.
       */
      placeOrder: async ({ items, phone, idempotencyKey }) => {
        const t = await token();
        if (!t) return { error: 'Your session has expired. Please sign in again.' };

        const res = await api.createOrder(t, { lines: toLines(items), phone, idempotency_key: idempotencyKey });
        if (!res?.success) return { error: res?.message || 'Failed to place order. Please try again.' };

        const order = res.data;
        const email = useUserStore.getState().user?.email;
        set({
          placed: [{ reference: order.reference, phone: order.lookup_phone, email }, ...get().placed.filter((p) => p.reference !== order.reference)],
          orders: [order, ...get().orders.filter((o) => o.reference !== order.reference)],
        });
        return { order };
      },
    }),
    {
      name: 'betopia-orders',
      partialize: (state) => ({ placed: state.placed }),
    }
  )
);
