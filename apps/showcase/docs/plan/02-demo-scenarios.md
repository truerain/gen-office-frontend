<!-- apps/showcase/docs/plan/02-demo-scenarios.md
Defines PM-facing demo scenarios and screen flows for GenOffice Showcase.
-->

# 02. PM 데모 시나리오

PM이 미팅 유형별로 선택해 사용하는 시나리오입니다. 각 시나리오는 Showcase 진입 → `apps/demo` mock 체험 → 마무리 메시지 순으로 구성합니다.

## 시나리오 요약

| ID | 이름 | 시간 | 주요 대상 | Demo 연결 |
| --- | --- | --- | --- | --- |
| A | Admin CRUD | 15분 | IT + 현업 | 사용자·권한·메뉴관리 |
| B | Finance Grid | 20분 | 현업·재무 | CO 실적·차트·Excel |
| C | Platform | 30분 | IT·아키텍처 | i18n·공통코드·공지·메뉴 DB |
| D | ROI Summary | 5분 | 경영·구매 | Showcase 정적 페이지 (PM 단독) |

---

## 시나리오 A — Admin CRUD (15분, 기본)

**스토리:** “○○그룹 통합관리시스템을 Nexacro에서 GenOffice로 전환한다면, 가장 많은 화면 패턴은 이렇게 구현합니다.”

**성공 기준:** 발주처 IT가 “Grid CRUD와 MDI는 Nexacro와 비슷하다”고 말하는 순간.

### 화면 흐름

| 순서 | 화면 | PM 멘트 (요지) | 보여줄 기능 |
| --- | --- | --- | --- |
| 1 | Showcase 랜딩 → **Guest 체험** | “별도 설치·ActiveX 없이 브라우저만으로 동작합니다.” | 원클릭 진입 |
| 2 | **MDI 워크벤치** | “업무 화면을 여러 개 열고 동시에 작업합니다. Nexacro WorkFrame과 같은 패턴입니다.” | 탭 3개 열기, 입력값·스크롤 유지 |
| 3 | **사용자관리** | “조회·추가·수정·일괄저장이 그리드 하나로 처리됩니다.” | 검색 → 행추가 → 수정 → 저장 |
| 4 | **권한·메뉴관리** | “운영자가 코드 배포 없이 메뉴와 권한을 관리할 수 있습니다.” | Role, Menu, UserRole |
| 5 | Showcase **마무리 카드** | “표준 CRUD·MDI·권한은 패키지로 제공됩니다. 프로젝트는 업무 로직에 집중합니다.” | 아키텍처 1장 + CTA |

### Demo 화면 매핑

| Demo 컴포넌트 | 메뉴 영역 | Nexacro 대응 |
| --- | --- | --- |
| `UserManagementPage` | 시스템관리 | Grid + Dataset CRUD |
| `RoleManagementPage` | 시스템관리 | 권한 그룹 관리 |
| `MenuManagementPage` | 시스템관리 | 메뉴 트리 관리 |
| `UserRoleManagementPage` | 시스템관리 | 사용자-권한 매핑 |

### 딥링크 (목표 스펙)

```text
/demo?mode=showcase&scenario=admin-crud
```

자동 오픈 탭: 사용자관리 → 권한관리 → 메뉴관리

---

## 시나리오 B — Finance Grid (20분)

**스토리:** “대용량 조회와 분석이 필요한 재무·현업 화면입니다.”

**성공 기준:** “Grid + Chart + Excel” Nexacro PM이 자주 요구하는 삼종 세트를 한 흐름에서 확인.

### 화면 흐름

| 순서 | 화면 | PM 멘트 (요지) | 보여줄 기능 |
| --- | --- | --- | --- |
| 1 | **CO 실적관리** | “복합 검색 조건과 대용량 그리드를 처리합니다.” | 필터, 2,000행+, 컬럼 접기 |
| 2 | **차트 연동** | “그리드에서 범위를 선택해 차트로 분석합니다.” | Range chart, 컨텍스트 메뉴 |
| 3 | **Excel Export** | “보고용 엑셀 다운로드가 내장되어 있습니다.” | Export, 템플릿 |
| 4 | **대시보드** | “요약 KPI 화면도 같은 프레임워크로 구성합니다.” | Dashboard demo |

### Demo 화면 매핑

| Demo 컴포넌트 | Nexacro 대응 |
| --- | --- |
| `CoActualsPage` | Grid + Bind + 대용량 Dataset |
| `ChartDemoPage` / Range chart | Chart 연동 |
| `DashboardDemoPage` | Dashboard / Widget |

### 딥링크

```text
/demo?mode=showcase&scenario=finance-grid
```

---

## 시나리오 C — Platform (30분)

**스토리:** “운영 가능한 enterprise 프레임워크입니다. 인증·메뉴·다국어·공통코드가 Reference로 제공됩니다.”

**대상:** 발주처 IT, 아키텍처 검토 미팅.

### 화면 흐름

| 순서 | 주제 | Showcase / Demo |
| --- | --- | --- |
| 1 | **인증·세션** | Login → 세션 만료 → CSRF (mock) |
| 2 | **메뉴 DB 연동** | `app_menus`, 권한별 필터 (`DATA_DRIVEN_MENU`) |
| 3 | **다국어** | KO/EN 전환, `MessageManagementPage` |
| 4 | **공통코드·공지** | `LkupManagementPage`, `NoticeManagementPage` |
| 5 | **기술 스택** | Showcase 정적: React 18, TS, Vite, 패키지 경계 |
| 6 | **마이그레이션** | Showcase 정적: 화면 단위 전환 로드맵 |

### Demo 화면 매핑

| Demo 컴포넌트 | 운영 기능 |
| --- | --- |
| `LkupManagementPage` | 공통코드 |
| `MessageManagementPage` | 다국어 메시지 |
| `NoticeManagementPage` | 공지 |
| `MenuManagementPage` | 메뉴 DB |

### 딥링크

```text
/demo?mode=showcase&scenario=platform
```

---

## 시나리오 D — ROI Summary (5분, PM 단독)

**스토리:** 경영·구매 브리핑용. 인터랙티브 최소, Showcase 정적 페이지.

### 포함 내용

- Nexacro: 런타ime·라이선스·브라우저 제약·인력 pool 축소
- GenOffice: 웹 표준, 오픈 생태계, 컴포넌트 재사용 → 화면당 개발일 단축
- 리스크 완화: Reference App + 표준 CRUD 패키지
- **수치 placeholder:** PM이 프로젝트별로 입력 (라이선스 절감, 전환 기간 등)

Showcase URL:

```text
/showcase/migration
/showcase/compare/nexacro
```

---

## PM 체크리스트 (미팅 전)

- [ ] mock-only 배포 URL 확인 (VPN·백엔드 불필요)
- [ ] 시나리오 URL 북마크 (A/B/C 중 1개)
- [ ] 브라우저: Chrome/Edge 최신, 시크릿 창 테스트
- [ ] 다크/라이트 모드 전환 1회 리허설 (TitleBar)
- [ ] Nexacro 비교표 PDF 또는 `/compare/nexacro` 탭 준비
- [ ] 발주처명 placeholder 슬라이드 (white-label lite, Phase 3)

## PM 체크리스트 (미팅 중)

- [ ] 로그인 없이 Guest 진입
- [ ] MDI 탭 2개 이상 열어 상태 유지 시연
- [ ] CRUD: 검색 → 추가 → 수정 → 저장 1회 완료
- [ ] “100% 동일” 대신 “핵심 80% Reference + 표준 React” 메시지 유지
- [ ] Gap 질문 시 `04-nexacro-comparison.md`, `06-gaps-and-roadmap.md` 기준으로 답변
