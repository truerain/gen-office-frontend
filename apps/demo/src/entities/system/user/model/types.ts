// apps/demo/src/entities/system/user/model/types.ts

export interface UserRequest {
  empNo?: string;
  empName?: string;
  empNameEng?: string;
  password?: string;
  email?: string;
  orgId?: string;
  title?: string;
  langCd?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
}

export interface User {
  userId: number;
  empNo?: string;
  empName?: string;
  empNameEng?: string;
  email?: string;
  orgId?: string;
  title?: string;
  langCd?: string;
  createdBy?: string;
  creationDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedDate?: string;
  password?: string;
}

export type UserListParams = {
  empName?: string;
  page?: number;
  pageSize?: number;
};
