import type { FilterFn } from '@tanstack/react-table';

export const FILTER_OPERATORS = ['=', '<>', '<=', '<', '>=', '>', 'like'] as const;
export type GenGridFilterOperator = (typeof FILTER_OPERATORS)[number];
export type GenGridFilterJoin = 'and' | 'or';

export type GenGridFilterCondition = {
  op: GenGridFilterOperator;
  value: string;
};

export type GenGridFilterValue = {
  join?: GenGridFilterJoin;
  conditions?: [GenGridFilterCondition, GenGridFilterCondition?];
};

const DEFAULT_CONDITION: GenGridFilterCondition = { op: 'like', value: '' };

function asString(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function normalizeCondition(input: unknown): GenGridFilterCondition {
  if (!input || typeof input !== 'object') return DEFAULT_CONDITION;
  const candidate = input as Partial<GenGridFilterCondition>;
  const op = FILTER_OPERATORS.includes(candidate.op as GenGridFilterOperator)
    ? (candidate.op as GenGridFilterOperator)
    : 'like';
  return { op, value: asString(candidate.value) };
}

function normalizeLegacyShape(input: unknown): GenGridFilterValue | null {
  if (typeof input === 'string') {
    return {
      join: 'and',
      conditions: [{ op: 'like', value: input }],
    };
  }
  if (!input || typeof input !== 'object') return null;
  const legacy = input as { op?: unknown; value?: unknown };
  if (typeof legacy.op === 'string' || typeof legacy.value !== 'undefined') {
    return {
      join: 'and',
      conditions: [normalizeCondition({ op: legacy.op, value: legacy.value })],
    };
  }
  return null;
}

export function normalizeFilterValue(input: unknown): GenGridFilterValue {
  const legacy = normalizeLegacyShape(input);
  if (legacy) return legacy;

  if (!input || typeof input !== 'object') {
    return { join: 'and', conditions: [{ ...DEFAULT_CONDITION }] };
  }
  const candidate = input as Partial<GenGridFilterValue>;
  const rawConditions = Array.isArray(candidate.conditions) ? candidate.conditions : [];
  const c1 = normalizeCondition(rawConditions[0]);
  const c2 = rawConditions.length > 1 ? normalizeCondition(rawConditions[1]) : undefined;
  return {
    join: candidate.join === 'or' ? 'or' : 'and',
    conditions: c2 ? [c1, c2] : [c1],
  };
}

export function hasActiveFilter(value: GenGridFilterValue): boolean {
  const conditions = value.conditions ?? [];
  return conditions.some((condition) => (condition?.value ?? '').trim().length > 0);
}

export function sanitizeFilterValue(value: GenGridFilterValue): GenGridFilterValue | undefined {
  const normalized = normalizeFilterValue(value);
  const next = (normalized.conditions ?? [])
    .map(normalizeCondition)
    .map((condition) => ({ ...condition, value: condition.value.trim() }))
    .filter((condition) => condition.value.length > 0);

  if (!next.length) return undefined;
  return {
    join: normalized.join === 'or' ? 'or' : 'and',
    conditions: next.length > 1 ? [next[0]!, next[1]!] : [next[0]!],
  };
}

function toComparable(value: unknown): { text: string; numberValue: number | null; dateValue: number | null } {
  const text = asString(value).trim();
  const numeric = Number(text);
  const numberValue = text.length > 0 && Number.isFinite(numeric) ? numeric : null;
  const parsedDate = Date.parse(text);
  const dateValue = text.length > 0 && Number.isFinite(parsedDate) ? parsedDate : null;
  return { text, numberValue, dateValue };
}

function compareCondition(cellValue: unknown, condition: GenGridFilterCondition): boolean {
  const rawNeedle = condition.value.trim();
  if (!rawNeedle.length) return true;

  const cell = toComparable(cellValue);
  const needle = toComparable(rawNeedle);
  const cellText = cell.text.toLowerCase();
  const needleText = needle.text.toLowerCase();

  if (condition.op === 'like') {
    return cellText.includes(needleText);
  }

  if (condition.op === '=' || condition.op === '<>') {
    const equal = cellText === needleText;
    return condition.op === '=' ? equal : !equal;
  }

  if (cell.numberValue != null && needle.numberValue != null) {
    if (condition.op === '<') return cell.numberValue < needle.numberValue;
    if (condition.op === '<=') return cell.numberValue <= needle.numberValue;
    if (condition.op === '>') return cell.numberValue > needle.numberValue;
    return cell.numberValue >= needle.numberValue;
  }

  if (cell.dateValue != null && needle.dateValue != null) {
    if (condition.op === '<') return cell.dateValue < needle.dateValue;
    if (condition.op === '<=') return cell.dateValue <= needle.dateValue;
    if (condition.op === '>') return cell.dateValue > needle.dateValue;
    return cell.dateValue >= needle.dateValue;
  }

  if (condition.op === '<') return cellText < needleText;
  if (condition.op === '<=') return cellText <= needleText;
  if (condition.op === '>') return cellText > needleText;
  return cellText >= needleText;
}

export const genGridOperatorFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  const normalized = normalizeFilterValue(filterValue);
  const active = sanitizeFilterValue(normalized);
  if (!active) return true;

  const conditions = active.conditions ?? [];
  const firstCondition = conditions[0];
  if (!firstCondition) return true;

  const first = compareCondition(row.getValue(columnId), firstCondition);
  const secondCondition = conditions[1];
  if (!secondCondition) return first;

  const second = compareCondition(row.getValue(columnId), secondCondition);
  return active.join === 'or' ? first || second : first && second;
};
