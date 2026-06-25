<!-- apps/showcase/docs/plan/04-nexacro-comparison.md
Compares Nexacro with GenOffice for PM-facing sales conversations.
-->

# 04. Nexacro 대비 비교

PM·발주처 IT 미팅에서 사용하는 **기능·운영·TCO** 비교 기준입니다. Showcase `/compare/nexacro` 페이지의 정본 콘텐츠로 사용합니다.

## 1. PM mental model 매핑

Nexacro SI 프로젝트에서 PM과 현업이 익숙한 개념과 GenOffice 대응 관계입니다.

| Nexacro에서 익숙한 것 | PM·현업 질문 | GenOffice | Showcase 시연 |
| --- | --- | --- | --- |
| WorkFrame / MDI | 여러 화면 동시 작업? | `@gen-office/mdi` | 탭 전환, 상태 유지 |
| Grid + Dataset | 그리드 CRUD? | `@gen-office/gen-grid-crud` | 사용자관리 |
| Form + Bind | 검색·입력·팝업? | `@gen-office/ui` | SimpleFilterBar, PopupInput |
| 메뉴·권한 | 역할별 메뉴? | DB `app_menus` + admin 화면 | Menu, Role, UserRole |
| 공통코드 | 코드表? | LkupManagement | 공통코드관리 |
| 다국어 | 메시지表? | i18n + MessageManagement | KO/EN 전환 |
| Excel | Export/Import? | GenGrid export, upload template | 사용자관리 Export |
| Chart | 그리드 연동? | `@gen-office/gen-grid-chart` | CO 실적 Range chart |
| Report (OZ 등) | 인쇄·리포트? | Phase 2 (연동 아키텍처) | 슬라이드·로드맵 |
| Runtime / ActiveX | 설치·브라우저? | **브라우저만**, Vite SPA | 랜딩 Hook |

## 2. 기능 비교표 (Showcase용)

| 영역 | Nexacro (일반적 SI) | GenOffice | 비고 |
| --- | --- | --- | --- |
| **클라이언트** | 전용 Runtime, ActiveX 이력 | 표준 브라우저 SPA | GenOffice 강점 |
| **언어** | JavaScript (Nexacro Script) | TypeScript + React | 인력·도구 생태계 |
| **UI 패턴** | Form, Grid, MDI | MDI, GenGridCrud, FilterBar | Reference로 시연 |
| **데이터 바인딩** | Dataset | React Query + Grid state | 패턴 다름, 결과 유사 |
| **메뉴** | XML/DB 혼용 | DB 기반 + `execComponent` | `DATA_DRIVEN_MENU` |
| **권한** | 커스텀 | Role, Menu, UserRole admin | Reference 제공 |
| **다국어** | 다국어 리소스 | i18next + 메시지 관리 | Reference 제공 |
| **Excel** | 내장 Export/Import | Grid export, template | Import는 화면별 확장 |
| **차트** | Basic / 연동 | gen-chart, gen-grid-chart | CO 실적 시연 |
| **디자이너** | Form Designer | 코드 + Storybook | Gap — 로드맵 명시 |
| **리포트** | OZ/Crownix 연동 多 | Excel·Chart 중심 | Gap — Phase 2 |
| **배치 UI** | 별도 화면 多 | admin CRUD 위주 | 백엔드·별도 모듈 |

## 3. TCO·운영 비교 (정성)

PM이 ROI 슬라이드에 넣을 ** talking points**입니다. 수치는 프로젝트별 placeholder.

| 항목 | Nexacro | GenOffice |
| --- | --- | --- |
| **클라이언트 배포** | Runtime 배포·버전 관리 | 정적 빌드 + CDN |
| **브라우저** | 제약·호환 이슈 이력 | Chromium 계열 표준 |
| **라이선스** | Runtime·Studio (발주처 정책 따름) | 오픈 스택 + 자체 IP (패키지) |
| **인력** | Nexacro 전문 인력 축소 | React/TS SI 인력 pool |
| **유지보수** | Form/XML + Script | TS 컴포넌트, 패키지 업그레이드 |
| **보안** | Runtime 공격면 | HTTPS, CSRF, 세션 (백엔드 연동) |

## 4. 설득 narrative (안전한 표현)

### 권장

- “업무 백오피스 **핵심 패턴(MDI, CRUD, 권한, 메뉴)** 은 Reference App으로 즉시 제공합니다.”
- “Nexacro Grid+Dataset에 해당하는 **GenGridCrud** 패턴으로 화면 개발을 표준화합니다.”
- “Runtime 제거로 **브라우저만**으로 배포·운영합니다.”
- “나머지 특수 화면은 **표준 React**로 확장하며, 벤더 lock-in을 줄입니다.”

### 지양

- “Nexacro 100% 대체 가능”
- “Form Designer와 동일”
- “모든 리포트·배치 UI 포함”

## 5. 자주 받는 질문 (FAQ)

| 질문 | 답변 방향 |
| --- | --- |
| Grid 성능은? | CO 실적 2,000행+ 시연, 가상 스크롤·필터 |
| AS-IS 화면 그대로? | 화면 단위 전환, UX 개선 기회, `/migration` 로드맵 |
| 개발 생산성? | CRUD·MDI·admin Reference, Storybook, monorepo 재사용 |
| Form Designer 없으면? | 표준 CRUD 템플릿 + 코드; 80% 단축 narrative |
| OZ 리포트는? | Phase 2 연동 또는 기존 리포트 서버 API 연동 |
| 보안 인증? | 세션·CSRF·권한 admin; 발주처 SSO는 프로젝트 연동 |

## 6. Showcase 페이지 구성 (`/compare/nexacro`)

1. Hero — “Runtime은 걷고, 업무 패턴은 유지”
2. 기능 매핑 표 (§1)
3. TCO bullet (§3)
4. FAQ accordion (§5)
5. CTA — 시나리오 A 체험
