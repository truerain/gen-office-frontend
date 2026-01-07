// packages/ui/src/composed/Drawer/Drawer.types.ts
import type { ReactNode } from 'react';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Drawer 표시 여부 */
  open: boolean;
  
  /** Drawer 열림/닫힘 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  
  /** Drawer 제목 */
  title?: string | ReactNode;
  
  /** Drawer 설명 */
  description?: string | ReactNode;
  
  /** Drawer 내용 */
  children: ReactNode;
  
  /** Drawer가 나타나는 위치 */
  side?: DrawerSide;
  
  /** 오버레이 클릭 시 닫기 여부 */
  closeOnOverlayClick?: boolean;
  
  /** ESC 키로 닫기 여부 */
  closeOnEsc?: boolean;
  
  /** Footer 영역 (버튼 등) */
  footer?: ReactNode;
  
  /** Drawer 너비/높이 (side에 따라 다름) */
  size?: 'sm' | 'md' | 'lg' | 'full';
}
