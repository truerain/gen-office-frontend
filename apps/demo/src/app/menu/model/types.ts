// apps/demo/src/entities/system/menu/model/types.ts

export interface AppMenu {
  menuId: number;
  menuName: string;
  menuNameEng: string;
  menuDesc?: string;
  menuDescEng?: string;
  menuIcon?: string;
  menuLevel?: number;
  execComponent?: string;
  parentMenuId: number|null;
  displayYn: string;
  useYn?: string;
  sortOrder: number;
}
