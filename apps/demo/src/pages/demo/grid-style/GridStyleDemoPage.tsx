import { useEffect, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronsDown, ChevronsUp, Paintbrush } from 'lucide-react';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { gridStyleDemoPreset } from './GridStyleDemoStyle';

import styles from './GridStyleDemoPage.module.css';

type DemoRow = {
  id: string;
  nodeId: string;
  parentNodeId: string | null;
  level: 1 | 2 | 3 | 4;
  fsIndex: string;
  indexName: string;
  '2022': number;
  '2023': number;
  '2024': number;
  '2025': number;
  '2026': number;
  '2026Plan': number;
  yoy: number;
  planDiff: number;
  yoyRate: number;
};

type TemplateRow = Omit<DemoRow, 'id' | 'nodeId' | 'parentNodeId'>;

const baseTemplates: TemplateRow[] = [
  {
    level: 1,
    fsIndex: 'PL-1000',
    indexName: 'Revenue',
    '2022': 1850000,
    '2023': 2010000,
    '2024': 2195000,
    '2025': 2340000,
    '2026': 2480000,
    '2026Plan': 2550000,
    yoy: 140000,
    planDiff: -70000,
    yoyRate: 6.0,
  },
  {
    level: 2,
    fsIndex: 'PL-1100',
    indexName: 'Product Revenue',
    '2022': 1320000,
    '2023': 1430000,
    '2024': 1570000,
    '2025': 1650000,
    '2026': 1730000,
    '2026Plan': 1760000,
    yoy: 80000,
    planDiff: -30000,
    yoyRate: 4.8,
  },
  {
    level: 2,
    fsIndex: 'PL-1200',
    indexName: 'Service Revenue',
    '2022': 530000,
    '2023': 580000,
    '2024': 625000,
    '2025': 690000,
    '2026': 750000,
    '2026Plan': 790000,
    yoy: 60000,
    planDiff: -40000,
    yoyRate: 8.7,
  },
  {
    level: 1,
    fsIndex: 'PL-2000',
    indexName: 'COGS',
    '2022': -940000,
    '2023': -1000000,
    '2024': -1090000,
    '2025': -1175000,
    '2026': -1260000,
    '2026Plan': -1240000,
    yoy: -85000,
    planDiff: -20000,
    yoyRate: -7.2,
  },
  {
    level: 3,
    fsIndex: 'PL-2110',
    indexName: 'Material Cost',
    '2022': 510000,
    '2023': 545000,
    '2024': 590000,
    '2025': -638000,
    '2026': 672000,
    '2026Plan': -660000,
    yoy: 34000,
    planDiff: 12000,
    yoyRate: -5.3,
  },
  {
    level: 3,
    fsIndex: 'PL-2120',
    indexName: 'Labor Cost',
    '2022': 215000,
    '2023': 226000,
    '2024': -244000,
    '2025': 262000,
    '2026': -291000,
    '2026Plan': -286000,
    yoy: -29000,
    planDiff: -5000,
    yoyRate: 11.1,
  },
  {
    level: 1,
    fsIndex: 'PL-3000',
    indexName: 'OPEX',
    '2022': 410000,
    '2023': -435000,
    '2024': 456000,
    '2025': -478000,
    '2026': 503000,
    '2026Plan': 495000,
    yoy: 25000,
    planDiff: -8000,
    yoyRate: 5.2,
  },
  {
    level: 4,
    fsIndex: 'PL-3111',
    indexName: 'Advertising',
    '2022': -66000,
    '2023': -72000,
    '2024': -76000,
    '2025': -80000,
    '2026': -93000,
    '2026Plan': -88000,
    yoy: -13000,
    planDiff: -5000,
    yoyRate: -16.3,
  },
  {
    level: 1,
    fsIndex: 'PL-9000',
    indexName: 'Operating Profit',
    '2022': 500000,
    '2023': 575000,
    '2024': 649000,
    '2025': 687000,
    '2026': 717000,
    '2026Plan': 815000,
    yoy: 30000,
    planDiff: -98000,
    yoyRate: 4.4,
  },
];

const levelPattern: DemoRow['level'][] = [1, 1, 2, 3, 4, 4, 4, 4, 4, 1, 2, 3, 4, 4];

function buildSeedData(): DemoRow[] {
  const rowsByLevel: Record<DemoRow['level'], TemplateRow[]> = {
    1: baseTemplates.filter((row) => row.level === 1),
    2: baseTemplates.filter((row) => row.level === 2),
    3: baseTemplates.filter((row) => row.level === 3),
    4: baseTemplates.filter((row) => row.level === 4),
  };

  const levelCursor: Record<DemoRow['level'], number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  return Array.from({ length: 5 }).flatMap((_, cycleIndex) => {
    const parentByLevel: Array<string | null> = [null, null, null, null, null];

    return levelPattern.map((level, patternIndex) => {
      const levelRows = rowsByLevel[level];
      const source = levelRows[levelCursor[level] % levelRows.length] ?? baseTemplates[0]!;
      levelCursor[level] += 1;

      const serial = cycleIndex * levelPattern.length + patternIndex + 1;
      const offset = cycleIndex * 9000 + patternIndex * 700;
      const sign = source['2022'] >= 0 ? 1 : -1;
      const drift = sign * offset;
      const keepNegative = serial % 10 === 0;
      const nodeId = `N-${serial}`;
      const parentNodeId = level === 1 ? null : parentByLevel[level - 1];

      parentByLevel[level] = nodeId;
      for (let lv = level + 1; lv <= 4; lv += 1) parentByLevel[lv] = null;

      const y2022 = source['2022'] + drift;
      const y2023 = source['2023'] + drift;
      const y2024 = source['2024'] + drift;
      const y2025 = source['2025'] + drift;
      const y2026 = source['2026'] + drift;
      const y2026Plan = source['2026Plan'] + drift;
      const yoy = source.yoy + Math.round(drift * 0.08);
      const planDiff = source.planDiff - Math.round(drift * 0.05);
      const yoyRate = source.yoyRate;

      return {
        ...source,
        id: String(serial),
        nodeId,
        parentNodeId,
        fsIndex: `${source.fsIndex}-R${cycleIndex + 1}-${patternIndex + 1}`,
        '2022': keepNegative ? y2022 : Math.abs(y2022),
        '2023': keepNegative ? y2023 : Math.abs(y2023),
        '2024': keepNegative ? y2024 : Math.abs(y2024),
        '2025': keepNegative ? y2025 : Math.abs(y2025),
        '2026': keepNegative ? y2026 : Math.abs(y2026),
        '2026Plan': keepNegative ? y2026Plan : Math.abs(y2026Plan),
        yoy: keepNegative ? yoy : Math.abs(yoy),
        planDiff: keepNegative ? planDiff : Math.abs(planDiff),
        yoyRate: keepNegative ? yoyRate : Math.abs(yoyRate),
      };
    });
  });
}

const seedData = buildSeedData();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function GridStyleDemoPage(_props: PageComponentProps) {
  const [data] = useState<DemoRow[]>(seedData);
  const [enableStyleRules, setEnableStyleRules] = useState(true);
  const numberFormatter = useMemo(() => new Intl.NumberFormat('ko-KR'), []);

  const renderByFormat = (format: unknown, value: unknown) => {
    if (typeof value !== 'number' || Number.isNaN(value)) return String(value ?? '');
    const absText = numberFormatter.format(Math.abs(value));
    if (format === 'triangleNumber') return value < 0 ? `△${absText}` : absText;
    if (format === 'number') return numberFormatter.format(value);
    return numberFormatter.format(value);
  };

  const defaultExpandedRowIds = useMemo<Record<string, boolean>>(() => {
    const parentIds = new Set<string>();
    for (const row of data) {
      if (row.parentNodeId) parentIds.add(row.parentNodeId);
    }
    const next: Record<string, boolean> = {};
    for (const parentId of parentIds) next[parentId] = true;
    return next;
  }, [data]);

  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpandedRowIds(defaultExpandedRowIds);
  }, [defaultExpandedRowIds]);

  const columns = useMemo<ColumnDef<DemoRow, any>[]>(
    () => [
      { accessorKey: 'level', header: 'Level', size: 80, meta: { pinned: 'left', align: 'center', mono: true } },
      { accessorKey: 'fsIndex', header: 'Fs Index', size: 120, meta: { pinned: 'left', mono: true } },
      {
        accessorKey: 'indexName',
        header: 'Index Name',
        size: 180,
        meta: { pinned: 'left' },
        cell: ({ row, getValue }) => {
          const level = Math.max(Number(row.original.level ?? 1), 1);
          return <span style={{ paddingLeft: `${level - 1}ch` }}>{String(getValue() ?? '')}</span>;
        },
      },
            {
        id: 'perfPlan',
        header: '실적/계획',
        columns: [
          { accessorKey: '2022', header: '2022', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: '2023', header: '2023', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: '2024', header: '2024', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: '2025', header: '2025', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: '2026', header: '2026', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: '2026Plan', header: '2026계획', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: 'yoy', header: '전년비', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: 'planDiff', header: '계획비', size: 110, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
          { accessorKey: 'yoyRate', header: '전년비(%)', size: 120, meta: { align: 'right', mono: true, format: 'triangleNumber' as any }, cell: ({ column, getValue }) => renderByFormat(column.columnDef.meta?.format, getValue()) },
        ],
      },
    ],
    [numberFormatter]
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Grid Style Demo"
        description="Tree + grouped headers + conditional row/cell style demo"
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
        <span className={styles.hint}>Level row color + account/value conditional style</span>
      </div>

      <div className={styles.gridWrap}>
        <GenGridCrud<DemoRow>
          data={data}
          columns={columns}
          getRowId={(row) => row.nodeId}
          onCommit={async () => ({ ok: true, nextData: data })}
          actionBar={{
            defaultStyle: 'icon',
            includeBuiltIns: ['excel'],
            customActions: [
              {
                key: 'expand-all',
                icon: <ChevronsDown aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 40,
                onClick: () => setExpandedRowIds(defaultExpandedRowIds),
              },
              {
                key: 'collapse-all',
                icon: <ChevronsUp aria-hidden size={16} />,
                side: 'right',
                style: 'icon',
                order: 41,
                onClick: () => setExpandedRowIds({}),
              },
            ],
          }}
          excelExport={{
            mode: 'frontend',
            fileName: 'GridStyleDemo',
            sheetName: 'GridStyleDemo',
            defaultBorder: true,
            rowHeight: 34,
          }}
          gridProps={{
            height: '100%',
            enablePinning: true,
            enableColumnSizing: true,
            enableActiveRowHighlight: true,
            rowHeight: 34,
            overscan: 8,
            tree: {
              enabled: true,
              idKey: 'nodeId',
              parentIdKey: 'parentNodeId',
              treeColumnId: 'indexName',
              expandedRowIds,
              onExpandedRowIdsChange: setExpandedRowIds,
              defaultExpanded: true,
              indentPx: 12,
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
