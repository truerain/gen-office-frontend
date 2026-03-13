import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AlertDialogVariant } from '@gen-office/ui';

export type AlertOptions = {
  type: AlertDialogVariant;
  message: string | ReactNode;
  confirmText?: string;
};

export type ConfirmOptions = {
  title?: string | ReactNode;
  message?: string | ReactNode;
  variant?: AlertDialogVariant;
  buttonSet?: 'ok' | 'okCancel' | 'yesNo';
};

export type AlertDialogContextValue = {
  openAlert: (options: AlertOptions) => Promise<void>;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
};

export const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

export function useAlertDialog() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return ctx;
}
