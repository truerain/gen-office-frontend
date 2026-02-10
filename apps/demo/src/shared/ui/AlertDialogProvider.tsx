import { createContext, useContext, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';
import { AlertDialog } from '@gen-office/ui';

type AlertOptions = {
  title: string | ReactNode;
  confirmText?: string;
};

type ConfirmOptions = {
  title: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
};

type AlertDialogContextValue = {
  openAlert: (options: AlertOptions) => Promise<void>;
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

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
        confirmText={confirmOptions?.confirmText ?? '확인'}
        cancelText={confirmOptions?.cancelText ?? '취소'}
        onConfirm={confirmYes}
        onCancel={confirmNo}
      />

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title={alertOptions?.title ?? ''}
        confirmText={alertOptions?.confirmText ?? '확인'}
        hideCancelButton
        onConfirm={closeAlert}
      />
    </AlertDialogContext.Provider>
  );
}

export function useAlertDialog() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return ctx;
}
