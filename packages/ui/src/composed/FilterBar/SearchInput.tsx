// packages/ui/src/composed/FilterBar/SearchInput.tsx
import { Input } from '../../core/Input';
import { Search } from 'lucide-react';
import styles from './SearchInput.module.css';

export interface SearchInputProps {
  /** current search value */
  value: string;
  /** change handler */
  onChange: (value: string) => void;
  /** placeholder text */
  placeholder?: string;
  /** extra class */
  className?: string;
}

/**
 * Search input with icon
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search..',
  className,
}: SearchInputProps) {
  return (
    <div className={`${styles.searchWrapper} ${className || ''}`}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        prefixContent={<Search size={16} className={styles.searchIcon} />}
        clearable
      />
    </div>
  );
}

export default SearchInput;
