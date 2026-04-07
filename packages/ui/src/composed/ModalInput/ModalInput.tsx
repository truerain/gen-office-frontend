import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@gen-office/utils';
import { Button } from '../../core/Button';
import { Input } from '../../core/Input';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../core/Dialog';
import { X } from 'lucide-react';
import type {
  ModalInputListColumn,
  ModalInputProps,
  ModalInputSelection,
} from './ModalInput.types';
import styles from './ModalInput.module.css';

function localFilter<TData>(
  list: ModalInputSelection<TData>[],
  keyword: string
) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return list;
  return list.filter((item) => {
    const haystack = [
      item.label,
      item.value,
      item.description ?? '',
      ...(item.keywords ?? []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function ModalInput<TData = unknown>({
  value,
  displayValue,
  selection,
  onValueChange,
  onDisplayValueChange,
  onSelectionChange,
  onCommitValue,
  items = [],
  fetchItems,
  searchOnInputChange = false,
  title = 'Select item',
  modalDescription,
  placeholder,
  searchPlaceholder = 'Search...',
  disabled,
  readOnly = true,
  openOnInputFocus = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  triggerAriaLabel = 'Open search modal',
  triggerIcon,
  label,
  helperText,
  error,
  required,
  fullWidth,
  clearable = true,
  clearLabel = 'Clear',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  emptyMessage = 'No results found.',
  loadingMessage = 'Loading...',
  confirmOnDoubleClick = true,
  autoFocusSearch = true,
  modalWidth,
  modalHeight = 560,
  listColumns,
  className,
  inputClassName,
  dialogClassName,
  listClassName,
}: ModalInputProps<TData>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalSelection, setInternalSelection] = useState<ModalInputSelection<TData> | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [draftSelection, setDraftSelection] = useState<ModalInputSelection<TData> | null>(null);
  const [remoteItems, setRemoteItems] = useState<ModalInputSelection<TData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const requestSeqRef = useRef(0);
  const skipNextFocusOpenRef = useRef(false);
  const dragStateRef = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const open = openProp ?? internalOpen;
  const resolvedSelection = selection !== undefined ? selection : internalSelection;
  const resolvedValue = String(value ?? resolvedSelection?.value ?? '');
  const resolvedDisplayValue = String(
    resolvedSelection?.label ?? displayValue ?? resolvedValue
  );

  const setOpen = (nextOpen: boolean) => {
    if (openProp === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!open) return;
    setSearchValue(String(displayValue ?? resolvedDisplayValue ?? value ?? '').trim());
    setDraftSelection(resolvedSelection ?? null);
  }, [displayValue, open, resolvedDisplayValue, resolvedSelection, value]);

  useEffect(() => {
    if (!open || !fetchItems) return;
    const requestId = ++requestSeqRef.current;
    setLoading(true);
    fetchItems(searchValue.trim())
      .then((nextItems) => {
        if (requestSeqRef.current !== requestId) return;
        setRemoteItems(Array.isArray(nextItems) ? nextItems : []);
      })
      .finally(() => {
        if (requestSeqRef.current === requestId) {
          setLoading(false);
        }
      });
  }, [fetchItems, open, searchValue]);

  useEffect(() => {
    if (open) return;
    setPosition(null);
    dragStateRef.current = null;
  }, [open]);

  const sourceItems = fetchItems ? remoteItems : items;
  const filteredItems = useMemo(
    () => (fetchItems ? sourceItems : localFilter(sourceItems, searchValue)),
    [fetchItems, searchValue, sourceItems]
  );

  const commitSelection = (nextSelection: ModalInputSelection<TData> | null) => {
    if (selection === undefined) {
      setInternalSelection(nextSelection);
    }
    onSelectionChange?.(nextSelection);
    const nextValue = nextSelection?.value ?? '';
    const nextDisplay = nextSelection?.label ?? '';
    onValueChange?.(nextValue);
    onDisplayValueChange?.(nextDisplay);
    onCommitValue?.(nextValue, nextSelection);
    setOpen(false);
  };

  const clearSelection = () => {
    // Input clear keeps focus on the input. Prevent openOnInputFocus from reopening modal once.
    skipNextFocusOpenRef.current = true;
    if (selection === undefined) {
      setInternalSelection(null);
    }
    onSelectionChange?.(null);
    onValueChange?.('');
    onDisplayValueChange?.('');
    onCommitValue?.('', null);
    setOpen(false);
  };

  const toCssSize = (size: number | string) =>
    typeof size === 'number' ? `${size}px` : size;
  const resolvedModalWidth = modalWidth != null ? toCssSize(modalWidth) : undefined;
  const resolvedModalHeight = toCssSize(modalHeight);
  const hasTableColumns = Array.isArray(listColumns) && listColumns.length > 0;
  const gridTemplateColumns = hasTableColumns
    ? (listColumns as ModalInputListColumn<TData>[])
        .map((column) => column.width ?? 'minmax(0, 1fr)')
        .join(' ')
    : undefined;

  const handleHeaderPointerDown: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.button !== 0) return;

    const target = event.target as HTMLElement;
    if (target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }

    const node = contentRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    dragStateRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    };
    setPosition({ left: rect.left, top: rect.top });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleHeaderPointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    setPosition({
      left: event.clientX - dragState.offsetX,
      top: event.clientY - dragState.offsetY,
    });
  };

  const handleHeaderPointerUp: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragStateRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className={cn(styles.root, fullWidth && styles.fullWidth, className)}>
      <Input
        value={resolvedDisplayValue}
        onChange={(event) => {
          if (readOnly) return;
          const nextValue = event.target.value;
          if (selection === undefined) {
            setInternalSelection(null);
          }
          onSelectionChange?.(null);
          onDisplayValueChange?.(nextValue);
          onValueChange?.(nextValue);
          if (searchOnInputChange && fetchItems) {
            if (!open) setOpen(true);
            setSearchValue(nextValue);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        clearable={clearable}
        clearLabel={clearLabel}
        onClear={clearSelection}
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
          if (!disabled && openOnInputFocus) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          if (!disabled) setOpen(true);
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={contentRef}
          className={cn(styles.dialog, dialogClassName)}
          showClose={false}
          data-gen-grid-editor-overlay="true"
          style={
            {
              ...(resolvedModalWidth
                ? {
                    width: resolvedModalWidth,
                    maxWidth: resolvedModalWidth,
                  }
                : {}),
              ...(position
                ? {
                    left: `${position.left}px`,
                    top: `${position.top}px`,
                    transform: 'none',
                  }
                : {}),
            }
          }
        >
          <DialogHeader
            className={cn(styles.dialogHeader, styles.draggableHeader)}
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
          >
            <div className={styles.headerRow}>
              <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>
              <DialogClose className={styles.dialogCloseButton} aria-label="Close">
                <X size={16} aria-hidden={true} />
              </DialogClose>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className={styles.content} style={{ height: resolvedModalHeight }}>
              {modalDescription ? <div className={styles.itemMeta}>{modalDescription}</div> : null}
              <div className={styles.searchRow}>
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  autoFocus={autoFocusSearch}
                  clearable={true}
                  fullWidth={true}
                  autoSelect={false}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.preventDefault();
                      event.stopPropagation();
                      setOpen(false);
                    }
                    if (event.key === 'Enter' && filteredItems.length === 1) {
                      event.preventDefault();
                      const only = filteredItems[0];
                      if (!only.disabled) commitSelection(only);
                    }
                  }}
                />
              </div>

              <div className={cn(styles.listWrap, listClassName)}>
                {loading ? (
                  <div className={styles.empty}>{loadingMessage}</div>
                ) : filteredItems.length === 0 ? (
                  <div className={styles.empty}>{emptyMessage}</div>
                ) : hasTableColumns ? (
                  <div className={styles.table}>
                    <div
                      className={styles.tableHeader}
                      style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
                    >
                      {(listColumns as ModalInputListColumn<TData>[]).map((column) => (
                        <div
                          key={column.key}
                          className={cn(
                            styles.tableHeaderCell,
                            column.align === 'center' && styles.alignCenter,
                            column.align === 'right' && styles.alignRight
                          )}
                        >
                          {column.header}
                        </div>
                      ))}
                    </div>
                    <div className={styles.tableBody}>
                      {filteredItems.map((item) => {
                        const selected = draftSelection?.value === item.value;
                        return (
                          <button
                            key={`${item.value}:${item.label}`}
                            type="button"
                            className={styles.tableRow}
                            data-selected={selected ? 'true' : 'false'}
                            style={gridTemplateColumns ? { gridTemplateColumns } : undefined}
                            disabled={item.disabled}
                            onClick={() => setDraftSelection(item)}
                            onDoubleClick={() => {
                              if (!confirmOnDoubleClick) return;
                              commitSelection(item);
                            }}
                          >
                            {(listColumns as ModalInputListColumn<TData>[]).map((column) => (
                              <span
                                key={`${item.value}:${column.key}`}
                                className={cn(
                                  styles.tableCell,
                                  column.align === 'center' && styles.alignCenter,
                                  column.align === 'right' && styles.alignRight
                                )}
                              >
                                {column.render(item)}
                              </span>
                            ))}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={styles.list}>
                    {filteredItems.map((item) => {
                      const selected = draftSelection?.value === item.value;
                      return (
                        <button
                          key={`${item.value}:${item.label}`}
                          type="button"
                          className={styles.item}
                          data-selected={selected ? 'true' : 'false'}
                          disabled={item.disabled}
                          onClick={() => setDraftSelection(item)}
                          onDoubleClick={() => {
                            if (!confirmOnDoubleClick) return;
                            commitSelection(item);
                          }}
                        >
                          <span className={styles.itemTitle}>{item.label}</span>
                          <span className={styles.itemMeta}>
                            {item.description ?? item.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className={styles.footer}>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => commitSelection(draftSelection)}
                disabled={!draftSelection}
              >
                {confirmLabel}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ModalInput;
