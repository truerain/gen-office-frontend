import type { ColumnDef } from '@tanstack/react-table';
import type { GenGridColumnMeta } from '../components/layout/utils';

type ColumnOpts<TData> = {
  id?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  editable?: boolean;
  meta?: GenGridColumnMeta;
  cell?: ColumnDef<TData, any>['cell'];
};

function baseColumn<TData>(
  key: string,
  header: string,
  opts?: ColumnOpts<TData>
): ColumnDef<TData, any> {
  return {
    id: opts?.id ?? key,
    header,
    accessorKey: key,
    size: opts?.width,
    cell: opts?.cell,
    meta: {
      align: opts?.align,
      editable: opts?.editable,
      ...(opts?.meta ?? {}),
    } as any,
  };
}

export function textColumn<TData>(
  key: keyof TData & string,
  header: string,
  opts?: ColumnOpts<TData>
): ColumnDef<TData, any> {
  return baseColumn<TData>(key, header, {
    ...opts,
    meta: { editType: 'text', ...(opts?.meta ?? {}) },
  });
}

export function numberColumn<TData>(
  key: keyof TData & string,
  header: string,
  opts?: ColumnOpts<TData>
): ColumnDef<TData, any> {
  return baseColumn<TData>(key, header, {
    ...opts,
    meta: { format: 'number', editType: 'number', ...(opts?.meta ?? {}) },
  });
}

export function currencyColumn<TData>(
  key: keyof TData & string,
  header: string,
  opts?: ColumnOpts<TData> & { currency?: string }
): ColumnDef<TData, any> {
  return baseColumn<TData>(key, header, {
    ...opts,
    meta: { format: 'currency', currency: opts?.currency, ...(opts?.meta ?? {}) },
  });
}

export function dateColumn<TData>(
  key: keyof TData & string,
  header: string,
  opts?: ColumnOpts<TData>
): ColumnDef<TData, any> {
  return baseColumn<TData>(key, header, {
    ...opts,
    meta: { format: 'date', editType: 'date', ...(opts?.meta ?? {}) },
  });
}

export function selectColumn<TData>(
  key: keyof TData & string,
  header: string,
  opts: ColumnOpts<TData> & { options: { label: string; value: string | number }[] }
): ColumnDef<TData, any> {
  return baseColumn<TData>(key, header, {
    ...opts,
    meta: { editType: 'select', editOptions: opts.options, ...(opts?.meta ?? {}) },
  });
}
