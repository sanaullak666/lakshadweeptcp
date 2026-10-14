import { ApplicantFormData, SubmissionResult, SubmissionDetailData, DashboardStats, SubmissionListItem, LetterTemplateItem, AuditLogItem } from '../types';

function getApiBase(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (!envUrl) return '/api';
  const trimmed = envUrl.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE = getApiBase();

async function parseJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}: ${res.statusText || 'Unable to connect to backend'}. Please verify backend server is running.`);
    }
    throw new Error('Received non-JSON response from server.');
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status} (${res.statusText})`);
  }

  return data as T;
}

export function getAdminToken(): string | null {
  return localStorage.getItem('lakshadweep_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('lakshadweep_admin_token', token);
}

export function clearAdminToken() {
  localStorage.removeItem('lakshadweep_admin_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Public API
export async function submitObjections(data: ApplicantFormData): Promise<SubmissionResult> {
  const formData = new FormData();
  formData.append('fullName', data.fullName);
  formData.append('relationship', data.relationship);
  formData.append('parentSpouseName', data.parentSpouseName);
  formData.append('houseName', data.houseName);
  formData.append('island', data.island);
  formData.append('pinCode', data.pinCode);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('place', data.place);
  formData.append('date', data.date);
  formData.append('signatureType', data.signatureType);

  if (data.idempotencyKey) {
    formData.append('idempotencyKey', data.idempotencyKey);
  }

  if (data.signatureType === 'drawn' && data.signatureData) {
    formData.append('signatureData', data.signatureData);
  } else if (data.signatureType === 'uploaded' && data.signatureFile) {
    formData.append('signatureFile', data.signatureFile);
  }

  const response = await fetch(`${API_BASE}/submissions`, {
    method: 'POST',
    body: formData
  });

  return parseJson<SubmissionResult>(response);
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/submissions/settings`);
    const data = await parseJson<any>(res);
    return data.settings || {};
  } catch {
    return {};
  }
}

export async function getSubmission(id: string, token?: string) {
  const url = `${API_BASE}/submissions/${id}${token ? `?token=${token}` : ''}`;
  const res = await fetch(url);
  return parseJson<any>(res);
}

// Admin API
export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await parseJson<any>(res);
  if (data.token) {
    setAdminToken(data.token);
  }
  return data;
}

export async function adminLogout() {
  try {
    await fetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      headers: { ...getAuthHeaders() }
    });
  } finally {
    clearAdminToken();
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await parseJson<any>(res);
  return data.stats;
}

export async function getSubmissionsList(params: {
  page?: number;
  limit?: number;
  search?: string;
  island?: string;
  status?: string;
  dateRange?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ submissions: SubmissionListItem[]; pagination: any }> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.island) query.set('island', params.island);
  if (params.status) query.set('status', params.status);
  if (params.dateRange) query.set('dateRange', params.dateRange);
  if (params.dateFrom) query.set('dateFrom', params.dateFrom);
  if (params.dateTo) query.set('dateTo', params.dateTo);

  const res = await fetch(`${API_BASE}/admin/submissions?${query.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  return parseJson<{ submissions: SubmissionListItem[]; pagination: any }>(res);
}

export async function getSubmissionDetail(id: string): Promise<SubmissionDetailData> {
  const res = await fetch(`${API_BASE}/admin/submissions/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  return parseJson<SubmissionDetailData>(res);
}

export async function updateSubmissionStatus(id: string, status: string, remarks?: string) {
  const res = await fetch(`${API_BASE}/admin/submissions/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ status, remarks })
  });
  return parseJson<any>(res);
}

export async function addAdminNote(id: string, note: string) {
  const res = await fetch(`${API_BASE}/admin/submissions/${id}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ note })
  });
  return parseJson<any>(res);
}

export function getExportCsvUrl(island?: string, status?: string): string {
  const query = new URLSearchParams();
  if (island && island !== 'All') query.set('island', island);
  if (status && status !== 'All') query.set('status', status);
  const token = getAdminToken();
  if (token) query.set('admin_token', token);
  return `${API_BASE}/admin/export?${query.toString()}`;
}

export async function getTemplates(): Promise<LetterTemplateItem[]> {
  const res = await fetch(`${API_BASE}/templates`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await parseJson<any>(res);
  return data.templates;
}

export async function getTemplateById(id: number | string): Promise<LetterTemplateItem> {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  const data = await parseJson<any>(res);
  return data.template;
}

export async function previewTemplate(contentHtml: string) {
  const res = await fetch(`${API_BASE}/templates/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentHtml })
  });
  const data = await parseJson<any>(res);
  return data.previewHtml;
}

export async function createTemplateVersion(payload: {
  letterNumber: number;
  title: string;
  version: string;
  subject?: string;
  reference?: string;
  copyTo?: string[] | string;
  contentHtml: string;
  activateImmediately?: boolean;
}) {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  });
  return parseJson<any>(res);
}

export async function activateTemplateVersion(id: number | string) {
  const res = await fetch(`${API_BASE}/templates/${id}/activate`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });
  return parseJson<any>(res);
}

export async function getAuditLogs(page: number = 1, limit: number = 30): Promise<{ logs: AuditLogItem[]; pagination: any }> {
  const res = await fetch(`${API_BASE}/admin/audit-logs?page=${page}&limit=${limit}`, {
    headers: { ...getAuthHeaders() }
  });
  return parseJson<{ logs: AuditLogItem[]; pagination: any }>(res);
}

export async function updateAppSetting(key: string, value: string) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ key, value })
  });
  return parseJson<any>(res);
}
