import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Radio,
  RadioGroup,
} from '@gen-office/ui';
import styles from './LayoutSettingsDialog.module.css';

type LayoutMode = 'titlebar' | 'left-panel';

interface LayoutSettingsDialogProps {
  open: boolean;
  value: LayoutMode;
  onOpenChange: (open: boolean) => void;
  onConfirm: (value: LayoutMode) => void;
}

export function LayoutSettingsDialog({
  open,
  value,
  onOpenChange,
  onConfirm,
}: LayoutSettingsDialogProps) {
  const [draft, setDraft] = useState<LayoutMode>(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  const handleConfirm = () => {
    onConfirm(draft);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialog}>
        <DialogHeader>
          <DialogTitle>레이아웃 설정</DialogTitle>
          <DialogDescription>
            원하는 레이아웃을 선택하세요.
          </DialogDescription>
        </DialogHeader>
        <div className={styles.section}>
          <span className={styles.label}>Layout Mode</span>
          <RadioGroup
            className={styles.group}
            value={draft}
            onValueChange={(value) => setDraft(value as LayoutMode)}
          >
            <div className={styles.option}>
              <Radio id="layout-titlebar" value="titlebar" />
              <label htmlFor="layout-titlebar">Title Bar</label>
            </div>
            <div className={styles.option}>
              <Radio id="layout-left-panel" value="left-panel" />
              <label htmlFor="layout-left-panel">Left Panel</label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter className={styles.footer}>
          <DialogClose asChild>
            <Button size="sm" variant="outline">취소</Button>
          </DialogClose>
          <Button size="sm" variant="default" onClick={handleConfirm}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
