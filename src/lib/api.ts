/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/api.ts
// Centralised API client — replaces all mock data imports.
// All requests include credentials (cookies) automatically.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include', // send httpOnly cookie
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    request<any>('POST', '/api/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    request<any>('POST', '/api/auth/login', data),

  logout: () => request<any>('POST', '/api/auth/logout'),

  me: () => request<any>('GET', '/api/auth/me'),

  memberLogin: (data: { name: string; password: string }) =>
    request<any>('POST', '/api/auth/member-login', data),

  memberSignup: (data: { name: string; phone: string; aadhar: string; shg_id: string; password: string }) =>
    request<any>('POST', '/api/auth/member-signup', data),

  getShgList: (district?: string) => {
    const qs = district ? `?district=${encodeURIComponent(district)}` : '';
    return request<any>('GET', `/api/auth/shgs${qs}`);
  },

  changePassword: (data: { current: string; newPassword: string }) =>
    request<any>('POST', '/api/auth/change-password', data),
};

// ── SHG ───────────────────────────────────────────────────────
export const shgApi = {
  get: () => request<any>('GET', '/api/shg'),

  setup: (data: {
    name: string; registration_number?: string; village?: string;
    block?: string; district?: string; state?: string;
    formation_date?: string; bank_name?: string;
    bank_account?: string; ifsc?: string;
  }) => request<any>('POST', '/api/shg/setup', data),

  update: (data: Record<string, string>) => request<any>('PUT', '/api/shg', data),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  get: () => request<any>('GET', '/api/dashboard'),
};

// ── Members ───────────────────────────────────────────────────
export const membersApi = {
  list: () => request<any>('GET', '/api/members'),

  get: (id: string) => request<any>('GET', `/api/members/${id}`),

  create: (data: {
    name: string; phone?: string; village?: string;
    age?: number; income?: number; aadhar?: string; joined_date?: string;
  }) => request<any>('POST', '/api/members', data),

  update: (id: string, data: Record<string, unknown>) =>
    request<any>('PUT', `/api/members/${id}`, data),

  delete: (id: string) => request<any>('DELETE', `/api/members/${id}`),
};

// ── Savings ───────────────────────────────────────────────────
export const savingsApi = {
  list: (params?: { member_id?: string; month?: number; year?: number }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>('GET', `/api/savings${qs}`);
  },

  create: (data: {
    member_id: string; month: number; year: number;
    amount: number; payment_mode?: string; date?: string;
  }) => request<any>('POST', '/api/savings', data),

  delete: (id: string) => request<any>('DELETE', `/api/savings/${id}`),
};

// ── Loans ─────────────────────────────────────────────────────
export const loansApi = {
  list: (params?: { member_id?: string; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>('GET', `/api/loans${qs}`);
  },

  get: (id: string) => request<any>('GET', `/api/loans/${id}`),

  create: (data: {
    member_id: string; loan_amount: number; interest_rate?: number;
    tenure_months?: number; purpose?: string; disbursed_date?: string;
  }) => request<any>('POST', '/api/loans', data),

  update: (id: string, data: { status?: string; purpose?: string }) =>
    request<any>('PUT', `/api/loans/${id}`, data),
};

// ── Loan Requests (Module) ────────────────────────────────────
export const loanRequestsApi = {
  apply: (data: FormData) =>
    request<any>('POST', '/api/loan/apply', data, true),

  getMemberLoans: (member_id?: string) => {
    const qs = member_id ? `?member_id=${member_id}` : '';
    return request<any>('GET', `/api/loan/member${qs}`);
  },

  getLeaderReview: () => request<any>('GET', '/api/loan/leader-review'),

  approveLoan: (data: { loan_id: string; status: 'approved' | 'rejected' }) =>
    request<any>('PUT', '/api/loan/leader-approve', data),

  verifyDocument: (doc_id: string, data: { status: 'approved' | 'rejected' | 'request_reupload'; remarks?: string; action?: string }) =>
    request<any>('PUT', `/api/loan/document/${doc_id}/verify`, data),

  reuploadDocument: (doc_id: string, data: FormData) =>
    request<any>('POST', `/api/loan/document/${doc_id}/reupload`, data, true),
};

// ── Repayments ────────────────────────────────────────────────
export const repaymentsApi = {
  list: (params?: { loan_id?: string; member_id?: string; status?: string }) => {
    const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<any>('GET', `/api/repayments${qs}`);
  },

  pay: (id: string, paid_date?: string) =>
    request<any>('POST', `/api/repayments/${id}/pay`, { paid_date }),
};

// ── Admin ─────────────────────────────────────────────────────
export const adminApi = {
  // Check auth
  me: () => request<any>('GET', '/api/admin/me'),

  // Auth
  signup: (data: any) => request<any>('POST', '/api/admin/signup', data),
  login: (data: any) => request<any>('POST', '/api/admin/login', data),
  logout: () => request<any>('POST', '/api/admin/logout'),

  // Entities
  getShgs: () => request<any>('GET', '/api/admin/shgs'),
  getShgDetails: (id: string) => request<any>('GET', `/api/admin/shgs/${id}`),

  // Schemes
  getSchemes: () => request<any>('GET', '/api/admin/schemes'),
  createScheme: (data: any) => request<any>('POST', '/api/admin/schemes', data),
  updateScheme: (id: string, data: any) => request<any>('PUT', `/api/admin/schemes/${id}`, data),
  deleteScheme: (id: string) => request<any>('DELETE', `/api/admin/schemes/${id}`),
};

// ── Meetings ──────────────────────────────────────────────────
export const meetingsApi = {
  list:   ()                          => request<any>('GET',    '/api/meetings'),
  get:    (id: string)                => request<any>('GET',    `/api/meetings/${id}`),
  create: (data: any)                 => request<any>('POST',   '/api/meetings', data),
  update: (id: string, data: any)     => request<any>('PUT',    `/api/meetings/${id}`, data),
  delete: (id: string)                => request<any>('DELETE', `/api/meetings/${id}`),
};
 
// ── Meeting Attendance ────────────────────────────────────────
export const meetingAttendanceApi = {
  getForMeeting: (meetingId: string) =>
    request<any>('GET', `/api/meeting-attendance/meeting/${meetingId}`),
 
  bulkSave: (meetingId: string, records: any[]) =>
    request<any>('POST', `/api/meeting-attendance/meeting/${meetingId}/bulk`, { records }),
 
  markFinePaid: (attendanceId: string) =>
    request<any>('PATCH', `/api/meeting-attendance/${attendanceId}/fine-paid`),
};