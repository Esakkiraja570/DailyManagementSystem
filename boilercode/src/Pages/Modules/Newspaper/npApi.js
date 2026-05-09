const BASE_URL = 'http://localhost:1010/np';
const getToken = () => localStorage.getItem('npToken') || '';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const handle = async (res) => {
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  try { return JSON.parse(text); } catch { return text; }
};

export const npGet    = (p)    => fetch(`${BASE_URL}${p}`, { headers: headers() }).then(handle);
export const npPost   = (p, b) => fetch(`${BASE_URL}${p}`, { method:'POST',   headers: headers(), body: JSON.stringify(b) }).then(handle);
export const npPut    = (p, b) => fetch(`${BASE_URL}${p}`, { method:'PUT',    headers: headers(), body: JSON.stringify(b) }).then(handle);
export const npDelete = (p)    => fetch(`${BASE_URL}${p}`, { method:'DELETE', headers: headers() }).then(handle);

export const getMobile = () => localStorage.getItem('npMobile') || '';
export { BASE_URL };
