import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@gen-office/utils';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Popover, PopoverContent } from '../../core/Popover';
import { Input } from '../../core/Input';
import type {
  TreeComboboxId,
  TreeComboboxOption,
  TreeComboboxProps,
} from './TreeCombobox.types';
import styles from './TreeCombobox.module.css';

type TreeData = {
  rootKeys: string[];
  nodesByKey: Map<string, TreeComboboxOption>;
  parentByKey: Map<string, string | null>;
  childrenByKey: Map<string, string[]>;
};

type VisibleNode = {
  key: string;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  parentKey: string | null;
  node: TreeComboboxOption;
};

const defaultFilter = (option: TreeComboboxOption, inputValue: string) => {
  const query = inputValue.trim().toLowerCase();
  if (!query) return true;
  return option.label.toLowerCase().includes(query);
};

const keyOf = (id: TreeComboboxId) => String(id);

function buildTree(options: TreeComboboxOption[]): TreeData {
  const nodesByKey = new Map<string, TreeComboboxOption>();
  const parentByKey = new Map<string, string | null>();
  const childrenByKey = new Map<string, string[]>();
  const rootKeys: string[] = [];

  for (const option of options) {
    const nodeKey = keyOf(option.id);
    nodesByKey.set(nodeKey, option);
  }

  for (const option of options) {
    const nodeKey = keyOf(option.id);
    const parentKey =
      option.parentId === null || option.parentId === undefined
        ? null
        : keyOf(option.parentId);
    parentByKey.set(nodeKey, parentKey);
  }

  for (const option of options) {
    const nodeKey = keyOf(option.id);
    const parentKey = parentByKey.get(nodeKey) ?? null;

    if (!parentKey || !nodesByKey.has(parentKey)) {
      rootKeys.push(nodeKey);
      continue;
    }

    const children = childrenByKey.get(parentKey);
    if (children) children.push(nodeKey);
    else childrenByKey.set(parentKey, [nodeKey]);
  }

  return { rootKeys, nodesByKey, parentByKey, childrenByKey };
}

function findOptionByValue(options: TreeComboboxOption[], value?: string) {
  if (!value) return null;
  return options.find((option) => option.value === value) ?? null;
}

function collectVisibleNodes(
  tree: TreeData,
  expandedSet: Set<string>,
  query: string,
  filter: (option: TreeComboboxOption, inputValue: string) => boolean
) {
  const hasQuery = query.trim().length > 0;
  const includeKeys = new Set<string>();

  if (hasQuery) {
    const addAncestors = (nodeKey: string) => {
      let current = tree.parentByKey.get(nodeKey) ?? null;
      while (current) {
        includeKeys.add(current);
        current = tree.parentByKey.get(current) ?? null;
      }
    };

    const addDescendants = (nodeKey: string) => {
      const children = tree.childrenByKey.get(nodeKey) ?? [];
      for (const childKey of children) {
        includeKeys.add(childKey);
        addDescendants(childKey);
      }
    };

    for (const [nodeKey, node] of tree.nodesByKey) {
      if (!filter(node, query)) continue;
      includeKeys.add(nodeKey);
      addAncestors(nodeKey);
      addDescendants(nodeKey);
    }
  }

  const visibleNodes: VisibleNode[] = [];

  const visit = (nodeKey: string, depth: number) => {
    const node = tree.nodesByKey.get(nodeKey);
    if (!node) return;

    if (hasQuery && !includeKeys.has(nodeKey)) return;

    const children = tree.childrenByKey.get(nodeKey) ?? [];
    const hasChildren = children.length > 0;
    const isExpanded = hasQuery ? true : expandedSet.has(nodeKey);
    const parentKey = tree.parentByKey.get(nodeKey) ?? null;

    visibleNodes.push({
      key: nodeKey,
      depth,
      hasChildren,
      isExpanded,
      parentKey,
      node,
    });

    if (!hasChildren) return;
    if (!hasQuery && !isExpanded) return;

    for (const childKey of children) {
      visit(childKey, depth + 1);
    }
  };

  for (const rootKey of tree.rootKeys) {
    visit(rootKey, 0);
  }

  return visibleNodes;
}

function getNextEnabledKey(
  nodes: VisibleNode[],
  currentKey: string | null,
  direction: 1 | -1
) {
  if (nodes.length === 0) return null;

  let index = nodes.findIndex((node) => node.key === currentKey);
  if (index === -1) index = direction === 1 ? -1 : 0;

  for (let i = 0; i < nodes.length; i += 1) {
    index = (index + direction + nodes.length) % nodes.length;
    if (!nodes[index].node.disabled) return nodes[index].key;
  }

  return null;
}

export function TreeCombobox({
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
  maxVisibleItems,
  optionItemHeight = 32,
  indent = 16,
  expandedIds,
  defaultExpandedIds,
  onExpandedIdsChange,
}: TreeComboboxProps) {
  const generatedId = useId();
  const inputId = providedId ?? generatedId;
  const treeId = `${inputId}-tree`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearingRef = useRef(false);
  const optionRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const [open, setOpen] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [internalInputValue, setInternalInputValue] = useState('');
  const [showAllOnOpen, setShowAllOnOpen] = useState(false);

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(
    () => new Set((defaultExpandedIds ?? []).map((id) => keyOf(id)))
  );

  const isExpandedControlled = expandedIds !== undefined;
  const expandedSet = useMemo(
    () =>
      isExpandedControlled
        ? new Set((expandedIds ?? []).map((id) => keyOf(id)))
        : uncontrolledExpanded,
    [expandedIds, isExpandedControlled, uncontrolledExpanded]
  );

  const tree = useMemo(() => buildTree(options), [options]);
  const resolvedInputValue = inputValue ?? internalInputValue;
  const resolvedFilter = filterOptions ?? defaultFilter;
  const effectiveFilterValue = showAllOnOpen ? '' : resolvedInputValue;

  const visibleNodes = useMemo(
    () =>
      collectVisibleNodes(tree, expandedSet, effectiveFilterValue, resolvedFilter),
    [tree, expandedSet, effectiveFilterValue, resolvedFilter]
  );

  const setInputValue = (nextValue: string) => {
    if (inputValue === undefined) {
      setInternalInputValue(nextValue);
    }
    onInputValueChange?.(nextValue);
  };

  const emitExpandedChange = (nextSet: Set<string>) => {
    if (!isExpandedControlled) {
      setUncontrolledExpanded(new Set(nextSet));
    }

    const nextIds = Array.from(nextSet)
      .map((nodeKey) => tree.nodesByKey.get(nodeKey)?.id)
      .filter((id): id is TreeComboboxId => id !== undefined);

    onExpandedIdsChange?.(nextIds);
  };

  const toggleExpanded = (nodeKey: string) => {
    const next = new Set(expandedSet);
    if (next.has(nodeKey)) next.delete(nodeKey);
    else next.add(nodeKey);
    emitExpandedChange(next);
  };

  const selectNode = (node: TreeComboboxOption) => {
    if (node.disabled) return;
    onValueChange?.(node.value, node);
    setInputValue(node.label);
    setShowAllOnOpen(false);
    setOpen(false);
  };

  const focusNode = (nodeKey: string | null) => {
    if (!nodeKey) return;
    const target = optionRefs.current.get(nodeKey);
    if (target) target.focus();
  };

  const handleInputChange = (nextValue: string) => {
    if (clearingRef.current) {
      clearingRef.current = false;
      setInputValue(nextValue);
      return;
    }

    setShowAllOnOpen(false);
    setInputValue(nextValue);
    if (!open) setOpen(true);
  };

  const handleNavigate = (direction: 1 | -1) => {
    const nextKey = getNextEnabledKey(visibleNodes, highlightedKey, direction);
    setHighlightedKey(nextKey);
    window.setTimeout(() => focusNode(nextKey), 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) setOpen(true);
      handleNavigate(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      handleNavigate(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      if (!open || !highlightedKey || effectiveFilterValue.trim()) return;
      const current = visibleNodes.find((node) => node.key === highlightedKey);
      if (!current || !current.hasChildren) return;
      if (!current.isExpanded) {
        event.preventDefault();
        toggleExpanded(current.key);
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      if (!open || !highlightedKey || effectiveFilterValue.trim()) return;
      const current = visibleNodes.find((node) => node.key === highlightedKey);
      if (!current) return;

      if (current.hasChildren && current.isExpanded) {
        event.preventDefault();
        toggleExpanded(current.key);
        return;
      }

      if (current.parentKey) {
        event.preventDefault();
        setHighlightedKey(current.parentKey);
        window.setTimeout(() => focusNode(current.parentKey), 0);
      }
      return;
    }

    if (event.key === 'Enter') {
      if (!open || !highlightedKey) return;
      event.preventDefault();
      const current = visibleNodes.find((node) => node.key === highlightedKey);
      if (current) selectNode(current.node);
      return;
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setShowAllOnOpen(false);
      setOpen(false);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleNavigate(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleNavigate(-1);
      return;
    }

    if (event.key === 'Enter' && highlightedKey) {
      event.preventDefault();
      const current = visibleNodes.find((node) => node.key === highlightedKey);
      if (current) selectNode(current.node);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setShowAllOnOpen(false);
      setOpen(false);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInteractOutside = (event: Event) => {
    const target = event.target as Node | null;
    if (target && rootRef.current?.contains(target)) {
      event.preventDefault();
      return;
    }
    setShowAllOnOpen(false);
    setOpen(false);
  };

  const handleClear = () => {
    clearingRef.current = true;
    setShowAllOnOpen(false);
    setInputValue('');
    onValueChange?.('', null);
    onClear?.();
  };

  const activeOptionId = highlightedKey
    ? `${inputId}-tree-option-${highlightedKey}`
    : undefined;

  useEffect(() => {
    if (inputValue !== undefined) return;
    const selected = findOptionByValue(options, value);
    if (selected) {
      setInternalInputValue(selected.label);
    }
  }, [value, options, inputValue]);

  useEffect(() => {
    if (!open) {
      setHighlightedKey(null);
      return;
    }

    if (visibleNodes.length === 0) {
      setHighlightedKey(null);
      return;
    }

    const current = highlightedKey
      ? visibleNodes.find((node) => node.key === highlightedKey)
      : null;
    if (current && !current.node.disabled) return;

    setHighlightedKey(getNextEnabledKey(visibleNodes, null, 1));
  }, [open, visibleNodes, highlightedKey]);

  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
    }
  }, [disabled, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (disabled) return;
    if (!nextOpen) setShowAllOnOpen(false);
    setOpen(nextOpen);
  };

  const computedMaxHeight =
    maxVisibleItems && maxVisibleItems > 0
      ? maxVisibleItems * optionItemHeight + 8
      : undefined;

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      setShowAllOnOpen(nextOpen);
      return nextOpen;
    });
    window.setTimeout(() => inputRef.current?.focus(), 0);
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
            className={cn(styles.inputWithTrigger, inputClassName)}
            clearable={clearable}
            clearLabel={clearLabel}
            onClear={handleClear}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={treeId}
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
        {visibleNodes.length === 0 ? (
          <div className={styles.empty}>{emptyMessage}</div>
        ) : (
          <div className={styles.tree} role="tree" id={treeId}>
            {visibleNodes.map((item) => {
              const isActive = item.key === highlightedKey;
              const rowStyle = {
                ['--tree-indent' as any]: `${indent}px`,
                ['--tree-depth' as any]: item.depth,
              } as CSSProperties;
              const optionId = `${inputId}-tree-option-${item.key}`;
              const blockToggle = effectiveFilterValue.trim().length > 0;

              return (
                <div
                  key={item.key}
                  className={styles.row}
                  style={rowStyle}
                >
                  {item.hasChildren ? (
                    <button
                      type="button"
                      className={cn(styles.toggle, blockToggle && styles.toggleDisabled)}
                      aria-label={item.isExpanded ? 'Collapse node' : 'Expand node'}
                      aria-expanded={item.isExpanded}
                      disabled={blockToggle}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleExpanded(item.key);
                      }}
                    >
                      <ChevronRight
                        className={cn(
                          styles.chevron,
                          item.isExpanded && styles.chevronExpanded
                        )}
                      />
                    </button>
                  ) : (
                    <span className={styles.togglePlaceholder} aria-hidden={true} />
                  )}
                  <button
                    id={optionId}
                    type="button"
                    role="treeitem"
                    aria-level={item.depth + 1}
                    aria-expanded={item.hasChildren ? item.isExpanded : undefined}
                    aria-selected={isActive}
                    aria-disabled={item.node.disabled}
                    disabled={item.node.disabled}
                    ref={(node) => {
                      optionRefs.current.set(item.key, node);
                    }}
                    className={cn(
                      styles.option,
                      isActive && styles.optionActive,
                      item.node.disabled && styles.optionDisabled
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectNode(item.node)}
                    onKeyDown={handleListKeyDown}
                  >
                    <span className={styles.optionLabel}>{item.node.label}</span>
                    {item.node.description ? (
                      <span className={styles.optionDescription}>
                        {item.node.description}
                      </span>
                    ) : null}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default TreeCombobox;
