import type { ReactNode } from 'react';
import type { AlertDialogVariant } from '../AlertDialog';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string | ReactNode;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  variant?: AlertDialogVariant;
}
