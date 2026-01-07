// apps/demo/src/components/FilterBar/SearchInput.tsx
import { Input } from '@gen-office/ui';
import { Search } from 'lucide-react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  /** 현재 검색어 */
  value: string;
  /** 검색어 변경 핸들러 */
  onChange: (value: string) => void;
  /** placeholder 텍스트 */
  placeholder?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 검색 아이콘이 포함된 검색 입력 필드
 */
export function SearchInput({ 
  value, 
  onChange, 
  placeholder = '검색...',
  className 
}: SearchInputProps) {
  return (
    <div className={`${styles.searchWrapper} ${className || ''}`}>
      <Search size={16} className={styles.searchIcon} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
}

export default SearchInput;