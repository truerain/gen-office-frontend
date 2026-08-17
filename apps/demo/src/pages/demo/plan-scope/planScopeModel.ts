// apps/demo/src/pages/demo/plan-scope/planScopeModel.ts
// Actual / Pooled / PlanScope domain model and pure operations for the PlanScope demo.

export type DimensionKey = 'acctCd' | 'ccCd' | 'deptCd';

export type ActualItem = {
  id: string;
  acctCd: string;
  acctName: string;
  ccCd: string;
  ccName: string;
  deptCd: string;
  deptName: string;
  actualTotal: number;
  pooledId: string | null;
};

export type PooledDimensions = {
  acctCd: string;
  acctName: string;
  ccCd: string | null;
  ccName: string | null;
  deptCd: string | null;
  deptName: string | null;
};

export type PooledItem = {
  id: string;
  code: string;
  name: string;
  kept: PooledDimensions;
  collapsed: DimensionKey[];
  memberIds: string[];
};

export type PlanScopeState = {
  actuals: ActualItem[];
  pooled: PooledItem[];
};

export type PlanScopeCounts = {
  actual: number;
  pooled: number;
  planScope: number;
};

export type CommonDimensions = {
  acctCd: string;
  acctName: string;
  ccCd: string | null;
  ccName: string | null;
  deptCd: string | null;
  deptName: string | null;
  collapsed: DimensionKey[];
};

export type AssignValidation =
  | { ok: true; common: CommonDimensions }
  | { ok: false; reason: string };

const ACCOUNTS = [
  { acctCd: '410100', acctName: '국내매출' },
  { acctCd: '410200', acctName: '해외매출' },
  { acctCd: '410300', acctName: '온라인매출' },
  { acctCd: '510100', acctName: '재료비' },
  { acctCd: '510200', acctName: '물류비' },
  { acctCd: '520100', acctName: '급여' },
  { acctCd: '520200', acctName: '임차료' },
  { acctCd: '520300', acctName: '광고선전비' },
] as const;

const COST_CENTERS = [
  { ccCd: 'CC-HQ', ccName: '본사' },
  { ccCd: 'CC-PRD1', ccName: '생산1' },
  { ccCd: 'CC-PRD2', ccName: '생산2' },
  { ccCd: 'CC-SLS', ccName: '영업' },
] as const;

const DEPARTMENTS = [
  { deptCd: 'D-HR', deptName: '인사팀' },
  { deptCd: 'D-PRD', deptName: '생산팀' },
  { deptCd: 'D-SLS', deptName: '영업팀' },
  { deptCd: 'D-FIN', deptName: '재무팀' },
] as const;

function actualId(acctCd: string, ccCd: string, deptCd: string) {
  return `${acctCd}|${ccCd}|${deptCd}`;
}

function pooledCodeFromDimensions(common: CommonDimensions) {
  const parts = [common.acctCd];
  if (common.deptCd) parts.push(common.deptCd);
  if (common.ccCd) parts.push(common.ccCd);
  return `P-${parts.join('-')}`;
}

function pooledNameFromDimensions(common: CommonDimensions) {
  const parts = [common.acctName];
  if (common.deptName) parts.push(common.deptName);
  if (common.ccName) parts.push(common.ccName);
  return parts.join(' / ');
}

function nextPooledId(pooled: readonly PooledItem[]) {
  const max = pooled.reduce((acc, item) => {
    const match = /^pool-(\d+)$/.exec(item.id);
    const num = match ? Number(match[1]) : 0;
    return Math.max(acc, num);
  }, 0);
  return `pool-${max + 1}`;
}

export function createSeedActuals(): ActualItem[] {
  const rows: ActualItem[] = [];
  let amountSeed = 1;

  for (const account of ACCOUNTS) {
    for (const cc of COST_CENTERS) {
      for (const dept of DEPARTMENTS) {
        if (account.acctCd.startsWith('41') && cc.ccCd.startsWith('CC-PRD')) continue;
        if (account.acctCd === '520100' && dept.deptCd === 'D-FIN') continue;

        const base = 40_000 + (amountSeed % 7) * 8_500 + (amountSeed % 3) * 3_200;
        rows.push({
          id: actualId(account.acctCd, cc.ccCd, dept.deptCd),
          acctCd: account.acctCd,
          acctName: account.acctName,
          ccCd: cc.ccCd,
          ccName: cc.ccName,
          deptCd: dept.deptCd,
          deptName: dept.deptName,
          actualTotal: base,
          pooledId: null,
        });
        amountSeed += 1;
      }
    }
  }

  return rows;
}

export function createInitialState(): PlanScopeState {
  return {
    actuals: createSeedActuals(),
    pooled: [],
  };
}

export function isMember(actual: ActualItem) {
  return actual.pooledId != null;
}

export function getNonMemberActuals(actuals: readonly ActualItem[]) {
  return actuals.filter((row) => !isMember(row));
}

export function getMembers(actuals: readonly ActualItem[], pooledId: string) {
  return actuals.filter((row) => row.pooledId === pooledId);
}

export function planScopeCounts(state: PlanScopeState): PlanScopeCounts {
  const actual = getNonMemberActuals(state.actuals).length;
  const pooled = state.pooled.length;
  return {
    actual,
    pooled,
    planScope: actual + pooled,
  };
}

export function validateSelection(actuals: readonly ActualItem[], ids: readonly string[]): AssignValidation {
  if (ids.length === 0) {
    return { ok: false, reason: 'Actual을 1건 이상 선택하세요.' };
  }

  const selected = actuals.filter((row) => ids.includes(row.id));
  if (selected.length !== ids.length) {
    return { ok: false, reason: '선택한 Actual을 찾을 수 없습니다.' };
  }

  if (selected.some((row) => isMember(row))) {
    return { ok: false, reason: '이미 Pooled에 포함된 Actual은 선택할 수 없습니다.' };
  }

  const acctSet = new Set(selected.map((row) => row.acctCd));
  if (acctSet.size !== 1) {
    return { ok: false, reason: '서로 다른 계정은 하나의 Pooled로 묶을 수 없습니다.' };
  }

  const first = selected[0]!;
  const sameCc = selected.every((row) => row.ccCd === first.ccCd);
  const sameDept = selected.every((row) => row.deptCd === first.deptCd);

  const collapsed: DimensionKey[] = [];
  if (!sameCc) collapsed.push('ccCd');
  if (!sameDept) collapsed.push('deptCd');

  return {
    ok: true,
    common: {
      acctCd: first.acctCd,
      acctName: first.acctName,
      ccCd: sameCc ? first.ccCd : null,
      ccName: sameCc ? first.ccName : null,
      deptCd: sameDept ? first.deptCd : null,
      deptName: sameDept ? first.deptName : null,
      collapsed,
    },
  };
}

export function commonDimensionsFromSelection(
  actuals: readonly ActualItem[],
  ids: readonly string[]
): CommonDimensions | null {
  const validation = validateSelection(actuals, ids);
  return validation.ok ? validation.common : null;
}

export function suggestPooledName(common: CommonDimensions) {
  return pooledNameFromDimensions(common);
}

export function suggestPooledCode(common: CommonDimensions) {
  return pooledCodeFromDimensions(common);
}

function dimensionsMatch(a: CommonDimensions, b: PooledItem) {
  return (
    a.acctCd === b.kept.acctCd &&
    a.ccCd === b.kept.ccCd &&
    a.deptCd === b.kept.deptCd &&
    a.collapsed.join('|') === b.collapsed.join('|')
  );
}

export function compatiblePooled(
  pooled: readonly PooledItem[],
  common: CommonDimensions
): PooledItem[] {
  return pooled.filter((item) => dimensionsMatch(common, item));
}

export function previewPlanScopeAfterAssign(
  state: PlanScopeState,
  actualIds: readonly string[],
  target: { type: 'new' } | { type: 'existing'; pooledId: string }
): PlanScopeCounts {
  const next = target.type === 'new'
    ? assignToNewPooled(state, actualIds, suggestPooledName(commonDimensionsFromSelection(state.actuals, actualIds)!))
    : assignToExistingPooled(state, target.pooledId, actualIds);
  return planScopeCounts(next);
}

export function assignToNewPooled(
  state: PlanScopeState,
  actualIds: readonly string[],
  name: string
): PlanScopeState {
  const validation = validateSelection(state.actuals, actualIds);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  const common = validation.common;
  const pooledId = nextPooledId(state.pooled);
  const nextActuals = state.actuals.map((row) =>
    actualIds.includes(row.id) ? { ...row, pooledId } : row
  );

  const nextPooled: PooledItem = {
    id: pooledId,
    code: pooledCodeFromDimensions(common),
    name: name.trim() || pooledNameFromDimensions(common),
    kept: {
      acctCd: common.acctCd,
      acctName: common.acctName,
      ccCd: common.ccCd,
      ccName: common.ccName,
      deptCd: common.deptCd,
      deptName: common.deptName,
    },
    collapsed: [...common.collapsed],
    memberIds: [...actualIds],
  };

  return {
    actuals: nextActuals,
    pooled: [...state.pooled, nextPooled],
  };
}

export function assignToExistingPooled(
  state: PlanScopeState,
  pooledId: string,
  actualIds: readonly string[]
): PlanScopeState {
  const target = state.pooled.find((item) => item.id === pooledId);
  if (!target) {
    throw new Error('선택한 Pooled를 찾을 수 없습니다.');
  }

  const validation = validateSelection(state.actuals, actualIds);
  if (!validation.ok) {
    throw new Error(validation.reason);
  }

  if (!dimensionsMatch(validation.common, target)) {
    throw new Error('선택한 Actual은 이 Pooled와 호환되지 않습니다.');
  }

  const nextMemberIds = [...new Set([...target.memberIds, ...actualIds])];
  const nextActuals = state.actuals.map((row) =>
    actualIds.includes(row.id) ? { ...row, pooledId } : row
  );

  return {
    actuals: nextActuals,
    pooled: state.pooled.map((item) =>
      item.id === pooledId ? { ...item, memberIds: nextMemberIds } : item
    ),
  };
}

export function addMembers(
  state: PlanScopeState,
  pooledId: string,
  actualIds: readonly string[]
): PlanScopeState {
  return assignToExistingPooled(state, pooledId, actualIds);
}

export function removeMembers(
  state: PlanScopeState,
  actualIds: readonly string[]
): PlanScopeState {
  if (actualIds.length === 0) return state;

  const affectedPooledIds = new Set<string>();
  for (const id of actualIds) {
    const row = state.actuals.find((item) => item.id === id);
    if (row?.pooledId) affectedPooledIds.add(row.pooledId);
  }

  const nextActuals = state.actuals.map((row) =>
    actualIds.includes(row.id) ? { ...row, pooledId: null } : row
  );

  let nextPooled = state.pooled
    .map((item) => ({
      ...item,
      memberIds: item.memberIds.filter((id) => !actualIds.includes(id)),
    }))
    .filter((item) => item.memberIds.length > 0);

  for (const pooledId of affectedPooledIds) {
    const stillExists = nextPooled.some((item) => item.id === pooledId);
    if (!stillExists) continue;
    const members = getMembers({ actuals: nextActuals, pooled: nextPooled }, pooledId);
    if (members.length === 0) {
      nextPooled = nextPooled.filter((item) => item.id !== pooledId);
    }
  }

  return {
    actuals: nextActuals,
    pooled: nextPooled,
  };
}

export function unpool(state: PlanScopeState, pooledId: string): PlanScopeState {
  const target = state.pooled.find((item) => item.id === pooledId);
  if (!target) return state;
  return removeMembers(state, target.memberIds);
}

export type ActualFilter = {
  acctCd: string;
  ccCd: string;
  deptCd: string;
  keyword: string;
};

export const ALL_FILTER = 'ALL';

export const defaultActualFilter: ActualFilter = {
  acctCd: ALL_FILTER,
  ccCd: ALL_FILTER,
  deptCd: ALL_FILTER,
  keyword: '',
};

function matchesFilterValue(filterValue: string, rowValue: string) {
  const normalized = filterValue.trim();
  if (!normalized || normalized === ALL_FILTER) return true;
  return rowValue === normalized;
}

export function filterActuals(actuals: readonly ActualItem[], filter: ActualFilter) {
  const keyword = filter.keyword.trim().toLowerCase();
  return actuals.filter((row) => {
    if (!matchesFilterValue(filter.acctCd, row.acctCd)) return false;
    if (!matchesFilterValue(filter.ccCd, row.ccCd)) return false;
    if (!matchesFilterValue(filter.deptCd, row.deptCd)) return false;
    if (!keyword) return true;
    const haystack = [
      row.acctCd,
      row.acctName,
      row.ccCd,
      row.ccName,
      row.deptCd,
      row.deptName,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(keyword);
  });
}

export function actualFilterOptions(actuals: readonly ActualItem[]) {
  const acctMap = new Map<string, string>();
  const ccMap = new Map<string, string>();
  const deptMap = new Map<string, string>();

  for (const row of actuals) {
    acctMap.set(row.acctCd, row.acctName);
    ccMap.set(row.ccCd, row.ccName);
    deptMap.set(row.deptCd, row.deptName);
  }

  return {
    accounts: [...acctMap.entries()].map(([value, label]) => ({ value, label })),
    costCenters: [...ccMap.entries()].map(([value, label]) => ({ value, label })),
    departments: [...deptMap.entries()].map(([value, label]) => ({ value, label })),
  };
}

export function formatCollapsedDimensions(pooled: PooledItem) {
  if (pooled.collapsed.length === 0) return '-';
  return pooled.collapsed
    .map((key) => {
      if (key === 'ccCd') return 'CC';
      if (key === 'deptCd') return '부서';
      return key;
    })
    .join(', ');
}

export function formatKeptDimensions(pooled: PooledItem) {
  const parts = [pooled.kept.acctName];
  if (pooled.kept.deptName) parts.push(pooled.kept.deptName);
  if (pooled.kept.ccName) parts.push(pooled.kept.ccName);
  return parts.join(' / ');
}
