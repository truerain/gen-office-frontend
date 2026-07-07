# UI 구현 로그

## 2026-07-07

### MaskedInput 컴포넌트 구현

- 고정 패턴 mask 입력을 위한 `MaskedInput` composed 컴포넌트를 추가했습니다.
- `0`, `A`, `*` 기본 토큰을 지원하는 경량 mask 엔진과 `onValueChange` API를 구현했습니다.
- Storybook 예제와 UI 패키지 export를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/MaskedInput/*`, `packages/ui/src/index.ts`, `packages/ui/docs/implementation-log.md`

## 2026-07-05

### MaskedInput 구현 계획 문서 추가

- `packages/ui`에 mask 입력을 공통 컴포넌트로 추가하기 위한 계획 문서를 작성했습니다.
- 기존 `Input`에 mask prop을 직접 추가하지 않고 `composed/MaskedInput`으로 분리하는 방향을 기록했습니다.
- API 초안, mask 엔진 선택지, GenDataGrid 연계 방향, 테스트 계획을 정리했습니다.
- 관련 파일: `packages/ui/docs/masked-input-plan.md`, `packages/ui/docs/implementation-log.md`

## 2026-06-15

### 로그 관리 시작

- 패키지 구현 로그를 생성했습니다.
- 앞으로 이 패키지의 소스, API, 동작, 문서 변경 사항은 이 파일에 기록합니다.
