import { useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { AlertDialog } from '@gen-office/ui';
import type { AlertDialogVariant } from '@gen-office/ui';
import {
  AlertDialogContext,
  type AlertDialogContextValue,
  type AlertOptions,
  type ConfirmOptions,
} from './AlertDialogContext';
const DEFAULT_CONFIRM_TEXT = '확인';
const DEFAULT_CANCEL_TEXT = '취소';
const ALERT_TYPE_TITLES: Record<AlertDialogVariant, string> = {
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
};

export function AlertDialogProvider({ children }: PropsWithChildren) {
  const [alertOpen, setAlertOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
  const alertResolverRef = useRef<(() => void) | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const openAlert = (options: AlertOptions) =>
    new Promise<void>((resolve) => {
      alertResolverRef.current = resolve;
      setAlertOptions(options);
      setAlertOpen(true);
    });

  const openConfirm = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmOptions(options);
      setConfirmOpen(true);
    });

  const closeAlert = () => {
    alertResolverRef.current?.();
    alertResolverRef.current = null;
    setAlertOpen(false);
  };

  const confirmYes = () => {
    confirmResolverRef.current?.(true);
    confirmResolverRef.current = null;
    setConfirmOpen(false);
  };

  const confirmNo = () => {
    confirmResolverRef.current?.(false);
    confirmResolverRef.current = null;
    setConfirmOpen(false);
  };

  const value = useMemo<AlertDialogContextValue>(
    () => ({ openAlert, openConfirm }),
    []
  );

  const alertType = alertOptions?.type ?? 'info';
  const alertTitle = ALERT_TYPE_TITLES[alertType];
  const alertMessage = alertOptions?.message ?? '';

  return (
    <AlertDialogContext.Provider value={value}>
      {children}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open && confirmResolverRef.current) {
            confirmNo();
          }
        }}
        title={confirmOptions?.title ?? ''}
        confirmText={confirmOptions?.confirmText ?? DEFAULT_CONFIRM_TEXT}
        cancelText={confirmOptions?.cancelText ?? DEFAULT_CANCEL_TEXT}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        message={alertMessage}
        variant={alertType}
        confirmText={alertOptions?.confirmText ?? DEFAULT_CONFIRM_TEXT}
        hideCancelButton
        onConfirm={closeAlert}
      />
    </AlertDialogContext.Provider>
  );
}
