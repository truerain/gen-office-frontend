# GenGridCrud Validation 표준안

본 문서는 `GenGridCrud`의 Validation 표준을 정의한다.

전제:
- 하위호환은 고려하지 않는다.
- 필드 단위 Validation은 `columns`에서 정의한다.
- 필드 단위로 표현하기 어려운 규칙은 `beforeCommit`에서 처리한다.

## 1. 책임 분리

`columns` Validation:
- 단일 필드 규칙(필수값, 길이, 포맷, 범위, 타입)
- 셀 단위 즉시 피드백

`beforeCommit` Validation:
- 행 간/전체 규칙(중복, 교차 필드, 무결성, 비동기 검증)
- 저장 직전 최종 점검

서버 Validation:
- 최종 진실은 서버
- `onCommitError`의 서버 오류를 동일 에러 모델로 매핑해 UI 반영

## 2. 저장 파이프라인

1. field validation 실행 (`columns`)
2. 실패가 있으면 저장 중단 (`beforeCommit` 미실행)
3. `beforeCommit` validation 실행
4. confirm
5. `onCommit`

## 3. 표준 에러 모델

```ts
export type CrudValidationError = {
  code: string;
  rowId?: string | number;
  field?: string;
  messageKey?: string;
  defaultMessage?: string;
};

export type CrudValidationResult =
  | { ok: true; errors: [] }
  | { ok: false; errors: CrudValidationError[] };
```

원칙:
- 메시지는 `messageKey` 우선, `defaultMessage`는 fallback
- `rowId + field`를 제공하면 셀/행 에러 하이라이트 가능

## 4. `columns` Field Validation 스키마

```ts
export type CrudFieldValidatorContext<TData> = {
  value: unknown;
  row: TData;
  rowId: string;
  columnId: string;
  isCreate: boolean;
  isUpdate: boolean;
  viewData: readonly TData[];
};

export type CrudFieldValidator<TData> =
  (ctx: CrudFieldValidatorContext<TData>) =>
    | CrudValidationError
    | null
    | Promise<CrudValidationError | null>;

export type ValidationRule<TData> =
  | { type: 'required' }
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'size'; value: number } // alias of maxLength
  | { type: 'min'; value: number }
  | { type: 'max'; value: number }
  | { type: 'pattern'; value: RegExp }
  | { type: 'oneOf'; value: readonly (string | number | boolean)[] }
  | { type: 'numeric' }
  | { type: 'alphanumeric' }
  | { type: 'email' }
  | { type: 'phone' }
  | { type: 'url' }
  | { type: 'custom'; validate: CrudFieldValidator<TData> };

export type CrudFieldValidationMeta<TData> = {
  trim?: boolean;
  validateOn?: 'change' | 'blur' | 'commit' | Array<'change' | 'blur' | 'commit'>;
  rules: readonly ValidationRule<TData>[];
};
```

## 5. Built-in Rule 정의

- `required`: `null | undefined | ''(trim 후)` 금지
- `minLength`: 문자열 길이 하한
- `maxLength`: 문자열 길이 상한
- `size`: `maxLength`와 동일 동작
- `min`: 숫자 하한
- `max`: 숫자 상한
- `pattern`: 정규식 일치
- `oneOf`: 허용 목록 포함 여부
- `numeric`: 숫자 해석 가능 여부
- `alphanumeric`: 영문/숫자만 허용
- `email`: 이메일 형식
- `phone`: 전화번호 형식
- `url`: URL 형식
- `custom`: 화면별 사용자 규칙

## 6. 엔진 동작 규칙

1. `change`/`blur`: 해당 셀만 검증
2. `commit`: dirty 셀 전체 재검증
3. 셀당 첫 에러 1건만 노출
4. 에러 키는 `${rowId}::${columnId}` 사용

권장:

```ts
type FieldErrorMap = Record<string, CrudValidationError>;
```

## 7. `beforeCommit` 규칙

- `beforeCommit`은 `CrudValidationResult` 기반으로 판단
- 실패 시 알림 후 `false` 반환
- 성공 시 confirm 결과 반환
- `create/update/delete` 각각의 문맥을 분리해 검증

## 8. 예시

```ts
meta: {
  editable: true,
  editType: 'text',
  validation: {
    trim: true,
    validateOn: ['blur', 'commit'],
    rules: [
      { type: 'required' },
      { type: 'size', value: 50 },
      { type: 'alphanumeric' },
      { type: 'custom', validate: ({ value }) => {
        if (String(value ?? '') === 'ADMIN') {
          return {
            code: 'RESERVED_WORD',
            messageKey: 'common.validation.reserved_word',
            defaultMessage: 'Reserved word.',
          };
        }
        return null;
      } },
    ],
  },
}
```
