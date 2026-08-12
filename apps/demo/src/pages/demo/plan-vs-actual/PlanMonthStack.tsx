// apps/demo/src/pages/demo/plan-vs-actual/PlanMonthStack.tsx
// Stacked actual/plan cell and month editor (plan-only or actual+plan).

import { useRef, useState, type KeyboardEvent } from 'react';

import {
  computeRatio,
  type PlanVsActualGridRow,
} from './planVsActualModel';

import styles from './PlanVsActualDemoPage.module.css';

const amountFormatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 });
const ratioFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatAmount(value: number) {
  return amountFormatter.format(Number(value) || 0);
}

export function formatRatio(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '';
  return ratioFormatter.format(value);
}

function ratioClassName(value: number | null) {
  if (value == null || !Number.isFinite(value)) return styles.ratio;
  if (value > 1) return `${styles.ratio} ${styles.ratioOver}`;
  return `${styles.ratio} ${styles.ratioUnder}`;
}

export function parseAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = String(value ?? '').replace(/,/g, '').trim();
  if (!text) return 0;
  const next = Number(text);
  return Number.isFinite(next) ? next : 0;
}

export function PlanMonthStack(props: { actual: number; plan: number }) {
  const ratio = computeRatio(props.plan, props.actual);
  return (
    <div className={styles.stack}>
      <div className={styles.actualAmount}>{formatAmount(props.actual)}</div>
      <div className={styles.ratioSlot} aria-hidden="true" />
      <div className={styles.planAmount}>{formatAmount(props.plan)}</div>
      <div className={ratioClassName(ratio)}>{formatRatio(ratio)}</div>
    </div>
  );
}

type PlanMonthEditorProps = {
  value: unknown;
  row: PlanVsActualGridRow;
  columnId: string;
  canEditActual?: boolean;
  onChange: (nextValue: unknown) => void;
  commitValue: (nextValue: unknown) => void;
  onCancel: () => void;
  onTab?: (dir: 1 | -1) => void;
};

export function PlanMonthEditor({
  value,
  row,
  columnId,
  canEditActual = false,
  onChange,
  commitValue,
  onCancel,
  onTab,
}: PlanMonthEditorProps) {
  const actualFieldName = columnId.replace(/^plan/, 'actual') as keyof PlanVsActualGridRow;
  const initialActual = Number(row[actualFieldName]) || 0;
  const [actualText, setActualText] = useState(String(initialActual));
  const [planText, setPlanText] = useState(value == null ? '' : String(value));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const actualInputRef = useRef<HTMLInputElement | null>(null);
  const planInputRef = useRef<HTMLInputElement | null>(null);

  const actual = canEditActual ? parseAmount(actualText) : initialActual;
  const plan = parseAmount(planText);
  const ratio = computeRatio(plan, actual);

  const commitCurrent = () => {
    if (canEditActual) {
      commitValue({ actual, plan });
      return;
    }
    commitValue(plan);
  };

  const handleEditorKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    slot: 'actual' | 'plan'
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      commitCurrent();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;

    event.preventDefault();
    event.stopPropagation();
    if (canEditActual && slot === 'actual' && !event.shiftKey) {
      planInputRef.current?.focus();
      planInputRef.current?.select();
      return;
    }
    if (canEditActual && slot === 'plan' && event.shiftKey) {
      actualInputRef.current?.focus();
      actualInputRef.current?.select();
      return;
    }
    commitCurrent();
    onTab?.(event.shiftKey ? -1 : 1);
  };

  return (
    <div
      ref={rootRef}
      className={styles.stack}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && rootRef.current?.contains(next)) return;
        commitCurrent();
      }}
    >
      <div className={styles.actualAmount}>
        {canEditActual ? (
          <input
            ref={actualInputRef}
            className={styles.editorInput}
            autoFocus
            inputMode="numeric"
            value={actualText}
            onChange={(event) => setActualText(event.target.value)}
            onKeyDown={(event) => handleEditorKeyDown(event, 'actual')}
          />
        ) : (
          formatAmount(actual)
        )}
      </div>
      <div className={styles.ratioSlot} aria-hidden="true" />
      <div className={styles.planAmount}>
        <input
          ref={planInputRef}
          className={styles.editorInput}
          autoFocus={!canEditActual}
          inputMode="numeric"
          value={planText}
          onChange={(event) => {
            const next = event.target.value;
            setPlanText(next);
            if (!canEditActual) onChange(next);
          }}
          onKeyDown={(event) => handleEditorKeyDown(event, 'plan')}
        />
      </div>
      <div className={ratioClassName(ratio)}>{formatRatio(ratio)}</div>
    </div>
  );
}
