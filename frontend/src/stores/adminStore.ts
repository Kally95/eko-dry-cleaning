import { create } from 'zustand';

interface AdminState {
  token: string | null;
  admin: { id: string; email: string; name: string } | null;
  setAuth: (token: string, admin: any) => void;
  clearAuth: () => void;
}

// Simple localStorage persistence
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('eko-admin-auth');
    return stored ? JSON.parse(stored) : { token: null, admin: null };
  } catch {
    return { token: null, admin: null };
  }
};

const storeAuth = (token: string | null, admin: any) => {
  localStorage.setItem('eko-admin-auth', JSON.stringify({ token, admin }));
};

export const useAdminStore = create<AdminState>((set) => ({
  ...getStoredAuth(),
  setAuth: (token, admin) => {
    storeAuth(token, admin);
    set({ token, admin });
  },
  clearAuth: () => {
    storeAuth(null, null);
    set({ token: null, admin: null });
  },
}));
