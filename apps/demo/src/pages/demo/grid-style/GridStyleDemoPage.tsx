import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Paintbrush } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { gridStyleDemoPreset } from './GridStyleDemoStyle';

import styles from './GridStyleDemoPage.module.css';

type DemoRow = {
  id: string;
  team: string;
  status: 'ACTIVE' | 'INACTIVE' | 'RISK';
  owner: string;
  amount: number;
  score: number;
  dueDate: string;
};

const seedData: DemoRow[] = [
  { id: '1', team: 'Platform', status: 'ACTIVE', owner: 'Jin Park', amount: 12000, score: 91, dueDate: '2026-03-12' },
  { id: '2', team: 'Platform', status: 'RISK', owner: 'Sora Kim', amount: -1500, score: 58, dueDate: '2026-03-08' },
  { id: '3', team: 'Frontend', status: 'ACTIVE', owner: 'Ari Cho', amount: 9800, score: 84, dueDate: '2026-03-20' },
  { id: '4', team: 'Frontend', status: 'INACTIVE', owner: 'Noah Seo', amount: 0, score: 40, dueDate: '2026-03-01' },
  { id: '5', team: 'Sales', status: 'RISK', owner: 'Mina Yoo', amount: -820, score: 62, dueDate: '2026-03-05' },
  { id: '6', team: 'Sales', status: 'ACTIVE', owner: 'Ryan Choi', amount: 14000, score: 88, dueDate: '2026-03-16' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GridStyleDemoPage(_props: PageComponentProps) {
  const [data] = useState<DemoRow[]>(seedData);
  const [enableStyleRules, setEnableStyleRules] = useState(true);

  const columns = useMemo<ColumnDef<DemoRow, any>[]>(
    () => [
      { accessorKey: 'team', header: 'Team', size: 130, meta: { pinned: 'left' } },
      { accessorKey: 'status', header: 'Status', size: 110 },
      { accessorKey: 'owner', header: 'Owner', size: 150 },
      { accessorKey: 'amount', header: 'Amount', size: 120, meta: { align: 'right', mono: true } },
      { accessorKey: 'score', header: 'Score', size: 100, meta: { align: 'right', mono: true } },
      { accessorKey: 'dueDate', header: 'Due Date', size: 130, meta: { format: 'date' } },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Grid Style Demo"
        description="Row/Cell 조건부 color, background, border 스타일 데모"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <Paintbrush size={16} /> },
          { label: 'Grid Style Demo', icon: <Paintbrush size={16} /> },
        ]}
      />

      <div className={styles.toolbar}>
        <button
          type="button"
          className={enableStyleRules ? styles.activeBtn : styles.btn}
          onClick={() => setEnableStyleRules((v) => !v)}
        >
          {enableStyleRules ? 'Style Rules ON' : 'Style Rules OFF'}
        </button>
        <span className={styles.hint}>RISK/INACTIVE row, 음수 amount, low score 셀을 조건 스타일로 표시</span>
      </div>

      <div className={styles.gridWrap}>
        <GenGridCrud<DemoRow>
          data={data}
          columns={columns}
          title="GridStyleDemo"
          getRowId={(row) => row.id}
          onCommit={async () => ({ ok: true, nextData: data })}
          actionBar={{
            includeBuiltIns: ['excel'],
          }}
          excelExport={{
            mode: 'frontend',
            fileName: 'GridStyleDemo',
            sheetName: 'GridStyleDemo',
          }}
          gridProps={{
            enablePinning: true,
            enableColumnSizing: true,
            enableActiveRowHighlight: true,
            rowHeight: 34,
            overscan: 8,
            getRowClassName: ({ row }) => {
              if (!enableStyleRules) return undefined;
              if (row.status === 'INACTIVE') return styles.rowDisabled;
              if (row.status === 'RISK') return styles.rowWarning;
              return undefined;
            },
            getRowStyle: ({ row, rowIndex }) => {
              if (!enableStyleRules) return undefined;
              return gridStyleDemoPreset.getRowStyle?.({
                row: row as Record<string, unknown>,
                rowId: row.id,
                rowIndex,
              });
            },
            getCellStyle: ({ columnId, value, row, rowIndex }) => {
              if (!enableStyleRules) return undefined;
              return gridStyleDemoPreset.getCellStyle?.({
                row: row as Record<string, unknown>,
                rowId: row.id,
                rowIndex,
                columnId,
                value,
              });
            },
          }}
        />
      </div>
    </div>
  );
}
