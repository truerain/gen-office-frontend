import { http, HttpResponse } from 'msw';

type ActualMockRow = {
  acctCd: string;
  acctName: string;
  acctLevel: number;
  parentCd: string | null;
  drCr: string;
  fiscalYr: string;
  fiscalPrd: string;
  orgCd: string;
  currActAmt: number;
  planAmt: number;
  prevActAmt: number;
  attribute1: string | null;
  attribute2: string | null;
  attribute3: string | null;
  attribute4: string | null;
  attribute5: string | null;
  attribute6: string | null;
  attribute7: string | null;
  attribute8: string | null;
  attribute9: string | null;
  attribute10: string | null;
  createdBy: string | null;
  creationDate: string | null;
  lastUpdatedBy: string | null;
  lastUpdatedDate: string | null;
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
    attribute1: 'MANUFACTURE',
    attribute2: null,
    attribute3: null,
    attribute4: null,
    attribute5: null,
    attribute6: null,
    attribute7: null,
    attribute8: null,
    attribute9: null,
    attribute10: null,
    createdBy: 'SYSTEM',
    creationDate: '2026-01-31T09:00:00',
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
    attribute1: 'MANUFACTURE',
    attribute2: null,
    attribute3: null,
    attribute4: null,
    attribute5: null,
    attribute6: null,
    attribute7: null,
    attribute8: null,
    attribute9: null,
    attribute10: null,
    createdBy: 'SYSTEM',
    creationDate: '2026-01-31T09:00:00',
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
    attribute1: 'SGA',
    attribute2: null,
    attribute3: null,
    attribute4: null,
    attribute5: null,
    attribute6: null,
    attribute7: null,
    attribute8: null,
    attribute9: null,
    attribute10: null,
    createdBy: 'SYSTEM',
    creationDate: '2026-01-31T09:00:00',
    lastUpdatedBy: 'SYSTEM',
    lastUpdatedDate: '2026-02-01T10:15:00',
  },
];

export const coActualsHandlers = [
  http.get('/api/co/actuals', ({ request }) => {
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
