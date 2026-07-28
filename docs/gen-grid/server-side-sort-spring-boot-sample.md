<!-- docs/gen-grid/server-side-sort-spring-boot-sample.md
Spring Boot sample for safely applying GenGridCrud formatServerSortQuery results.
-->

# Server-Side Sort — Spring Boot 샘플

프론트엔드 `formatServerSortQuery(sorting)` 결과 예:

```text
name:asc,score:desc
```

이 값은 **SQL이 아니라** API 정렬 스펙입니다.  
Spring Boot에서 **화이트리스트 검증 후** `Pageable`/`Sort`로 변환하는 예제입니다.

관련: `docs/gen-grid/server-side-sort-architecture.md`

---

## 1. API 계약 (예시)

```http
GET /api/users?page=0&size=25&sort=name:asc,score:desc
```

| 파라미터 | 설명 |
|----------|------|
| `page` | 0-based page index |
| `size` | page size |
| `sort` | `field:asc|desc`를 쉼표로 연결 (없으면 서버 기본 정렬) |

형식 규칙:

- 토큰: `{field}:{asc|desc}`
- 구분자: `,` (공백 없음 권장; 파서는 trim 허용)
- SQL `ORDER BY` 문법과 의도적으로 다름

---

## 2. 화이트리스트 + 파서

```java
package com.example.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ServerSortParser {

  /** API sort field → JPA entity property */
  private static final Map<String, String> ALLOWED_FIELDS = Map.of(
      "name", "name",
      "department", "department",
      "region", "region",
      "status", "status",
      "score", "score",
      "created_at", "createdAt"
  );

  private static final Set<String> ALLOWED_DIRECTIONS = Set.of("asc", "desc");

  private ServerSortParser() {}

  /**
   * @param sortQuery e.g. "name:asc,score:desc" (nullable/blank → empty Sort)
   */
  public static Sort parse(String sortQuery) {
    if (sortQuery == null || sortQuery.isBlank()) {
      return Sort.unsorted();
    }

    List<Sort.Order> orders = new ArrayList<>();
    String[] parts = sortQuery.split(",");

    for (String raw : parts) {
      String token = raw.trim();
      if (token.isEmpty()) {
        continue;
      }

      int colon = token.indexOf(':');
      if (colon <= 0 || colon == token.length() - 1) {
        throw badRequest("Invalid sort token: " + token);
      }

      String fieldKey = token.substring(0, colon).trim();
      String direction = token.substring(colon + 1).trim().toLowerCase(Locale.ROOT);

      // Reject SQL-looking tokens early (defense in depth).
      if (fieldKey.contains(" ") || fieldKey.contains(";") || fieldKey.contains("--")) {
        throw badRequest("Sort field not allowed: " + fieldKey);
      }

      String entityProperty = ALLOWED_FIELDS.get(fieldKey);
      if (entityProperty == null) {
        throw badRequest("Sort field not allowed: " + fieldKey);
      }
      if (!ALLOWED_DIRECTIONS.contains(direction)) {
        throw badRequest("Sort direction not allowed: " + direction);
      }

      orders.add(
          "desc".equals(direction)
              ? Sort.Order.desc(entityProperty)
              : Sort.Order.asc(entityProperty)
      );
    }

    return orders.isEmpty() ? Sort.unsorted() : Sort.by(orders);
  }

  private static ResponseStatusException badRequest(String message) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }
}
```

핵심:

- SQL 문자열 concat 없음
- `field:dir` 스펙만 파싱
- 허용 필드·방향만 `Sort.Order`로 변환

---

## 3. Controller

```java
package com.example.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public Page<UserResponse> list(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "25") int size,
      @RequestParam(required = false) String sort
  ) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), 100);

    Sort springSort = ServerSortParser.parse(sort);
    if (springSort.isUnsorted()) {
      springSort = Sort.by(Sort.Order.asc("name"));
    }

    Pageable pageable = PageRequest.of(safePage, safeSize, springSort);
    return userService.findAll(pageable);
  }
}
```

---

## 4. Service / Repository (요약)

```java
public interface UserRepository extends JpaRepository<UserEntity, Long> {
}

@Service
public class UserService {
  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public Page<UserResponse> findAll(Pageable pageable) {
    return userRepository.findAll(pageable).map(UserResponse::from);
  }
}
```

---

## 5. 프론트 연동 예

```ts
import { formatServerSortQuery, type ServerSortingState } from '@gen-office/gen-grid-crud';

async function fetchUsers(args: {
  pageIndex: number;
  pageSize: number;
  sorting: ServerSortingState;
}) {
  const params = new URLSearchParams({
    page: String(args.pageIndex),
    size: String(args.pageSize),
  });

  const sort = formatServerSortQuery(args.sorting);
  // e.g. "name:asc,score:desc"
  if (sort) params.set('sort', sort);

  const res = await fetch(`/api/users?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

컬럼 id와 API 필드가 다르면:

```ts
{
  accessorKey: 'createdAt',
  header: 'Created',
  meta: { sortField: 'created_at' }, // ALLOWED_FIELDS 키와 맞출 것
}
```

---

## 6. 주의

| 하지 말 것 | 할 것 |
|------------|--------|
| `"ORDER BY " + sort` | `field:dir` 파싱 → 화이트리스트 → `Sort.by(...)` |
| `name asc` SQL 흉내 문자열을 그대로 사용 | `name:asc` API 스펙 사용 |
| size 무제한 | `size` 상한 (예: 100) |

Spring Data 기본 `?sort=name,asc` 형식과도 다릅니다.  
프론트 `formatServerSortQuery`(`field:asc,field:desc`)를 쓰면 위 파서를 쓰면 됩니다.
