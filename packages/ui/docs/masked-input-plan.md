<!-- packages/ui/docs/masked-input-plan.md
Documents the implementation plan and API direction for the UI MaskedInput component.
-->

# MaskedInput 구현 계획

## 목적

`MaskedInput`은 전화번호, 사업자번호, 우편번호, 카드번호, 날짜처럼 고정된 입력 형식이 필요한 필드를 위한 UI 패키지 공통 입력 컴포넌트다. 기존 `Input`은 HTML input의 기본 동작과 라벨, helper text, prefix/suffix, clear 동작을 제공하고, mask 동작은 별도 composed 컴포넌트로 분리한다.

이 분리는 `Input`을 가볍게 유지하면서도 GenDataGrid, CRUD form, 검색 조건 영역에서 같은 mask 입력 규칙을 재사용하기 위한 것이다.

## 패키지 경계

- 위치: `packages/ui/src/composed/MaskedInput`
- 의존 방향: `packages/ui` 내부에서 기존 `core/Input`을 조합한다.
- `Input`에 `mask` prop을 직접 추가하지 않는다.
- `MaskedInput`은 domain-neutral 컴포넌트로 유지한다.
- 주민등록번호, 계좌번호 같은 민감정보 정책은 앱 또는 feature package에서 결정하고, `MaskedInput`은 입력 형식 제어만 담당한다.

## 기본 사용 예시

```tsx
<MaskedInput
  mask="000-0000-0000"
  value={phone}
  onValueChange={(next) => setPhone(next.value)}
  placeholder="010-1234-5678"
/>
```

unmask 값이 필요한 경우:

```tsx
<MaskedInput
  mask="000-0000-0000"
  value={phone}
  unmask
  onValueChange={(next) => setPhone(next.unmaskedValue)}
/>
```

## API 초안

```ts
export type MaskedInputValueChange = {
  value: string;
  unmaskedValue: string;
  completed: boolean;
};

export type MaskedInputProps = Omit<InputProps, 'onChange'> & {
  mask: string;
  value?: string;
  defaultValue?: string;
  unmask?: boolean;
  placeholderChar?: string;
  definitions?: Record<string, RegExp>;
  onValueChange?: (next: MaskedInputValueChange) => void;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};
```

### Prop 의미

| Prop | 설명 |
| --- | --- |
| `mask` | 입력 패턴. 기본 토큰은 `0` 숫자, `A` 영문, `*` 영숫자로 시작한다. |
| `value` | controlled 표시 값 또는 `unmask` 정책에 따른 입력 값. |
| `defaultValue` | uncontrolled 초기 값. |
| `unmask` | `onValueChange`에서 저장용 값을 unmasked 기준으로 다룰지 결정한다. |
| `placeholderChar` | 입력 전 자리 표시 문자. 기본값은 `_`로 검토한다. |
| `definitions` | 프로젝트별 토큰 확장. |
| `onValueChange` | mask 적용 결과를 구조화해서 전달한다. |
| `onChange` | 기존 input event 호환이 필요한 경우를 위한 escape hatch. |

## Mask 엔진 선택지

### 1. 자체 경량 엔진

- 장점: 새 dependency 없이 시작할 수 있다.
- 장점: 전화번호, 우편번호, 사업자번호처럼 단순한 고정 패턴에 충분하다.
- 비용: caret 보정, paste, 삭제, IME 조합, 모바일 입력을 직접 검증해야 한다.
- 권장 범위: MVP 또는 그리드 셀 편집처럼 단순 mask만 필요한 경우.

### 2. `react-imask` 래핑

- 장점: caret, paste, overwrite, unmask, dynamic mask 같은 입력 세부 동작을 검증된 라이브러리에 위임한다.
- 장점: 장기적으로 form, grid, popup input에서 재사용하기 좋다.
- 비용: `packages/ui`에 외부 dependency가 추가된다.
- 권장 범위: 다양한 mask와 실사용 품질이 필요한 경우.

### 3. `react-input-mask` 계열 래핑

- 장점: API가 단순하고 학습 비용이 낮다.
- 비용: React 최신 버전 호환성과 유지보수 상태를 확인해야 한다.
- 권장 범위: 단순 mask만 필요하고 라이브러리 정책을 확인한 뒤 채택할 수 있는 경우.

초기 권장은 `react-imask`를 후보로 검토하되, dependency 추가 결정 전에는 자체 경량 엔진으로 API 모양과 UX를 먼저 고정하는 것이다.

## 구현 구조

```text
packages/ui/src/composed/MaskedInput/
  MaskedInput.tsx
  MaskedInput.types.ts
  MaskedInput.module.css
  MaskedInput.stories.tsx
  maskEngine.ts
  index.ts
```

`MaskedInput.tsx`는 기존 `Input`을 조합하고, mask 계산은 `maskEngine.ts` 또는 선택한 외부 라이브러리 adapter에 격리한다. 이 구조를 유지하면 이후 자체 엔진에서 `react-imask`로 바꾸더라도 public component API 변경을 줄일 수 있다.

## 동작 기준

- controlled와 uncontrolled를 모두 지원한다.
- typing, paste, backspace, delete에서 mask 형식이 유지되어야 한다.
- `onValueChange`는 표시 값과 unmasked 값을 함께 전달한다.
- `inputMode`는 mask 정의에 따라 기본값을 정할 수 있어야 한다. 숫자 mask만 있으면 `numeric`을 기본 후보로 둔다.
- `aria-invalid`, `aria-describedby`, `label`, `helperText`, `error`, `fullWidth`, `prefixContent`, `suffix`, `clearable` 등 기존 `Input` 사용 경험을 유지한다.
- IME 입력은 mask 대상 필드가 숫자/영문 중심이라는 점을 고려하되, composition event 중 값 훼손이 없는지 테스트한다.

## GenDataGrid 연계 방향

`GenDataGrid`는 `editType: 'mask'`를 추가할 수 있지만, UI 패키지에 `MaskedInput`이 먼저 있으면 기본 editor 구현이 단순해진다.

예상 column meta:

```ts
meta: {
  editable: true,
  editType: 'mask',
  editMask: '000-0000-0000',
  editPlaceholder: '010-1234-5678',
}
```

그리드 내부 editor는 `MaskedInput`의 `onValueChange`를 `ctx.setDraftValue`와 연결하고, Enter/blur 시 `ctx.commit()`을 호출한다. 저장 값은 `editMaskUnmask` 같은 별도 옵션을 둬 표시 값과 unmasked 값 중 하나를 선택하게 한다.

## 테스트 계획

- `MaskedInput` 단위 테스트
  - 숫자 mask 입력
  - 영문/영숫자 token 입력
  - 허용되지 않는 문자 무시
  - paste 시 mask 적용
  - clear 버튼 동작
  - controlled 값 변경 반영
  - `onValueChange`의 `value`, `unmaskedValue`, `completed` 검증
- Storybook
  - Phone number
  - Business registration number
  - Zip code
  - Credit card
  - Custom alphanumeric code
  - Error/helper text
- 접근성 확인
  - label 연결
  - error state
  - keyboard 입력과 focus 유지

## 구현 순서

1. `MaskedInput` public API와 문서 확정
2. 자체 경량 `maskEngine` 또는 외부 라이브러리 채택 결정
3. `packages/ui/src/composed/MaskedInput` 컴포넌트 추가
4. Storybook 예제 추가
5. UI package export 추가
6. `packages/ui` 타입 검사와 빌드 확인
7. GenDataGrid `editType: 'mask'` 연계 설계 또는 구현

## 보류 사항

- dynamic mask 지원 여부
- locale별 전화번호 mask 정책
- 날짜 mask와 실제 calendar/date validation의 책임 분리
- unmasked 값을 `value` prop 기준으로 받을지, 항상 표시 값을 받을지
- 외부 dependency를 `dependencies`로 둘지 `peerDependencies`로 둘지
