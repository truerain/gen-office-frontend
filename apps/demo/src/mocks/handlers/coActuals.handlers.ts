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

export const coActualsHandlers = [
  http.get('/api/co/actual', ({ request }) => {
    const url = new URL(request.url);
    const fiscalYr = (url.searchParams.get('fiscalYr') ?? '').trim();
    const fiscalPrd = (url.searchParams.get('fiscalPrd') ?? '').trim();
    const orgCd = (url.searchParams.get('orgCd') ?? '').trim().toUpperCase();
    const acctCd = (url.searchParams.get('acctCd') ?? '').trim();

    const items = baseRows.filter((row) => {
      if (fiscalYr && row.fiscalYr !== fiscalYr) return false;
      if (fiscalPrd && row.fiscalPrd !== fiscalPrd) return false;
      if (orgCd && row.orgCd.toUpperCase() !== orgCd) return false;
      if (acctCd && !row.acctCd.includes(acctCd)) return false;
      return true;
    });

    return HttpResponse.json({
      success: true,
      code: 'S0000',
      message: 'ok',
      data: items,
    });
  }),
];
