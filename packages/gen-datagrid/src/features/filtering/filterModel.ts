// packages/gen-datagrid/src/features/filtering/filterModel.ts
// Defines the current string filter contract and reserves structured values for advanced filters.

export type GenDataGridFilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'empty'
  | 'notEmpty';

export type GenDataGridFilterJoin = 'and' | 'or';

export type GenDataGridFilterCondition = {
  operator: GenDataGridFilterOperator;
  value?: unknown;
  valueTo?: unknown;
};

export type GenDataGridColumnFilterValue =
  | string
  | {
      join?: GenDataGridFilterJoin;
      conditions: GenDataGridFilterCondition[];
    };

export function normalizeColumnFilterInput(value: string) {
  return value.trim() === '' ? undefined : value;
}

export function getColumnFilterInputValue(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (isStructuredColumnFilterValue(value)) {
    const first = value.conditions[0];
    return first?.value == null ? '' : String(first.value);
  }
  return String(value);
}

export function isColumnFilterActive(value: unknown) {
  if (value == null || value === '') return false;
  if (!isStructuredColumnFilterValue(value)) return true;
  return value.conditions.some((condition) => {
    if (condition.operator === 'empty' || condition.operator === 'notEmpty') return true;
    return condition.value != null && String(condition.value) !== '';
  });
}

export function isStructuredColumnFilterValue(
  value: unknown
): value is Exclude<GenDataGridColumnFilterValue, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { conditions?: unknown }).conditions)
  );
}
