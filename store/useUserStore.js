import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './useCartStore';
import { msalInstance } from '../lib/msal';

const ERP_HOST = 'https://erp.betopiagroup.com';

// ERP returns avatar paths relative to its own host
const absoluteAvatar = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) return url;
  return `${ERP_HOST}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      msalToken: null,
      isAuthenticated: false,

      isAdmin: () => {
        const user = get().user;
        return user?.user_type === 'admin' || user?.role === 'admin';
      },

      /**
       * Called after Microsoft SSO redirects back. Identity comes from Microsoft;
       * employee details (company, ID, address, photo) come from the ERP profile API.
       */
      ssoLogin: async (msalAccessToken) => {
        try {
          const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
          const email = (account?.username || '').toLowerCase();
          const msName = account?.name || '';

          let erp = null;
          try {
            const erpRes = await fetch('/api/erp-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, microsoft_access_token: msalAccessToken }),
            });
            if (erpRes.ok) {
              const json = await erpRes.json();
              if (json.success) erp = json;
            }
          } catch (err) {
            console.error('ERP profile fetch error:', err);
          }

          const emp = erp?.employee || {};
          const usr = erp?.user || {};
          const name = usr.name || msName || email.split('@')[0];

          set({
            user: {
              email: usr.email || email,
              name,
              first_name: name.split(' ')[0],
              company: emp.company || '',
              company_id: emp.company_id || null,
              company_address: emp.company_address || '',
              phone: usr.phone || emp.phone || emp.mobile_phone || '',
              employee_id: emp.employee_id || emp.employee_id_no || null,
              user_type: 'employee',
              role: 'employee',
              avatar: absoluteAvatar(erp?.profile_image || erp?.avatar_url || ''),
            },
            msalToken: msalAccessToken,
            isAuthenticated: true,
          });

          return { success: true };
        } catch (error) {
          console.error('SSO Login error:', error);
          return { success: false, error: 'Sign-in failed. Please try again.' };
        }
      },

      logout: () => {
        set({ user: null, msalToken: null, isAuthenticated: false });
        useCartStore.getState().clearCart();
        // Forget the Microsoft account locally so the next visit asks to sign in again
        msalInstance.setActiveAccount(null);
        msalInstance.clearCache?.().catch(() => {});
      },

      updateUser: (newUserData) => set((state) => {
        const processed = { ...newUserData };
        if (processed.avatar) processed.avatar = absoluteAvatar(processed.avatar);
        return { user: state.user ? { ...state.user, ...processed } : null };
      }),
    }),
    {
      name: 'betopia-daily-user',
      // Old sessions from the previous backend carried its tokens; drop them
      version: 2,
      migrate: () => ({ user: null, msalToken: null, isAuthenticated: false }),
    }
  )
);
