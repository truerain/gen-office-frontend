// apps/demo/src/entities/system/role/model/types.ts

export interface RoleRequest {
  roleName?: string;
  roleCode?: string;
  roleDesc?: string;
  useFlag?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface Role {
  id: number;
  roleName?: string;
  roleCode?: string;
  roleDesc?: string;
  useFlag?: string;
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
