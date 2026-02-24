import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@gen-office/utils';
import { Input } from '../../core/Input';
import { Popover, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { PopupInputProps } from './PopupInput.types';
import styles from './PopupInput.module.css';

export function PopupInput({
  value,
  onValueChange,
  placeholder,
  disabled,
  readOnly = true,
  openOnInputFocus = true,
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
}: PopupInputProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const resolvedValue = String(value ?? '');

  const setOpen = (nextOpen: boolean) => {
    if (openProp === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const renderedContent = useMemo(() => {
    if (typeof content === 'function') {
      return content({
        open,
        close: () => setOpen(false),
        value: resolvedValue,
      });
    }
    return content;
  }, [content, open, resolvedValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn(styles.root, fullWidth && styles.fullWidth, className)}>
        <Input
          value={resolvedValue}
          onChange={(event) => onValueChange?.(event.target.value)}
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
            if (event.key !== 'Enter' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            if (!disabled) setOpen(true);
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
      <PopoverContent align={align} sideOffset={sideOffset} className={contentClassName}>
        {renderedContent}
      </PopoverContent>
    </Popover>
  );
}

export default PopupInput;
