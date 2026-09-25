const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

async function request(path, options = {}) {
  const token = localStorage.getItem('topTierToken');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
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
  startTelegramVerification: () => request('/api/telegram/verification/start', { method: 'POST' }),
  getTelegramVerificationStatus: () => request('/api/telegram/verification/status'),
  getTasks: () => request('/api/tasks'),
  getMyTaskSubmissions: () => request('/api/tasks/me'),
  submitTask: (taskId, { proofFile, proofUrl } = {}) => {
    const body = new FormData();
    if (proofFile) body.append('proof', proofFile);
    if (proofUrl) body.append('proofUrl', proofUrl);
    return request(`/api/tasks/${taskId}/submit`, { method: 'POST', body });
  },
  getDemoPrices: () => request('/api/demo/prices'),
  getDemoCandles: (symbol, hours = 4, interval = 1) =>
    request(`/api/demo/prices/${encodeURIComponent(symbol)}/candles?hours=${hours}&interval=${interval}`),
  getDemoAccount: () => request('/api/demo/account'),
  getDemoPerformance: () => request('/api/demo/performance'),
  getDemoTrades: () => request('/api/demo/trades'),
  openDemoTrade: (payload) =>
    request('/api/demo/trades', { method: 'POST', body: JSON.stringify(payload) }),
  closeDemoTrade: (id) => request(`/api/demo/trades/${id}/close`, { method: 'POST' }),
  adminGetReferrals: () => request('/api/admin/referrals'),
  adminListUsers: (search = '') =>
    request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  adminGetUser: (id) => request(`/api/admin/users/${id}`),
  adminSetStatus: (id, status) =>
    request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminUpdateContribution: (id, contribution) =>
    request(`/api/admin/users/${id}/contribution`, {
      method: 'PATCH',
      body: JSON.stringify({ contribution }),
    }),
  adminDeleteUser: (id) =>
    request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  adminScoreUser: (id, points, note) =>
    request(`/api/admin/users/${id}/score`, {
      method: 'POST',
      body: JSON.stringify({ points, note }),
    }),
  adminUpdateProfile: (id, fields) =>
    request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  adminGetActivity: (limit = 50) => request(`/api/admin/activity?limit=${limit}`),
  adminGetTrades: (status) =>
    request(`/api/admin/trades${status ? `?status=${status}` : ''}`),
  adminGetPendingSubmissions: () => request('/api/admin/tasks/pending'),
  adminReviewSubmission: (id, status) =>
    request(`/api/tasks/submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminCreateTask: (payload) =>
    request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  adminDeactivateTask: (id) =>
    request(`/api/tasks/${id}/deactivate`, { method: 'PATCH' }),
  adminGetOutstandingTasks: () => request('/api/admin/tasks/outstanding'),
  startTelegramVerification: () => request('/api/telegram/verification/start', { method: 'POST' }),
};
