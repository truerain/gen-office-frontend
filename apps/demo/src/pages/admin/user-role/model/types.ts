export interface UserRoleKey {
  userId: number;
  roleId: number;
}

export interface UserRole extends UserRoleKey {
  primaryYn: string;
  useYn: string;
  createdAt?: string;
  updatedAt?: string;
  empNo?: string | null;
  empName?: string | null;
  orgName?: string | null;
  roleName?: string | null;
}

export type UserRoleListParams = {
  userId?: number;
  roleId?: number;
  useYn?: string;
  sort?: string;
  page?: number;
  size?: number;
};

export interface UserRoleCreateRequest {
  userId: number;
  roleId: number;
  primaryYn: string;
  useYn: string;
}

export interface UserRoleUpdateRequest {
  primaryYn: string;
  useYn: string;
}

export interface UserRoleOption {
  value: number;
  label: string;
}

export interface UserRoleBulkUpdateItem {
  userId: number;
  roleId: number;
  input: UserRoleUpdateRequest;
}

export interface UserRoleBulkKey {
  userId: number;
  roleId: number;
}

export interface UserRoleBulkRequest {
  creates: UserRoleCreateRequest[];
  updates: UserRoleBulkUpdateItem[];
  deletes: UserRoleBulkKey[];
}
