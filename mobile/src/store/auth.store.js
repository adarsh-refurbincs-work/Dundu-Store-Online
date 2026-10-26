import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/index';
import { setLogoutCallback, setAuthToken } from '../api/client';
import useCartStore from './cart.store';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    set({ isLoading: true });
    let token = null;
    try {
      const [t1, t2, cachedUser] = await Promise.all([
        AsyncStorage.getItem('dundu_token'),
        AsyncStorage.getItem('velora_token'),
        AsyncStorage.getItem('dundu_user'),
      ]);
      token = t1 || t2;
      setAuthToken(token);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      // Show the app as logged in immediately using the last known user, then
      // verify with /auth/me in the background instead of blocking on the network.
      let user = null;
      try { user = cachedUser ? JSON.parse(cachedUser) : null; } catch (_) {}
      set({ user, token, isAuthenticated: true, isLoading: false });
      const res = await authApi.me();
      const fresh = res.user || res;
      set({ user: fresh });
      AsyncStorage.setItem('dundu_user', JSON.stringify(fresh)).catch(() => {});
    } catch (error) {
      // Only drop the session when the server actually rejected the token;
      // a network blip keeps the cached session (401 is handled by the client interceptor).
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        await AsyncStorage.multiRemove(['dundu_token', 'velora_token', 'dundu_user']);
        setAuthToken(null);
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  login: async (data) => {
    const res = await authApi.login(data);
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    setAuthToken(token);
    await AsyncStorage.setItem('dundu_token', token);
    AsyncStorage.setItem('dundu_user', JSON.stringify(user || null)).catch(() => {});
    set({ user, token, isAuthenticated: true });
    return res;
  },

  signup: async (data) => {
    const res = await authApi.signup(data);
    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;
    setAuthToken(token);
    await AsyncStorage.setItem('dundu_token', token);
    AsyncStorage.setItem('dundu_user', JSON.stringify(user || null)).catch(() => {});
    set({ user, token, isAuthenticated: true });
    return res;
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(['dundu_token', 'velora_token', 'dundu_user', 'dundu_loyalty_card']);
    } catch (e) {
      // ignore
    }
    setAuthToken(null);
    useCartStore.getState().resetCart();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    set({ user });
    AsyncStorage.setItem('dundu_user', JSON.stringify(user || null)).catch(() => {});
  },
}));

// Wire global logout callback after store is created
setLogoutCallback(useAuthStore.getState().logout);

export default useAuthStore;
