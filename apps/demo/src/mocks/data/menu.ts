// apps/demo/src/mocks/data/menu.ts
import type { AppMenu } from '@/app/menu/model/types';

const menus: AppMenu[] = [
  { menuId: 100000, menuName: "고객관리", menuNameEng:"Customer Management", prntMenuId: null, dsplFlag: "Y", sortOrder: 1 }, 
  { menuId: 100100, menuName: "고객정보관리", menuNameEng:"Customer Information", prntMenuId: 100000, dsplFlag: "Y", sortOrder: 1, url: 'CustomerInfoPage' }, 
  { menuId: 100200, menuName: "고객별 매출", menuNameEng:"Customer Sales", prntMenuId: 100000, dsplFlag: "Y", sortOrder: 2 }, 

  { menuId: 900000, menuName: "시스템관리", menuNameEng:"System Management", prntMenuId: null, dsplFlag: "Y", sortOrder: 9  }, 
  { menuId: 900100, menuName: "사용자관리", menuNameEng:"User Management", prntMenuId: 900000, dsplFlag: "Y", sortOrder: 1, url: 'UserManagementPage'  }, 
  { menuId: 900200, menuName: "메뉴관리", menuNameEng:"Menu Management", prntMenuId: 900000, dsplFlag: "Y", sortOrder: 1, url: 'MenuManagementPage' }, 

  { menuId: 990000, menuName: "UI Demo", menuNameEng:"UI Demo", prntMenuId: null, dsplFlag: "Y", sortOrder: 10  }, 
  { menuId: 990100, menuName: "Primitives", menuNameEng:"Primitives", prntMenuId: 990000, dsplFlag: "Y", sortOrder: 1, url: 'PrimitivesPage'  }, 
  { menuId: 990200, menuName: "DatePicker", menuNameEng:"DatePicker", prntMenuId: 990000, dsplFlag: "Y", sortOrder: 2, url: 'DatePickerDemoPage'  }, 
];

export function loadAppMenuData() {
  return menus;
}

