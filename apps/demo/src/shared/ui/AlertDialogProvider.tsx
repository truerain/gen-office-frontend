import { useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertDialog } from '@gen-office/ui';
import type { AlertDialogVariant } from '@gen-office/ui';
import {
  AlertDialogContext,
  type AlertDialogContextValue,
  type AlertOptions,
  type ConfirmOptions,
} from './AlertDialogContext';

const ALERT_TYPE_TITLES: Record<AlertDialogVariant, string> = {
  info: 'Information',
  warning: 'Warning',
  error: 'Error',
  success: 'Success',
};

export function AlertDialogProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
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

  const confirmButtonSet = confirmOptions?.buttonSet ?? 'okCancel';
  const confirmTitle = confirmOptions?.title ?? t('common.confirm', { defaultValue: 'Confirm' });
  const confirmMessage = confirmOptions?.message;
  const confirmVariant = confirmOptions?.variant ?? 'warning';
  const confirmText =
    confirmButtonSet === 'yesNo'
      ? t('common.yes', { defaultValue: 'Yes' })
      : t('common.confirm', { defaultValue: 'Confirm' });
  const cancelText =
    confirmButtonSet === 'yesNo'
      ? t('common.no', { defaultValue: 'No' })
      : t('common.cancel', { defaultValue: 'Cancel' });
  const hideCancelButton = confirmButtonSet === 'ok';

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
        title={confirmTitle}
        message={confirmMessage}
        variant={confirmVariant}
        confirmText={confirmText}
        cancelText={cancelText}
        hideCancelButton={hideCancelButton}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertTitle}
        message={alertMessage}
        variant={alertType}
        confirmText={alertOptions?.confirmText ?? t('common.confirm', { defaultValue: 'Confirm' })}
        hideCancelButton
        onConfirm={closeAlert}
      />
    </AlertDialogContext.Provider>
  );
}
