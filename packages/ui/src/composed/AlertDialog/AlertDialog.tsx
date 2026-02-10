// packages/ui/src/composed/AlertDialog/AlertDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../core/Dialog';
import { Button } from '../../core/Button';
import type { AlertDialogProps } from './AlertDialog.types';
import styles from './AlertDialog.module.css';

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={getVariantClass()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

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
