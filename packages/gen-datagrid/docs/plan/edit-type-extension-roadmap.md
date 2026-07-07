<!-- packages/gen-datagrid/docs/plan/edit-type-extension-roadmap.md
Tracks candidate GenDataGrid built-in editType extensions beyond the current MVP editors.
-->

# GenDataGrid Edit Type Extension Roadmap

## 목적

`GenDataGrid`의 built-in `editType` 확장 후보를 한 문서에서 관리한다. 이 문서는 개별 editor 구현 계획을 대체하지 않고, 어떤 editor를 built-in으로 승격할지 판단하기 위한 기준과 우선순위를 기록한다.

현재 상세 구현 계획이 있는 항목은 `mask`이며, 세부 계획은 `masked-edit-type-plan.md`를 따른다.

## 현재 built-in editType

현재 `GenDataGrid`는 다음 editor를 built-in으로 제공한다.

| editType | 분류 | 현재 정책 |
| --- | --- | --- |
| `text` | inline input | Arrow grid 이동, Enter commit |
| `number` | inline input | Arrow grid 이동, Enter commit |
| `date` | native date input | Arrow grid 이동, Enter commit, openOnEditStart best-effort |
| `select` | native select | editor-first Arrow, portal blur 기본값 |
| `textarea` | multiline input | Arrow/Enter editor-local |
| `checkbox` | boolean input | Arrow grid 이동, Enter commit |

## 확장 후보 요약

| 후보 | 우선순위 | 성격 | 상태 |
| --- | --- | --- | --- |
| `mask` | 높음 | fixed-pattern inline editor | 상세 계획 있음 |
| `dateTime` | 중간 | 날짜+시간 editor | 별도 설계 필요 |
| `combo` 또는 `richSelect` | 중간 | 검색/필터 가능한 select | 별도 설계 필요 |
| `lookup` | 중간-높음 | popup/modal 기반 참조 선택 | 별도 설계 필요 |
| `multiSelect` | 낮음-중간 | 배열 값 editor | 저장값 정책 선행 필요 |

## Built-in 승격 기준

새 editor를 built-in `editType`으로 추가하려면 다음 조건을 만족해야 한다.

- 여러 업무 화면에서 반복될 가능성이 높다.
- `renderEditor` custom 구현으로만 두면 app별 중복이 의미 있게 커진다.
- 저장값, 표시값, commit 값의 기준을 public API로 설명할 수 있다.
- keyboard ownership, blur ownership, Tab 이동, Enter/Escape 정책을 기존 editing contract 안에서 정의할 수 있다.
- Storybook과 interaction test로 핵심 동작을 검증할 수 있다.
- package boundary를 해치지 않는다. 무거운 domain engine이 필요하면 별도 feature package를 우선 검토한다.

## 후보별 검토

### mask

목적:

- 전화번호, 사업자번호, 우편번호, 카드번호처럼 고정 형식 입력이 필요한 필드를 지원한다.

권장 방향:

- `@gen-office/ui`의 `MaskedInput`을 built-in editor로 사용한다.
- `editMask`, `editMaskUnmask`, `editMaskDefinitions`를 column meta에 추가한다.
- text 계열 inline editor로 분류한다.

상세 계획:

- `masked-edit-type-plan.md`

### dateTime

목적:

- 날짜와 시간을 하나의 cell에서 입력해야 하는 업무 필드를 지원한다.

검토할 정책:

- 저장값 기준: ISO string, local datetime string, `Date`, 또는 app-controlled transform 중 무엇을 기본으로 둘지 결정해야 한다.
- editor 구현: native `input type="datetime-local"`로 시작할지, `DatePicker`와 time input 조합을 사용할지 결정해야 한다.
- timezone 정책: grid package가 timezone 변환을 소유하지 않도록 범위를 제한해야 한다.

초기 권장:

- `editType: 'dateTime'`은 가능하지만, 저장값 정책이 정해지기 전에는 custom editor 또는 app-level formatter로 유지한다.

### combo / richSelect

목적:

- option 수가 많거나 검색이 필요한 select 입력을 지원한다.

검토할 정책:

- `editOptions`와 `getEditOptions`를 재사용할지, async option source를 추가할지 결정해야 한다.
- keyboard ownership은 select보다 복잡하다. Arrow는 option navigation을 우선하고, Tab은 commit+이동을 유지해야 한다.
- popup surface가 생기면 `blurOwnership: 'portal'` 또는 editor surface 등록이 필요하다.

초기 권장:

- `combo`는 searchable inline/popup select로 정의한다.
- `richSelect`라는 이름은 AG Grid와 비슷하지만 기능 범위가 넓게 해석될 수 있으므로, 실제 범위가 검색 가능한 단일 선택이라면 `combo`가 더 명확하다.

### lookup

목적:

- 사용자, 부서, 품목, 거래처처럼 별도 목록/검색 화면에서 참조 값을 선택하는 업무 필드를 지원한다.

검토할 정책:

- `PopupInput` 또는 `ModalInput`과 연계할 수 있다.
- 저장값과 표시값을 분리해야 한다. 예: `{ id, label }`, id만 저장, label만 표시.
- popup/modal lifecycle은 `blurOwnership`, `registerEditorSurface`, `commit`, `cancel` 정책과 직접 연결된다.
- option source와 row context 기반 query parameter 설계가 필요하다.

초기 권장:

- built-in `lookup`을 바로 추가하기보다 custom editor reference implementation과 demo를 먼저 만든다.
- 반복 패턴이 안정되면 `editType: 'lookup'` 승격을 검토한다.

### multiSelect

목적:

- 하나의 cell에 여러 option 값을 배열로 저장하는 입력을 지원한다.

검토할 정책:

- 저장값 기준: 배열, delimiter string, object 배열 중 무엇을 지원할지 결정해야 한다.
- 표시값 formatting과 filter/sort behavior를 분리해야 한다.
- paste 정책이 복잡하다. delimiter paste를 배열로 파싱할지, plain string으로 둘지 결정해야 한다.
- checkbox list, token input, popup multi select 중 editor UI 범위를 정해야 한다.

초기 권장:

- 저장값 정책과 paste 정책이 정해지기 전에는 built-in 승격을 보류한다.

## 우선순위

1. `mask`
   - 업무 화면 반복 가능성이 높고, `MaskedInput` 기반 구현 준비가 되어 있다.
2. `lookup`
   - back-office 도메인에서 중요하지만 저장값/표시값 분리와 popup lifecycle 설계가 필요하다.
3. `combo`
   - `select`의 자연스러운 확장이다. option source와 keyboard 정책을 먼저 고정해야 한다.
4. `dateTime`
   - 필요성은 있지만 timezone과 저장 타입을 grid가 소유하지 않도록 주의해야 한다.
5. `multiSelect`
   - 배열 저장, 표시, paste, filter 정책이 얽혀 있어 별도 설계 후 진행한다.

## 문서화 원칙

각 editor를 구현할 때는 다음 문서를 함께 갱신한다.

- 해당 editor의 상세 계획 문서
- `reference/cell-edit-api.md`
- `reference/editor-implementation-contract.md`
- `reference/api-structure.md`
- `reference/api-comparison-with-gen-grid.md`
- `log/implementation-log.md`

demo app에서 확인할 필요가 있는 editor는 root `docs/demo/` 아래에 별도 연계 계획을 둔다.
