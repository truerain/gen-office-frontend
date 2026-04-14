import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { SlidersHorizontal } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './CrudActionControlsDemoPage.module.css';

type SourceRow = {
  id: string;
  category: string;
  accountName: string;
  amount: number;
};

type ViewRow = SourceRow & {
  displayAmount: number;
};

const sourceRows: SourceRow[] = [
  { id: '1', category: 'Revenue', accountName: 'Domestic Sales', amount: 1250 },
  { id: '2', category: 'Revenue', accountName: 'Export Sales', amount: 0 },
  { id: '3', category: 'COGS', accountName: 'Material Cost', amount: 880 },
  { id: '4', category: 'COGS', accountName: 'Outsourcing Cost', amount: 100 },
  { id: '5', category: 'OPEX', accountName: 'Travel Expense', amount: 0 },
  { id: '6', category: 'OPEX', accountName: 'IT Service', amount: 340 },
  { id: '7', category: 'OPEX', accountName: 'Education Expense', amount: 90 },
  { id: '8', category: 'Other', accountName: 'Adjustment', amount: -30 },
];

type UnitValue = '1' | '10' | '100';

const unitLabelByValue: Record<UnitValue, string> = {
  '1': '0단위',
  '10': '10단위',
  '100': '100단위',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CrudActionControlsDemoPage(_props: PageComponentProps) {
  const [unit, setUnit] = useState<UnitValue>('1');
  const [excludeZero, setExcludeZero] = useState(false);

  const viewRows = useMemo<ViewRow[]>(() => {
    const divisor = Number(unit);
    return sourceRows
      .filter((row) => (excludeZero ? row.amount !== 0 : true))
      .map((row) => ({
        ...row,
        displayAmount: Math.trunc(row.amount / divisor),
      }));
  }, [excludeZero, unit]);

  const columns = useMemo<ColumnDef<ViewRow, unknown>[]>(
    () => [
      { accessorKey: 'category', header: 'Category', size: 120 },
      { accessorKey: 'accountName', header: 'Account Name', size: 220 },
      {
        accessorKey: 'amount',
        header: 'Raw Amount',
        size: 120,
        meta: { align: 'right', mono: true },
      },
      {
        accessorKey: 'displayAmount',
        header: `Display Amount (${unitLabelByValue[unit]})`,
        size: 160,
        meta: { align: 'right', mono: true },
      },
    ],
    [unit]
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="GenGridCrud Custom Action Controls"
        description="ActionBar custom action style: combo / checkbox"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <SlidersHorizontal size={16} /> },
          { label: 'Custom Action Controls', icon: <SlidersHorizontal size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.summary}>
          <span>단위: {unitLabelByValue[unit]}</span>
          <span>0 데이터 제외: {excludeZero ? 'ON' : 'OFF'}</span>
          <span>현재 행 수: {viewRows.length.toLocaleString()}</span>
        </div>
        <div className={styles.gridWrap}>
          <GenGridCrud<ViewRow>
            title="Actual Amounts"
            readonly
            data={viewRows}
            columns={columns}
            getRowId={(row) => row.id}
            onCommit={async () => ({ ok: true })}
            actionBar={{
              position: 'top',
              defaultStyle: 'icon',
              includeBuiltIns: ['excel'],
              customActions: [
                {
                  key: 'exclude-zero',
                  style: 'checkbox',
                  side: 'right',
                  order: 5,
                  label: '0 데이터 제외',
                  checked: excludeZero,
                  onCheckedChange: setExcludeZero,
                },
                {
                  key: 'unit',
                  style: 'combo',
                  side: 'right',
                  order: 7,
                  label: 'Unit',
                  placeholder: '단위 선택',
                  value: unit,
                  itemStyle: { paddingInlineStart: '1rem' },
                  triggerStyle: { minWidth: '5rem', width: '5rem' },
                  options: [
                    { value: '1', label: '0' },
                    { value: '10', label: '10' },
                    { value: '100', label: '100' },
                  ],
                  onValueChange: (value) => {
                    if (value === '1' || value === '10' || value === '100') {
                      setUnit(value);
                    }
                  },
                },
              ],
            }}
            gridProps={{
              height: '100%',
              rowHeight: 34,
              enablePinning: true,
              enableColumnSizing: true,
              enableVirtualization: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
