// apps/demo/src/entities/system/menu/model/types.ts

export interface Menu {
  menuId: number;
  menuName: string;
  menuNameEng: string;
  menuDesc: string;
  menuLevel: number;
  prntMenuId: number;
  dsplFlag: string;
  useFlag: string;
  sortOrder: number;
  url: string;
  param1?: string;
  param2?: string;
  param3?: string;
  param4?: string;
  param5?: string;
  abAuthFlag?: string;
  attribute1?: string;
  attribute2?: string;
  attribute3?: string;
  attribute4?: string;
  attribute5?: string;
  attribute6?: string;
  attribute7?: string;
  attribute8?: string;
  attribute9?: string;
  attribute10?: string;
  creationDate?: string;
  createdBy?: string;
  lastUpdateDate?: string;
  lastUpdatedBy?: string;
  cauthFlag?: string;
  eauthFlag?: string;
  fauthFlag?: string;
}

export type MenuListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};



