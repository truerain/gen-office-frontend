<!-- packages/gen-calendar/.docs/calendar-concept-and-plan.md
Documents the initial concept and implementation plan for GenCalendar.
-->

# GenCalendar 기본 개념 및 계획

## 목적

`@gen-office/gen-calendar`는 GenOffice 백오피스 애플리케이션에서 재사용할 수 있는 편집 가능 캘린더 기반 기능 패키지로 정의한다.

고객별 일정관리 화면 전체를 이 패키지에 넣기보다, 여러 업무 화면에서 공통으로 필요한 캘린더 렌더링, 날짜 탐색, 일정 표시, 슬롯 선택, 드래그 기반 기간 변경, 반복 일정 표현을 담당하는 기반 패키지로 시작한다.

## 패키지 경계

`gen-calendar`가 담당할 영역:

- 월간, 주간 캘린더 뷰 렌더링
- 현재 날짜와 뷰 모드 제어
- 일정 이벤트 데이터 표시
- 날짜 셀, 시간 슬롯, 이벤트 클릭 및 선택 이벤트
- 드래그를 통한 일정 이동 또는 기간 변경
- 반복 일정 규칙 표현과 기본 전개 전략
- 백오피스 화면에서 재사용 가능한 캘린더 타입과 컴포넌트

`gen-calendar`가 직접 담당하지 않을 영역:

- 고객별 일정관리 업무 정책
- 사용자, 부서, 회의실, 설비 등 도메인 리소스 관리
- 승인, 예약 확정, 권한, 알림, 외부 캘린더 연동 정책
- 서버 API 호출, 저장, 동기화, 충돌 해결
- 특정 고객 화면의 검색 조건, 상세 패널, 업무 플로우

이 경계를 유지하면 `gen-calendar`는 `gen-grid`, `gen-chart`, `mdi`처럼 백오피스 기능 단위 패키지로 남고, 고객 업무 화면은 `apps/*` 또는 별도 업무 패키지에서 조합할 수 있다.

## 1차 범위 판단

1차 범위는 단순 MVP보다 넓다. 월간/주간 뷰에 더해 편집 가능 캘린더, 드래그 기반 기간 변경, 반복 일정까지 포함하므로 “실사용 초기 버전”에 가깝다.

이 범위는 가능하지만 다음 결정과 검증 부담이 함께 생긴다.

- 주간 뷰에서 겹치는 일정 배치 규칙이 필요하다.
- 드래그 편집 후 변경 결과를 어떤 이벤트로 전달할지 정해야 한다.
- 반복 일정 원본과 반복 회차 인스턴스를 구분해야 한다.
- 반복 일정 중 특정 회차만 수정하거나 취소하는 모델이 필요할 수 있다.
- 저장, 충돌 감지, 권한 검사는 패키지 밖에서 처리하되 콜백 계약은 명확해야 한다.

## 초기 컴포넌트 모델

초기 공개 컴포넌트 후보:

```tsx
<GenCalendar
  date={date}
  view={view}
  events={events}
  editable
  onDateChange={setDate}
  onViewChange={setView}
  onEventClick={handleEventClick}
  onSlotSelect={handleSlotSelect}
  onEventMove={handleEventMove}
  onEventResize={handleEventResize}
/>
```

초기 뷰 타입:

```ts
type GenCalendarView = "month" | "week";
```

## 일정 데이터 필드 제안

```ts
type GenCalendarEventStatus =
  | "draft"
  | "confirmed"
  | "cancelled"
  | "completed";

type GenCalendarRecurrenceFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

interface GenCalendarEvent {
  id: string;
  title: string;

  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay?: boolean;
  timezone?: string;

  description?: string;
  location?: string;

  status?: GenCalendarEventStatus;
  color?: string;

  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;

  recurrence?: GenCalendarRecurrenceRule;
  recurrenceId?: string;
  originalStart?: string;

  resourceId?: string;
  ownerId?: string;
  attendeeIds?: string[];

  meta?: Record<string, unknown>;
}

interface GenCalendarRecurrenceRule {
  frequency: GenCalendarRecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[]; // 0 Sunday - 6 Saturday
  dayOfMonth?: number;
  until?: string; // ISO datetime/date
  count?: number;
  exceptions?: string[]; // skipped occurrence start dates
}
```

필드 의도:

- `start`, `end`, `allDay`, `timezone`은 월간/주간 뷰와 드래그 기간 변경의 기본 필드다.
- `editable`, `draggable`, `resizable`은 일정별 편집 가능 여부가 다를 수 있어 전역 옵션과 별도로 둔다.
- `recurrence`는 반복 일정 원본의 규칙을 표현한다.
- `recurrenceId`, `originalStart`는 반복 일정 중 특정 회차만 수정하거나 취소할 때 사용한다.
- `resourceId`, `ownerId`, `attendeeIds`는 1차 화면에서 바로 쓰지 않아도 고객 일정관리에서 자주 필요한 연결 지점이다.
- `meta`는 고객별 확장 필드를 공통 패키지 타입에 직접 섞지 않기 위한 확장 영역이다.

## 반복 일정 처리 원칙

반복 일정은 저장 모델과 표시 모델을 분리해서 본다.

- 저장 모델은 반복 원본 이벤트와 반복 규칙을 보존한다.
- 표시 모델은 현재 캘린더 범위에 포함되는 반복 회차를 전개한 이벤트 목록이다.
- `gen-calendar`는 기본 반복 전개 유틸리티를 제공할 수 있다.
- 서버가 반복 회차를 이미 전개해서 내려주는 방식도 허용한다.
- 특정 회차 수정 또는 취소는 `recurrenceId`와 `originalStart`로 원본 반복 일정과 연결한다.

이 방식은 패키지가 기본 사용성을 제공하면서도, 고객별 반복 규칙과 저장 정책을 패키지 안으로 과도하게 끌어들이지 않게 한다.

## 1차 구현 범위

포함:

- 월간 뷰
- 주간 뷰
- 오늘, 이전, 다음 날짜 탐색
- controlled `date`, `view` API
- 일정 목록 렌더링
- 날짜 셀 및 시간 슬롯 선택
- 일정 클릭
- 드래그를 통한 일정 이동
- 드래그 또는 핸들을 통한 기간 변경
- 반복 일정 규칙 타입
- 기본 반복 일정 전개 전략
- demo 또는 Storybook 예제

제외 또는 후순위:

- 일간 뷰
- 리소스 캘린더 축
- 외부 캘린더 연동
- 충돌 감지와 예약 승인 플로우
- 서버 저장 정책
- 복잡한 반복 규칙 전체 지원
- 고급 접근성 및 전체 키보드 편집

## 월간 초과 일정 처리

월간 뷰에서는 날짜 셀 높이보다 일정이 많을 수 있다. 이 경우 화면에 표시 가능한 일정 일부만 보여주고, 나머지는 `+N more` 형태의 초과 일정 액션으로 표시한다.

1차에서는 패키지가 특정 팝오버 UI를 강제하지 않는다. 대신 소비자가 업무 화면에 맞는 팝오버, 우측 상세 패널, 일간 상세 이동을 선택할 수 있도록 콜백을 제공한다.

```ts
interface GenCalendarMoreEventsClick {
  date: string;
  events: GenCalendarEvent[];
  hiddenCount: number;
}
```

```tsx
<GenCalendar onMoreEventsClick={(payload) => {}} />
```

## 구현 전략 후보

### 직접 구현

장점:

- GenOffice 디자인 토큰과 패키지 API에 맞추기 쉽다.
- 장기적으로 캘린더의 공개 API와 동작을 통제하기 좋다.
- 그리드, CRUD, MDI 등 기존 패키지와 통합 규칙을 직접 맞출 수 있다.

비용 및 리스크:

- 주간 뷰의 이벤트 겹침 배치가 복잡하다.
- 드래그 편집의 포인터 이벤트, 스냅 단위, 취소 조건을 직접 검증해야 한다.
- 반복 일정 전개까지 포함하면 날짜 연산 테스트가 필요하다.

### 외부 라이브러리 기반

장점:

- 월/주 뷰, 드래그, 리사이즈 같은 기능을 빠르게 확보할 수 있다.
- 검증된 날짜 배치 로직을 활용할 수 있다.

비용 및 리스크:

- GenOffice 스타일 시스템과 API를 자연스럽게 맞추기 어려울 수 있다.
- 라이브러리의 데이터 모델과 이벤트 정책에 종속될 수 있다.
- 패키지 크기와 의존성 정책을 별도로 검토해야 한다.

현재 1차 범위가 편집과 반복 일정을 포함하므로, 직접 구현과 외부 라이브러리 기반을 모두 비교해야 한다. 직접 구현은 장기 통제력이 좋지만 초기 비용이 크고, 외부 라이브러리는 속도가 빠르지만 패키지 API와 스타일 통제에 비용이 생긴다.

## 단계별 계획

### 0단계: 요구 정리

- 고객이 필요한 기본 뷰 확인: 월간, 주간
- 일정 데이터 최소 필드 확정
- 드래그 이동과 기간 변경의 UX 범위 확정
- 반복 일정 규칙의 1차 지원 범위 확정
- 반복 일정의 서버 저장 모델과 화면 표시 모델 분리 여부 확인

### 1단계: 패키지 골격

- `packages/gen-calendar/package.json`
- `src/index.ts`
- `src/GenCalendar.tsx`
- `src/GenCalendar.types.ts`
- `src/index.css`
- `.docs` 문서 정리
- demo 또는 Storybook 진입점

### 2단계: 날짜 및 이벤트 모델

- 월간 날짜 매트릭스 생성
- 주간 날짜 및 시간 슬롯 생성
- 이벤트 날짜 범위 정규화
- 반복 일정 타입 정의
- 현재 표시 범위 기준 반복 일정 전개

### 3단계: 월간/주간 렌더링

- 월간 셀 렌더링
- 주간 시간표 렌더링
- 이벤트를 날짜별 또는 시간 슬롯별로 배치
- 겹치는 주간 이벤트 배치 규칙 구현
- 초과 일정 표시 정책 정의

### 4단계: 편집 상호작용

- 날짜 셀 및 시간 슬롯 선택
- 일정 드래그 이동
- 일정 기간 변경
- 드래그 스냅 단위 설정
- 편집 결과 콜백 계약 정의

### 5단계: 통합 및 검증

- demo app 또는 Storybook 예제 구성
- 날짜 계산 테스트
- 반복 일정 전개 테스트
- 드래그 편집 상호작용 테스트
- 인코딩 및 문서 로그 확인

## 확정된 결정

- 반복 일정 타입은 패키지 자체 구조화 타입을 우선한다.
- RFC 5545 RRULE이나 외부 시스템 규칙이 필요할 때는 `gen-calendar` 내부 모델을 직접 바꾸기보다 중간 변환 레이어를 둔다.
- 드래그 편집의 기본 스냅 단위는 30분으로 한다.
- 주간 뷰는 24시간 전체를 기본 시간 범위로 표시한다.
- 구현 전략은 자체 구현을 우선한다.
- 월간 뷰의 초과 일정 클릭은 패키지가 기본 팝오버를 강제하지 않고 `onMoreEventsClick` 콜백을 우선 제공한다.

## 남은 결정

- 패키지 이름을 `gen-calendar`로 확정할지
- 문서 디렉터리를 `.docs`로 유지할지, 기존 관례처럼 `docs`로 둘지
- 고객 일정관리 화면을 demo app에 먼저 만들지, 별도 앱 또는 업무 패키지로 둘지
- 월간 초과 일정 콜백 이후의 기본 예제를 팝오버, 우측 패널, 일간 이동 중 무엇으로 보여줄지

