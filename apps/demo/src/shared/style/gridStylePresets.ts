import type * as React from 'react';

export type RowStyleArgs = {
  row: Record<string, unknown>;
  rowId: string;
  rowIndex: number;
};

export type CellStyleArgs = {
  row: Record<string, unknown>;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
};

export type GridStylePreset = {
  getRowStyle?: (args: RowStyleArgs) => React.CSSProperties | undefined;
  getCellStyle?: (args: CellStyleArgs) => React.CSSProperties | undefined;
};

export const defaultGridStylePreset: GridStylePreset = {
  getRowStyle: () => {
    return undefined;
  },
  getCellStyle: ({ value }) => {
    if (typeof value === 'number' && value < 0) {
      return {
        color: '#b42318',
        backgroundColor: '#fef3f2',
        borderBottom: '1px solid #fecdca',
        fontWeight: 600,
      };
    }
    return undefined;
  },
};
