import axios from 'axios';

// ─── Base URLs ────────────────────────────────────────────────
export const BASE_URL     = 'http://localhost:1010/api/smallshop';
export const CUSTOMER_URL = 'http://localhost:1010/api/customer';

// ─── Axios Instances ──────────────────────────────────────────
export const shopApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export const customerApi = axios.create({
  baseURL: CUSTOMER_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── JWT Injection ────────────────────────────────────────────
shopApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ─── Auth Error Handler ───────────────────────────────────────
shopApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('smallshop');
      localStorage.removeItem('shopId');
      localStorage.removeItem('token');
      window.location.href = '/auth/smallshop/admin';
    }
    return Promise.reject(err);
  }
);

// ─── Helpers ──────────────────────────────────────────────────
export const getShopId = () => {
  try {
    const s = localStorage.getItem('smallshop');
    if (s) { const p = JSON.parse(s); if (p?.shopId) return p.shopId; }
    return localStorage.getItem('shopId') || '';
  } catch { return ''; }
};

export const getShopProfile = () => {
  try { return JSON.parse(localStorage.getItem('smallshop') || 'null'); } catch { return null; }
};

export const getCustomerId = () => {
  try {
    const s = localStorage.getItem('smallshopCustomer');
    if (s) { const p = JSON.parse(s); if (p?.customerId) return p.customerId; }
    return '';
  } catch { return ''; }
};

// ─── Generic Request ──────────────────────────────────────────
const request = async (instance, method, path, data = null) => {
  try {
    const res = await instance({ method, url: path, data });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Server Error';
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
};

// ─── Shop API ─────────────────────────────────────────────────
export const apiGet    = (path)        => request(shopApi, 'GET',    path);
export const apiPost   = (path, body)  => request(shopApi, 'POST',   path, body);
export const apiPut    = (path, body)  => request(shopApi, 'PUT',    path, body);
export const apiDelete = (path)        => request(shopApi, 'DELETE', path);
export const apiPatch  = (path, body)  => request(shopApi, 'PATCH',  path, body);

// ─── Customer API ─────────────────────────────────────────────
export const custApiGet  = (path)       => request(customerApi, 'GET',  path);
export const custApiPost = (path, body) => request(customerApi, 'POST', path, body);
export const custApiPut  = (path, body) => request(customerApi, 'PUT',  path, body);