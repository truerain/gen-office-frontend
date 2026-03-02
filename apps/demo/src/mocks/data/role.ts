// apps/demo/src/mocks/data/role.ts
import type { Role } from '@/pages/admin/role/model/types';

export const mockRoles: Role[] = [
  {
    roleId: 1,
    roleCd: 'ADMIN',
    roleName: 'Administrator',
    roleNameEng: 'Administrator',
    roleDesc: 'System administrator role',
    sortOrder: 1,
    useYn: 'Y',
    lastUpdatedBy: 'system',
    lastUpdatedByName: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
  {
    roleId: 2,
    roleCd: 'MANAGER',
    roleName: 'Manager',
    roleNameEng: 'Manager',
    roleDesc: 'Department manager role',
    sortOrder: 2,
    useYn: 'Y',
    lastUpdatedBy: 'system',
    lastUpdatedByName: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
  {
    roleId: 3,
    roleCd: 'USER',
    roleName: 'User',
    roleNameEng: 'User',
    roleDesc: 'General user role',
    sortOrder: 3,
    useYn: 'Y',
    lastUpdatedBy: 'system',
    lastUpdatedByName: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
];
