import { http, HttpResponse } from 'msw';

type ActualMockRow = {
  acctCd: string;
  acctName: string;
  acctLevel: number;
  parentCd: string;
  drCr: string;
  fiscalYr: string;
  fiscalPrd: string;
  orgCd: string;
  currActAmt: number;
  planAmt: number;
  prevActAmt: number;
  m01: number;
  m02: number;
  m03: number;
  m04: number;
  m05: number;
  m06: number;
  m07: number;
  m08: number;
  m09: number;
  m10: number;
  m11: number;
  m12: number;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
};

const baseRows: ActualMockRow[] = [
  {
    acctCd: '500100',
    acctName: '재료비',
    acctLevel: 2,
    parentCd: '500000',
    drCr: 'DR',
    fiscalYr: '2026',
    fiscalPrd: '01',
    orgCd: 'HQ',
    currActAmt: 123000000,
    planAmt: 120000000,
    prevActAmt: 110000000,
    m01: 123000000,
    m02: 0,
    m03: 0,
    m04: 0,
    m05: 0,
    m06: 0,
    m07: 0,
    m08: 0,
    m09: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    lastUpdatedBy: 'SYSTEM',
    lastUpdatedDate: '2026-02-01T10:15:00',
  },
  {
    acctCd: '500200',
    acctName: '노무비',
    acctLevel: 2,
    parentCd: '500000',
    drCr: 'DR',
    fiscalYr: '2026',
    fiscalPrd: '01',
    orgCd: 'HQ',
    currActAmt: 78000000,
    planAmt: 80000000,
    prevActAmt: 76000000,
    m01: 78000000,
    m02: 0,
    m03: 0,
    m04: 0,
    m05: 0,
    m06: 0,
    m07: 0,
    m08: 0,
    m09: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    lastUpdatedBy: 'SYSTEM',
    lastUpdatedDate: '2026-02-01T10:15:00',
  },
  {
    acctCd: '600100',
    acctName: '판매관리비',
    acctLevel: 2,
    parentCd: '600000',
    drCr: 'DR',
    fiscalYr: '2026',
    fiscalPrd: '01',
    orgCd: 'SALES',
    currActAmt: 46000000,
    planAmt: 43000000,
    prevActAmt: 41000000,
    m01: 46000000,
    m02: 0,
    m03: 0,
    m04: 0,
    m05: 0,
    m06: 0,
    m07: 0,
    m08: 0,
    m09: 0,
    m10: 0,
    m11: 0,
    m12: 0,
    lastUpdatedBy: 'SYSTEM',
    lastUpdatedDate: '2026-02-01T10:15:00',
  },
];

const TOTAL_ACTUAL_ROWS = 2000;

const orgCodes = ['HQ', 'SALES', 'MFG', 'RND', 'FIN'];
const fiscalPeriods = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0')
);

function toIsoDateByIndex(index: number) {
  const month = (index % 12) + 1;
  const day = (index % 28) + 1;
  return `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T10:15:00`;
}

function buildMockRows(total: number): ActualMockRow[] {
  return Array.from({ length: total }, (_, index) => {
    const template = baseRows[index % baseRows.length]!;
    const variance = (index % 23) * 110_000;
    const currActAmt = Math.max(0, template.currActAmt + variance);
    const planAmt = Math.max(0, template.planAmt + Math.floor(variance * 0.85));
    const prevActAmt = Math.max(0, template.prevActAmt + Math.floor(variance * 0.7));
    const fiscalPrd = fiscalPeriods[index % fiscalPeriods.length]!;
    const orgCd = orgCodes[index % orgCodes.length]!;
    const acctCd = `${template.acctCd}${String(index + 1).padStart(4, '0')}`;

    return {
      ...template,
      acctCd,
      acctName: `${template.acctName} ${String(index + 1).padStart(4, '0')}`,
      fiscalYr: String(2026 - (index % 3)),
      fiscalPrd,
      orgCd,
      currActAmt,
      planAmt,
      prevActAmt,
      m01: fiscalPrd === '01' ? currActAmt : 0,
      m02: fiscalPrd === '02' ? currActAmt : 0,
      m03: fiscalPrd === '03' ? currActAmt : 0,
      m04: fiscalPrd === '04' ? currActAmt : 0,
      m05: fiscalPrd === '05' ? currActAmt : 0,
      m06: fiscalPrd === '06' ? currActAmt : 0,
      m07: fiscalPrd === '07' ? currActAmt : 0,
      m08: fiscalPrd === '08' ? currActAmt : 0,
      m09: fiscalPrd === '09' ? currActAmt : 0,
      m10: fiscalPrd === '10' ? currActAmt : 0,
      m11: fiscalPrd === '11' ? currActAmt : 0,
      m12: fiscalPrd === '12' ? currActAmt : 0,
      lastUpdatedBy: `SYSTEM${String((index % 9) + 1)}`,
      lastUpdatedDate: toIsoDateByIndex(index),
    };
  });
}

const actualRows: ActualMockRow[] = buildMockRows(TOTAL_ACTUAL_ROWS);

function filterActualRows(
  request: Request
) {
  const url = new URL(request.url);
  const fiscalYr = (url.searchParams.get('fiscalYr') ?? '').trim();
  const fiscalPrd = (url.searchParams.get('fiscalPrd') ?? '').trim();
  const orgCd = (url.searchParams.get('orgCd') ?? '').trim().toUpperCase();
  const acctCd = (url.searchParams.get('acctCd') ?? '').trim();

  return actualRows.filter((row) => {
    if (fiscalYr && row.fiscalYr !== fiscalYr) return false;
    if (fiscalPrd && row.fiscalPrd !== fiscalPrd) return false;
    if (orgCd && row.orgCd.toUpperCase() !== orgCd) return false;
    if (acctCd && !row.acctCd.includes(acctCd)) return false;
    return true;
  });
}

export const coActualsHandlers = [
  http.get('/api/co/actual', ({ request }) => {
    const items = filterActualRows(request);

    return HttpResponse.json({
      success: true,
      code: 'S0000',
      message: 'ok',
      data: items,
    });
  }),
  http.get('/api/co/actuals', ({ request }) => {
    const items = filterActualRows(request);

    return HttpResponse.json({
      success: true,
      code: 'S0000',
      message: 'ok',
      data: items,
    });
  }),
];
