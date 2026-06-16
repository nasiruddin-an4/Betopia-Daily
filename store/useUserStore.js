import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_USER } from '../lib/data';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await fetch('/api/erp/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': '/'
            },
            body: JSON.stringify({
              email,
              password,
              appVersion: "1.0.0",
              deviceId: "2382832"
            })
          });

          if (!res.ok) {
            return { success: false, error: 'Invalid credentials or server error' };
          }
          
          let data;
          try {
            data = await res.json();
          } catch(e) {
             data = {};
          }
          
          // Use returned user data if available, otherwise fallback to basic info
          const userData = data?.user || data?.result || data?.data || { ...MOCK_USER, email };
          const access_token = data?.accessToken || data?.access_token || data?.token || null;
          const refresh_token = data?.refreshToken || data?.refresh_token || null;
          
          set({ 
            user: userData, 
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true 
          });
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'Network error or server unreachable' };
        }
      },
      logout: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
      deductSalaryCredit: (amount) => set((state) => ({
        user: state.user ? { ...state.user, salary_credit_balance: state.user.salary_credit_balance - amount } : null
      }))
    }),
    {
      name: 'betopia-daily-user',
    }
  )
);

