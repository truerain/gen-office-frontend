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
  marginRate: number;
  targetMarginRate: number;
  defectRate: number;
  baselineDefectRate: number;
};

type ViewRow = SourceRow & {
  displayAmount: number;
};

const sourceRows: SourceRow[] = [
  {
    id: '1',
    category: 'Revenue',
    accountName: 'Domestic Sales',
    amount: 1250,
    marginRate: 0.262,
    targetMarginRate: 0.24,
    defectRate: 0.011,
    baselineDefectRate: 0.012,
  },
  {
    id: '2',
    category: 'Revenue',
    accountName: 'Export Sales',
    amount: 0,
    marginRate: 0.187,
    targetMarginRate: 0.2,
    defectRate: 0.018,
    baselineDefectRate: 0.014,
  },
  {
    id: '3',
    category: 'COGS',
    accountName: 'Material Cost',
    amount: 880,
    marginRate: 0.143,
    targetMarginRate: 0.15,
    defectRate: 0.021,
    baselineDefectRate: 0.023,
  },
  {
    id: '4',
    category: 'COGS',
    accountName: 'Outsourcing Cost',
    amount: 100,
    marginRate: 0.133,
    targetMarginRate: 0.12,
    defectRate: 0.016,
    baselineDefectRate: 0.017,
  },
  {
    id: '5',
    category: 'OPEX',
    accountName: 'Travel Expense',
    amount: 0,
    marginRate: 0.081,
    targetMarginRate: 0.09,
    defectRate: 0.015,
    baselineDefectRate: 0.018,
  },
  {
    id: '6',
    category: 'OPEX',
    accountName: 'IT Service',
    amount: 340,
    marginRate: 0.209,
    targetMarginRate: 0.19,
    defectRate: 0.012,
    baselineDefectRate: 0.015,
  },
  {
    id: '7',
    category: 'OPEX',
    accountName: 'Education Expense',
    amount: 90,
    marginRate: 0.051,
    targetMarginRate: 0.06,
    defectRate: 0.024,
    baselineDefectRate: 0.021,
  },
  {
    id: '8',
    category: 'Other',
    accountName: 'Adjustment',
    amount: -30,
    marginRate: -0.014,
    targetMarginRate: 0.01,
    defectRate: 0.031,
    baselineDefectRate: 0.028,
  },
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
        size: 130,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'amount',
          amountOptions: { negativeStyle: 'both' },
        },
      },
      {
        accessorKey: 'displayAmount',
        header: `Display Amount (${unitLabelByValue[unit]})`,
        size: 180,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'amount',
          amountOptions: { negativeStyle: 'triangle' },
        },
      },
      {
        accessorKey: 'marginRate',
        header: 'Margin %',
        size: 110,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'percent',
          percentOptions: { mode: 'plain', negativeStyle: 'triangle', negativeColor: true },

          numberFormat: {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          },
        },
      },
      {
        id: 'marginRateDelta',
        accessorFn: (row) => row.marginRate,
        header: 'Margin % vs Target',
        size: 160,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'percent',
          percentOptions: {
            mode: 'delta',
            deltaFrom: 'targetMarginRate',
          },
          numberFormat: {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          },
        },
      },
      {
        id: 'defectRateDelta',
        accessorFn: (row) => row.defectRate,
        header: 'Defect % vs Baseline',
        size: 170,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'percent',
          percentOptions: {
            mode: 'delta',
            deltaFrom: 'baselineDefectRate',
            invertDirection: true,
          },
          numberFormat: {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          },
        },
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
