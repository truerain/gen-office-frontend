import type { GridStylePreset } from '@/shared/style/gridStylePresets';
import { defaultGridStylePreset } from '@/shared/style/gridStylePresets';

const numberColumns = new Set([
  '2022',
  '2023',
  '2024',
  '2025',
  '2026',
  '2026Plan',
  'yoy',
  'planDiff',
  'yoyRate',
]);

const levelRowBackgroundMap: Record<number, string> = {
  1: 'rgb(252, 228, 214)',
  2: 'rgb(224, 242, 254)',
  3: 'rgb(236, 253, 245)',
  4: '#ffffff',
};

export const gridStyleDemoPreset: GridStylePreset = {
  getRowStyle: (args) => {
    const baseStyle = defaultGridStylePreset.getRowStyle?.(args);
    const level = Number(args.row.level ?? 4);

    return {
      ...(baseStyle ?? {}),
      backgroundColor: levelRowBackgroundMap[level] ?? levelRowBackgroundMap[4],
    };
  },
  getCellStyle: (args) => {
    const baseStyle = defaultGridStylePreset.getCellStyle?.(args);
    const value = args.value;

    if (numberColumns.has(args.columnId) && typeof value === 'number') {
      if (value < 0) {
        return {
          ...(baseStyle ?? {}),
          color: '#b42318',
          //backgroundColor: '#fef3f2',
          borderBottom: '1px solid #fecdca',
        };
      }
      if (value > 1_000_000 && args.columnId !== 'yoyRate') {
        return {
          ...(baseStyle ?? {}),
          // color: '#1849a9',
          //backgroundColor: '#eff8ff',
        };
      }
    }

    if (args.columnId === 'yoyRate' && typeof value === 'number' && value < 0) {
      return {
        ...(baseStyle ?? {}),
        color: '#b42318',
        //backgroundColor: '#fff1f3',
      };
    }

    return baseStyle;
  },
};
