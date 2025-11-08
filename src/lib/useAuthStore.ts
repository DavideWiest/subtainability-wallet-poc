import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  isOnboarded: boolean;
  setOnboarded: (value: boolean) => void;
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isOnboarded: false,
      setOnboarded: (value) => set({ isOnboarded: value }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;