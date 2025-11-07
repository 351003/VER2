const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${API_BASE}/api${path}`;
  const opts = {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  };

  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = new Error('API request failed');
    err.status = res.status;
    try {
      err.body = await res.json();
    } catch (_) {}
    throw err;
  }
  // Try parse json, but return null for 204
  if (res.status === 204) return null;
  return res.json();
}

export async function get(path) { return request(path, { method: 'GET', credentials: 'include' }); }
export async function post(path, body) { return request(path, { method: 'POST', body: JSON.stringify(body), credentials: 'include' }); }
export async function put(path, body) { return request(path, { method: 'PUT', body: JSON.stringify(body), credentials: 'include' }); }
export async function del(path) { return request(path, { method: 'DELETE', credentials: 'include' }); }

export default { get, post, put, del };
