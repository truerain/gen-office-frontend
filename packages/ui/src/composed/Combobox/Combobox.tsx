import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '@gen-office/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '../../core/Popover';
import { Input } from '../../core/Input';
import type { ComboboxOption, ComboboxProps } from './Combobox.types';
import styles from './Combobox.module.css';

const defaultFilter = (option: ComboboxOption, inputValue: string) => {
  const query = inputValue.trim().toLowerCase();
  if (!query) return true;
  return option.label.toLowerCase().includes(query);
};

const findOptionByValue = (options: ComboboxOption[], value?: string) => {
  if (!value) return null;
  return options.find((option) => option.value === value) ?? null;
};

export function Combobox({
  options,
  value,
  onValueChange,
  inputValue,
  onInputValueChange,
  placeholder,
  emptyMessage = 'No results',
  label,
  helperText,
  error,
  required,
  disabled,
  clearable = false,
  clearLabel = 'Clear',
  onClear,
  fullWidth,
  className,
  inputClassName,
  listClassName,
  openOnFocus = true,
  filterOptions,
  id: providedId,
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearingRef = useRef(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalInputValue, setInternalInputValue] = useState('');

  const resolvedInputValue = inputValue ?? internalInputValue;
  const resolvedFilter = filterOptions ?? defaultFilter;

  const filteredOptions = useMemo(
    () => options.filter((option) => resolvedFilter(option, resolvedInputValue)),
    [options, resolvedFilter, resolvedInputValue]
  );

  useEffect(() => {
    if (inputValue !== undefined) return;
    const selected = findOptionByValue(options, value);
    if (selected) {
      setInternalInputValue(selected.label);
    }
  }, [value, options, inputValue]);

  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (filteredOptions.length === 0) {
      setHighlightedIndex(-1);
      return;
    }
    if (highlightedIndex === -1) return;
    const current = filteredOptions[highlightedIndex];
    if (!current || current.disabled) {
      const nextIndex = getNextEnabledIndex(filteredOptions, -1, 1);
      setHighlightedIndex(nextIndex);
    }
  }, [filteredOptions, highlightedIndex, open]);

  const setInputValue = (nextValue: string) => {
    if (inputValue === undefined) {
      setInternalInputValue(nextValue);
    }
    onInputValueChange?.(nextValue);
  };

  const getNextEnabledIndex = (
    list: ComboboxOption[],
    startIndex: number,
    direction: 1 | -1
  ) => {
    if (list.length === 0) return -1;
    let index = startIndex;
    for (let i = 0; i < list.length; i += 1) {
      index = (index + direction + list.length) % list.length;
      if (!list[index].disabled) return index;
    }
    return -1;
  };

  const selectOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    onValueChange?.(option.value, option);
    setInputValue(option.label);
    setOpen(false);
  };

  const focusOption = (index: number) => {
    const target = optionRefs.current[index];
    if (target) {
      target.focus();
    }
  };

  const handleInputChange = (nextValue: string) => {
    if (clearingRef.current) {
      clearingRef.current = false;
      setInputValue(nextValue);
      return;
    }
    const nextFilteredOptions = options.filter((option) =>
      resolvedFilter(option, nextValue)
    );
    setInputValue(nextValue);
    if (!open) setOpen(true);
    if (highlightedIndex === -1 && nextFilteredOptions.length > 0) {
      const nextIndex = getNextEnabledIndex(nextFilteredOptions, -1, 1);
      setHighlightedIndex(nextIndex);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) setOpen(true);
      const nextIndex = getNextEnabledIndex(
        filteredOptions,
        highlightedIndex === -1 ? -1 : highlightedIndex,
        1
      );
      setHighlightedIndex(nextIndex);
      if (nextIndex >= 0) {
        window.setTimeout(() => focusOption(nextIndex), 0);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      const nextIndex = getNextEnabledIndex(
        filteredOptions,
        highlightedIndex === -1 ? 0 : highlightedIndex,
        -1
      );
      setHighlightedIndex(nextIndex);
      if (nextIndex >= 0) {
        window.setTimeout(() => focusOption(nextIndex), 0);
      }
      return;
    }

    if (event.key === 'Enter') {
      if (open && highlightedIndex >= 0) {
        event.preventDefault();
        const option = filteredOptions[highlightedIndex];
        if (option) selectOption(option);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(
        filteredOptions,
        highlightedIndex === -1 ? -1 : highlightedIndex,
        1
      );
      setHighlightedIndex(nextIndex);
      if (nextIndex >= 0) focusOption(nextIndex);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(
        filteredOptions,
        highlightedIndex === -1 ? 0 : highlightedIndex,
        -1
      );
      setHighlightedIndex(nextIndex);
      if (nextIndex >= 0) focusOption(nextIndex);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) selectOption(option);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleInteractOutside = (event: Event) => {
    const target = event.target as Node | null;
    if (target && rootRef.current?.contains(target)) {
      event.preventDefault();
      return;
    }
    setOpen(false);
  };

  const handleClear = () => {
    clearingRef.current = true;
    setInputValue('');
    onValueChange?.('', null);
    onClear?.();
  };

  const activeOptionId =
    highlightedIndex >= 0 ? `${inputId}-option-${highlightedIndex}` : undefined;

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    setOpen(nextOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverPrimitive.Anchor asChild={true}>
        <div
          ref={rootRef}
          className={cn(styles.root, fullWidth && styles.fullWidth, className)}
        >
          <Input
            ref={inputRef}
            id={inputId}
            value={resolvedInputValue}
            onChange={(event) => handleInputChange(event.target.value)}
            onFocus={() => openOnFocus && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            label={label}
            helperText={helperText}
            error={error}
            required={required}
            disabled={disabled}
            fullWidth={fullWidth}
            className={inputClassName}
            clearable={clearable}
            clearLabel={clearLabel}
            onClear={handleClear}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
          />
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverContent
        className={cn(styles.content, listClassName)}
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={handleInteractOutside}
      >
        {filteredOptions.length === 0 ? (
          <div className={styles.empty}>{emptyMessage}</div>
        ) : (
          <div className={styles.list} role="listbox" id={listboxId}>
            {filteredOptions.map((option, index) => {
              const isActive = index === highlightedIndex;
              return (
                <button
                  key={option.value}
                  id={`${inputId}-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={option.disabled}
                  disabled={option.disabled}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  className={cn(
                    styles.option,
                    isActive && styles.optionActive,
                    option.disabled && styles.optionDisabled
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onKeyDown={handleListKeyDown}
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {option.description && (
                    <span className={styles.optionDescription}>
                      {option.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
