// apps/demo/src/mocks/handlers/role.handlers.ts
import { http, HttpResponse } from 'msw';
import { mockRoles } from '@/mocks/data/role';
import type { Role, RoleRequest } from '@/entities/system/role/model/types';

function parseRoleId(value: string) {
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function nextRoleId() {
  const maxId = mockRoles.reduce((max, role) => (role.roleId > max ? role.roleId : max), 0);
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
          String(role.roleCd ?? '').toLowerCase().includes(q) ||
          String(role.roleDesc ?? '').toLowerCase().includes(q)
        );
      });
    }

    return HttpResponse.json(items);
  }),

  http.get('/api/roles/:id', ({ params }) => {
    const id = parseRoleId(String(params.id));
    if (id == null) return new HttpResponse('invalid id', { status: 400 });

    const found = mockRoles.find((role) => role.roleId === id);
    if (!found) return new HttpResponse('not found', { status: 404 });

    return HttpResponse.json(found);
  }),

  http.post('/api/roles', async ({ request }) => {
    const body = (await request.json()) as RoleRequest;

    if (!String(body.roleName ?? '').trim()) {
      return new HttpResponse('roleName is required', { status: 400 });
    }

    const now = new Date().toISOString();
    const created: Role = {
      roleId: nextRoleId(),
      roleCd: String(body.roleCd ?? '').trim(),
      roleName: String(body.roleName ?? '').trim(),
      roleNameEng: String(body.roleNameEng ?? '').trim(),
      roleDesc: String(body.roleDesc ?? '').trim(),
      sortOrder: Number(body.sortOrder ?? 0),
      useYn: String(body.useYn ?? 'Y'),
      attribute1: String(body.attribute1 ?? ''),
      attribute2: String(body.attribute2 ?? ''),
      attribute3: String(body.attribute3 ?? ''),
      attribute4: String(body.attribute4 ?? ''),
      attribute5: String(body.attribute5 ?? ''),
      attribute6: String(body.attribute6 ?? ''),
      attribute7: String(body.attribute7 ?? ''),
      attribute8: String(body.attribute8 ?? ''),
      attribute9: String(body.attribute9 ?? ''),
      attribute10: String(body.attribute10 ?? ''),
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

    const idx = mockRoles.findIndex((role) => role.roleId === id);
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
      roleCd: Object.prototype.hasOwnProperty.call(body, 'roleCd')
        ? String(body.roleCd ?? '').trim()
        : mockRoles[idx].roleCd,
      roleName: nextName,
      roleNameEng: Object.prototype.hasOwnProperty.call(body, 'roleNameEng')
        ? String(body.roleNameEng ?? '').trim()
        : mockRoles[idx].roleNameEng,
      roleDesc: Object.prototype.hasOwnProperty.call(body, 'roleDesc')
        ? String(body.roleDesc ?? '').trim()
        : mockRoles[idx].roleDesc,
      sortOrder: Object.prototype.hasOwnProperty.call(body, 'sortOrder')
        ? Number(body.sortOrder ?? 0)
        : mockRoles[idx].sortOrder,
      useYn: Object.prototype.hasOwnProperty.call(body, 'useYn')
        ? String(body.useYn ?? 'Y')
        : mockRoles[idx].useYn,
      attribute1: Object.prototype.hasOwnProperty.call(body, 'attribute1')
        ? String(body.attribute1 ?? '')
        : mockRoles[idx].attribute1,
      attribute2: Object.prototype.hasOwnProperty.call(body, 'attribute2')
        ? String(body.attribute2 ?? '')
        : mockRoles[idx].attribute2,
      attribute3: Object.prototype.hasOwnProperty.call(body, 'attribute3')
        ? String(body.attribute3 ?? '')
        : mockRoles[idx].attribute3,
      attribute4: Object.prototype.hasOwnProperty.call(body, 'attribute4')
        ? String(body.attribute4 ?? '')
        : mockRoles[idx].attribute4,
      attribute5: Object.prototype.hasOwnProperty.call(body, 'attribute5')
        ? String(body.attribute5 ?? '')
        : mockRoles[idx].attribute5,
      attribute6: Object.prototype.hasOwnProperty.call(body, 'attribute6')
        ? String(body.attribute6 ?? '')
        : mockRoles[idx].attribute6,
      attribute7: Object.prototype.hasOwnProperty.call(body, 'attribute7')
        ? String(body.attribute7 ?? '')
        : mockRoles[idx].attribute7,
      attribute8: Object.prototype.hasOwnProperty.call(body, 'attribute8')
        ? String(body.attribute8 ?? '')
        : mockRoles[idx].attribute8,
      attribute9: Object.prototype.hasOwnProperty.call(body, 'attribute9')
        ? String(body.attribute9 ?? '')
        : mockRoles[idx].attribute9,
      attribute10: Object.prototype.hasOwnProperty.call(body, 'attribute10')
        ? String(body.attribute10 ?? '')
        : mockRoles[idx].attribute10,
      lastUpdatedBy: String(body.lastUpdatedBy ?? 'admin'),
      lastUpdatedDate: new Date().toISOString(),
    };

    return HttpResponse.json(mockRoles[idx]);
  }),

  http.delete('/api/roles/:id', ({ params }) => {
    const id = parseRoleId(String(params.id));
    if (id == null) return new HttpResponse('invalid id', { status: 400 });

    const idx = mockRoles.findIndex((role) => role.roleId === id);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockRoles.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),
];
