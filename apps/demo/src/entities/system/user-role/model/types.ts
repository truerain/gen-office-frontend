export interface UserRoleKey {
  userId: number;
  roleId: number;
}

export interface UserRole extends UserRoleKey {
  primaryYn: string;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
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
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}

export interface UserRoleUpdateRequest {
  primaryYn: string;
  useYn: string;
  attribute1?: string | null;
  attribute2?: string | null;
  attribute3?: string | null;
  attribute4?: string | null;
  attribute5?: string | null;
  attribute6?: string | null;
  attribute7?: string | null;
  attribute8?: string | null;
  attribute9?: string | null;
  attribute10?: string | null;
}
