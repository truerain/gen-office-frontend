// types.ts
export interface ColumnDef<T> {
  id: string;
  accessor: keyof T | ((row: T) => any);
  header: string;
  width?: number;
  editable?: boolean | ((row: T) => boolean); // 추가
}

export interface NGridProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: keyof T;
  onEdit?: (rowKey: string | number, columnId: string, newValue: any) => void;

  // 선택 관련
  selectable?: boolean;
  selectedRows?: (string | number)[];
  onSelectionChange?: (selectedRows: (string | number)[]) => void;

  // 변경 추적
  trackChanges?: boolean;
  modifiedRows?: Set<string | number>;

  // 높이 설정
  headerHeight?: number; // default: 48
  rowHeight?: number; // default: 48
  height?: number; // 전체 그리드 높이 (설정 시 body 스크롤)
}