import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Table2 } from 'lucide-react';

import { GenGrid } from '@gen-office/gen-grid';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './RowSpanningDemoPage.module.css';

type GridRow = {
  id: string;
  category: '매출액' | '변동비' | '고정비' | '영역이익';
  item: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  may: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  oct: number;
  nov: number;
  dec: number;
};

const CATEGORIES: GridRow['category'][] = ['매출액', '변동비', '고정비', '영역이익'];

const ITEM_BY_CATEGORY: Record<GridRow['category'], string[]> = {
  매출액: ['국내매출', '해외매출', '온라인매출', '오프라인매출', '기타매출'],
  변동비: ['재료비', '포장비', '물류비', '판매수수료', '외주가공비'],
  고정비: ['급여', '임차료', '감가상각비', '복리후생비', '보험료'],
  영역이익: ['국내영역이익', '해외영역이익', '온라인영역이익', '오프라인영역이익', '기타영역이익'],
};

function buildSampleData(rowCount = 100): GridRow[] {
  const rowsPerCategory = Math.floor(rowCount / CATEGORIES.length);
  const result: GridRow[] = [];
  let seq = 1;

  for (const category of CATEGORIES) {
    const items = ITEM_BY_CATEGORY[category];
    for (let i = 0; i < rowsPerCategory; i += 1) {
      const item = `${items[i % items.length]}-${String(Math.floor(i / items.length) + 1).padStart(2, '0')}`;
      const categoryBase = category === '매출액' ? 180000 : category === '영역이익' ? 75000 : 50000;
      const itemDrift = (i + 1) * 1900;
      const s = seq;

      result.push({
        id: String(seq),
        category,
        item,
        jan: categoryBase + itemDrift + s * 120,
        feb: categoryBase + itemDrift + s * 150,
        mar: categoryBase + itemDrift + s * 180,
        apr: categoryBase + itemDrift + s * 210,
        may: categoryBase + itemDrift + s * 240,
        jun: categoryBase + itemDrift + s * 270,
        jul: categoryBase + itemDrift + s * 300,
        aug: categoryBase + itemDrift + s * 330,
        sep: categoryBase + itemDrift + s * 360,
        oct: categoryBase + itemDrift + s * 390,
        nov: categoryBase + itemDrift + s * 420,
        dec: categoryBase + itemDrift + s * 450,
      });
      seq += 1;
    }
  }

  return result;
}

const seedData = buildSampleData(100);

export default function GridRowSpanningPage(_props: PageComponentProps) {
  const [data, setData] = useState<GridRow[]>(seedData);

  const formatter = useMemo(() => new Intl.NumberFormat('ko-KR'), []);
  const asAmount = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? formatter.format(n) : '';
  };

  const columns = useMemo<ColumnDef<GridRow, any>[]>(
    () => [
      {
        accessorKey: 'category',
        header: '구분',
        size: 130,
        meta: {
          pinned: 'left',
          align: 'center',
          mono: true,
          rowSpan: true,
        },
      },
      {
        accessorKey: 'item',
        header: '하위항목',
        size: 220,
        meta: { pinned: 'left' },
      },
      { accessorKey: 'jan', header: '1월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'feb', header: '2월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'mar', header: '3월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'apr', header: '4월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'may', header: '5월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'jun', header: '6월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'jul', header: '7월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'aug', header: '8월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'sep', header: '9월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'oct', header: '10월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'nov', header: '11월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
      { accessorKey: 'dec', header: '12월', size: 100, meta: { align: 'right', mono: true }, cell: ({ getValue }) => asAmount(getValue()) },
    ],
    [formatter]
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Grid Row Spanning Demo"
        description="Row spanning + monthly amount sample (100 rows)"
        breadcrumbItems={[
          { label: 'UI Demo', icon: <Table2 size={16} /> },
          { label: 'Grid Row Spanning Demo', icon: <Table2 size={16} /> },
        ]}
      />

      <div className={styles.toolbar}>
        <div className={styles.groupingLabel}>샘플 데이터</div>
        <span className={styles.hint}>구분(매출액/변동비/고정비/영역이익) row merge + 하위항목 + 월별 금액</span>
      </div>

      <div className={styles.grid}>
        <GenGrid<GridRow>
          data={data}
          onDataChange={setData}
          dataVersion={data.length}
          columns={columns}
          getRowId={(row) => row.id}
          rowSpanning
          rowSpanningMode="visual"
          enablePinning
          enableColumnSizing
          enableActiveRowHighlight
          rowHeight={34}
          overscan={8}
        />
      </div>
    </div>
  );
}
