import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@gen-office/utils';
import { Input } from '../../core/Input';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { PopupInputProps, PopupInputSelection } from './PopupInput.types';
import styles from './PopupInput.module.css';

export function PopupInput<TData = unknown>({
  value,
  displayValue,
  selection,
  onValueChange,
  onCommitValue,
  onDisplayValueChange,
  onSelectionChange,
  placeholder,
  disabled,
  readOnly = true,
  openOnInputFocus = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  align = 'start',
  sideOffset = 6,
  content,
  triggerAriaLabel = 'Open popup',
  triggerIcon,
  label,
  helperText,
  error,
  required,
  fullWidth,
  className,
  inputClassName,
  contentClassName,
}: PopupInputProps<TData>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalSelection, setInternalSelection] = useState<PopupInputSelection<TData> | null>(null);
  const open = openProp ?? internalOpen;
  const controlledSelection = selection !== undefined ? selection : undefined;
  const candidateSelection =
    controlledSelection === undefined ? internalSelection : controlledSelection;
  const resolvedValue = String(value ?? candidateSelection?.value ?? '');
  const resolvedSelection =
    candidateSelection && candidateSelection.value === resolvedValue ? candidateSelection : null;
  const resolvedDisplayValue = String(resolvedSelection?.label ?? displayValue ?? resolvedValue);
  const hasSelectedValue = resolvedDisplayValue.trim().length > 0;

  const setOpen = (nextOpen: boolean) => {
    if (openProp === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const setSelection = (nextSelection: PopupInputSelection<TData> | null) => {
    if (selection === undefined) {
      setInternalSelection(nextSelection);
    }
    onSelectionChange?.(nextSelection);
    onCommitValue?.(nextSelection?.value ?? '', nextSelection);
  };

  const renderedContent = useMemo(() => {
    if (typeof content === 'function') {
      return content({
        open,
        close: () => setOpen(false),
        value: resolvedValue,
        displayValue: resolvedDisplayValue,
        selection: resolvedSelection,
        setSelection,
      });
    }
    return content;
  }, [content, open, resolvedDisplayValue, resolvedSelection, resolvedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild={true}>
        <div className={cn(styles.root, fullWidth && styles.fullWidth, className)}>
          <Input
            value={resolvedDisplayValue}
            onChange={(event) => {
              const nextValue = event.target.value;
              if (selection === undefined) {
                setInternalSelection(null);
              }
              onSelectionChange?.(null);
              onDisplayValueChange?.(nextValue);
              onValueChange?.(nextValue);
            }}
            clearable={hasSelectedValue}
            onClear={() => {
              if (selection === undefined) {
                setInternalSelection(null);
              }
              onSelectionChange?.(null);
              onDisplayValueChange?.('');
              onValueChange?.('');
              onCommitValue?.('', null);
              setOpen(false);
            }}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            autoSelect={false}
            label={label}
            helperText={helperText}
            error={error}
            required={required}
            fullWidth={fullWidth}
            className={inputClassName}
            onFocus={() => {
              if (!disabled && openOnInputFocus) setOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              if (!disabled) {
                setOpen(true);
              }
            }}
            suffix={
              <PopoverTrigger asChild={true}>
                <button
                  type="button"
                  className={styles.triggerButton}
                  aria-label={triggerAriaLabel}
                  disabled={disabled}
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {triggerIcon ?? <Search size={14} aria-hidden={true} />}
                </button>
              </PopoverTrigger>
            }
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align={align}
        sideOffset={sideOffset}
        className={contentClassName}
        data-gen-grid-editor-overlay="true"
      >
        {renderedContent}
      </PopoverContent>
    </Popover>
  );
}

export default PopupInput;
