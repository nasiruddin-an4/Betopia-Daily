import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_USER } from '../lib/data';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (employeeId, password) => {
        // Mock authentication - accept any password for demo
        // In real app, this would hit the API
        if (employeeId) {
          set({ user: MOCK_USER, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      deductSalaryCredit: (amount) => set((state) => ({
        user: state.user ? { ...state.user, salary_credit_balance: state.user.salary_credit_balance - amount } : null
      }))
    }),
    {
      name: 'betopia-daily-user',
    }
  )
);

