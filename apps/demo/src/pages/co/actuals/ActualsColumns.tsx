import type { ColumnDef } from '@tanstack/react-table';
import type { CoActual } from '@/pages/co/actuals/model/types';

const numberFormatter = new Intl.NumberFormat('ko-KR');
const monthKeys = ['m01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11', 'm12'] as const;

export type ActualsViewMode = 'summary' | 'monthly-detail';

function formatAmount(value: unknown) {
  if (typeof value !== 'number') return '';
  return numberFormatter.format(value);
}

function createMonthlyColumn(monthKey: (typeof monthKeys)[number], index: number): ColumnDef<CoActual> {
  return {
    id: monthKey,
    header: `${index + 1}월`,
    accessorKey: monthKey,
    size: 120,
    cell: ({ getValue }) => formatAmount(getValue()),
    meta: { align: 'right' },
  };
}

export const createActualsColumns = (viewMode: ActualsViewMode = 'summary'): ColumnDef<CoActual>[] => [
  {
    id: 'acctCd',
    header: '계정코드',
    accessorKey: 'acctCd',
    size: 120,
    meta: { align: 'center', pinned: 'left' },
  },
  {
    id: 'acctName',
    header: '계정명',
    accessorKey: 'acctName',
    size: 220,
    meta: { pinned: 'left' },
  },
  {
    id: 'prevActAmt',
    header: '전년',
    accessorKey: 'prevActAmt',
    size: 150,
    cell: ({ getValue }) => formatAmount(getValue()),
    meta: { align: 'right' },
  },
  {
    id: 'planAmt',
    header: '계획',
    accessorKey: 'planAmt',
    size: 150,
    cell: ({ getValue }) => formatAmount(getValue()),
    meta: { align: 'right' },
  },
  ...(viewMode === 'monthly-detail'
    ? [
        {
          id: 'currGroup',
          header: '당기',
          columns: [
            {
              id: 'currActAmt',
              header: '합계',
              accessorKey: 'currActAmt',
              size: 150,
              cell: ({ getValue }) => formatAmount(getValue()),
              meta: { align: 'right' },
            },
            ...monthKeys.map((monthKey, index) => createMonthlyColumn(monthKey, index)),
          ],
        } satisfies ColumnDef<CoActual>,
      ]
    : [
        {
          id: 'currActAmt',
          header: '당기',
          accessorKey: 'currActAmt',
          size: 150,
          cell: ({ getValue }) => formatAmount(getValue()),
          meta: { align: 'right' },
        } satisfies ColumnDef<CoActual>,
      ]),
];
