// apps/demo/src/mocks/handlers/role.handlers.ts
import { http, HttpResponse } from 'msw';
import { mockRoles } from '@/mocks/data/role';
import type { Role, RoleRequest } from '@/pages/admin/role/model/types';

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

    const created: Role = {
      roleId: nextRoleId(),
      roleCd: String(body.roleCd ?? '').trim(),
      roleName: String(body.roleName ?? '').trim(),
      roleNameEng: String(body.roleNameEng ?? '').trim(),
      roleDesc: String(body.roleDesc ?? '').trim(),
      sortOrder: Number(body.sortOrder ?? 0),
      useYn: String(body.useYn ?? 'Y'),
    };

    mockRoles.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post('/api/roles/bulk', async ({ request }) => {
    const body = (await request.json()) as {
      creates?: RoleRequest[];
      updates?: Array<{ id: number; input: RoleRequest }>;
      deletes?: number[];
    };

    const creates = body.creates ?? [];
    const updates = body.updates ?? [];
    const deletes = body.deletes ?? [];
    const next = mockRoles.slice();
    let nextId = nextRoleId();
    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const item of creates) {
      const roleName = String(item?.roleName ?? '').trim();
      if (!roleName) return new HttpResponse('roleName is required', { status: 400 });
      next.unshift({
        roleId: nextId++,
        roleCd: String(item?.roleCd ?? '').trim(),
        roleName,
        roleNameEng: String(item?.roleNameEng ?? '').trim(),
        roleDesc: String(item?.roleDesc ?? '').trim(),
        sortOrder: Number(item?.sortOrder ?? 0),
        useYn: String(item?.useYn ?? 'Y'),
      });
      created++;
    }

    for (const item of updates) {
      const id = Number(item?.id);
      if (!Number.isFinite(id)) return new HttpResponse('invalid id', { status: 400 });
      const idx = next.findIndex((role) => role.roleId === id);
      if (idx === -1) return new HttpResponse('not found', { status: 404 });
      const payload = item.input ?? {};
      const nextName = Object.prototype.hasOwnProperty.call(payload, 'roleName')
        ? String(payload.roleName ?? '').trim()
        : next[idx]!.roleName;
      if (!nextName) return new HttpResponse('roleName is required', { status: 400 });
      next[idx] = {
        ...next[idx]!,
        roleCd: Object.prototype.hasOwnProperty.call(payload, 'roleCd')
          ? String(payload.roleCd ?? '').trim()
          : next[idx]!.roleCd,
        roleName: nextName,
        roleNameEng: Object.prototype.hasOwnProperty.call(payload, 'roleNameEng')
          ? String(payload.roleNameEng ?? '').trim()
          : next[idx]!.roleNameEng,
        roleDesc: Object.prototype.hasOwnProperty.call(payload, 'roleDesc')
          ? String(payload.roleDesc ?? '').trim()
          : next[idx]!.roleDesc,
        sortOrder: Object.prototype.hasOwnProperty.call(payload, 'sortOrder')
          ? Number(payload.sortOrder ?? 0)
          : next[idx]!.sortOrder,
        useYn: Object.prototype.hasOwnProperty.call(payload, 'useYn')
          ? String(payload.useYn ?? 'Y')
          : next[idx]!.useYn,
      };
      updated++;
    }

    for (const rawId of deletes) {
      const id = Number(rawId);
      if (!Number.isFinite(id)) return new HttpResponse('invalid id', { status: 400 });
      const idx = next.findIndex((role) => role.roleId === id);
      if (idx === -1) return new HttpResponse('not found', { status: 404 });
      next.splice(idx, 1);
      deleted++;
    }

    mockRoles.splice(0, mockRoles.length, ...next);
    return HttpResponse.json({ created, updated, deleted });
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
