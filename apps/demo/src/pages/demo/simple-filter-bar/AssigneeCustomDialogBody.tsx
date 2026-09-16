// apps/demo/src/pages/demo/simple-filter-bar/AssigneeCustomDialogBody.tsx
// GenGrid-based assignee picker body for CustomModalInput demo (single/multi).

import { useMemo, useState } from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { GenGrid } from '@gen-office/gen-grid';
import { Input } from '@gen-office/ui';

import styles from './AssigneeCustomDialogBody.module.css';

export type EmployeeRow = {
  id: string;
  name: string;
  dept: string;
  email: string;
};

type AssigneeCustomDialogBodyBaseProps = {
  rows: EmployeeRow[];
};

export type AssigneeCustomDialogBodySingleProps = AssigneeCustomDialogBodyBaseProps & {
  mode?: 'single';
  value: string;
  onChange: (next: string) => void;
  confirm: (next?: string) => void;
};

export type AssigneeCustomDialogBodyMultiProps = AssigneeCustomDialogBodyBaseProps & {
  mode: 'multi';
  value: string[];
  onChange: (next: string[]) => void;
  confirm: (next?: string[]) => void;
};

export type AssigneeCustomDialogBodyProps =
  | AssigneeCustomDialogBodySingleProps
  | AssigneeCustomDialogBodyMultiProps;

function toRowSelection(ids: string[]): RowSelectionState {
  return Object.fromEntries(ids.map((id) => [id, true]));
}

function selectedIdsFromState(next: RowSelectionState): string[] {
  return Object.keys(next).filter((id) => next[id]);
}

function includesIgnoreCase(text: string, keyword: string) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;
  return text.toLowerCase().includes(normalized);
}

export function AssigneeCustomDialogBody(props: AssigneeCustomDialogBodyProps) {
  const { rows } = props;
  const isMulti = props.mode === 'multi';
  const [nameFilter, setNameFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const columns = useMemo<ColumnDef<EmployeeRow>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        accessorKey: 'id',
        size: 100,
        meta: { mono: true, align: 'center' },
      },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        size: 180,
      },
      {
        id: 'dept',
        header: 'Department',
        accessorKey: 'dept',
        size: 140,
      },
      {
        id: 'email',
        header: 'Email',
        accessorKey: 'email',
        size: 240,
      },
    ],
    []
  );

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          includesIgnoreCase(row.name, nameFilter) && includesIgnoreCase(row.dept, deptFilter)
      ),
    [deptFilter, nameFilter, rows]
  );

  const selectedIds = isMulti ? props.value : props.value ? [props.value] : [];
  const selectionKey = selectedIds.join('|');
  const rowSelection = useMemo(() => toRowSelection(selectedIds), [selectionKey]);

  return (
    <div className={styles.root}>
      <p className={styles.hint}>
        {isMulti
          ? 'Multi select: toggle checkboxes, then Confirm. Double-click confirms current selection.'
          : 'Single select: click a checkbox, or double-click a row to confirm.'}
      </p>
      <div className={styles.filters}>
        <Input
          value={nameFilter}
          onChange={(event) => setNameFilter(event.target.value)}
          placeholder="Filter by Name"
          clearable={true}
          fullWidth={true}
          aria-label="Filter by Name"
        />
        <Input
          value={deptFilter}
          onChange={(event) => setDeptFilter(event.target.value)}
          placeholder="Filter by Department"
          clearable={true}
          fullWidth={true}
          aria-label="Filter by Department"
        />
      </div>
      <div className={styles.grid}>
        <GenGrid<EmployeeRow>
          data={filteredRows}
          onDataChange={() => {
            // Read-only picker: selection only, no cell edits.
          }}
          columns={columns}
          getRowId={(row) => row.id}
          checkboxSelection={true}
          rowSelection={rowSelection}
          onRowSelectionChange={(next) => {
            const ids = selectedIdsFromState(next);
            if (isMulti) {
              // Keep selections that are currently hidden by filters.
              const visibleIdSet = new Set(filteredRows.map((row) => row.id));
              const hiddenSelected = selectedIds.filter((id) => !visibleIdSet.has(id));
              const nextVisible = ids.filter((id) => visibleIdSet.has(id));
              props.onChange([...hiddenSelected, ...nextVisible]);
              return;
            }
            if (ids.length === 0) {
              props.onChange('');
              return;
            }
            // Keep single selection: prefer newly toggled id over the previous value.
            const nextId =
              ids.find((id) => id !== props.value) ?? ids[ids.length - 1] ?? '';
            props.onChange(nextId);
          }}
          onRowDoubleClick={({ rowId }) => {
            if (isMulti) {
              const nextIds = selectedIds.includes(rowId)
                ? selectedIds
                : [...selectedIds, rowId];
              props.confirm(nextIds);
              return;
            }
            props.confirm(rowId);
          }}
          enableColumnSizing={true}
          enableVirtualization={true}
          enableActiveRowHighlight={true}
          editOnActiveCell={false}
          rowHeight={34}
          height="100%"
          noRowsMessage="No employees"
        />
      </div>
    </div>
  );
}
