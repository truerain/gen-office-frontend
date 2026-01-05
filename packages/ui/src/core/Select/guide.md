# Select 컴포넌트 가이드

## 📦 구조

```
Select/
├── Select.tsx           # 메인 컴포넌트 (170 lines)
├── Select.types.ts      # TypeScript 타입 정의 (52 lines)
├── Select.module.css    # CSS 스타일 (230 lines)
├── Select.stories.tsx   # Storybook 스토리 (290+ lines)
└── index.ts             # Export (20 lines)
```

---

## 🎯 컴포넌트 구성

Select는 **10개의 서브 컴포넌트**로 구성됩니다:

1. **Select** - Root 컨테이너
2. **SelectTrigger** - 클릭 가능한 버튼
3. **SelectValue** - 선택된 값 표시
4. **SelectContent** - 드롭다운 컨테이너
5. **SelectItem** - 개별 옵션
6. **SelectGroup** - 옵션 그룹화
7. **SelectLabel** - 그룹 라벨
8. **SelectSeparator** - 구분선
9. **SelectScrollUpButton** - 위 스크롤 버튼
10. **SelectScrollDownButton** - 아래 스크롤 버튼

---

## 💡 기본 사용법

### 가장 간단한 예제

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@gen-office/primitives';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
    <SelectItem value="3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

---

## 🎨 다양한 사용 예제

### 1. 기본값 설정

```tsx
<Select defaultValue="option2">
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### 2. Controlled (제어 컴포넌트)

```tsx
const [value, setValue] = useState('');

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### 3. 그룹화

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
    </SelectGroup>
    
    <SelectSeparator />
    
    <SelectGroup>
      <SelectLabel>Vegetables</SelectLabel>
      <SelectItem value="carrot">Carrot</SelectItem>
      <SelectItem value="potato">Potato</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### 4. 비활성화된 항목

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="red">Red</SelectItem>
    <SelectItem value="green">Green</SelectItem>
    <SelectItem value="blue" disabled>
      Blue (Out of stock)
    </SelectItem>
  </SelectContent>
</Select>
```

### 5. 전체 비활성화

```tsx
<Select disabled>
  <SelectTrigger>
    <SelectValue placeholder="Disabled" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### 6. Error 상태

```tsx
<Select>
  <SelectTrigger error>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### 7. Full Width

```tsx
<Select>
  <SelectTrigger fullWidth>
    <SelectValue placeholder="Full width select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

### 8. Form에서 사용

```tsx
<form>
  <Select name="country" required>
    <SelectTrigger fullWidth>
      <SelectValue placeholder="Select country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="kr">South Korea</SelectItem>
      <SelectItem value="us">United States</SelectItem>
      <SelectItem value="jp">Japan</SelectItem>
    </SelectContent>
  </Select>
</form>
```

### 9. Label과 Helper Text

```tsx
<div>
  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
    Country <span style={{ color: 'var(--color-status-error)' }}>*</span>
  </label>
  
  <Select name="country" required>
    <SelectTrigger fullWidth>
      <SelectValue placeholder="Select your country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="kr">South Korea</SelectItem>
      <SelectItem value="us">United States</SelectItem>
    </SelectContent>
  </Select>
  
  <span style={{ fontSize: '0.8125rem', color: 'var(--color-fg-secondary)' }}>
    Select your country of residence
  </span>
</div>
```

---

## 🎭 Lucide 아이콘

Select는 다음 Lucide 아이콘을 사용합니다:

1. **ChevronDown** - Trigger의 드롭다운 아이콘
2. **ChevronUp** - 위 스크롤 버튼
3. **Check** - 선택된 항목 표시

```tsx
// Trigger
<SelectTrigger>
  <SelectValue />
  <ChevronDown />  {/* 자동으로 추가됨 */}
</SelectTrigger>

// Item
<SelectItem value="1">
  <Check />  {/* 선택 시 자동 표시 */}
  Option 1
</SelectItem>
```

---

## 🎨 스타일 특징

### Trigger (버튼)

```css
height: 2.5rem;        /* 40px - Input과 동일 */
padding: 0 1rem;       /* 16px */
min-width: 12.5rem;    /* 200px */
border-radius: 0.375rem; /* 6px */
```

### Content (드롭다운)

```css
max-height: 24rem;     /* 384px - 스크롤 */
border-radius: 0.375rem; /* 6px */
box-shadow: 0 4px 8px rgba(0,0,0,0.1);
animation: fadeIn 0.15s; /* 부드러운 애니메이션 */
```

### Item (옵션)

```css
padding: 0.5rem 2rem;  /* 8px 32px - 체크 아이콘 공간 */
border-radius: 0.25rem; /* 4px */
```

---

## 🔍 Input vs Select 비교

| 특징 | Input | Select |
|------|-------|--------|
| **사용자 입력** | 직접 입력 | 선택만 |
| **높이** | 40px | 40px (동일) |
| **컴포넌트 수** | 1개 | 10개 |
| **Radix UI** | Label만 | Select 전체 |
| **아이콘** | 선택적 | ChevronDown 필수 |
| **드롭다운** | ❌ | ✅ |
| **그룹화** | ❌ | ✅ |

---

## ✨ Radix UI Select 특징

### 1. 완전한 접근성
- ✅ 키보드 네비게이션 (↑↓로 이동)
- ✅ 타이핑으로 검색
- ✅ 스크린리더 지원
- ✅ ARIA 속성 자동

### 2. 자동 위치 조정
- ✅ 화면 밖으로 나가지 않음
- ✅ 스크롤 자동 감지
- ✅ 방향 자동 조정

### 3. Portal 렌더링
- ✅ z-index 문제 해결
- ✅ 부모 overflow 무시
- ✅ body에 렌더링

### 4. 스크롤 버튼
- ✅ 많은 항목 시 자동 표시
- ✅ ChevronUp/Down 아이콘
- ✅ 부드러운 스크롤

---

## 🎯 사용 패턴

### 패턴 1: 간단한 선택

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### 패턴 2: 카테고리별 그룹

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Category 1</SelectLabel>
      <SelectItem value="1-1">Item 1-1</SelectItem>
      <SelectItem value="1-2">Item 1-2</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Category 2</SelectLabel>
      <SelectItem value="2-1">Item 2-1</SelectItem>
      <SelectItem value="2-2">Item 2-2</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

### 패턴 3: Form 필드

```tsx
<div className="field">
  <Label htmlFor="country" required>Country</Label>
  <Select name="country" required>
    <SelectTrigger id="country" fullWidth>
      <SelectValue placeholder="Select country" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="kr">South Korea</SelectItem>
      <SelectItem value="us">United States</SelectItem>
    </SelectContent>
  </Select>
  {error && <span className="error">{error}</span>}
</div>
```

---

## 🚀 Props 정리

### Select (Root)

- `value?: string` - 현재 값 (controlled)
- `defaultValue?: string` - 기본 값 (uncontrolled)
- `onValueChange?: (value: string) => void` - 값 변경 콜백
- `disabled?: boolean` - 비활성화
- `required?: boolean` - 필수 선택
- `name?: string` - Form 이름

### SelectTrigger

- `error?: boolean` - 에러 상태
- `fullWidth?: boolean` - 전체 너비
- `disabled?: boolean` - 비활성화

### SelectItem

- `value: string` - 항목 값 (필수)
- `disabled?: boolean` - 항목 비활성화
- `children: ReactNode` - 표시할 텍스트

### SelectContent

- `position?: 'item-aligned' | 'popper'` - 위치 모드

---

## 🎨 커스터마이징

### 너비 조절

```tsx
// Trigger 너비
<SelectTrigger style={{ width: '300px' }}>
  ...
</SelectTrigger>

// 또는 fullWidth
<SelectTrigger fullWidth>
  ...
</SelectTrigger>
```

### 최대 높이 조절

```tsx
<SelectContent style={{ maxHeight: '300px' }}>
  ...
</SelectContent>
```

---

## 💡 Best Practices

### 1. Placeholder 명확히
```tsx
<SelectValue placeholder="Select a country" />  // ✅ Good
<SelectValue placeholder="Select" />            // ⚠️ Too vague
```

### 2. Form에서는 name 필수
```tsx
<Select name="country" required>  // ✅ Good
  ...
</Select>
```

### 3. 많은 항목은 그룹화
```tsx
// 10개 이상의 항목이면 그룹화 고려
<SelectGroup>
  <SelectLabel>Category</SelectLabel>
  ...
</SelectGroup>
```

### 4. 비활성화된 항목에 이유 표시
```tsx
<SelectItem value="x" disabled>
  Premium (Upgrade required)
</SelectItem>
```
