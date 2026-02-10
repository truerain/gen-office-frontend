1. 검증 위치 설계

beforeCommit에서 저장 직전 전체 검증을 수행한다.
필드 단위 즉시 검증(입력 순간)은 컬럼 meta나 onCellEdit로 보완한다.
서버 응답 검증은 onCommitError에서 메시지/필드 오류로 연결한다.
2. 검증 대상 분리

신규 행 검증: 필수값(예: menuId) 누락, 형식, 유효범위
수정 행 검증: 변경된 값만 검증
삭제 행 검증: 참조 무결성 등 서버에서 막히는 경우 고려
3. 검증 결과 형태 표준화

beforeCommit는 true/false로 저장 진행 여부 결정
추가로 사용자에게 보여줄 메시지(알림, 토스트)를 함께 처리
필요하면 “필드별 에러” 형태로 관리해, UI에서 표시 가능하게 한다
4. 구현 흐름 예시

beforeCommit에서 changes를 순회
문제 발견 시 alert/notification 띄우고 false 리턴
통과 시 confirm 또는 true 리턴
5. 점진적 강화

1단계: 현재처럼 alert + return false
2단계: 필드별 오류 관리(예: fieldErrors 상태)
3단계: 셀/행에 직접 오류 표시
현재 코드 기준 권장 구조

beforeCommit: 전체 검증 + confirm
onCommitError: 서버 오류 메시지 알림
(추가 필요 시) onCellEdit: 즉시 피드백
필요하면 “필드별 에러 표시”까지 확장하는 구조도 잡아줄게요.