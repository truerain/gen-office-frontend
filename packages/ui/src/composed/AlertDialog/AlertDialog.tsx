// packages/ui/src/composed/AlertDialog/AlertDialog.tsx
import { useState } from 'react';
import {
  CircleAlert,
  CircleCheckBig,
  CircleX,
  TriangleAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogFooter,
} from '../../core/Dialog';
import { Button } from '../../core/Button';
import type { AlertDialogProps } from './AlertDialog.types';
import styles from './AlertDialog.module.css';

export function AlertDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  thirdText,
  onConfirm,
  onCancel,
  onThird,
  variant = 'info',
  hideCancelButton = false,
  isLoading = false,
}: AlertDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('AlertDialog confirm error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleThird = () => {
    onThird?.();
    onOpenChange(false);
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'warning':
        return styles.warning;
      case 'error':
        return styles.error;
      case 'success':
        return styles.success;
      default:
        return styles.info;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'primary' as const;
      case 'success':
        return 'primary' as const;
      default:
        return 'primary' as const;
    }
  };

  const Icon = (() => {
    switch (variant) {
      case 'warning':
        return TriangleAlert;
      case 'error':
        return CircleX;
      case 'success':
        return CircleCheckBig;
      default:
        return CircleAlert;
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={getVariantClass()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {message && (
          <DialogBody className={styles.body}>
            <div className={styles.iconWrapper} aria-hidden="true">
              <Icon className={styles.icon} />
            </div>
            <div className={styles.bodyContent}>{message}</div>
          </DialogBody>
        )}

        <DialogFooter>
          {!hideCancelButton && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading || isLoading}
            >
              {cancelText}
            </Button>
          )}
          {thirdText && (
            <Button
              variant="outline"
              onClick={handleThird}
              disabled={loading || isLoading}
            >
              {thirdText}
            </Button>
          )}
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={loading || isLoading}
          >
            {loading || isLoading ? '처리중...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
