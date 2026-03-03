# GenGrid 엑셀 다운로드 가이드

## 목적
- GenGrid/GenGridCrud에서 엑셀 다운로드를 `프런트 생성` 또는 `백엔드 생성`으로 선택 가능하게 설계한다.
- 커스텀 렌더 셀(`renderCell`)이 있는 경우에도 안정적으로 엑셀 값을 추출한다.

## 선택 옵션 설계
엑셀 다운로드 동작을 아래 모드로 분리한다.

- `frontend`: 브라우저에서 `exceljs`로 파일 생성
- `backend`: Spring Boot API 호출 후 서버가 만든 파일 다운로드

```ts
type ExcelExportMode = 'frontend' | 'backend';

type ExcelExportOptions<TData> = {
  mode: ExcelExportMode;
  fileName?: string;
  sheetName?: string;
  backend?: {
    endpoint: string;
    method?: 'GET' | 'POST';
    // 현재 필터/정렬/선택행 등 서버 export 파라미터
    buildPayload?: () => Record<string, unknown>;
  };
  frontend?: {
    onlySelected?: boolean;
  };
};
```

## 파일명 규칙
- 권장 형식: `title_YYYYMMDD_HHmmss.xlsx`
- 예시: `UserRole_20260302_153045.xlsx`
- `title`에 파일명 금지 문자가 있으면 치환 후 사용
  - 대상 문자: `\ / : * ? " < > |`
  - 공백은 `_`로 치환 권장

## 구현 위치 (권장)
- `GenGridCrud`의 `actionBar.customActions`에서 엑셀 버튼 추가
- 버튼 클릭 시 `mode`에 따라 분기 실행

```ts
const exportOptions: ExcelExportOptions<UserRoleGridRow> = {
  mode: 'frontend', // 또는 'backend'
  fileName: 'UserRole',
  sheetName: 'UserRole',
  frontend: { onlySelected: false },
  backend: {
    endpoint: '/api/user-roles/export',
    method: 'POST',
    buildPayload: () => ({
      // 필터값/정렬값 등
    }),
  },
};
```

## 프런트 생성 방식
### 사용 조건
- 현재 화면 데이터 기준 다운로드
- 소량/중간 규모 데이터
- 빠른 구현 필요

### 기본 흐름
1. `ctx.state.viewData`를 export 대상 데이터로 선택
2. 필요 시 `ctx.state.rowSelection`으로 선택행만 필터
3. 컬럼 정의에서 헤더/값 추출
4. `exceljs`로 파일 생성 및 다운로드
5. 컬럼 `size`(width), `meta.align`(left/center/right) 반영
6. 헤더 영역(단일 헤더: 1행, 다단 헤더: 헤더 depth 전체)에 Gray 배경 + Bold 스타일 적용
7. `gridProps.getRowStyle`/`gridProps.getCellStyle`가 있으면 엑셀 셀 스타일에 매핑 적용
   - 지원: `color`, `fontWeight`, `backgroundColor`, `border`, `borderTop/Right/Bottom/Left`
   - 우선순위: Row style < Cell style

```ts
import ExcelJS from 'exceljs';

async function exportFrontend(rows: Array<Record<string, unknown>>, fileName: string, sheetName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.addRows(rows);
  // 단일 헤더는 1행, 다단 헤더는 헤더 행 범위를 반복 적용
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }, // Gray
  };
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  // a 태그 다운로드 처리
}
```

## 백엔드 생성 방식 (Spring Boot)
### 사용 조건
- 대용량 다운로드
- 조회 조건 기반 전체 데이터 다운로드
- 권한/마스킹/감사 로그가 필요한 업무 데이터

### 기본 흐름
1. 프런트에서 export API 호출
2. 서버(Spring Boot)에서 Apache POI 등으로 엑셀 생성
3. `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`로 파일 스트림 응답
4. 프런트에서 Blob 다운로드 처리

## 커스텀 렌더 셀 처리 원칙
`renderCell`은 화면 표현용(ReactNode)이므로 그대로 엑셀 값으로 사용하지 않는다.

- 권장: 컬럼 `meta.exportValue` 계약 추가
- fallback: `accessorKey`/`accessorFn` raw 값 사용

```ts
meta: {
  renderCell: ({ value }) => <GridYnSwitchCell value={value} commitValue={() => {}} />,
  exportValue: ({ row }) => (row.useYn === 'Y' ? 'Y' : 'N'),
}
```

엑셀 값 추출 우선순위:
1. `meta.exportValue`
2. `accessorKey` 값
3. `accessorFn` 결과
4. 빈 문자열

## 다단 헤더(mergeCells) 반영 방식
다단 헤더가 있는 경우 엑셀도 동일하게 다단 헤더로 출력한다.  
구현은 `exceljs`의 `mergeCells`를 사용한다.

### 구현 규칙 (기본 적용)
1. `columns` 트리를 순회해 헤더 depth(최대 레벨) 계산
2. 각 노드에 leaf span(자식 leaf 개수) 계산
3. 헤더 행을 depth만큼 생성
4. 그룹 헤더는 가로 병합
   - 예: `mergeCells(row, startCol, row, endCol)`
5. 리프 헤더는 세로 병합(하위 depth 채우기)
   - 예: `mergeCells(row, col, maxDepth, col)`
6. 병합된 헤더 범위 전체에 Gray 배경 + Bold + center 정렬 적용

즉, 단일 헤더 컬럼만 있는 경우는 1행 헤더로 출력되고, 다단 헤더 컬럼이 하나라도 있으면 그 depth에 맞는 다단 헤더가 엑셀에도 생성된다.

### 예시
```ts
// depth=2 예시
worksheet.mergeCells(1, 1, 1, 3); // "기본정보" 그룹
worksheet.getCell(1, 1).value = '기본정보';

worksheet.getCell(2, 1).value = '사번';
worksheet.getCell(2, 2).value = '이름';
worksheet.getCell(2, 3).value = '부서';
```

### 주의사항
- 시스템 컬럼(`__select__`, `__rowNumber__`, `__row_status__`)은 span 계산에서 제외
- 숨김/비표시 컬럼 정책이 있으면 merge 계산 전에 필터링
- 중복 헤더명은 내부적으로 컬럼 키를 별도 관리하고, 표시 텍스트만 헤더 셀에 사용

## 포맷 정책 통일 방안
엑셀 출력 시 화면/페이지마다 임의 포맷을 쓰지 않고, 아래 공통 규칙으로 통일한다.

### 날짜(Date) / 일시(DateTime)
- 내부값은 `Date` 또는 ISO 문자열로 유지
- 출력 규칙 예시
  - Date: `YYYY-MM-DD`
  - DateTime: `YYYY-MM-DD HH:mm:ss`
- 빈값/미정값은 `''`(빈 문자열)로 통일

### 숫자(Number)
- 가능하면 엑셀 셀 타입을 숫자로 유지(문자열 `'1,234'` 지양)
- 소수 자릿수, 음수 표기, 반올림 규칙을 전 화면 공통으로 적용
- 통화 컬럼은 통화별 자릿수 정책을 분리
  - 예: KRW 0자리, USD 2자리

### 불리언(Boolean)
- 출력 라벨을 한 가지로 통일
  - 예: `Y/N` 또는 `Yes/No` 중 하나만 선택
- 프로젝트 전체에서 동일 라벨을 사용

### 운영 권장
- 정책 문서 1개 + 공용 formatter 함수 1세트로 관리
- 프런트 export와 백엔드 export가 같은 규칙을 공유하도록 유지
- 신규 컬럼 추가 시 정책 기준으로 포맷을 먼저 확정

## 추천 운영 방식
1. 1차: `frontend` 모드로 빠르게 제공
2. 2차: 대용량/보안 요구 시 `backend` 모드 추가
3. UI는 동일한 엑셀 버튼을 유지하고 `mode`만 교체

## 체크리스트
- 시스템 컬럼(체크박스, row status, row number) 엑셀 출력 제외
- 날짜/숫자/불리언 포맷 정책 통일
- 파일명 규칙(예: `title_YYYYMMDD_HHmmss`) 적용
- 헤더 행 Gray 배경(반전) + Bold 스타일 적용
- 조건부 스타일 훅(`getRowStyle`/`getCellStyle`) 사용 시 엑셀 스타일 매핑 동작 확인
- 백엔드 모드 시 권한 검증 및 감사 로그 정책 반영



## 엔진 선택 결론
- 프런트 엔진은 `exceljs`로 통일한다.
- 이유:
  - 컬럼 `width`/`align` 반영 요구 대응
  - 향후 셀 스타일/서식 확장 여지 확보
