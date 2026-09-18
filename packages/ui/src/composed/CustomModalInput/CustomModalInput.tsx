// packages/ui/src/composed/CustomModalInput/CustomModalInput.tsx
// Trigger input + SimpleDialog shell; app supplies dialog body via render.
// Sibling of ModalInput — does not share list/fetch APIs.

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@gen-office/utils';
import { Button } from '../../core/Button';
import { Input } from '../../core/Input';
import { SimpleDialog } from '../../core/Dialog';
import type { CustomModalInputProps } from './CustomModalInput.types';
import styles from './CustomModalInput.module.css';

function cloneDraftValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as T;
  }
  if (value !== null && typeof value === 'object') {
    return { ...value } as T;
  }
  return value;
}

export function CustomModalInput<T>({
  value,
  onChange,
  displayValue,
  render,
  title,
  placeholder,
  disabled,
  fullWidth = true,
  clearable = true,
  clearLabel = 'Clear',
  emptyValue,
  onClear,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  size,
  modalHeight = 360,
  modalWidth,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  triggerAriaLabel = 'Open modal',
  triggerIcon,
  label,
  helperText,
  error,
  required,
  className,
  inputClassName,
  dialogClassName,
}: CustomModalInputProps<T>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState<T>(() => cloneDraftValue(value));
  const skipNextFocusOpenRef = useRef(false);

  const open = openProp ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(cloneDraftValue(value));
    }
    if (openProp === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const canClear = clearable && (onClear != null || emptyValue !== undefined);

  const clearSelection = () => {
    skipNextFocusOpenRef.current = true;
    if (onClear) {
      onClear();
    } else if (emptyValue !== undefined) {
      onChange(emptyValue);
    }
    if (open) {
      setOpen(false);
    }
  };

  const commit = (next?: T) => {
    onChange(next !== undefined ? next : draft);
    setOpen(false);
  };

  const close = () => {
    setOpen(false);
  };

  const useSizePreset = size !== undefined;

  return (
    <div className={cn(styles.root, fullWidth && styles.fullWidth, className)}>
      <Input
        value={displayValue}
        readOnly={true}
        placeholder={placeholder}
        disabled={disabled}
        clearable={canClear}
        clearLabel={clearLabel}
        onClear={canClear ? clearSelection : undefined}
        autoSelect={false}
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        fullWidth={fullWidth}
        className={inputClassName}
        onFocus={() => {
          if (skipNextFocusOpenRef.current) {
            skipNextFocusOpenRef.current = false;
            return;
          }
          if (!disabled) {
            setOpen(true);
          }
        }}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (!disabled) {
            setOpen(true);
          }
        }}
        suffix={
          <button
            type="button"
            className={styles.triggerButton}
            aria-label={triggerAriaLabel}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setOpen(true)}
          >
            {triggerIcon ?? <Search size={14} aria-hidden={true} />}
          </button>
        }
      />

      <SimpleDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        size={useSizePreset ? size : undefined}
        initialHeight={useSizePreset ? undefined : modalHeight}
        initialWidth={useSizePreset ? undefined : modalWidth}
        className={dialogClassName}
        footer={
          <div className={styles.footer}>
            <Button type="button" variant="secondary" onClick={close}>
              {cancelLabel}
            </Button>
            <Button type="button" variant="primary" onClick={() => commit()}>
              {confirmLabel}
            </Button>
          </div>
        }
      >
        <div className={styles.body}>
          {render({
            value: draft,
            onChange: setDraft,
            close,
            confirm: commit,
          })}
        </div>
      </SimpleDialog>
    </div>
  );
}

export default CustomModalInput;
