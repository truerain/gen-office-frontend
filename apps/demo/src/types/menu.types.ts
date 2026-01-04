// apps/demo/src/types/menu.types.ts

export interface MenuItem {
  id: string;
  label: string;
  icon: string; // lucide-react 아이콘 이름
  component?: React.ComponentType;  // 실제 페이지 컴포넌트
  children?: MenuItem[];
}

export interface MenuData {
  categories: MenuItem[];
}