# Session & Login 구현 가이드

이 문서는 백엔드 세션 기반 인증(JSESSIONID)과 프론트 적용 방식을 정리합니다.

## 백엔드 요약

- 인증 방식: 서버 세션 기반, `JSESSIONID` 쿠키로 인증
- API 호출: fetch는 `credentials: "include"`, axios는 `withCredentials: true`
- 세션 만료 처리: `401` 또는 `440` 수신 시 로그인 화면으로 이동
- CSRF 정책: 활성화 시 토큰을 헤더에 포함(POST/PUT/DELETE 등)
- CSRF 토큰 발급: `GET /api/auth/csrf` 호출 시 쿠키에 토큰 저장
- 로그아웃 UX: `/api/auth/logout` 호출 후 클라이언트 상태 초기화 및 로그인 화면 이동

## 프론트 적용 (apps/demo)

### 1) 공통 HTTP 래퍼

파일: `apps/demo/src/shared/api/http.ts`
- 모든 fetch 요청에 `credentials: "include"` 적용
- 세션 만료(401/440) 시 핸들러 호출
- CSRF 토큰 제공자 등록 후 상태 변경 요청에 `X-CSRF-TOKEN` 헤더 자동 추가

등록 API
- `setAuthExpiredHandler(handler)`
- `setCsrfTokenProvider(provider)`

### 2) 앱 초기화 시 세션 핸들러 등록

파일: `apps/demo/src/app/App.tsx`
- `setAuthExpiredHandler` 등록
- 세션 만료 시 상태 초기화 후 로그인 화면 표시 (demo 앱은 라우팅 없이 인앱 로그인 화면 사용)
- `setCsrfTokenProvider`에 토큰 조회 함수를 주입

CSRF 토큰 조회 우선순위
1. `<meta name="csrf-token" content="...">`
2. `<meta name="x-csrf-token" content="...">`
3. 쿠키 `XSRF-TOKEN` (기본)

CSRF 토큰 초기화
- 앱 시작 시 `GET /api/auth/csrf` 호출
- 로그인 시 `ensureCsrf()`로 재확인

CSRF 기본값(백엔드)
- 쿠키 이름: `XSRF-TOKEN`
- 헤더 이름: `X-XSRF-TOKEN`

### 3) 로그아웃 호출

파일: `apps/demo/src/shared/api/auth.ts`
- `logout()` → `/api/auth/logout` 호출
- 성공 후 클라이언트 상태 초기화 + `/login` 이동

예시:
```ts
import { logout } from '@/shared/api/auth';
import { useAppStore } from '@/app/store/appStore';

const resetSession = useAppStore((state) => state.resetSession);

const handleLogout = async () => {
  await logout();
  resetSession();
  // demo 앱: 라우팅 없이 인앱 로그인 화면 표시
};
```

## 주의사항

- 세션 기반이므로 `Authorization` 헤더(Basic/Bearer)는 제거해야 합니다.
- CSRF 활성화 환경에서 `POST/PUT/DELETE`는 토큰 없이는 실패합니다.
- 로그인 화면 경로는 `/login`으로 가정했습니다. 실제 경로와 다르면 `setAuthExpiredHandler`에서 변경하세요.
