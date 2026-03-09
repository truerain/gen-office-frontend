export interface RoleRequest {
  roleId?: number;
  roleCd?: string;
  roleName?: string;
  roleNameEng?: string;
  roleDesc?: string;
  sortOrder?: number;
  useYn?: string;
}

export interface Role {
  roleId: number;
  roleCd?: string;
  roleName?: string;
  roleNameEng?: string;
  roleDesc?: string;
  sortOrder?: number;
  useYn?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
}

export type RoleListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
