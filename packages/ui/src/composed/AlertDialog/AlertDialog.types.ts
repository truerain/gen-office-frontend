// packages/ui/src/composed/AlertDialog/AlertDialog.types.ts
import type { ReactNode } from 'react';

export type AlertDialogVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertDialogProps {
  /** Dialog 표시 여부 */
  open: boolean;
  
  /** Dialog 열림/닫힘 상태 변경 핸들러 */
  onOpenChange: (open: boolean) => void;
  
  /** Alert 제목 (string 또는 JSX) */
  title: string | ReactNode;
  
  /** Alert 설명 (string 또는 JSX - HTML 태그 사용 가능) */
  description?: string | ReactNode;
  
  /** 확인 버튼 텍스트 */
  confirmText?: string;
  
  /** 취소 버튼 텍스트 */
  cancelText?: string;
  
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: () => void | Promise<void>;
  
  /** 취소 버튼 클릭 핸들러 (선택적) */
  onCancel?: () => void;
  
  /** Alert 타입 */
  variant?: AlertDialogVariant;
  
  /** 취소 버튼 숨기기 */
  hideCancelButton?: boolean;
  
  /** 확인 버튼 로딩 상태 */
  isLoading?: boolean;
}