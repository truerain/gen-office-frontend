// packages/gen-datagrid/src/features/editing/editPolicy.ts
// Resolves grid-level and column-level edit policy into one runtime shape.

import type {
  GenDataGridEditContinuationTriggers,
  GenDataGridEditPolicy,
  GenDataGridEditStartTriggers,
} from '../../GenDataGrid.types';

export type ResolvedGenDataGridEditStartTriggers = Required<GenDataGridEditStartTriggers>;

export type ResolvedGenDataGridEditContinuationTriggers =
  Required<GenDataGridEditContinuationTriggers>;

export type ResolvedGenDataGridEditPolicy = {
  startTriggers: ResolvedGenDataGridEditStartTriggers;
  continueTriggers: ResolvedGenDataGridEditContinuationTriggers;
  openOnEditStart: boolean;
};

export const defaultEditPolicy: ResolvedGenDataGridEditPolicy = {
  startTriggers: {
    reclick: true,
    doubleClick: true,
    enter: true,
    f2: true,
    printableKey: true,
  },
  continueTriggers: {
    click: false,
    tab: true,
    arrowKey: false,
  },
  openOnEditStart: false,
};

export function resolveEditPolicy(
  gridPolicy?: GenDataGridEditPolicy,
  columnPolicy?: GenDataGridEditPolicy
): ResolvedGenDataGridEditPolicy {
  return {
    startTriggers: {
      ...defaultEditPolicy.startTriggers,
      ...gridPolicy?.startTriggers,
      ...columnPolicy?.startTriggers,
    },
    continueTriggers: {
      ...defaultEditPolicy.continueTriggers,
      ...gridPolicy?.continueTriggers,
      ...columnPolicy?.continueTriggers,
    },
    openOnEditStart:
      columnPolicy?.openOnEditStart ??
      gridPolicy?.openOnEditStart ??
      defaultEditPolicy.openOnEditStart,
  };
}
