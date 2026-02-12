// apps/demo/src/entities/system/role/model/types.ts

export interface RoleRequest {
  roleCd?: string;
  roleName?: string;
  roleNameEng?: string;
  roleDesc?: string;
  sortOrder?: number;
  useYn?: string;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  attribute4: string;
  attribute5: string;
  attribute6: string;
  attribute7: string;
  attribute8: string;
  attribute9: string;
  attribute10: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface Role {
  roleId: number;
  roleCd?: string;
  roleName?: string;
  roleNameEng?: string;
  roleDesc?: string;
  sortOrder?: number;
  useYn?: string;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  attribute4: string;
  attribute5: string;
  attribute6: string;
  attribute7: string;
  attribute8: string;
  attribute9: string;
  attribute10: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
}

export type RoleListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
