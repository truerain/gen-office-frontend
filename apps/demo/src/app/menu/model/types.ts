// apps/demo/src/entities/system/menu/model/types.ts

export interface AppMenu {
  menuId: number;
  menuName: string;
  menuNameEng: string;
  menuDesc?: string;
  prntMenuId: number|null;
  dsplFlag: string;
  useFlag?: string;
  sortOrder: number;
  url?: string;
  param1?: string;
  param2?: string;
  param3?: string;
  param4?: string;
  param5?: string;
}
