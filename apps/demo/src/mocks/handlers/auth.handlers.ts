// apps/demo/src/mocks/handlers/auth.handlers.ts
import { http, HttpResponse } from 'msw';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginRequest = {
  empNo: string;
  password: string;
};

let currentUser: User | null = null;

const createCookieHeader = (name: string, value: string, options: string[] = []) => {
  const parts = [`${name}=${encodeURIComponent(value)}`].concat(options);
  return parts.join('; ');
};

export const authHandlers = [
  http.get('/api/auth/csrf', () => {
    const token = Math.random().toString(36).slice(2);
    const headers = new Headers({
      'Set-Cookie': createCookieHeader('XSRF-TOKEN', token, ['Path=/', 'SameSite=Lax']),
    });
    return new HttpResponse(null, { status: 204, headers });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;
    const empNo = body?.empNo?.trim();
    if (!empNo) {
      return HttpResponse.json({ message: 'empNo required' }, { status: 400 });
    }

    currentUser = {
      id: empNo,
      name: empNo,
      email: '',
      role: 'user',
    };

    const headers = new Headers({
      'Set-Cookie': createCookieHeader('JSESSIONID', Math.random().toString(36).slice(2), [
        'Path=/',
        'SameSite=Lax',
      ]),
    });

    return HttpResponse.json({ user: currentUser }, { status: 200, headers });
  }),

  http.get('/api/auth/me', () => {
    if (!currentUser) {
      return HttpResponse.json({ message: 'unauthenticated' }, { status: 401 });
    }
    return HttpResponse.json({ user: currentUser });
  }),

  http.post('/api/auth/logout', () => {
    currentUser = null;
    return HttpResponse.json({ ok: true });
  }),
];
