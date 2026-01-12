## @gen-office/utils 도메인 정의(확정)

### 책임(OK)
- className 조합(cn)
- date/number formatting
- validation (email/phone/range 등)
- (추가 예정) tiny pure functions: object/path/safe-parse 정도까지

#### 금지(NOT OK)
- React import / JSX / hooks
- UI 컴포넌트 의존
- theme/design-tokens 의존
- API client / fetch / query 같은 “데이터 레이어”
- 브라우저 전용(예: window/localStorage 직접 접근) 유틸

