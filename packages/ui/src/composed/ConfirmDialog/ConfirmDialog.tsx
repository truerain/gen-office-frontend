import { AlertDialog } from '../AlertDialog';
import type { ConfirmDialogProps } from './ConfirmDialog.types';

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'warning',
}: ConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      message={message}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
      variant={variant}
    />
  );
}
