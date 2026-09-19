const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    // Token inválido o expirado: cerrar sesión y volver al login (excepto en el propio login)
    if (
      res.status === 401 &&
      token &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/login')
    ) {
      clearToken();
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function getRole(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Reject expired tokens so UI role checks don't trust stale data
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return payload.role ?? null;
  } catch {
    return null;
  }
}
