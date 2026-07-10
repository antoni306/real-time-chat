const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/auth/refreshTokens`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });

  if (!res.ok) {
    clearTokens();
    return false;
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && getRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { message?: string | string[] });
    const message = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? res.statusText);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return null as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ConversationResponse {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  participants: UserSummary[];
}

export interface UserSummary {
  id: string;
  username: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export const api = {
  register: (username: string, email: string, password: string) =>
    request<void>('/auth/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),

  login: (username: string, password: string) =>
    request<AuthTokens>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  findUserByUsername: (username: string) =>
    request<{ id: string; username: string }>(`/user?username=${encodeURIComponent(username)}`),

  getAllUsers: () => request<UserSummary[]>('/user/all'),

  createConversation: (payload: { type: 'DIRECT' | 'GROUP'; name?: string; participantsIds: string[] }) =>
    request<ConversationResponse>('/conversation', { method: 'POST', body: JSON.stringify(payload) }),

  getConversations: () => request<ConversationResponse[]>('/conversation'),

  getMessages: (conversationId: string) =>
    request<MessageResponse[]>(`/conversation/${encodeURIComponent(conversationId)}/messages`),
};
