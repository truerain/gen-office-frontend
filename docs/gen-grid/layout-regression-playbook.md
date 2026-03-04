# GenGrid Layout Regression Playbook

## 목적
- `GenGrid` 또는 `GenGridCrud` 소스 수정 후 반복적으로 발생하는 레이아웃 깨짐을 빠르게 진단/복구한다.
- 특히 아래 2가지 증상을 재발 방지한다.
  - ActionBar가 여러 줄처럼 보이거나 버튼이 깨지는 현상
  - GenGrid 내부 스크롤바(`tableScroll`)가 생성되지 않고 페이지 전체가 스크롤되는 현상

## 대표 증상
1. ActionBar가 한 줄로 유지되지 않음
- 아이콘/버튼이 줄바꿈처럼 보이거나 좌우 정렬이 무너짐
- 좁은 폭에서 버튼이 잘리거나 배치가 비정상적임

2. GenGrid 내부 스크롤 미생성
- 그리드 높이가 계속 늘어나며 페이지 전체가 스크롤됨
- `tableScroll`(GenGrid 내부 스크롤 컨테이너) 대신 상위 레이아웃이 스크롤됨

## 근본 원인 (수정 후 정리)
1. 페이지 컨테이너의 높이/`min-height: 0` 체인 누락
- `GenGrid`는 부모 높이 제약 안에서 내부 스크롤을 만든다.

2. `GenGridCrud`에서 높이 강제 규칙을 과도하게 넣은 경우
- `mergedGridProps.height = '100%'` 기본 강제나 `.gridArea > * { height: 100% }` 일괄 적용은
  일부 화면에서 오히려 레이아웃 회귀를 만들 수 있다.

3. ActionBar overflow 분배가 비대칭
- root는 `overflow-x: auto`인데 내부 좌측 컨테이너가 `overflow: hidden`이면
  스크롤 대신 잘림/깨짐이 발생하기 쉬움

## 표준 수정 가이드

### A. GenGridCrud height 기본값을 강제하지 않기
파일: `packages/gen-grid-crud/src/GenGridCrud.tsx`

`mergedGridProps`는 소비자 입력을 그대로 우선한다.

```ts
const mergedGridProps = React.useMemo(
  () => ({
    ...gridProps,
    enableFiltering: filterEnabled,
  }),
  [gridProps, filterEnabled]
);
```

### B. gridArea 하위는 `min-height: 0`만 유지
파일: `packages/gen-grid-crud/src/GenGridCrud.module.css`

```css
.gridArea > * {
  flex: 1 1 auto;
  min-height: 0;
}
```

### C. ActionBar 단일 행 + 가로 스크롤 구조 고정
파일: `packages/gen-grid-crud/src/components/CrudActionBar.module.css`

핵심 원칙:
- root가 가로 스크롤 책임
- left/right 그룹은 nowrap 유지, hidden으로 잘라먹지 않음

권장 포인트:
- `.root`: `width: 100%`, `justify-content: flex-start`, `overflow-x: auto`, `overflow-y: hidden`
- `.leftActions`: `min-width: max-content`, `flex: 0 0 auto`, `white-space: nowrap`
- `.rightActions`: `margin-left: auto`, `white-space: nowrap`

## 페이지 사용 시 계약 (Consumer Side)
페이지에서도 아래를 지켜야 내부 스크롤이 안정적이다.

1. 상위 flex 체인
- `height: 100%`
- `min-height: 0`
- `overflow: hidden`

2. Grid 래퍼
- `display: flex`
- `flex: 1 1 auto` 또는 고정 높이
- `min-height: 0`
- `overflow: hidden`

3. GenGrid/GenGridCrud 전달값
- `gridProps.height: '100%'` 권장

## PR 체크리스트
- [ ] ActionBar가 좁은 폭에서도 한 줄 + 가로 스크롤로 동작한다.
- [ ] `tableScroll`에 내부 세로 스크롤이 생성된다.
- [ ] 페이지 전체 스크롤로 빠지지 않는다.
- [ ] `gridProps.height`가 필요한 화면에서는 페이지/화면에서 명시적으로 지정했다.
- [ ] `apps/demo` 타입체크 통과
- [ ] `packages/gen-grid-crud` 타입체크 통과

## 빠른 검증 명령
```bash
pnpm -C packages/gen-grid-crud exec tsc -p tsconfig.json --noEmit
pnpm -C apps/demo exec tsc -p tsconfig.json --noEmit
```

## 관련 문서
- `docs/gen-grid/layout-contract.md`
- `docs/gen-grid/row-spanning.md`
