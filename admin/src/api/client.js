import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const client = axios.create({ baseURL: apiBase ? `${apiBase}/api` : '/api' });

export const TOKEN_KEY = 'dundu_admin_token';
const LEGACY_TOKEN_KEY = 'velora_admin_token';
export const RETURN_TO_KEY = 'dundu_admin_return_to';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
export const clearToken = () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(LEGACY_TOKEN_KEY); };

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => {
    // Sliding session: the API re-issues a token once the current one is past
    // half its lifetime. Swap it in silently so an active admin never expires.
    const refreshed = res.headers?.['x-refreshed-token'];
    if (refreshed && refreshed !== getToken()) localStorage.setItem(TOKEN_KEY, refreshed);
    return res.data;
  },
  (err) => {
    if (err.response?.status === 401) {
      const isAuthEndpoint = err.config?.url?.includes('/auth/');
      if (!isAuthEndpoint && getToken()) {
        const reason = err.response.headers?.['x-auth-reason'] || 'UNAUTHORIZED';
        const message = err.response.data?.message || 'Session ended';
        console.warn(`[admin-auth] 401 from ${err.config?.method?.toUpperCase()} ${err.config?.url} — ${reason}: ${message}`);
        // Remember where the admin was so login can bring them straight back.
        try { sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search); } catch { /* ignore */ }
        clearToken();
        // Soft sign-out: the auth store flips to logged-out and <Layout> routes to
        // /login without a full page reload (so in-memory form drafts survive).
        window.dispatchEvent(new CustomEvent('dundu:session-lost', { detail: { reason, message } }));
      }
    }
    // Surface the HTTP status on whatever we reject with so callers can tell a
    // rejected token (401/403) from a network blip or a 5xx.
    const payload = err.response?.data && typeof err.response.data === 'object' ? err.response.data : err;
    if (err.response?.status && payload.status === undefined) payload.status = err.response.status;
    return Promise.reject(payload);
  }
);

export default client;
