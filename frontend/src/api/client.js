const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Drugs ──────────────────────────────────────────────────────────────
export const drugsApi = {
  list: () => request('/drugs'),
  get: (id) => request(`/drugs/${id}`),
  create: (data) => request('/drugs', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Findings ───────────────────────────────────────────────────────────
export const findingsApi = {
  listPending: (skip = 0, limit = 50) =>
    request(`/findings/pending?skip=${skip}&limit=${limit}`),
  get: (id) => request(`/findings/${id}`),
  create: (data) => request('/findings', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id, comment) =>
    request(`/findings/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment, decision: 'approve' }),
    }),
  reject: (id, comment) =>
    request(`/findings/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment, decision: 'reject' }),
    }),
  addComment: (id, comment) =>
    request(`/findings/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ comment, decision: 'comment' }),
    }),
};

// ── Searches ──────────────────────────────────────────────────────────
export const searchesApi = {
  trigger: (drugId) => request(`/searches/${drugId}/trigger`, { method: 'POST' }),
  schedule: (drugId, frequency) =>
    request(`/searches/${drugId}/schedule?frequency=${frequency}`, { method: 'POST' }),
};

// ── Audit logs ─────────────────────────────────────────────────────────
export const auditApi = {
  list: (skip = 0, limit = 100) =>
    request(`/audit-logs?skip=${skip}&limit=${limit}`),
  getForRecord: (recordId) => request(`/audit-logs/${recordId}`),
};
