import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './useCartStore';
import { MOCK_USER } from '../lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/';

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      // Role-based access helpers
      isAdmin: () => {
        const user = get().user;
        return user?.user_type === 'admin' || user?.role === 'admin';
      },
      isEmployee: () => {
        const user = get().user;
        return user?.user_type === 'employee' || user?.role === 'employee';
      },
      getUserRole: () => {
        const user = get().user;
        return user?.user_type || user?.role || 'employee';
      },
      login: async (email, password) => {
        try {
          // Step 1: Authenticate with ERP
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
          
          const access_token = data?.accessToken || data?.access_token || data?.token || null;
          const refresh_token = data?.refreshToken || data?.refresh_token || null;

          if (!access_token) {
            return { success: false, error: 'Login failed: No access token received from server.' };
          }

          // Step 2: Fetch profile from the profile API to match & get user details
          let profileData = null;
          try {
            const headers = { 'Content-Type': 'application/json' };
            if (access_token) {
              headers['Authorization'] = `Bearer ${access_token}`;
            }
            const profileRes = await fetch(`${BASE_URL}profile/`, {
              method: 'GET',
              headers
            });
            if (profileRes.ok) {
              const profileJson = await profileRes.json();
              // Profile API returns an array or object — find the matching user by email
              const profiles = Array.isArray(profileJson) ? profileJson 
                : profileJson?.data ? (Array.isArray(profileJson.data) ? profileJson.data : [profileJson.data])
                : profileJson?.results ? profileJson.results 
                : [profileJson];
              
              profileData = profiles.find(p => p.email === email) || profiles[0] || null;
            }
          } catch (profileErr) {
            console.error('Profile fetch error:', profileErr);
          }

          // Build the user object by merging ERP login response + profile data
          const erpUser = data?.user || data?.result || data?.data || { ...MOCK_USER, email };
          
          // Determine role and type from profile API
          const userType = profileData?.user_type || erpUser?.user_type || 'employee';
          const userRole = profileData?.role || erpUser?.role || userType;
          
          const userData = {
            ...erpUser,
            ...(profileData || {}),
            email: email,
            name: profileData?.name || erpUser?.name || email.split('@')[0],
            first_name: profileData?.first_name || profileData?.name?.split(' ')[0] || erpUser?.name?.split(' ')[0] || email.split('@')[0],
            company: profileData?.company || erpUser?.company || '',
            user_type: userType,
            role: userRole,
            employee_id: profileData?.employee_id || erpUser?.employee_id || erpUser?.erp_employee_id || null,
          };
          
          set({ 
            user: userData, 
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true 
          });
          
          // Fetch the user's remote cart
          useCartStore.getState().initCart();
          
          return { success: true };
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'Network error or server unreachable' };
        }
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        useCartStore.getState().initCart(); // This will clear the items since isAuthenticated is now false
      },
      deductSalaryCredit: (amount) => set((state) => ({
        user: state.user ? { ...state.user, salary_credit_balance: state.user.salary_credit_balance - amount } : null
      }))
    }),
    {
      name: 'betopia-daily-user',
    }
  )
);
