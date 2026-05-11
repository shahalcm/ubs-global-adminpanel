import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  admin: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: (email, password) => {
    // Mock login for now
    localStorage.setItem('token', 'mock-token');
    set({
      admin: { name: 'Admin', email },
      token: 'mock-token',
      isAuthenticated: true,
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ admin: null, token: null, isAuthenticated: false });
  },
  setAdmin: (admin) => set({ admin }),
}));
