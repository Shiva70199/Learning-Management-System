import { create } from "zustand";

export type AuthUser = { id: string; email: string };

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (accessToken: string, user: AuthUser) => void;
  clearSession: () => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  hydrated: false,
  setSession: (accessToken, user) =>
    set({ accessToken, user, hydrated: true }),
  clearSession: () => set({ accessToken: null, user: null }),
  setHydrated: (v) => set({ hydrated: v }),
}));
