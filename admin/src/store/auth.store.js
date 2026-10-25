import { create } from 'zustand';
import { authApi } from '../api';
import { TOKEN_KEY, getToken, clearToken } from '../api/client';

const isAdminRole = (role) => ['admin', 'super_admin'].includes(role);

const useAuthStore = create((set, get) => ({
  user: null,
  token: getToken(),
  isLoading: true,
  // Set when the API rejected the token (shown once on the login page).
  sessionLostMessage: null,

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, sessionLostMessage: null });
  },

  fetchMe: async () => {
    if (!get().token) { set({ isLoading: false }); return; }
    try {
      const res = await authApi.me();
      const user = res.data.user;
      if (!isAdminRole(user.role)) {
        clearToken();
        set({ token: null, user: null, isLoading: false, sessionLostMessage: 'Administrator privileges required' });
        return;
      }
      set({ user, isLoading: false });
    } catch (err) {
      // Only an explicit rejection of the token ends the session. Network hiccups,
      // a restarting API or a 5xx must NOT log the admin out — keep the token and
      // the current user (if any) and let the next request retry.
      const status = err?.status || err?.response?.status;
      if (status === 401 || status === 403) {
        clearToken();
        set({ token: null, user: null, isLoading: false, sessionLostMessage: err?.message || 'Session expired' });
      } else {
        set({ isLoading: false });
      }
    }
  },

  // Called when any API call comes back 401 (see api/client.js interceptor).
  sessionLost: (message) => {
    clearToken();
    set({ token: null, user: null, isLoading: false, sessionLostMessage: message || 'Your session ended, please sign in again' });
  },

  logout: () => {
    clearToken();
    set({ user: null, token: null, sessionLostMessage: null });
  },

  isSuperAdmin: () => get().user?.role === 'super_admin',

  hasPermission: (key) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(key);
  },
}));

export default useAuthStore;
