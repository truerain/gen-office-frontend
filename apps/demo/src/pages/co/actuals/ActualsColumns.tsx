import type { ColumnDef } from '@tanstack/react-table';
import type { CoActual } from '@/pages/co/actuals/model/types';

const numberFormatter = new Intl.NumberFormat('ko-KR');

function formatAmount(value: unknown) {
  if (typeof value !== 'number') return '';
  return numberFormatter.format(value);
}

export const createActualsColumns = (): ColumnDef<CoActual>[] => [
  /*
  {
    id: 'fiscalYr',
    header: '회계연도',
    accessorKey: 'fiscalYr',
    size: 100,
    meta: { align: 'center', pinned: 'left' },
  },
  {
    id: 'fiscalPrd',
    header: '회계기간',
    accessorKey: 'fiscalPrd',
    size: 100,
    meta: { align: 'center', pinned: 'left' },
  },
  {
    id: 'orgCd',
    header: '조직',
    accessorKey: 'orgCd',
    size: 110,
    meta: { align: 'center', pinned: 'left' },
  },
  */
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
    id: 'currActAmt',
    header: '당기',
    accessorKey: 'currActAmt',
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
];
