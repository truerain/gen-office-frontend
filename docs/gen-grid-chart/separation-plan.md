# gen-grid-chart 분리 검토 문서

## 1. 목적
- 현재 `apps/demo/src/shared/ui/grid`에 있는 Range Chart 관련 코드를 workspace package로 분리한다.
- 목표 패키지명: `@gen-office/gen-grid-chart`
- 분리 후에도 현재 `ActualsPage` 기능은 동일하게 유지한다.

## 2. 현재 코드 범위
- 변환 유틸: `apps/demo/src/shared/ui/grid/rangeChartContextMenu.ts`
- 다이얼로그 UI: `apps/demo/src/shared/ui/grid/RangeChartDialog.tsx`
- 스타일: `apps/demo/src/shared/ui/grid/RangeChartDialog.module.css`
- 화면 연결: `apps/demo/src/pages/co/actuals/ActualsPage.tsx`

## 3. 분리 원칙
- `gen-grid-chart`는 `gen-grid-crud`를 상속하지 않는다.
- `GenGrid`/`GenGridCrud` 어느 쪽에서도 사용할 수 있는 조합형(composition) 유틸로 설계한다.
- 앱 종속 코드(`ActualsPage`의 `acctName` 고정 정책)는 패키지 밖에 둔다.
- 1차 분리에서는 기능 확장보다 "동작 동일성"을 우선한다.

## 4. 패키지 책임
- Selection Range -> Chart model 변환
- Chart preview dialog 렌더
- ContextMenu custom action 연결 헬퍼 제공(선택)

패키지 책임에서 제외:
- 특정 도메인 컬럼 규칙(예: `acctName` 강제)
- 서버 API 호출/저장
- 메뉴/라우팅

## 5. 제안 디렉터리 구조
`packages/gen-grid-chart`

`src/model`
- `rangeToChartModel.ts`

`src/ui`
- `RangeChartDialog.tsx`
- `RangeChartDialog.module.css`

`src/integration`
- `createRangeChartContextMenuAction.ts` (옵션, 2차)

`src`
- `index.ts`
- `index.css` (필요 시)

## 6. 공개 API 제안 (1차)
```ts
export type RangeChartSeries;
export type RangeChartRow;
export type RangeChartModel;
export type RangeChartBuildResult;

export function buildRangeChartModel<TData>(
  ctx: GenGridContextMenuActionContext<TData>,
  options?: {
    categoryColumnIndex?: number;
    messageWhenInvalid?: string;
  }
): RangeChartBuildResult;

export function RangeChartDialog(props: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  title?: string;
  description?: string;
  error?: string | null;
  rows: RangeChartRow[];
  series: RangeChartSeries[];
}): JSX.Element;
```

## 7. 의존성 정책
- `peerDependencies`
  - `react`, `react-dom`
  - `@gen-office/gen-grid`
  - `@gen-office/gen-chart`
  - `@gen-office/ui`
- `dependencies`
  - 가능하면 없음

주의:
- `apps/demo/src/main.tsx`에서 `@gen-office/gen-chart/index.css`를 계속 import 해야 한다.
- 패키지 README에 CSS 선행 import 조건을 명시한다.

## 8. 마이그레이션 단계
### Step 1: 패키지 스캐폴딩
- `packages/gen-grid-chart/package.json`, `tsconfig.json`, `vite.config.ts`, `src/index.ts` 생성
- 기존 패키지(`gen-grid`, `gen-grid-crud`) 설정을 최소 템플릿으로 재사용

### Step 2: 코드 이동 (기능 동일)
- `rangeChartContextMenu.ts` -> `packages/gen-grid-chart/src/model/rangeToChartModel.ts`
- `RangeChartDialog.*` -> `packages/gen-grid-chart/src/ui/*`
- export 구성

### Step 3: 앱 연결 교체
- `ActualsPage` import를 `@gen-office/gen-grid-chart`로 변경
- 기존 `apps/demo/src/shared/ui/grid` 파일 제거

### Step 4: 검증
- `pnpm -C packages/gen-grid-chart build`
- `pnpm -C apps/demo exec tsc -p tsconfig.app.json --noEmit`
- 화면 수동 점검: ContextMenu > Chart, 다이얼로그 리사이즈, grouped series legend

## 9. 리스크 및 대응
- 리스크: `gen-grid` 타입 변경에 따른 깨짐
  - 대응: `GenGridContextMenuActionContext` 변경 시 release note + peer version 정책 명시

- 리스크: CSS 의존 누락으로 범례/툴팁 미노출
  - 대응: README에 필수 import 명시, demo에서 smoke 체크 추가

- 리스크: 앱별 요구사항이 패키지로 유입
  - 대응: 도메인 규칙은 callback/option으로 받고 기본 로직은 범용 유지

## 10. 확장 계획 (2차)
- 멀티 차트 preset (`bar`, `line`, `area`, `pie`, `donut`)
- `createRangeChartContextMenuAction` 헬퍼 제공
- 시리즈/축 포맷터 옵션 제공
- chart model validator 강화 (카테고리 중복, null 비율)

## 12. 멀티시리즈 바 모드 확장안
대상 컬럼(숫자 컬럼)이 여러 개일 때 아래 3가지 바 모드를 지원한다.
- `grouped`: 카테고리별 시리즈를 나란히 표시
- `stacked`: 카테고리별 시리즈를 누적 표시
- `stacked100`: 카테고리별 시리즈 비율을 100% 기준으로 누적 표시

### 12.1 타입/옵션 제안
```ts
export type BarSeriesLayout = 'grouped' | 'stacked' | 'stacked100';

export type BuildRangeChartModelOptions = {
  categoryColumnIndex?: number;
  numericColumnIndexes?: number[];
  barSeriesLayout?: BarSeriesLayout;
  messageWhenInvalid?: string;
};

export type RangeChartModel = {
  title: string;
  rows: RangeChartRow[];
  series: RangeChartSeries[];
  categoryHeader: string;
  barSeriesLayout?: BarSeriesLayout;
};
```

### 12.2 모델 생성 규칙
- `grouped`
  - 현재와 동일하게 원본 수치를 각 시리즈에 그대로 배치
- `stacked`
  - 원본 수치를 그대로 사용, 렌더에서 같은 `stackId`를 부여
- `stacked100`
  - 카테고리(행) 단위로 시리즈 합계를 계산
  - 합계가 0이면 해당 행 시리즈를 모두 0 처리
  - 각 시리즈 값을 `(value / rowSum) * 100`으로 변환
  - 반올림 정책은 옵션화 가능(기본: 소수점 2자리)

### 12.3 렌더링 규칙
- `RangeChartDialog`에서 `barSeriesLayout`에 따라 `GenChart` 시리즈를 생성
  - `grouped`: `stackId` 미설정
  - `stacked`: 공통 `stackId` 설정 (예: `'stack-1'`)
  - `stacked100`: 공통 `stackId` + yAxis max=100(+ tick format `%`)
- 범례는 3모드 모두 표시
- `stacked100`일 때 툴팁은 `%` 표현 지원(옵션)

### 12.4 ContextMenu UX 제안
- `Chart` 단일 메뉴가 아니라 하위 선택 형태로 제공:
  - `Chart (Grouped)`
  - `Chart (Stacked)`
  - `Chart (100% Stacked)`
- 또는 액션 생성 헬퍼에서 mode별 액션을 자동 생성:
```ts
createRangeChartContextMenuActions({
  barModes: ['grouped', 'stacked', 'stacked100']
})
```

### 12.5 검증 항목 추가
- 숫자 컬럼 2개 이상 선택 시 3모드 모두 정상 렌더
- 음수/양수 혼합 데이터에서 stacked 동작 검증
- `stacked100`에서 합계 0 행 처리(0 나눗셈 방지)
- 라벨 컬럼 + 숫자 컬럼 순서가 바뀌어도 모드별 결과 동일

## 11. 결론
- 권장 순서: "분리 -> 안정화 -> 기능 확장"
- 다음 작업 단위:
  1. 패키지 생성 + 현재 기능 1:1 이동
  2. `ActualsPage` 교체 및 동작 동일성 확인
  3. 이후 멀티 차트 확장 착수
