# GenGrid Layout Contract

## 목적
- `GenGrid` 내부 스크롤이 사라지고 페이지 전체가 스크롤되는 문제를 방지한다.
- `ActionBar`가 줄바꿈/깨짐 없이 안정적으로 보이도록 한다.

## 핵심 원칙
- `GenGrid`는 **부모 높이 제약 안에서** 동작해야 한다.
- 상위 컨테이너 체인 중 하나라도 `min-height: 0`이 빠지면 내부 스크롤 대신 바깥 스크롤로 빠질 수 있다.
- `ActionBar`는 텍스트 버튼 폭에 민감하므로, 좁은 화면에서는 아이콘 스타일을 우선 사용한다.

## 필수 레이아웃 체인
아래 규칙을 `GenGridCrud`를 감싸는 페이지 컨테이너에 적용한다.

```css
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.gridWrap {
  /* 고정 높이 또는 flex 영역 둘 중 하나를 명확히 선택 */
  height: 560px; /* 또는 flex: 1 1 auto */
  min-height: 0;
  display: flex;
  overflow: hidden;
}
```

`GenGridCrud` 사용 시:
- `gridProps.height: '100%'` 지정 권장
- 부모가 고정 높이를 주지 않으면 내부 `tableScroll` 스크롤이 생기지 않을 수 있음

## ActionBar 안정화 가이드
- 기본: `actionBar.defaultStyle: 'icon'`
- 커스텀 액션도 가능하면 `style: 'icon'` 사용
- 긴 라벨이 필요하면 우측 액션 수를 줄이거나 페이지 폭 여유를 확보

예시:
```ts
actionBar: {
  defaultStyle: 'icon',
  includeBuiltIns: ['excel'],
  customActions: [
    { key: 'expand-all', icon: <ChevronsDown size={16} />, side: 'right', style: 'icon' },
    { key: 'collapse-all', icon: <ChevronsUp size={16} />, side: 'right', style: 'icon' },
  ],
}
```

## 다단 헤더 관련 주의
- 그룹 헤더(`colSpan > 1`)는 하위 리프 컬럼 너비 합으로 계산되어야 한다.
- 그룹 헤더 폭이 1레벨 컬럼 폭으로 계산되면 정렬이 깨진다.

## 체크리스트 (PR 전)
- [ ] 페이지 컨테이너에 `height: 100%`, `min-height: 0`, `overflow: hidden`이 있다.
- [ ] 그리드 래퍼에 `min-height: 0`과 높이 제약(고정 또는 flex)이 있다.
- [ ] `gridProps.height`를 명시했다 (`'100%'` 권장).
- [ ] ActionBar 커스텀 액션이 텍스트 폭으로 줄바꿈을 유발하지 않는다.
- [ ] 다단 헤더에서 그룹 헤더 폭이 리프 컬럼 합과 일치한다.

## 장애 패턴 요약
- 증상: 그리드 스크롤바 없음 + 페이지 전체 스크롤
  - 원인: 부모 flex 체인 `min-height: 0` 누락, 높이 제약 누락
- 증상: ActionBar 2줄/깨짐
  - 원인: 텍스트 버튼 폭 과다, 라벨 길이/개수 과다, 화면 폭 대비 우측 액션 과밀
