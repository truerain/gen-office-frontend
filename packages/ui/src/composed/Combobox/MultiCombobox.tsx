import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@gen-office/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '../../core/Popover';
import { Input } from '../../core/Input';
import type { ComboboxOption } from './Combobox.types';
import type { MultiComboboxProps } from './MultiCombobox.types';
import styles from './MultiCombobox.module.css';

const defaultFilter = (option: ComboboxOption, inputValue: string) => {
  const query = inputValue.trim().toLowerCase();
  if (!query) return true;
  return option.label.toLowerCase().includes(query);
};

function defaultDisplayValue(selectedOptions: ComboboxOption[]) {
  if (selectedOptions.length === 0) return '';
  if (selectedOptions.length === 1) return selectedOptions[0]?.label ?? '';
  const first = selectedOptions[0]?.label ?? '';
  return `${first} +${selectedOptions.length - 1}`;
}

export function MultiCombobox({
  options,
  values,
  onValuesChange,
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
  maxVisibleItems,
  optionItemHeight = 32,
  formatDisplayValue,
}: MultiComboboxProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const listboxId = `${inputId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearingRef = useRef(false);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [internalValues, setInternalValues] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const resolvedValues = values ?? internalValues;
  const selectedValueSet = useMemo(() => new Set(resolvedValues), [resolvedValues]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValueSet.has(option.value)),
    [options, selectedValueSet]
  );
  const resolvedFilter = filterOptions ?? defaultFilter;
  const filteredOptions = useMemo(
    () => options.filter((option) => resolvedFilter(option, searchValue)),
    [options, resolvedFilter, searchValue]
  );
  const displayValue =
    formatDisplayValue?.(selectedOptions) ?? defaultDisplayValue(selectedOptions);
  const inputDisplayValue = open ? searchValue : displayValue;

  useEffect(() => {
    if (!open) {
      setHighlightedIndex(-1);
      setSearchValue('');
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

  const commitValues = (nextValues: string[]) => {
    if (values === undefined) {
      setInternalValues(nextValues);
    }
    const nextOptions = options.filter((option) => nextValues.includes(option.value));
    onValuesChange?.(nextValues, nextOptions);
  };

  const toggleOption = (option: ComboboxOption) => {
    if (option.disabled) return;
    if (selectedValueSet.has(option.value)) {
      commitValues(resolvedValues.filter((value) => value !== option.value));
      return;
    }
    commitValues([...resolvedValues, option.value]);
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
    }
    setSearchValue(nextValue);
    if (!open) setOpen(true);
    if (highlightedIndex === -1) {
      const nextFilteredOptions = options.filter((option) => resolvedFilter(option, nextValue));
      if (nextFilteredOptions.length > 0) {
        const nextIndex = getNextEnabledIndex(nextFilteredOptions, -1, 1);
        setHighlightedIndex(nextIndex);
      }
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
        if (option) toggleOption(option);
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

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) toggleOption(option);
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
    commitValues([]);
    setSearchValue('');
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

  const computedMaxHeight =
    maxVisibleItems && maxVisibleItems > 0
      ? maxVisibleItems * optionItemHeight + 8
      : undefined;

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prevOpen) => !prevOpen);
    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      <PopoverPrimitive.Anchor asChild={true}>
        <div ref={rootRef} className={cn(styles.root, fullWidth && styles.fullWidth, className)}>
          <Input
            ref={inputRef}
            id={inputId}
            value={inputDisplayValue}
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
            className={cn(styles.inputWithTrigger, inputClassName)}
            clearable={clearable}
            clearLabel={clearLabel}
            onClear={handleClear}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            suffix={
              <button
                type="button"
                className={styles.triggerButton}
                aria-label="Open options"
                aria-expanded={open}
                disabled={disabled}
                data-open={open}
                onMouseDown={(event) => event.preventDefault()}
                onClick={toggleOpen}
              >
                <ChevronDown className={styles.triggerIcon} size={14} aria-hidden={true} />
              </button>
            }
          />
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverContent
        className={cn(styles.content, listClassName)}
        align="start"
        sideOffset={6}
        style={computedMaxHeight ? { maxHeight: `${computedMaxHeight}px` } : undefined}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={handleInteractOutside}
      >
        {filteredOptions.length === 0 ? (
          <div className={styles.empty}>{emptyMessage}</div>
        ) : (
          <div
            className={styles.list}
            role="listbox"
            id={listboxId}
            aria-multiselectable={true}
          >
            {filteredOptions.map((option, index) => {
              const isActive = index === highlightedIndex;
              const isSelected = selectedValueSet.has(option.value);
              const currentGroup = option.group?.trim() ?? '';
              const previousGroup =
                index > 0 ? (filteredOptions[index - 1]?.group?.trim() ?? '') : '';
              const showGroupSeparator =
                currentGroup.length > 0 && currentGroup !== previousGroup;

              return (
                <Fragment key={option.value}>
                  {showGroupSeparator && (
                    <div className={styles.groupSeparator} role="separator">
                      <span className={styles.groupLabel}>{currentGroup}</span>
                    </div>
                  )}
                  <button
                    id={`${inputId}-option-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    disabled={option.disabled}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    className={cn(
                      styles.option,
                      isActive && styles.optionActive,
                      isSelected && styles.optionSelected,
                      option.disabled && styles.optionDisabled
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => toggleOption(option)}
                    onKeyDown={handleListKeyDown}
                  >
                    <span className={styles.optionCheck} aria-hidden={true}>
                      {isSelected ? <Check size={13} /> : null}
                    </span>
                    <span className={styles.optionContent}>
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.description && (
                        <span className={styles.optionDescription}>{option.description}</span>
                      )}
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default MultiCombobox;
