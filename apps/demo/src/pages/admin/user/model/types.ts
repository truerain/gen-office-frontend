// apps/demo/src/entities/system/user/model/types.ts

export interface UserRequest {
  empNo?: string;
  empName?: string;
  empNameEng?: string;
  email?: string;
  orgId?: string;
  titleCd?: string;
  langCd?: string;
}

export interface User {
  userId: number;
  empNo?: string;
  empName?: string;
  empNameEng?: string;
  email?: string;
  orgId?: string;
  titleCd?: string;
  titleName?: string;
  langCd?: string;
  password?: string;
  lastUpdatedDate?: string;
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
}

export type UserListParams = {
  empName?: string;
  page?: number;
  pageSize?: number;
};
