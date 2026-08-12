// apps/demo/src/pages/demo/plan-vs-actual/planVsActualModel.ts
// One-row account model for the plan-vs-actual stacked-cell demo.

export const MONTH_KEYS = [
  'm01',
  'm02',
  'm03',
  'm04',
  'm05',
  'm06',
  'm07',
  'm08',
  'm09',
  'm10',
  'm11',
  'm12',
] as const;

export type MonthKey = (typeof MONTH_KEYS)[number];
export type ActualField = `actual${Capitalize<MonthKey>}`;
export type PlanField = `plan${Capitalize<MonthKey>}`;

export type PlanVsActualAccount = {
  acctCd: string;
  acctName: string;
  actual: Record<MonthKey, number>;
  plan: Record<MonthKey, number>;
};

export type PlanVsActualGridRow = {
  acctCd: string;
  acctName: string;
  actualTotal: number;
  planTotal: number;
  totalRatio: number | null;
} & Record<ActualField, number> &
  Record<PlanField, number>;

const MONTH_HEADERS: Record<MonthKey, string> = {
  m01: '1월',
  m02: '2월',
  m03: '3월',
  m04: '4월',
  m05: '5월',
  m06: '6월',
  m07: '7월',
  m08: '8월',
  m09: '9월',
  m10: '10월',
  m11: '11월',
  m12: '12월',
};

export function monthHeader(key: MonthKey) {
  return MONTH_HEADERS[key];
}

export function actualField(key: MonthKey): ActualField {
  return `actual${key[0].toUpperCase()}${key.slice(1)}` as ActualField;
}

export function planField(key: MonthKey): PlanField {
  return `plan${key[0].toUpperCase()}${key.slice(1)}` as PlanField;
}

export function isPlanField(value: string): value is PlanField {
  return MONTH_KEYS.some((key) => planField(key) === value);
}

export function isDualEditMonth(key: MonthKey) {
  return key === 'm10' || key === 'm11' || key === 'm12';
}

export type MonthAmountPair = {
  actual: number;
  plan: number;
};

export function isMonthAmountPair(value: unknown): value is MonthAmountPair {
  if (value == null || typeof value !== 'object') return false;
  return 'actual' in value && 'plan' in value;
}

export function monthKeyFromPlanField(field: PlanField): MonthKey {
  const found = MONTH_KEYS.find((key) => planField(key) === field);
  if (!found) throw new Error(`Unknown plan field: ${field}`);
  return found;
}

export function sumMonths(values: Record<MonthKey, number>) {
  return MONTH_KEYS.reduce((sum, key) => sum + (Number(values[key]) || 0), 0);
}

export function computeRatio(planAmount: number, actualAmount: number) {
  if (!Number.isFinite(actualAmount) || actualAmount === 0) return null;
  return planAmount / actualAmount;
}

function monthsFromBase(base: number, drift: number): Record<MonthKey, number> {
  return MONTH_KEYS.reduce((acc, key, index) => {
    acc[key] = Math.round(base * (0.92 + ((index + drift) % 5) * 0.02));
    return acc;
  }, {} as Record<MonthKey, number>);
}

export function createSeedAccounts(): PlanVsActualAccount[] {
  const rows: Array<{ acctCd: string; acctName: string; actualBase: number; planRate: number }> = [
    { acctCd: '410100', acctName: '국내매출', actualBase: 1_250_000, planRate: 1.08 },
    { acctCd: '410200', acctName: '해외매출', actualBase: 860_000, planRate: 1.12 },
    { acctCd: '410300', acctName: '온라인매출', actualBase: 420_000, planRate: 1.18 },
    { acctCd: '510100', acctName: '재료비', actualBase: 610_000, planRate: 1.04 },
    { acctCd: '510200', acctName: '물류비', actualBase: 145_000, planRate: 1.06 },
    { acctCd: '520100', acctName: '급여', actualBase: 380_000, planRate: 1.03 },
    { acctCd: '520200', acctName: '임차료', actualBase: 96_000, planRate: 1.02 },
    { acctCd: '520300', acctName: '광고선전비', actualBase: 74_000, planRate: 1.15 },
  ];

  return rows.map((row, index) => {
    const actual = monthsFromBase(row.actualBase, index);
    const plan = MONTH_KEYS.reduce((acc, key) => {
      acc[key] = Math.round(actual[key] * row.planRate);
      return acc;
    }, {} as Record<MonthKey, number>);
    return { acctCd: row.acctCd, acctName: row.acctName, actual, plan };
  });
}

export function toGridRow(account: PlanVsActualAccount): PlanVsActualGridRow {
  const actualTotal = sumMonths(account.actual);
  const planTotal = sumMonths(account.plan);
  const row = {
    acctCd: account.acctCd,
    acctName: account.acctName,
    actualTotal,
    planTotal,
    totalRatio: computeRatio(planTotal, actualTotal),
  } as PlanVsActualGridRow;

  for (const key of MONTH_KEYS) {
    row[actualField(key)] = account.actual[key];
    row[planField(key)] = account.plan[key];
  }
  return row;
}

export function buildGridRows(accounts: readonly PlanVsActualAccount[]): PlanVsActualGridRow[] {
  return accounts.map(toGridRow);
}

export function planMonthsFromRow(row: PlanVsActualGridRow): Record<MonthKey, number> {
  return MONTH_KEYS.reduce((acc, key) => {
    acc[key] = Number(row[planField(key)]) || 0;
    return acc;
  }, {} as Record<MonthKey, number>);
}

export function actualMonthsFromRow(row: PlanVsActualGridRow): Record<MonthKey, number> {
  return MONTH_KEYS.reduce((acc, key) => {
    acc[key] = Number(row[actualField(key)]) || 0;
    return acc;
  }, {} as Record<MonthKey, number>);
}

export function applyPlanRate(accounts: readonly PlanVsActualAccount[], rate: number): PlanVsActualAccount[] {
  return accounts.map((account) => ({
    ...account,
    plan: MONTH_KEYS.reduce((acc, key) => {
      acc[key] = Math.round(account.actual[key] * rate);
      return acc;
    }, {} as Record<MonthKey, number>),
  }));
}

export function applyGridRowsToAccounts(
  accounts: readonly PlanVsActualAccount[],
  rows: readonly PlanVsActualGridRow[]
): PlanVsActualAccount[] {
  const byAcct = new Map(rows.map((row) => [row.acctCd, row]));
  return accounts.map((account) => {
    const row = byAcct.get(account.acctCd);
    if (!row) return account;
    return {
      ...account,
      actual: actualMonthsFromRow(row),
      plan: planMonthsFromRow(row),
    };
  });
}

export function recomputeTotals(row: PlanVsActualGridRow): Pick<
  PlanVsActualGridRow,
  'actualTotal' | 'planTotal' | 'totalRatio'
> {
  const actualTotal = sumMonths(actualMonthsFromRow(row));
  const planTotal = sumMonths(planMonthsFromRow(row));
  return {
    actualTotal,
    planTotal,
    totalRatio: computeRatio(planTotal, actualTotal),
  };
}
