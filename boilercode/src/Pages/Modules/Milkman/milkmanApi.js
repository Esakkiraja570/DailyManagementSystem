export const BASE_URL = "http://localhost:1010/api";

export const getMilkmanMobile = () => {
  const stored = localStorage.getItem('milkman');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.mobile) return parsed.mobile;
    } catch (error) {
      // ignore malformed data
    }
  }
  return localStorage.getItem('milkmanMobile') || localStorage.getItem('mobile') || '';
};

const parseResponse = async (res) => {
  const bodyText = await res.text();
  try {
    return bodyText ? JSON.parse(bodyText) : null;
  } catch {
    return bodyText;
  }
};

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await parseResponse(res);
  if (!res.ok) {
    throw new Error(data?.message || data || 'Server error');
  }
  return data;
};

export const apiGet = (path) => request(path, { method: 'GET' });
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const apiPut = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });
export const apiDelete = (path) => request(path, { method: 'DELETE' });
