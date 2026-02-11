// apps/demo/src/shared/api/auth.ts
import { http } from './http';

type LoginRequest = {
  empNo: string;
  password: string;
};

type LoginResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&')}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function hasCsrfCookie() {
  return !!readCookie('XSRF-TOKEN');
}

let csrfInFlight: Promise<void> | null = null;

export async function ensureCsrf(force = false): Promise<void> {
  if (!force && hasCsrfCookie()) return;
  if (csrfInFlight) return csrfInFlight;
  csrfInFlight = (async () => {
    await http<void>('/api/auth/csrf', { method: 'GET', cache: 'no-store' });
    if (!hasCsrfCookie()) {
      throw new Error('CSRF cookie not set');
    }
  })();
  try {
    await csrfInFlight;
  } finally {
    csrfInFlight = null;
  }
}

export async function login(input: LoginRequest): Promise<LoginResponse> {
  //await ensureCsrf();
  return http<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getMe(): Promise<LoginResponse> {
  const res = await http<any>('/api/auth/me', { method: 'GET' });
  const user = res?.user ?? res;
  if (!user) return {};
  return {
    user: {
      id: String(user.userId ?? user.id ?? user.empNo ?? ''),
      name: String(user.empName ?? user.name ?? user.empNo ?? ''),
      email: String(user.email ?? ''),
      role: Array.isArray(user.roles) ? user.roles.join(',') : String(user.role ?? ''),
    },
  };
}

export async function logout(): Promise<void> {
  await http<void>('/api/auth/logout', { method: 'POST' });
}
