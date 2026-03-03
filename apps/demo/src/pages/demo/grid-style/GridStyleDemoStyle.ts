import type { GridStylePreset } from '@/shared/style/gridStylePresets';
import { defaultGridStylePreset } from '@/shared/style/gridStylePresets';

export const gridStyleDemoPreset: GridStylePreset = {
  getRowStyle: (args) => {
    const baseStyle = defaultGridStylePreset.getRowStyle?.(args);
    const status = String(args.row.status ?? '');
    if (status === 'INACTIVE') {
      return {
        ...(baseStyle ?? {}),
        backgroundColor: '#f8fafc',
        color: '#98a2b3',
      };
    }
    if (status === 'ACTIVE') {
      return {
        ...(baseStyle ?? {}),
        backgroundColor: '#f0fdf4',
      };
    }
    if (status === 'RISK') {
      return {
        ...(baseStyle ?? {}),
        backgroundColor: '#fff7ed',
        borderBottom: '1px solid #fed7aa',
      };
    }
    return baseStyle;
  },
  getCellStyle: (args) => {
    const baseStyle = defaultGridStylePreset.getCellStyle?.(args);

    if (args.columnId === 'score' && typeof args.value === 'number' && args.value < 70) {
      return {
        ...(baseStyle ?? {}),
        color: '#7a2e0b',
        backgroundColor: '#fffbeb',
        borderBottom: '1px solid #fed7aa',
      };
    }
    if (args.columnId === 'dueDate' && String(args.row.status ?? '') === 'RISK') {
      return {
        ...(baseStyle ?? {}),
        borderBottom: '1px dashed #f59e0b',
      };
    }
    return baseStyle;
  },
};
