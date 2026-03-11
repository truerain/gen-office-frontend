import * as React from 'react';
import {
  FILTER_OPERATORS,
  normalizeFilterValue,
  sanitizeFilterValue,
  type GenGridFilterCondition,
  type GenGridFilterJoin,
  type GenGridFilterOperator,
  type GenGridFilterValue,
} from './filterModel';
import styles from '../../components/layout/GenGridHeader.module.css';

type FilterCellPopoverProps = {
  header: any;
};

const DEFAULT_CONDITION: GenGridFilterCondition = { op: 'like', value: '' };

type DraftFilterValue = {
  join: GenGridFilterJoin;
  conditions: [GenGridFilterCondition, GenGridFilterCondition];
};

type PopoverPlacement = {
  left: number;
  top: number;
};

function ensureDraft(value: GenGridFilterValue): DraftFilterValue {
  const normalized = normalizeFilterValue(value);
  const first = normalized.conditions?.[0] ?? { ...DEFAULT_CONDITION };
  const second = normalized.conditions?.[1] ?? { ...DEFAULT_CONDITION };
  return {
    join: normalized.join === 'or' ? 'or' : 'and',
    conditions: [first, second],
  };
}

function buildFilterSummary(value: GenGridFilterValue | undefined): string {
  if (!value?.conditions?.length) return '';

  const parts = value.conditions
    .filter((condition): condition is GenGridFilterCondition => Boolean(condition))
    .map((condition) => ({ ...condition, value: condition.value.trim() }))
    .filter((condition) => condition.value.length > 0)
    .map((condition) => `${condition.op} ${condition.value}`);

  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];

  const joinLabel = value.join === 'or' ? ' OR ' : ' AND ';
  return parts.slice(0, 2).join(joinLabel);
}

function computePlacement(rootRect: DOMRect, popoverRect: DOMRect): PopoverPlacement {
  const viewportPadding = 8;
  const viewportLeft = viewportPadding;
  const viewportRight = window.innerWidth - viewportPadding;
  const viewportTop = viewportPadding;
  const viewportBottom = window.innerHeight - viewportPadding;

  // default behavior: left-edge anchored to the cell.
  const baseLeft = rootRect.left;
  const maxLeft = Math.max(viewportLeft, viewportRight - popoverRect.width);
  const left = Math.min(Math.max(baseLeft, viewportLeft), maxLeft);

  const baseTop = rootRect.bottom + 6;
  const maxTop = Math.max(viewportTop, viewportBottom - popoverRect.height);
  const top = Math.min(Math.max(baseTop, viewportTop), maxTop);

  return { left, top };
}

export function FilterCellPopover(props: FilterCellPopoverProps) {
  const { header } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const popoverRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DraftFilterValue>(() =>
    ensureDraft(normalizeFilterValue(header.column.getFilterValue()))
  );
  const [placement, setPlacement] = React.useState<PopoverPlacement>({ left: 0, top: 0 });

  const current = normalizeFilterValue(header.column.getFilterValue());
  const sanitized = sanitizeFilterValue(current);
  const summaryText = buildFilterSummary(sanitized);
  const hasActive = summaryText.length > 0;

  const updatePlacement = React.useCallback(() => {
    const root = rootRef.current;
    const popover = popoverRef.current;
    if (!root || !popover) return;

    const rootRect = root.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    setPlacement(computePlacement(rootRect, popoverRect));
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;

    const raf = requestAnimationFrame(() => {
      updatePlacement();
    });

    const handleResize = () => updatePlacement();
    const handleScroll = () => updatePlacement();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, updatePlacement]);

  React.useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open]);

  const openPanel = React.useCallback(() => {
    setDraft(ensureDraft(normalizeFilterValue(header.column.getFilterValue())));
    setOpen(true);
  }, [header.column]);

  const applyDraft = React.useCallback(() => {
    const next = sanitizeFilterValue({
      join: draft.join,
      conditions: [draft.conditions[0], draft.conditions[1]],
    });
    header.column.setFilterValue(next);
    setOpen(false);
  }, [draft, header.column]);

  const clearDraft = React.useCallback(() => {
    setDraft({ join: 'and', conditions: [DEFAULT_CONDITION, DEFAULT_CONDITION] });
    header.column.setFilterValue(undefined);
    setOpen(false);
  }, [header.column]);

  const setJoin = (next: GenGridFilterJoin) => {
    setDraft((prev) => ({ ...prev, join: next }));
  };

  const setCondition = (index: 0 | 1, patch: Partial<GenGridFilterCondition>) => {
    setDraft((prev) => {
      const nextConditions: [GenGridFilterCondition, GenGridFilterCondition] = [
        { ...prev.conditions[0] },
        { ...prev.conditions[1] },
      ];
      nextConditions[index] = {
        ...nextConditions[index],
        ...patch,
      };
      return {
        ...prev,
        conditions: nextConditions,
      };
    });
  };

  return (
    <div className={styles.filterCellInner} ref={rootRef}>
      <button
        type="button"
        className={[styles.filterTrigger, hasActive ? styles.filterTriggerActive : '']
          .filter(Boolean)
          .join(' ')}
        aria-label={hasActive ? `Filter: ${summaryText}` : 'Filter'}
        aria-haspopup="dialog"
        aria-expanded={open ? 'true' : 'false'}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            openPanel();
          }
        }}
      >
        <span className={styles.filterTriggerContent}>
          {!hasActive ? (
            <svg className={styles.filterTriggerIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" fill="currentColor" />
            </svg>
          ) : null}
          <span>{hasActive ? summaryText : 'Filter'}</span>
        </span>
      </button>

      {open ? (
        <div
          ref={popoverRef}
          className={styles.filterPopover}
          style={{
            position: 'fixed',
            left: placement.left,
            top: placement.top,
          }}
          role="dialog"
          aria-label="Column filter"
        >
          <div className={styles.filterSectionTitle}>Condition 1</div>
          <div className={styles.filterConditionRow}>
            <select
              className={styles.filterOpSelect}
              value={draft.conditions[0].op}
              onChange={(e) => setCondition(0, { op: e.target.value as GenGridFilterOperator })}
            >
              {FILTER_OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              className={styles.filterInput}
              value={draft.conditions[0].value}
              onChange={(e) => setCondition(0, { value: e.target.value })}
              placeholder="Value"
            />
          </div>

          <div className={styles.filterSectionTitle}>Condition 2 (optional)</div>
          <div className={styles.filterConditionRow}>
            <select
              className={styles.filterJoinSelect}
              value={draft.join}
              onChange={(e) => setJoin(e.target.value as GenGridFilterJoin)}
            >
              <option value="and">AND</option>
              <option value="or">OR</option>
            </select>
            <select
              className={styles.filterOpSelect}
              value={draft.conditions[1].op}
              onChange={(e) => setCondition(1, { op: e.target.value as GenGridFilterOperator })}
            >
              {FILTER_OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <input
              className={styles.filterInput}
              value={draft.conditions[1].value}
              onChange={(e) => setCondition(1, { value: e.target.value })}
              placeholder="Value"
            />
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={styles.filterActionBtn} onClick={clearDraft}>
              Clear
            </button>
            <button
              type="button"
              className={[styles.filterActionBtn, styles.filterActionPrimary].join(' ')}
              onClick={applyDraft}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}