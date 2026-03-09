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
  lastUpdatedDate: string;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
}

export type MenuRequest = {
  menuId?: number;
  menuName?: string;
  menuNameEng?: string;
  menuDesc?: string;
  menuDescEng?: string;
  menuLevel?: number;
  parentMenuId?: number;
  execComponent?: string;
  menuIcon?: string;
  displayYn?: string;
  useYn?: string;
  sortOrder?: number;
};

export type MenuListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};
