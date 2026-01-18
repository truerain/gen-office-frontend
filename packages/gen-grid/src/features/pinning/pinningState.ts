// packages/datagrid/src/gen-grid/features/pinning/pinningState.ts

import type { ColumnDef, ColumnPinningState } from '@tanstack/react-table';

export function getLeafColumnDefs<TData>(
  cols: ColumnDef<TData, any>[]
): ColumnDef<TData, any>[] {
  const out: ColumnDef<TData, any>[] = [];
  const walk = (arr: ColumnDef<TData, any>[]) => {
    for (const c of arr) {
      const anyC: any = c as any;
      if (anyC.columns && Array.isArray(anyC.columns)) walk(anyC.columns);
      else out.push(c);
    }
  };
  walk(cols);
  return out;
}

export function uniqKeepOrder(ids: string[]) {
  const s = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!id) continue;
    if (s.has(id)) continue;
    s.add(id);
    out.push(id);
  }
  return out;
}

export function getPinnedIdsFromMeta<TData>(leafDefs: ColumnDef<TData, any>[]) {
  const left = leafDefs
    .filter((c: any) => c?.meta?.pinned === 'left')
    .map((c: any) => (c.id ?? c.accessorKey) as string);

  const right = leafDefs
    .filter((c: any) => c?.meta?.pinned === 'right')
    .map((c: any) => (c.id ?? c.accessorKey) as string);

  return { left: uniqKeepOrder(left), right: uniqKeepOrder(right) };
}

export function buildInitialPinningState(args: {
  systemLeft?: string[];
  systemRight?: string[];
  userLeft?: string[];
  userRight?: string[];
}): ColumnPinningState {
  const left = uniqKeepOrder([...(args.systemLeft ?? []), ...(args.userLeft ?? [])]);
  const right = uniqKeepOrder([...(args.systemRight ?? []), ...(args.userRight ?? [])]);
  return { left, right };
}
