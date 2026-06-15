// packages/gen-datagrid/test/columnReorder.test.ts
// Verifies column reorder normalization for pinned zones.

import { describe, expect, it } from 'vitest';

import {
  getColumnPinningZone,
  reorderColumnOrder,
  reorderColumnPinning,
} from '../src/features/reorder/columnReorder';

describe('reorderColumnOrder', () => {
  it('moves columns inside the same pinning zone', () => {
    expect(
      reorderColumnOrder({
        columnOrder: ['name', 'age', 'city'],
        columnPinning: { left: ['name', 'age'] },
        movingColumnId: 'age',
        targetColumnId: 'name',
      })
    ).toEqual(['age', 'name', 'city']);
  });

  it('blocks moves across pinning zones', () => {
    const columnOrder = ['name', 'age', 'city'];

    expect(
      reorderColumnOrder({
        columnOrder,
        columnPinning: { left: ['name'], right: ['city'] },
        movingColumnId: 'name',
        targetColumnId: 'age',
      })
    ).toBe(columnOrder);
  });

  it('moves column pinning order inside the same pinned zone', () => {
    expect(
      reorderColumnPinning({
        columnPinning: { left: ['name', 'age'], right: ['city'] },
        movingColumnId: 'age',
        targetColumnId: 'name',
      })
    ).toEqual({ left: ['age', 'name'], right: ['city'] });
  });

  it('keeps pinning state when moving a center column', () => {
    const columnPinning = { left: ['name'], right: ['city'] };

    expect(
      reorderColumnPinning({
        columnPinning,
        movingColumnId: 'age',
        targetColumnId: 'role',
      })
    ).toBe(columnPinning);
  });

  it('resolves column pinning zones', () => {
    const columnPinning = { left: ['name'], right: ['city'] };

    expect(getColumnPinningZone('name', columnPinning)).toBe('left');
    expect(getColumnPinningZone('city', columnPinning)).toBe('right');
    expect(getColumnPinningZone('age', columnPinning)).toBe('center');
  });
});
