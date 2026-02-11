// apps/demo/src/mocks/handlers/role.handlers.ts
import { http, HttpResponse } from 'msw';
import { mockRoles } from '@/mocks/data/role';
import type { RoleRequest } from '@/entities/system/role/model/types';

function parseRoleId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function nextRoleId() {
  const maxId = mockRoles.reduce((max, role) => (role.id > max ? role.id : max), 0);
  return maxId + 1;
}

export const roleHandlers = [
  http.get('/api/roles', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    let items = mockRoles.slice();
    if (q) {
      items = items.filter((role) => {
        return (
          String(role.roleName ?? '').toLowerCase().includes(q) ||
          String(role.roleCode ?? '').toLowerCase().includes(q) ||
          String(role.roleDesc ?? '').toLowerCase().includes(q)
        );
      });
    }

    return HttpResponse.json(items);
  }),

  http.get('/api/roles/:id', ({ params }) => {
    const id = parseRoleId(String(params.id));
    if (id == null) return new HttpResponse('invalid id', { status: 400 });

    const found = mockRoles.find((role) => role.id === id);
    if (!found) return new HttpResponse('not found', { status: 404 });

    return HttpResponse.json(found);
  }),

  http.post('/api/roles', async ({ request }) => {
    const body = (await request.json()) as RoleRequest;

    if (!String(body.roleName ?? '').trim()) {
      return new HttpResponse('roleName is required', { status: 400 });
    }

    const now = new Date().toISOString();
    const created = {
      id: nextRoleId(),
      roleCode: String(body.roleCode ?? '').trim(),
      roleName: String(body.roleName ?? '').trim(),
      roleDesc: String(body.roleDesc ?? '').trim(),
      useFlag: String(body.useFlag ?? 'Y'),
      createdBy: String(body.createdBy ?? 'admin'),
      creationDate: now,
      lastUpdatedBy: String(body.lastUpdatedBy ?? body.createdBy ?? 'admin'),
      lastUpdatedDate: now,
    };

    mockRoles.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/api/roles/:id', async ({ params, request }) => {
    const id = parseRoleId(String(params.id));
    if (id == null) return new HttpResponse('invalid id', { status: 400 });

    const idx = mockRoles.findIndex((role) => role.id === id);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    const body = (await request.json()) as RoleRequest;
    const nextName = Object.prototype.hasOwnProperty.call(body, 'roleName')
      ? String(body.roleName ?? '').trim()
      : mockRoles[idx].roleName;

    if (!String(nextName ?? '').trim()) {
      return new HttpResponse('roleName is required', { status: 400 });
    }

    mockRoles[idx] = {
      ...mockRoles[idx],
      roleCode: Object.prototype.hasOwnProperty.call(body, 'roleCode')
        ? String(body.roleCode ?? '').trim()
        : mockRoles[idx].roleCode,
      roleName: nextName,
      roleDesc: Object.prototype.hasOwnProperty.call(body, 'roleDesc')
        ? String(body.roleDesc ?? '').trim()
        : mockRoles[idx].roleDesc,
      useFlag: Object.prototype.hasOwnProperty.call(body, 'useFlag')
        ? String(body.useFlag ?? 'Y')
        : mockRoles[idx].useFlag,
      lastUpdatedBy: String(body.lastUpdatedBy ?? 'admin'),
      lastUpdatedDate: new Date().toISOString(),
    };

    return HttpResponse.json(mockRoles[idx]);
  }),

  http.delete('/api/roles/:id', ({ params }) => {
    const id = parseRoleId(String(params.id));
    if (id == null) return new HttpResponse('invalid id', { status: 400 });

    const idx = mockRoles.findIndex((role) => role.id === id);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockRoles.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),
];
