import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from './useCartStore';
import { MOCK_USER } from '../lib/data';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://server.betopiadaily.shop/api/v1/';

// Helper to ensure avatar URLs are absolute based on BASE_URL
const processAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const host = BASE_URL.split('/api')[0];
  return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

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

          const erpUser = data?.user || data?.result || data?.data || data || { email };
          const extracted_employee_id = erpUser?.employee_id || erpUser?.employee_id_no || erpUser?.hr_employee_id || null;

          // Step 2: Fetch profile from external ERP API via local Next.js proxy to avoid CORS
          let erpExternalProfile = null;
          try {
            const erpRes = await fetch('/api/erp-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
            });
            if (erpRes.ok) {
              const erpJson = await erpRes.json();
              if (erpJson.success) {
                erpExternalProfile = erpJson;
              }
            }
          } catch (err) {
            console.error('External ERP Profile fetch error:', err);
          }

          // Step 3: Post to our backend to sync/create profile
          if (erpExternalProfile) {
            try {
              const emp = erpExternalProfile.employee || {};
              const usr = erpExternalProfile.user || {};
              
              const syncPayload = {
                email: usr.email || email,
                user_type: "employee",
                company: emp.company || "",
                employee_id: emp.employee_id ? parseInt(emp.employee_id) : (emp.employee_id_no ? parseInt(emp.employee_id_no) : 0),
                company_address: emp.company_address || "",
                avatar: erpExternalProfile.profile_image || (erpExternalProfile.avatar_url ? `https://erp.betopiagroup.com${erpExternalProfile.avatar_url}` : ""),
                access_token: access_token,
                phone: usr.phone || emp.phone || emp.mobile_phone || ""
              };

              const syncRes = await fetch(`${BASE_URL}profile/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncPayload)
              });
              if (!syncRes.ok) {
                console.error('Profile sync failed:', await syncRes.text());
              }
            } catch (err) {
              console.error('Profile sync network error:', err);
            }
          } else {
            // Fallback to form data creation if external fetch fails
            try {
              const formData = new FormData();
              formData.append('email', erpUser.email || email);
              formData.append('user_type', erpUser.user_type || 'employee');
              formData.append('company', erpUser.company || '');
              if (extracted_employee_id) formData.append('employee_id', parseInt(extracted_employee_id));
              formData.append('company_address', erpUser.company_address || '');
              formData.append('access_token', access_token);
              formData.append('phone', erpUser.phone || '');

              const createRes = await fetch(`${BASE_URL}profile/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${access_token}`
                },
                body: formData
              });
              
              if (!createRes.ok) {
                const errText = await createRes.text();
                console.error('Create profile failed:', createRes.status, errText);
              }
            } catch (createProfileErr) {
              console.error('Create profile network error:', createProfileErr);
            }
          }

          // Step 4: Fetch unified profile from our GET API
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
          

          // Determine role and type from profile API
          const userType = profileData?.user_type || erpUser?.user_type || 'employee';
          const userRole = profileData?.role || erpUser?.role || userType;
          
          const rawAvatar = profileData?.avatar || erpUser?.avatar || '';

          const userData = {
            ...erpUser,
            ...(profileData || {}),
            email: email,
            name: profileData?.name || erpUser?.name || email.split('@')[0],
            first_name: profileData?.first_name || profileData?.name?.split(' ')[0] || erpUser?.name?.split(' ')[0] || email.split('@')[0],
            company: profileData?.company || erpUser?.company || '',
            company_id: profileData?.company_id || erpUser?.company_id || null,
            companies: profileData?.companies || erpUser?.companies || [],
            user_type: userType,
            role: userRole,
            employee_id: profileData?.employee_id || erpUser?.employee_id || erpUser?.employee_id_no || erpUser?.hr_employee_id || null,
            avatar: processAvatarUrl(rawAvatar)
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
      ssoLogin: async (msalAccessToken) => {
        try {
          // Step 1: Authenticate with DRF using MSAL access token
          const res = await fetch(`${BASE_URL}auth/sso/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_token: msalAccessToken,
              appVersion: "1.0.0",
              deviceId: "2382832"
            })
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error('SSO Login failed:', res.status, errText);
            return { success: false, error: 'SSO Login failed. Invalid token or server error.' };
          }
          
          let data;
          try {
            data = await res.json();
          } catch(e) {
             data = {};
          }
          const responseData = data?.data || data;
          const access_token = responseData?.accessToken || responseData?.access_token || responseData?.token || null;
          const refresh_token = responseData?.refreshToken || responseData?.refresh_token || null;

          if (!access_token) {
            return { success: false, error: 'SSO Login failed: No access token received from server.' };
          }

          const erpUser = responseData?.user || responseData?.result || responseData;
          const email = erpUser?.email || erpUser?.login;
          const extracted_employee_id = erpUser?.employee_id || erpUser?.employee_id_no || erpUser?.hr_employee_id || null;

          // Step 2: Fetch profile from external ERP API via local Next.js proxy to avoid CORS
          let erpExternalProfile = null;
          try {
            const erpRes = await fetch('/api/erp-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email })
            });
            if (erpRes.ok) {
              const erpJson = await erpRes.json();
              if (erpJson.success) {
                erpExternalProfile = erpJson;
              }
            }
          } catch (err) {
            console.error('External ERP Profile fetch error:', err);
          }

          // Step 3: Post to our backend to sync/create profile
          if (erpExternalProfile) {
            try {
              const emp = erpExternalProfile.employee || {};
              const usr = erpExternalProfile.user || {};
              
              const syncPayload = {
                email: usr.email || email,
                user_type: "employee",
                company: emp.company || "",
                employee_id: emp.employee_id ? parseInt(emp.employee_id) : (emp.employee_id_no ? parseInt(emp.employee_id_no) : 0),
                company_address: emp.company_address || "",
                avatar: erpExternalProfile.profile_image || (erpExternalProfile.avatar_url ? `https://erp.betopiagroup.com${erpExternalProfile.avatar_url}` : ""),
                access_token: access_token,
                phone: usr.phone || emp.phone || emp.mobile_phone || ""
              };

              const syncRes = await fetch(`${BASE_URL}profile/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${access_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(syncPayload)
              });
              if (!syncRes.ok) {
                console.error('Profile sync failed:', await syncRes.text());
              }
            } catch (err) {
              console.error('Profile sync network error:', err);
            }
          } else {
            // Fallback to form data creation if external fetch fails
            try {
              const formData = new FormData();
              formData.append('email', erpUser.email || email);
              formData.append('user_type', erpUser.user_type || 'employee');
              formData.append('company', erpUser.company || '');
              if (extracted_employee_id) formData.append('employee_id', parseInt(extracted_employee_id));
              formData.append('company_address', erpUser.company_address || '');
              formData.append('access_token', access_token);
              formData.append('phone', erpUser.phone || '');

              const createRes = await fetch(`${BASE_URL}profile/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${access_token}`
                },
                body: formData
              });
              
              if (!createRes.ok) {
                const errText = await createRes.text();
                console.error('Create profile failed:', createRes.status, errText);
              }
            } catch (createProfileErr) {
              console.error('Create profile network error:', createProfileErr);
            }
          }

          // Step 4: Fetch unified profile from our GET API
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
              const profiles = Array.isArray(profileJson) ? profileJson 
                : profileJson?.data ? (Array.isArray(profileJson.data) ? profileJson.data : [profileJson.data])
                : profileJson?.results ? profileJson.results 
                : [profileJson];
              
              profileData = profiles.find(p => p.email === email) || profiles[0] || null;
            }
          } catch (profileErr) {
            console.error('Profile fetch error:', profileErr);
          }

          const userType = profileData?.user_type || erpUser?.user_type || 'employee';
          const userRole = profileData?.role || erpUser?.role || userType;
          const rawAvatar = profileData?.avatar || erpUser?.avatar || '';

          const userData = {
            ...erpUser,
            ...(profileData || {}),
            email: email,
            name: profileData?.name || erpUser?.name || email?.split('@')[0],
            first_name: profileData?.first_name || profileData?.name?.split(' ')[0] || erpUser?.name?.split(' ')[0] || email?.split('@')[0],
            company: profileData?.company || erpUser?.company || '',
            company_id: profileData?.company_id || erpUser?.company_id || null,
            companies: profileData?.companies || erpUser?.companies || [],
            user_type: userType,
            role: userRole,
            employee_id: profileData?.employee_id || erpUser?.employee_id || erpUser?.employee_id_no || erpUser?.hr_employee_id || null,
            avatar: processAvatarUrl(rawAvatar)
          };
          
          set({ 
            user: userData, 
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true 
          });
          
          useCartStore.getState().initCart();
          
          return { success: true };
        } catch (error) {
          console.error('SSO Login error:', error);
          return { success: false, error: 'Network error or server unreachable' };
        }
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        useCartStore.getState().initCart(); // This will clear the items since isAuthenticated is now false
      },
      deductSalaryCredit: (amount) => set((state) => ({
        user: state.user ? { ...state.user, salary_credit_balance: state.user.salary_credit_balance - amount } : null
      })),
      updateUser: (newUserData) => set((state) => {
        let processedData = { ...newUserData };
        if (processedData.avatar) {
          processedData.avatar = processAvatarUrl(processedData.avatar);
        }
        return {
          user: state.user ? { ...state.user, ...processedData } : null
        };
      })
    }),
    {
      name: 'betopia-daily-user',
    }
  )
);
