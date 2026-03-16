import type { ColumnDef } from '@tanstack/react-table';
import type {
  GenGridFieldValidationMeta,
  GenGridFieldValidatorContext,
  GenGridValidationError,
  GenGridValidationRule,
  GenGridValidationTrigger,
} from '@gen-office/gen-grid';
import type { CrudRowId, PendingIndex } from '../crud/types';

export type FieldErrorMap = Record<string, GenGridValidationError>;

type ValidationColumn<TData> = {
  columnId: string;
  accessorKey?: string;
  accessorFn?: (row: TData, index: number) => unknown;
  validation: GenGridFieldValidationMeta<TData>;
};

type ValidatePendingRowsArgs<TData> = {
  trigger: GenGridValidationTrigger;
  columns: readonly ColumnDef<TData, any>[];
  pending: PendingIndex<TData>;
  viewData: readonly TData[];
  getRowId: (row: TData, index: number) => string | number;
  includeAllRulesOnCommit?: boolean;
};

type ValidateCellArgs<TData> = {
  trigger: GenGridValidationTrigger;
  columns: readonly ColumnDef<TData, any>[];
  row: TData;
  rowId: string | number;
  rowIndex: number;
  columnId: string;
  value: unknown;
  viewData: readonly TData[];
  isCreate: boolean;
  isUpdate: boolean;
  includeAllRulesOnCommit?: boolean;
};

const PHONE_REGEX = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

function getColumnId<TData>(column: ColumnDef<TData, any>): string {
  const col = column as any;
  if (typeof col.id === 'string' && col.id) return col.id;
  if (typeof col.accessorKey === 'string' && col.accessorKey) return col.accessorKey;
  return '';
}

function getValueByAccessorKey(row: unknown, accessorKey: string): unknown {
  if (!accessorKey.includes('.')) return (row as any)?.[accessorKey];
  const tokens = accessorKey.split('.');
  let current: any = row;
  for (const token of tokens) {
    if (current == null) return undefined;
    current = current[token];
  }
  return current;
}

function normalizeValue(value: unknown, trim = false): unknown {
  if (!trim || typeof value !== 'string') return value;
  return value.trim();
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function toNumber(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function defaultError(
  code: string,
  defaultMessage: string,
  messageKey?: string
): GenGridValidationError {
  return { code, defaultMessage, messageKey };
}

function passesOneOf(value: unknown, allowed: readonly (string | number | boolean)[]): boolean {
  if (allowed.some((item) => Object.is(item, value))) return true;
  if (value == null) return false;
  const target = String(value);
  return allowed.some((item) => String(item) === target);
}

function shouldRunRule(
  validation: GenGridFieldValidationMeta<any>,
  trigger: GenGridValidationTrigger,
  includeAllRulesOnCommit: boolean
): boolean {
  if (trigger === 'commit' && includeAllRulesOnCommit) return true;
  const targets = validation.validateOn;
  if (!targets) return trigger === 'commit';
  const arr = Array.isArray(targets) ? targets : [targets];
  if (trigger === 'change') {
    return arr.includes('change') || arr.includes('blur');
  }
  return arr.includes(trigger);
}

async function runRule<TData>(
  rule: GenGridValidationRule<TData>,
  ctx: GenGridFieldValidatorContext<TData>
): Promise<GenGridValidationError | null> {
  const normalizedStr = String(ctx.value ?? '');

  switch (rule.type) {
    case 'required':
      if (isEmptyValue(ctx.value)) {
        return defaultError('REQUIRED', 'This field is required.', 'common.validation.required');
      }
      return null;
    case 'minLength':
      if (isEmptyValue(ctx.value)) return null;
      if (normalizedStr.length < rule.value) {
        return defaultError(
          'MIN_LENGTH',
          `Minimum length is ${rule.value}.`,
          'common.validation.min_length'
        );
      }
      return null;
    case 'maxLength':
    case 'size':
      if (normalizedStr.length > rule.value) {
        return defaultError(
          'MAX_LENGTH',
          `Maximum length is ${rule.value}.`,
          'common.validation.max_length'
        );
      }
      return null;
    case 'min': {
      const n = toNumber(ctx.value);
      if (n == null) return null;
      if (n < rule.value) {
        return defaultError('MIN', `Minimum value is ${rule.value}.`, 'common.validation.min');
      }
      return null;
    }
    case 'max': {
      const n = toNumber(ctx.value);
      if (n == null) return null;
      if (n > rule.value) {
        return defaultError('MAX', `Maximum value is ${rule.value}.`, 'common.validation.max');
      }
      return null;
    }
    case 'pattern':
      if (!normalizedStr) return null;
      if (!rule.value.test(normalizedStr)) {
        return defaultError('PATTERN', 'Invalid format.', 'common.validation.invalid_format');
      }
      return null;
    case 'oneOf':
      if (isEmptyValue(ctx.value)) return null;
      if (!passesOneOf(ctx.value, rule.value)) {
        return defaultError('ONE_OF', 'Value is not allowed.', 'common.validation.one_of');
      }
      return null;
    case 'numeric': {
      if (isEmptyValue(ctx.value)) return null;
      const n = toNumber(ctx.value);
      if (n == null) {
        return defaultError('NUMERIC', 'Only numeric values are allowed.', 'common.validation.numeric');
      }
      return null;
    }
    case 'alphanumeric':
      if (!normalizedStr) return null;
      if (!ALPHANUMERIC_REGEX.test(normalizedStr)) {
        return defaultError(
          'ALPHANUMERIC',
          'Only alphanumeric characters are allowed.',
          'common.validation.alphanumeric'
        );
      }
      return null;
    case 'email':
      if (!normalizedStr) return null;
      if (!EMAIL_REGEX.test(normalizedStr)) {
        return defaultError('EMAIL', 'Invalid email format.', 'common.validation.email');
      }
      return null;
    case 'phone':
      if (!normalizedStr) return null;
      if (!PHONE_REGEX.test(normalizedStr)) {
        return defaultError('PHONE', 'Invalid phone format.', 'common.validation.phone');
      }
      return null;
    case 'url':
      if (!normalizedStr) return null;
      try {
        new URL(normalizedStr);
        return null;
      } catch {
        return defaultError('URL', 'Invalid URL format.', 'common.validation.url');
      }
    case 'custom':
      return (await rule.validate(ctx)) ?? null;
    default:
      return null;
  }
}

function collectValidationColumns<TData>(
  columns: readonly ColumnDef<TData, any>[]
): Map<string, ValidationColumn<TData>> {
  const out = new Map<string, ValidationColumn<TData>>();
  const walk = (defs: readonly ColumnDef<TData, any>[]) => {
    for (const def of defs as any[]) {
      const children = def.columns as readonly ColumnDef<TData, any>[] | undefined;
      if (Array.isArray(children) && children.length > 0) {
        walk(children);
        continue;
      }
      const columnId = getColumnId(def);
      const validation = def.meta?.validation as GenGridFieldValidationMeta<TData> | undefined;
      if (!columnId || !validation?.rules?.length) continue;
      out.set(columnId, {
        columnId,
        accessorKey: typeof def.accessorKey === 'string' ? def.accessorKey : undefined,
        accessorFn: typeof def.accessorFn === 'function' ? def.accessorFn : undefined,
        validation,
      });
    }
  };
  walk(columns);
  return out;
}

function toFieldErrorKey(rowId: string | number, columnId: string): string {
  return `${String(rowId)}::${columnId}`;
}

function resolveValue<TData>(
  row: TData,
  rowIndex: number,
  columnId: string,
  accessorKey?: string,
  accessorFn?: (row: TData, index: number) => unknown,
  fallbackValue?: unknown
): unknown {
  if (fallbackValue !== undefined) return fallbackValue;
  if (accessorKey) return getValueByAccessorKey(row, accessorKey);
  if (accessorFn) return accessorFn(row, rowIndex);
  return (row as any)?.[columnId];
}

export async function validateCellValue<TData>(
  args: ValidateCellArgs<TData>
): Promise<GenGridValidationError | null> {
  const {
    trigger,
    columns,
    row,
    rowId,
    rowIndex,
    columnId,
    value,
    viewData,
    isCreate,
    isUpdate,
    includeAllRulesOnCommit = true,
  } = args;
  const validationColumns = collectValidationColumns(columns);
  const target = validationColumns.get(columnId);
  if (!target?.validation?.rules?.length) return null;
  if (!shouldRunRule(target.validation, trigger, includeAllRulesOnCommit)) return null;

  const normalizedValue = normalizeValue(value, Boolean(target.validation.trim));
  const ctx: GenGridFieldValidatorContext<TData> = {
    value: normalizedValue,
    row,
    rowId: String(rowId),
    columnId,
    isCreate,
    isUpdate,
    viewData,
  };

  for (const rule of target.validation.rules) {
    const err = await runRule(rule, ctx);
    if (err) return err;
  }
  return null;
}

export async function validatePendingRows<TData>(
  args: ValidatePendingRowsArgs<TData>
): Promise<FieldErrorMap> {
  const {
    trigger,
    columns,
    pending,
    viewData,
    getRowId,
    includeAllRulesOnCommit = true,
  } = args;
  const errors: FieldErrorMap = {};
  const validationColumns = collectValidationColumns(columns);
  if (validationColumns.size === 0) return errors;

  const viewRowById = new Map<string, { row: TData; rowIndex: number }>();
  for (let i = 0; i < viewData.length; i++) {
    const row = viewData[i]!;
    viewRowById.set(String(getRowId(row, i)), { row, rowIndex: i });
  }

  const touchedRowIds = new Map<string, CrudRowId>();
  for (const id of pending.created.keys()) touchedRowIds.set(String(id), id);
  for (const id of pending.updated.keys()) touchedRowIds.set(String(id), id);

  for (const [rowIdText, sourceRowId] of touchedRowIds.entries()) {
    const createdRow = pending.created.get(sourceRowId);
    const viewRow = viewRowById.get(rowIdText);
    const row = (createdRow ?? viewRow?.row) as TData | undefined;
    if (!row) continue;
    const rowIndex = viewRow?.rowIndex ?? -1;
    const isCreate = pending.created.has(sourceRowId);
    const isUpdate = pending.updated.has(sourceRowId);
    const patch = pending.updated.get(sourceRowId);
    const patchKeys = new Set(Object.keys((patch ?? {}) as Record<string, unknown>));

    for (const [columnId, def] of validationColumns.entries()) {
      if (!def.validation.rules.length) continue;
      if (!shouldRunRule(def.validation, trigger, includeAllRulesOnCommit)) continue;
      if (!isCreate && patchKeys.size > 0 && !patchKeys.has(columnId)) continue;

      const value = resolveValue(row, rowIndex, columnId, def.accessorKey, def.accessorFn);
      const normalizedValue = normalizeValue(value, Boolean(def.validation.trim));
      const ctx: GenGridFieldValidatorContext<TData> = {
        value: normalizedValue,
        row,
        rowId: rowIdText,
        columnId,
        isCreate,
        isUpdate,
        viewData,
      };

      for (const rule of def.validation.rules) {
        const err = await runRule(rule, ctx);
        if (!err) continue;
        errors[toFieldErrorKey(rowIdText, columnId)] = err;
        break;
      }
    }
  }

  return errors;
}

export function mergeFieldErrorMaps(...maps: FieldErrorMap[]): FieldErrorMap {
  const out: FieldErrorMap = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) out[key] = value;
  }
  return out;
}

export function buildFieldErrorKey(rowId: string | number, columnId: string): string {
  return toFieldErrorKey(rowId, columnId);
}
