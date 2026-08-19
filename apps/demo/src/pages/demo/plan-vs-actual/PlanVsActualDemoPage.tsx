// apps/demo/src/pages/demo/plan-vs-actual/PlanVsActualDemoPage.tsx
// Demo: one account row with stacked actual/plan month cells.

import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ClipboardList } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import { PlanMonthEditor, PlanMonthStack } from './PlanMonthStack';
import {
  MONTH_KEYS,
  actualField,
  applyGridRowsToAccounts,
  applyPlanRate,
  buildGridRows,
  createSeedAccounts,
  isDualEditMonth,
  isMonthAmountPair,
  isPlanField,
  monthHeader,
  monthKeyFromPlanField,
  planField,
  recomputeTotals,
  sumPlanVsActual,
  type PlanVsActualAccount,
  type PlanVsActualGridRow,
} from './planVsActualModel';

import styles from './PlanVsActualDemoPage.module.css';

function footerRows(table: { getFilteredRowModel: () => { rows: Array<{ original: PlanVsActualGridRow }> } }) {
  return table.getFilteredRowModel().rows.map((row) => row.original);
}

function columnDefId(column: ColumnDef<PlanVsActualGridRow, any>) {
  if (column.id) return column.id;
  if ('accessorKey' in column && column.accessorKey != null) return String(column.accessorKey);
  return '';
}

function createColumns(): ColumnDef<PlanVsActualGridRow, any>[] {
  return [
    {
      accessorKey: 'acctCd',
      header: '계정코드',
      size: 110,
      footer: () => <span className={styles.footerLabel}>합계</span>,
      meta: { pinned: 'left', align: 'center' },
    },
    {
      accessorKey: 'acctName',
      header: '계정명',
      size: 160,
      meta: { pinned: 'left' },
    },
    {
      id: 'total',
      header: '합계',
      size: 160,
      cell: ({ row }) => (
        <PlanMonthStack actual={row.original.actualTotal} plan={row.original.planTotal} />
      ),
      footer: ({ table }) => {
        const { actual, plan } = sumPlanVsActual(footerRows(table), 'actualTotal', 'planTotal');
        return <PlanMonthStack actual={actual} plan={plan} />;
      },
      meta: {
        pinned: 'left',
        align: 'right',
        mono: true,
        exportValue: ({ row }: { row: PlanVsActualGridRow }) => row.planTotal,
      },
    },
    ...MONTH_KEYS.map((key): ColumnDef<PlanVsActualGridRow, number> => {
      const planKey = planField(key);
      const actualKey = actualField(key);
      const canEditActual = isDualEditMonth(key);
      return {
        id: planKey,
        accessorKey: planKey,
        header: monthHeader(key),
        size: 150,
        cell: ({ row }) => (
          <PlanMonthStack actual={row.original[actualKey]} plan={row.original[planKey]} />
        ),
        footer: ({ table }) => {
          const { actual, plan } = sumPlanVsActual(footerRows(table), actualKey, planKey);
          return <PlanMonthStack actual={actual} plan={plan} />;
        },
        meta: {
          align: 'right',
          mono: true,
          editable: true,
          editType: canEditActual ? undefined : 'number',
          renderEditor: (editor) => (
            <PlanMonthEditor
              value={editor.value}
              row={editor.row as PlanVsActualGridRow}
              columnId={editor.columnId}
              canEditActual={canEditActual}
              onChange={editor.onChange}
              commitValue={editor.commitValue}
              onCancel={editor.onCancel}
              onTab={editor.onTab}
            />
          ),
          exportValue: ({ row }) => (row as PlanVsActualGridRow)[planKey],
        },
      };
    }),
    {
      id: 'status',
      accessorKey: 'status',
      header: '상태',
      size: 120,
      meta: { align: 'left' },
    },
    {
      id: 'reason',
      accessorKey: 'reason',
      header: '사유',
      size: 220,
      meta: {
        align: 'left',
        editable: true,
        editType: 'textarea',
        cellClassName: styles.reasonCell,
      },
    },
  ];
}

export default function PlanVsActualDemoPage(_props: PageComponentProps) {
  const [accounts, setAccounts] = useState<PlanVsActualAccount[]>(() => createSeedAccounts());
  const columns = createColumns();
  const columnOrderKey = columns.map(columnDefId).join('|');
  const gridRows = useMemo(() => buildGridRows(accounts), [accounts]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="사업계획 입력 Demo"
        description="1행 2줄: 위=실적, 아래=계획+비율. 1~9월은 계획만, 10~12월은 실적과 계획을 함께 수정합니다."
        breadcrumbItems={[
          { label: 'UI Demo', icon: <ClipboardList size={16} /> },
          { label: '사업계획 입력 Demo', icon: <ClipboardList size={16} /> },
        ]}
      />

      <div className={styles.toolbar}>
        <span className={styles.hint}>
          1~9월은 계획만 수정합니다. 10~12월은 실적·계획을 같이 수정하고 Tab으로 칸 안에서 이동합니다.
        </span>
      </div>

      <div className={styles.grid}>
        <GenGridCrud<PlanVsActualGridRow>
          key={columnOrderKey}
          data={gridRows}
          columns={columns}
          getRowId={(row) => row.acctCd}
          makePatch={({ columnId, value }) => {
            if (isPlanField(columnId) && isMonthAmountPair(value)) {
              const actualKey = actualField(monthKeyFromPlanField(columnId));
              return {
                [columnId]: value.plan,
                [actualKey]: value.actual,
              } as Partial<PlanVsActualGridRow>;
            }
            return { [columnId]: value } as Partial<PlanVsActualGridRow>;
          }}
          onCellEdit={({ row, columnId, nextValue }) => {
            if (!isPlanField(columnId)) return [];
            const actualKey = actualField(monthKeyFromPlanField(columnId));
            const plan = isMonthAmountPair(nextValue) ? nextValue.plan : Number(nextValue) || 0;
            const actual = isMonthAmountPair(nextValue) ? nextValue.actual : row[actualKey];
            const nextRow = { ...row, [columnId]: plan, [actualKey]: actual };
            return [
              {
                rowId: row.acctCd,
                patch: {
                  [actualKey]: actual,
                  ...recomputeTotals(nextRow),
                },
              },
            ];
          }}
          onCommit={async ({ ctx }) => {
            const nextAccounts = applyGridRowsToAccounts(accounts, ctx.viewData);
            setAccounts(nextAccounts);
            return { ok: true, nextData: buildGridRows(nextAccounts) };
          }}
          actionBar={{
            enabled: true,
            position: 'top',
            defaultStyle: 'icon',
            includeBuiltIns: ['excel', 'save'],
            customActions: [
              {
                key: 'fill-105',
                style: 'text',
                side: 'left',
                order: 20,
                label: '실적 × 105%로 계획 채우기',
                onClick: () => setAccounts((prev) => applyPlanRate(prev, 1.05)),
              },
            ],
          }}
          excelExport={{
            mode: 'frontend',
            fileName: 'PlanVsActualDemo',
            sheetName: 'PlanVsActual',
            defaultBorder: true,
            rowHeight: 34,
          }}
          gridProps={{
            height: '100%',
            dataVersion: accounts.map((row) => row.acctCd).join(','),
            enableVirtualization: true,
            enablePinning: true,
            enableColumnSizing: true,
            enableRowStatus: true,
            checkboxSelection: true,
            enableFooterRow: true,
            enableStickyFooterRow: true,
            //enableActiveRowHighlight: true,
            rowHeight: 64,
          }}
        />
      </div>
    </div>
  );
}
