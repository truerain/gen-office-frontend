import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Scale } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './GridDisplayScaleDemoPage.module.css';

type DemoRow = {
  id: string;
  accountName: string;
  currency: 'KRW' | 'USD' | 'JPY';
  amount: number;
};

const rows: DemoRow[] = [
  { id: '1', accountName: 'Domestic Sales', currency: 'KRW', amount: 1_250_000_000 },
  { id: '2', accountName: 'Export Sales', currency: 'USD', amount: 3_420_000 },
  { id: '3', accountName: 'Material Cost', currency: 'KRW', amount: -880_500_000 },
  { id: '4', accountName: 'Tokyo Branch', currency: 'JPY', amount: 125_000_000 },
  { id: '5', accountName: 'Adjustment', currency: 'KRW', amount: -12_500_000 },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GridDisplayScaleDemoPage(_props: PageComponentProps) {
  const columns = useMemo<ColumnDef<DemoRow, unknown>[]>(
    () => [
      { accessorKey: 'accountName', header: 'Account', size: 200 },
      { accessorKey: 'currency', header: 'Currency', size: 90, meta: { align: 'center', mono: true } },
      {
        accessorKey: 'amount',
        header: 'Raw (원)',
        size: 160,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'amount',
          amountOptions: { negativeStyle: 'both', negativeColor: true },
          numberFormat: { maximumFractionDigits: 0 },
        },
      },
      {
        id: 'amountThousand',
        accessorFn: (row) => row.amount,
        header: '천 단위 (고정)',
        size: 140,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'amount',
          amountOptions: { negativeStyle: 'triangle', negativeColor: true },
          displayScale: {
            divisor: 1000,
            unitLabel: '천원',
            tooltip: 'both',
          },
          numberFormat: { maximumFractionDigits: 0 },
        },
      },
      {
        id: 'amountByCurrency',
        accessorFn: (row) => row.amount,
        header: 'Row별 단위 (함수)',
        size: 180,
        meta: {
          align: 'right',
          mono: true,
          semanticType: 'amount',
          amountOptions: { negativeStyle: 'triangle' },
          displayScale: ({ row }) => {
            const currency = (row as DemoRow).currency;
            if (currency === 'KRW') {
              return { divisor: 1_000_000, unitLabel: '백만원', cellUnitLabel: 'M', tooltip: 'both' };
            }
            if (currency === 'USD') {
              return { divisor: 1000, unitLabel: 'K USD', tooltip: 'both' };
            }
            if (currency === 'JPY') {
              return { divisor: 10_000, unitLabel: '만엔', tooltip: 'raw' };
            }
            return undefined;
          },
          numberFormat: { maximumFractionDigits: 1 },
        },
      },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Grid Display Scale Demo"
        description="GenGridCrud + semanticType amount + displayScale (fixed / per-row)"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <Scale size={16} /> },
          { label: 'Display Scale', icon: <Scale size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <p className={styles.hint}>
          GenGridCrud에서 column meta의 displayScale로 셀 표시 단위를 바꿉니다. 마우스를 올리면 원자리 툴팁을
          확인할 수 있고, Excel보내기는 기본적으로 화면과 같은 스케일(display)로 출력합니다. 저장·편집 값은
          원단위(raw)입니다.
        </p>
        <div className={styles.gridWrap}>
          <GenGridCrud<DemoRow>
            title="Amount displayScale"
            readonly
            data={rows}
            columns={columns}
            getRowId={(row) => row.id}
            onCommit={async () => ({ ok: true })}
            actionBar={{
              defaultStyle: 'icon',
              includeBuiltIns: ['excel', 'columnReorder'],
            }}
            excelExport={{
              mode: 'frontend',
              fileName: 'GridDisplayScaleDemo',
              sheetName: 'DisplayScale',
              defaultBorder: true,
              rowHeight: 34,
            }}
            gridProps={{
              height: '100%',
              rowHeight: 36,
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
