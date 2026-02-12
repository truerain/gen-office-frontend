// apps/demo/src/entities/system/menu/model/types.ts

export interface Menu {
  menuId: number;
  menuName: string;
  menuNameEng: string;
  menuDesc: string;
  menuDescEng: string;
  menuLevel: number;
  parentMenuId: number,
  execComponent: string;
  menuIcon: string,
  displayYn: string;
  useYn: string;
  sortOrder: number;
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
  creationDate: string;
  createdBy: string;
  lastUpdatedDate: string;
  lastUpdatedBy: string;
}

export type MenuListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
