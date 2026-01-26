// apps/demo/src/entities/system/menu/model/types.ts

export interface Menu {
  menu_id: string;
  menu_name: string;
  menu_name_eng: string;
  menu_desc: string;
  menu_level: string;
  prnt_menu_id: string;
  display_flag: string;
  use_flag: string;
  sort_order: number;
  url: string;
}

export type MenuListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};



