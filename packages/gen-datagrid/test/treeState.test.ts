// packages/gen-datagrid/test/treeState.test.ts
// Verifies public tree expansion state helper behavior.

import { describe, expect, it } from 'vitest';

import {
  collectTreeExpandedRows,
  collapseTreeExpandedRowsFromDepth,
} from '../src/features/tree/treeState';

type TreeRow = {
  id: string;
  children?: TreeRow[];
};

const rows: TreeRow[] = [
  {
    id: '1',
    children: [
      {
        id: '1-1',
        children: [{ id: '1-1-1' }],
      },
      { id: '1-2' },
    ],
  },
  {
    id: '2',
    children: [{ id: '2-1' }],
  },
];

const accessors = {
  getRowId: (row: TreeRow) => row.id,
  getSubRows: (row: TreeRow) => row.children,
};

describe('treeState helpers', () => {
  it('collects all expandable row ids when no depth limit is provided', () => {
    expect(collectTreeExpandedRows({ rows, ...accessors })).toEqual({
      '1': true,
      '1-1': true,
      '2': true,
    });
  });

  it('collects expansion state up to a visible depth', () => {
    expect(
      collectTreeExpandedRows({
        rows,
        ...accessors,
        maxVisibleDepth: 2,
      })
    ).toEqual({
      '1': true,
      '2': true,
    });
  });

  it('can limit root branches for sample expansion', () => {
    expect(
      collectTreeExpandedRows({
        rows,
        ...accessors,
        maxRootCount: 1,
      })
    ).toEqual({
      '1': true,
      '1-1': true,
    });
  });

  it('collapses expansion state from a visible depth', () => {
    expect(
      collapseTreeExpandedRowsFromDepth({
        expandedRows: { '1': true, '1-1': true, '2': true },
        rows,
        ...accessors,
        collapseFromDepth: 2,
      })
    ).toEqual({
      '1': true,
      '2': true,
    });
  });
});