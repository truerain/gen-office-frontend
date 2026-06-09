// packages/gen-datagrid/test/rangeSelection.test.ts
// Verifies range selection and clipboard helper behavior.

import { describe, expect, it } from 'vitest';

import {
  parseClipboardGrid,
  serializeClipboardMatrix,
  toClipboardCell,
} from '../src/features/range-selection/clipboard';
import { resolveRangeSelectionBounds } from '../src/features/range-selection/rangeSelection';

describe('range selection helpers', () => {
  it('resolves normalized range bounds from reversed anchor and focus', () => {
    const bounds = resolveRangeSelectionBounds({
      rowIds: ['r1', 'r2', 'r3'],
      columnIds: ['name', 'age', 'city'],
      selection: {
        anchor: { rowId: 'r3', columnId: 'city' },
        focus: { rowId: 'r1', columnId: 'name' },
      },
    });

    expect(bounds).toEqual({
      rowMin: 0,
      rowMax: 2,
      columnMin: 0,
      columnMax: 2,
      rowIds: ['r1', 'r2', 'r3'],
      columnIds: ['name', 'age', 'city'],
    });
  });

  it('returns null when range coordinates are outside the current model', () => {
    const bounds = resolveRangeSelectionBounds({
      rowIds: ['r1'],
      columnIds: ['name'],
      selection: {
        anchor: { rowId: 'missing', columnId: 'name' },
        focus: { rowId: 'r1', columnId: 'name' },
      },
    });

    expect(bounds).toBeNull();
  });
});

describe('clipboard helpers', () => {
  it('escapes tab, newline, and quote values', () => {
    expect(toClipboardCell('plain')).toBe('plain');
    expect(toClipboardCell('A\tB')).toBe('"A\tB"');
    expect(toClipboardCell('A"B')).toBe('"A""B"');
  });

  it('serializes a matrix as tab-separated text', () => {
    expect(
      serializeClipboardMatrix([
        ['Name', 'Note'],
        ['Ada', 'A\tB'],
      ])
    ).toBe('Name\tNote\nAda\t"A\tB"');
  });

  it('parses tab-separated clipboard text', () => {
    expect(parseClipboardGrid('Ada\t37\nGrace\t41')).toEqual([
      ['Ada', '37'],
      ['Grace', '41'],
    ]);
  });

  it('parses quoted csv clipboard text', () => {
    expect(parseClipboardGrid('"Ada, A.",37\n"Grace ""G""",41')).toEqual([
      ['Ada, A.', '37'],
      ['Grace "G"', '41'],
    ]);
  });
});
