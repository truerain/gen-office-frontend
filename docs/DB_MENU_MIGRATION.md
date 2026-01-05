# DB 기반 메뉴 시스템 마이그레이션 가이드

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────┐
│                   Frontend                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  menuData (from DB) + componentRegistry (Static)   │
│           ↓                      ↓                  │
│    [Menu JSON Data]      [React Components]        │
│           ↓                      ↓                  │
│         merge via componentName                     │
│                    ↓                                │
│          Rendered Menu Items                        │
└─────────────────────────────────────────────────────┘
```

## 핵심 개념

### 1. 분리된 관심사 (Separation of Concerns)

**메뉴 데이터 (DB에 저장):**
```json
{
  "id": "customer-info",
  "label": "고객정보",
  "icon": "Users",
  "componentName": "CustomerInfoPage"
}
```

**컴포넌트 레지스트리 (코드에 유지):**
```typescript
{
  "CustomerInfoPage": CustomerInfoPage  // 실제 React 컴포넌트
}
```

### 2. 왜 이렇게 분리하나?

- **메뉴 데이터**: DB에서 동적으로 관리 (권한별 필터링, 순서 변경)
- **컴포넌트**: 코드로 관리 (빌드 타임에 번들링)

## DB 스키마

### PostgreSQL

```sql
-- 메뉴 테이블
CREATE TABLE menus (
  id VARCHAR(50) PRIMARY KEY,
  parent_id VARCHAR(50) REFERENCES menus(id),
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  component_name VARCHAR(100),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 권한별 메뉴 매핑
CREATE TABLE role_menus (
  role_id VARCHAR(50) NOT NULL,
  menu_id VARCHAR(50) NOT NULL REFERENCES menus(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, menu_id)
);

-- 인덱스
CREATE INDEX idx_menus_parent_id ON menus(parent_id);
CREATE INDEX idx_menus_order ON menus(order_index);
CREATE INDEX idx_role_menus_role_id ON role_menus(role_id);
```

### MySQL

```sql
-- 메뉴 테이블
CREATE TABLE menus (
  id VARCHAR(50) PRIMARY KEY,
  parent_id VARCHAR(50),
  label VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  component_name VARCHAR(100),
  order_index INT NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES menus(id)
);

-- 권한별 메뉴 매핑
CREATE TABLE role_menus (
  role_id VARCHAR(50) NOT NULL,
  menu_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, menu_id),
  FOREIGN KEY (menu_id) REFERENCES menus(id)
);
```

## 초기 데이터 삽입

```sql
-- 카테고리 (parent_id가 NULL)
INSERT INTO menus (id, parent_id, label, icon, component_name, order_index) VALUES
('customer', NULL, '고객관리', 'Users', NULL, 1),
('finance', NULL, '금융 및 결제', 'CreditCard', NULL, 2),
('system', NULL, '시스템관리', 'Settings', NULL, 3),
('demo', NULL, 'Demo', 'Box', NULL, 4);

-- 하위 메뉴
INSERT INTO menus (id, parent_id, label, icon, component_name, order_index) VALUES
-- 고객관리
('customer-info', 'customer', '고객정보', 'Users', 'CustomerInfoPage', 1),
('customer-service', 'customer', '고객응대', 'UserCheck', NULL, 2),
('customer-analysis', 'customer', '고객분석', 'BarChart3', NULL, 3),

-- 금융 및 결제
('payment-process', 'finance', '결제처리', 'CreditCard', NULL, 1),
('transfer', 'finance', '송금', 'Send', NULL, 2),
('subscription', 'finance', '구독관리', 'RefreshCw', NULL, 3),

-- 시스템관리
('menu-management', 'system', '메뉴관리', 'Menu', NULL, 1),
('role-management', 'system', '권한관리', 'Shield', NULL, 2),
('role-menu', 'system', '권한별 메뉴관리', 'FolderTree', NULL, 3),
('user-management', 'system', '사용자관리', 'UserCog', NULL, 4),

-- Demo
('primitives', 'demo', 'Primitives', 'Box', 'PrimitivesPage', 1),
('datagrid', 'demo', 'DataGrid', 'Grid3x3', 'DataGridPage', 2),
('mdi-demo', 'demo', 'MDI Demo', 'Layers', 'MDIPage', 3);
```

## API 엔드포인트

### GET /api/menus

**사용자의 권한에 따라 메뉴를 반환합니다.**

```typescript
// Backend (Node.js + Express)
app.get('/api/menus', async (req, res) => {
  const userId = req.user.id;
  
  // 사용자의 역할 가져오기
  const userRoles = await getUserRoles(userId);
  
  // 역할에 맞는 메뉴 가져오기
  const query = `
    SELECT DISTINCT m.*
    FROM menus m
    LEFT JOIN role_menus rm ON m.id = rm.menu_id
    WHERE m.is_active = true
      AND (rm.role_id IN (?) OR m.parent_id IS NULL)
    ORDER BY m.order_index
  `;
  
  const menus = await db.query(query, [userRoles]);
  
  // 계층 구조로 변환
  const menuTree = buildMenuTree(menus);
  
  res.json(menuTree);
});

function buildMenuTree(menus) {
  const categories = menus.filter(m => !m.parent_id);
  
  return {
    categories: categories.map(category => ({
      id: category.id,
      label: category.label,
      icon: category.icon,
      children: menus
        .filter(m => m.parent_id === category.id)
        .map(child => ({
          id: child.id,
          label: child.label,
          icon: child.icon,
          componentName: child.component_name,
        })),
    })),
  };
}
```

## Frontend 구현

### 1. API 서비스 생성

```typescript
// apps/demo/src/services/menuService.ts
import type { MenuData } from '../types/menu.types';

export const menuService = {
  /**
   * DB에서 메뉴 데이터 가져오기
   */
  async fetchMenus(): Promise<MenuData> {
    const response = await fetch('/api/menus', {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch menus');
    }
    
    return response.json();
  },
};
```

### 2. App.tsx에서 사용

```typescript
// apps/demo/src/App.tsx
import { useEffect, useState } from 'react';
import { menuService } from './services/menuService';
import { menuData as fallbackMenuData } from './mocks/menuData';

function App() {
  const [menuData, setMenuData] = useState(fallbackMenuData);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 메뉴 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const data = await menuService.fetchMenus();
        setMenuData(data);
      } catch (error) {
        console.error('Failed to load menus:', error);
        // fallback to static menu data
      } finally {
        setLoading(false);
      }
    };

    loadMenus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.app}>
      <TitleBar 
        menuData={menuData}  // ← DB에서 가져온 데이터
        onOpenPage={handleOpenPage}
        onOpenHome={handleOpenHome}
      />
      {/* ... */}
    </div>
  );
}
```

### 3. TitleBar 수정 (menuData를 props로 받기)

```typescript
// apps/demo/src/components/TitleBar.tsx
interface TitleBarProps {
  menuData: MenuData;  // ← Props로 받음
  onOpenPage: (id: string, title: string, icon: React.ReactNode) => void;
  onOpenHome?: () => void;
}

function TitleBar({ menuData, onOpenPage, onOpenHome }: TitleBarProps) {
  // menuData를 import 대신 props로 사용
  return (
    <nav>
      {menuData.categories.map((category) => (
        // ...
      ))}
    </nav>
  );
}
```

## 새 페이지 추가 프로세스

### 1. 컴포넌트 개발
```bash
apps/demo/src/pages/finance/PaymentProcessPage/
```

### 2. 컴포넌트 레지스트리에 등록
```typescript
// apps/demo/src/config/componentRegistry.ts
import PaymentProcessPage from '../pages/finance/PaymentProcessPage';

export const componentRegistry = {
  // ...
  'PaymentProcessPage': PaymentProcessPage,  // ← 추가
};
```

### 3. DB에 메뉴 추가
```sql
INSERT INTO menus (id, parent_id, label, icon, component_name, order_index) VALUES
('payment-process', 'finance', '결제처리', 'CreditCard', 'PaymentProcessPage', 1);
```

### 4. 권한 설정 (선택)
```sql
-- 관리자 역할에 메뉴 할당
INSERT INTO role_menus (role_id, menu_id) VALUES
('admin', 'payment-process');
```

### 끝! 🎉

Frontend 코드 변경 없이 DB만 수정하면 메뉴가 추가됩니다.

## 권한 기반 메뉴 필터링

```sql
-- 특정 역할의 메뉴만 조회
SELECT m.*
FROM menus m
INNER JOIN role_menus rm ON m.id = rm.menu_id
WHERE rm.role_id = 'manager'
  AND m.is_active = true
ORDER BY m.order_index;
```

## 메뉴 순서 변경

```sql
-- 드래그 앤 드롭으로 순서 변경
UPDATE menus SET order_index = 1 WHERE id = 'customer-analysis';
UPDATE menus SET order_index = 2 WHERE id = 'customer-service';
UPDATE menus SET order_index = 3 WHERE id = 'customer-info';
```

## 메뉴 활성화/비활성화

```sql
-- 특정 메뉴 숨기기
UPDATE menus SET is_active = false WHERE id = 'payment-process';

-- 다시 활성화
UPDATE menus SET is_active = true WHERE id = 'payment-process';
```

## 장점

### ✅ 동적 메뉴 관리
- DB만 수정하면 메뉴 추가/삭제/변경 가능
- Frontend 재배포 불필요

### ✅ 권한 기반 접근 제어
- 역할별로 다른 메뉴 표시
- 세밀한 접근 제어

### ✅ 유연한 구조
- 메뉴 순서 변경 쉬움
- 메뉴 활성화/비활성화 간편

### ✅ 확장성
- 무제한 메뉴 추가 가능
- 다국어 지원 쉬움 (label을 다국어 키로)

## 주의사항

### ⚠️ 컴포넌트 레지스트리 관리
- 새 페이지 추가 시 **반드시** 레지스트리에 등록
- componentName 오타 주의
- 미등록 시 플레이스홀더 표시

### ⚠️ 보안
- API에서 사용자 권한 검증 필수
- Frontend는 단순히 메뉴 숨김 (보안 아님)
- Backend에서 실제 접근 제어 구현

### ⚠️ 캐싱
- 메뉴 데이터는 자주 변경되지 않으므로 캐싱 권장
- Redis, LocalStorage 등 활용

## 마이그레이션 체크리스트

- [ ] DB 스키마 생성
- [ ] 초기 메뉴 데이터 삽입
- [ ] API 엔드포인트 구현
- [ ] menuService.ts 생성
- [ ] componentRegistry.ts 업데이트
- [ ] App.tsx에서 동적 로딩 구현
- [ ] TitleBar props 수정
- [ ] 권한 시스템 연동
- [ ] 에러 핸들링 추가
- [ ] 로딩 상태 UI 추가

## 결론

**현재 구조:**
```
menuData (Static JSON) + componentRegistry (Static)
```

**DB 마이그레이션 후:**
```
menuData (from DB API) + componentRegistry (Static)
```

메뉴 데이터만 DB로 이동하고, 컴포넌트 매핑은 코드에 유지합니다.
이를 통해 **동적 메뉴 관리**와 **코드 안전성**을 모두 확보합니다! 🎉
