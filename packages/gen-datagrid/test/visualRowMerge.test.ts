// packages/gen-datagrid/test/visualRowMerge.test.ts
// Verifies visual row merge metadata calculation.

import { describe, expect, it } from 'vitest';

import {
  buildVisibleStartVisualRowMergeDisplayModel,
  buildVisualRowMergeModel,
  getVisualRowMergeState,
  resolveVisualRowMergeOption,
} from '../src/features/visual-row-merge/visualRowMerge';

type RowData = {
  id: string;
  department: string;
  team: string;
};

function createRows(rows: RowData[]) {
  return rows.map((row, index) => ({
    id: row.id,
    index,
    original: row,
    getValue: (columnId: string) => row[columnId as keyof RowData],
  }));
}

describe('visual row merge metadata', () => {
  it('resolves boolean and object visual row merge options', () => {
    expect(resolveVisualRowMergeOption(true)).toEqual({
      enabled: true,
      showContinuationValue: true,
      stickyLabel: true,
    });
    expect(resolveVisualRowMergeOption(false)).toEqual({
      enabled: false,
      showContinuationValue: false,
      stickyLabel: false,
    });
    expect(
      resolveVisualRowMergeOption({
        showContinuationValue: false,
        stickyLabel: true,
      })
    ).toEqual({
      enabled: true,
      showContinuationValue: false,
      stickyLabel: true,
    });
    expect(
      resolveVisualRowMergeOption({
        enabled: false,
        showContinuationValue: true,
        stickyLabel: true,
      })
    ).toEqual({
      enabled: false,
      showContinuationValue: false,
      stickyLabel: false,
    });
  });

  it('calculates single, start, middle, and end states from current row order', () => {
    const model = buildVisualRowMergeModel({
      rows: createRows([
        { id: '1', department: 'Engineering', team: 'A' },
        { id: '2', department: 'Engineering', team: 'B' },
        { id: '3', department: 'Engineering', team: 'C' },
        { id: '4', department: 'Sales', team: 'D' },
        { id: '5', department: 'Sales', team: 'E' },
        { id: '6', department: 'Support', team: 'F' },
      ]),
      columnIds: ['department'],
      isColumnMergeEnabled: (columnId) => columnId === 'department',
    });

    expect(getVisualRowMergeState(model, '1', 'department')).toBe('start');
    expect(getVisualRowMergeState(model, '2', 'department')).toBe('middle');
    expect(getVisualRowMergeState(model, '3', 'department')).toBe('end');
    expect(getVisualRowMergeState(model, '4', 'department')).toBe('start');
    expect(getVisualRowMergeState(model, '5', 'department')).toBe('end');
    expect(getVisualRowMergeState(model, '6', 'department')).toBe('single');
  });

  it('does not calculate disabled columns', () => {
    const model = buildVisualRowMergeModel({
      rows: createRows([
        { id: '1', department: 'Engineering', team: 'A' },
        { id: '2', department: 'Engineering', team: 'A' },
      ]),
      columnIds: ['department', 'team'],
      isColumnMergeEnabled: (columnId) => columnId === 'department',
    });

    expect(getVisualRowMergeState(model, '1', 'department')).toBe('start');
    expect(getVisualRowMergeState(model, '1', 'team')).toBe('single');
  });

  it('excludes system columns even when the caller marks them enabled', () => {
    const model = buildVisualRowMergeModel({
      rows: createRows([
        { id: '1', department: 'Engineering', team: 'A' },
        { id: '2', department: 'Engineering', team: 'A' },
      ]),
      columnIds: ['__gen_row_number', 'department'],
      isColumnMergeEnabled: () => true,
    });

    expect(getVisualRowMergeState(model, '1', '__gen_row_number')).toBe('single');
    expect(getVisualRowMergeState(model, '1', 'department')).toBe('start');
  });

  it('uses Object.is so repeated nullish and special numeric values are stable', () => {
    const rows = [
      { id: '1', index: 0, original: {}, getValue: () => Number.NaN },
      { id: '2', index: 1, original: {}, getValue: () => Number.NaN },
      { id: '3', index: 2, original: {}, getValue: () => 0 },
      { id: '4', index: 3, original: {}, getValue: () => -0 },
    ];

    const model = buildVisualRowMergeModel({
      rows,
      columnIds: ['value'],
      isColumnMergeEnabled: () => true,
    });

    expect(getVisualRowMergeState(model, '1', 'value')).toBe('start');
    expect(getVisualRowMergeState(model, '2', 'value')).toBe('end');
    expect(getVisualRowMergeState(model, '3', 'value')).toBe('single');
    expect(getVisualRowMergeState(model, '4', 'value')).toBe('single');
  });

  it('marks the first visible continuation row as visible-start', () => {
    const rows = createRows([
      { id: '1', department: 'Engineering', team: 'A' },
      { id: '2', department: 'Engineering', team: 'B' },
      { id: '3', department: 'Engineering', team: 'C' },
      { id: '4', department: 'Sales', team: 'D' },
    ]);
    const model = buildVisualRowMergeModel({
      rows,
      columnIds: ['department'],
      isColumnMergeEnabled: () => true,
    });

    expect(
      buildVisibleStartVisualRowMergeDisplayModel({
        rows,
        columnIds: ['department'],
        mergeModel: model,
        visibleRowStartIndex: 1,
      })
    ).toEqual({
      '2::department': 'visible-start',
    });
  });

  it('does not add visible-start when the first visible row is a real start or single cell', () => {
    const rows = createRows([
      { id: '1', department: 'Engineering', team: 'A' },
      { id: '2', department: 'Engineering', team: 'B' },
      { id: '3', department: 'Sales', team: 'C' },
    ]);
    const model = buildVisualRowMergeModel({
      rows,
      columnIds: ['department'],
      isColumnMergeEnabled: () => true,
    });

    expect(
      buildVisibleStartVisualRowMergeDisplayModel({
        rows,
        columnIds: ['department'],
        mergeModel: model,
        visibleRowStartIndex: 0,
      })
    ).toEqual({});
    expect(
      buildVisibleStartVisualRowMergeDisplayModel({
        rows,
        columnIds: ['department'],
        mergeModel: model,
        visibleRowStartIndex: 2,
      })
    ).toEqual({});
  });
});
