const DEFAULT_PRODUCTION_API = 'https://top-tier-backend-sbd5.onrender.com';
const configuredUrls = [
  ...(import.meta.env.VITE_API_URLS || '').split(','),
  import.meta.env.VITE_API_URL || '',
].map((value) => String(value || '').trim().replace(/\/+$/, '')).filter(Boolean);

const API_URLS = [...new Set(
  (configuredUrls.length ? configuredUrls : [
    import.meta.env.DEV ? 'http://localhost:5000' : DEFAULT_PRODUCTION_API,
  ]).filter(Boolean)
)];

let activeApiIndex = Math.max(0, Number(sessionStorage.getItem('topTierApiIndex') || 0));
if (activeApiIndex >= API_URLS.length) activeApiIndex = 0;

const rememberApi = (index) => {
  activeApiIndex = index;
  try { sessionStorage.setItem('topTierApiIndex', String(index)); } catch {}
};

async function request(path, options = {}) {
  const token = localStorage.getItem('topTierToken');
  let lastError;

  for (let attempt = 0; attempt < API_URLS.length; attempt += 1) {
    const index = (activeApiIndex + attempt) % API_URLS.length;
    const base = API_URLS[index];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${base}${path}`, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const data = await res.json().catch(() => ({}));
      clearTimeout(timeout);

      if (res.ok) {
        rememberApi(index);
        return data;
      }

      const error = new Error(data.error || data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.apiUrl = base;

      if (res.status !== 404 && res.status < 500) throw error;
      lastError = error;
    } catch (error) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') {
        lastError = new Error('The server took too long to respond. Please try again.');
        lastError.status = 408;
      } else if (error?.status && error.status < 500 && error.status !== 404) {
        throw error;
      } else {
        lastError = error;
      }
    }
  }

  throw lastError || new Error('Unable to connect to the Top-tier backend.');
}

export async function checkBackendHealth() {
  try {
    const data = await request('/health');
    return { ok: true, ...data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

export const api = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  googleLogin: (accessToken, referralCode = '') => request('/api/auth/google', { method: 'POST', body: JSON.stringify({ accessToken, referralCode }) }),
  getLeaderboard: (limit = 20, offset = 0) => request(`/api/leaderboard?limit=${limit}&offset=${offset}`),
  getDashboard: () => request('/api/dashboard'),
  getMyDashboard: () => request('/api/dashboard/me'),
  getMyProfile: () => request('/api/profile/me'),
  updateMyProfile: (payload) => request('/api/profile/me', { method: 'PATCH', body: JSON.stringify(payload) }),
  updateNotificationPreference: (enabled) => request('/api/profile/me/notifications', { method: 'PATCH', body: JSON.stringify({ enabled }) }),
  getNotifications: () => request('/api/profile/me/notifications'),
  markNotificationRead: (id) => request(`/api/profile/me/notifications/${id}/read`, { method: 'PATCH' }),
  acceptPrivacy: () => request('/api/profile/me/privacy/accept', { method: 'POST' }),
  getSupportChat: () => request('/api/support/me'),
  sendSupportMessage: (message) => request('/api/support/me/messages', { method: 'POST', body: JSON.stringify({ message }) }),
  getMyReferral: () => request('/api/referral/me'),
  startTelegramVerification: () => request('/api/telegram/verification/start', { method: 'POST' }),
  startTelegramTask: (taskId) => request(`/api/telegram/tasks/${taskId}/start`, { method: 'POST' }),
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
  getDemoCandles: (symbol, hours = 4, interval = 1) => request(`/api/demo/prices/${encodeURIComponent(symbol)}/candles?hours=${hours}&interval=${interval}`),
  getDemoAccount: () => request('/api/demo/account'),
  getDemoPerformance: () => request('/api/demo/performance'),
  getDemoTrades: () => request('/api/demo/trades'),
  openDemoTrade: (payload) => request('/api/demo/trades', { method: 'POST', body: JSON.stringify(payload) }),
  closeDemoTrade: (id) => request(`/api/demo/trades/${id}/close`, { method: 'POST' }),
  adminGetReferrals: () => request('/api/admin/referrals'),
  adminGetSupport: () => request('/api/admin/support'),
  adminGetSupportChat: (id) => request(`/api/support/admin/${id}`),
  adminSendSupportMessage: (id, message) => request(`/api/support/admin/${id}/messages`, { method: 'POST', body: JSON.stringify({ message })),
  adminSendNotification: (title, message) => request('/api/admin/notifications', { method: 'POST', body: JSON.stringify({ title, message })),
  adminListUsers: (search = '') => request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  adminGetUser: (id) => request(`/api/admin/users/${id}`),
  adminSetStatus: (id, status) => request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminUpdateContribution: (id, contribution) => request(`/api/admin/users/${id}/contribution`, { method: 'PATCH', body: JSON.stringify({ contribution }) }),
  adminDeleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  adminScoreUser: (id, points, note) => request(`/api/admin/users/${id}/score`, { method: 'POST', body: JSON.stringify({ points, note }) }),
  adminUpdateProfile: (id, fields) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(fields) }),
  adminGetActivity: (limit = 50) => request(`/api/admin/activity?limit=${limit}`),
  adminGetTrades: (status) => request(`/api/admin/trades${status ? `?status=${status}` : ''}`),
  adminGetPendingSubmissions: () => request('/api/admin/tasks/pending'),
  adminGetSubmissions: ({ status = 'pending', search = '', limit = 50, offset = 0 } = {}) => {
    const params = new URLSearchParams({ status, limit: String(limit), offset: String(offset) });
    if (search) params.set('search', search);
    return request(`/api/admin/submissions?${params.toString()}`);
  },
  adminReviewSubmission: (id, status) => request(`/api/tasks/submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  adminCreateTask: (payload) => request('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  adminDeactivateTask: (id) => request(`/api/tasks/${id}/deactivate`, { method: 'PATCH' }),
  adminGetOutstandingTasks: () => request('/api/admin/tasks/outstanding'),
};
