# Theme 구현 로그

## 2026-08-05

### grid-cell-bg-focus 라이트 테마 가시성 조정

- 라이트 테마에서 `--grid-cell-bg-focus`가 `--grid-cell-bg`와 같아 active row / active cell 배경이 보이지 않았다.
- hover(8%) / selected(14%) 사이 계층을 유지하며 brand 18% `color-mix`로 변경했다.
- 관련 파일: src/styles/tokens/components/grid.css

## 2026-06-15

### 로그 관리 시작

- 패키지 구현 로그를 생성했습니다.
- 앞으로 이 패키지의 소스, API, 동작, 문서 변경 사항은 이 파일에 기록합니다.
