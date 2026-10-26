import axios from 'axios';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const client = axios.create({ baseURL: apiBase ? `${apiBase}/api` : '/api' });


client.interceptors.request.use((config) => {
  const token = localStorage.getItem('dundu_token') || localStorage.getItem('velora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Every Dundu API success response is an envelope { success, message, data }. Anything else
// (HTML from a mis-proxied route, another app's JSON) must fail visibly instead of letting
// screens read `undefined.token` and "succeed" silently.
const isEnvelope = (body) => body && typeof body === 'object' && 'success' in body;

client.interceptors.response.use(
  (res) => {
    if (!isEnvelope(res.data)) {
      console.error('[api] unexpected response shape from', res.config?.baseURL, res.config?.url, '— is the storefront pointed at the right backend?', res.data);
      return Promise.reject({ message: 'Unexpected response from the server. The storefront may be pointed at the wrong API.' });
    }
    return res.data;
  },
  (err) => {
    if (err.response?.status === 401) {
      const isAuthEndpoint = err.config?.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('dundu_token');
        localStorage.removeItem('velora_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data || { message: err.message || 'Network error' });
  }
);

export default client;
