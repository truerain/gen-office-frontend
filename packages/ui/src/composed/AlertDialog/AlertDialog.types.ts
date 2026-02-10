// packages/ui/src/composed/AlertDialog/AlertDialog.types.ts
import type { ReactNode } from 'react';

export type AlertDialogVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertDialogProps {
  /** Dialog open state */
  open: boolean;

  /** Change open state */
  onOpenChange: (open: boolean) => void;

  /** Dialog title (string or JSX) */
  title: string | ReactNode;

  /** Dialog description (string or JSX) */
  description?: string | ReactNode;

  /** Confirm button text */
  confirmText?: string;

  /** Cancel button text */
  cancelText?: string;

  /** Confirm action */
  onConfirm: () => void | Promise<void>;

  /** Cancel action (optional) */
  onCancel?: () => void;

  /** Alert variant */
  variant?: AlertDialogVariant;

  /** Hide cancel button */
  hideCancelButton?: boolean;

  /** Third button text (for Yes/No/Cancel) */
  thirdText?: string;

  /** Third button action */
  onThird?: () => void;

  /** Confirm loading state */
  isLoading?: boolean;
}
