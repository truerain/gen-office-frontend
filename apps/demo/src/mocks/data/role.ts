// apps/demo/src/mocks/data/role.ts
import type { Role } from '@/entities/system/role/model/types';

export const mockRoles: Role[] = [
  {
    id: 1,
    roleCode: 'ADMIN',
    roleName: 'Administrator',
    roleDesc: 'System administrator role',
    useFlag: 'Y',
    createdBy: 'system',
    creationDate: '2026-01-01T00:00:00Z',
    lastUpdatedBy: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    roleCode: 'MANAGER',
    roleName: 'Manager',
    roleDesc: 'Department manager role',
    useFlag: 'Y',
    createdBy: 'system',
    creationDate: '2026-01-01T00:00:00Z',
    lastUpdatedBy: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    roleCode: 'USER',
    roleName: 'User',
    roleDesc: 'General user role',
    useFlag: 'Y',
    createdBy: 'system',
    creationDate: '2026-01-01T00:00:00Z',
    lastUpdatedBy: 'system',
    lastUpdatedDate: '2026-01-01T00:00:00Z',
  },
];
