import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  isAdmin: boolean;
  setAuth: (token: string, username: string, isAdmin: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAdmin: false,
      setAuth: (token, username, isAdmin) =>
        set({ token, username, isAdmin }),
      clearAuth: () => set({ token: null, username: null, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
