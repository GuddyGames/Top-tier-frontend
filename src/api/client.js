const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const token = localStorage.getItem('topTierToken');

  const res = await fetch(`
    ${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  signup: (payload) =>
    request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getLeaderboard: (limit = 20, offset = 0) =>
    request(`/api/leaderboard?limit=${limit}&offset=${offset}`),
  getDashboard: () => request('/api/dashboard'),
  getMyDashboard: () => request('/api/dashboard/me'),
  getMyProfile: () => request('/api/profile/me'),
  updateMyProfile: (payload) =>
    request('/api/profile/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  getMyReferral: () => request('/api/referral/me'),
  getTasks: () => request('/api/tasks'),
  submitTask: (taskId, proofUrl) =>
    request(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ proofUrl }),
    }),
  getDemoPrices: () => request('/api/demo/prices'),
  getDemoCandles: (symbol, hours = 4, interval = 1) =>
    request(`/api/demo/prices/${encodeURIComponent(symbol)}/candles?hours=${hours}&interval=${interval}`),
  getDemoAccount: () => request('/api/demo/account'),
  getDemoPerformance: () => request('/api/demo/performance'),
  getDemoTrades: () => request('/api/demo/trades'),
  openDemoTrade: (payload) =>
    request('/api/demo/trades', { method: 'POST', body: JSON.stringify(payload) }),
  closeDemoTrade: (id) => request(`/api/demo/trades/${id}/close`, { method: 'POST' }),
  adminListUsers: (search = '') =>
    request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  adminGetUser: (id) => request(`/api/admin/users/${id}`),
  adminSetStatus: (id, status) =>
    request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminScoreUser: (id, points, note) =>
    request(`/api/admin/users/${id}/score`, {
      method: 'POST',
      body: JSON.stringify({ points, note }),
    }),
};
