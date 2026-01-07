import { useState, useEffect, useRef } from 'react';
import type { CellEditValidationResult } from '../../types';
import styles from './EditableCell.module.css';

export interface EditableCellProps {
  value: any;
  editType?: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  editOptions?: Array<{ label: string; value: any }>;
  editValidator?: (value: any) => CellEditValidationResult | boolean;
  editPlaceholder?: string;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export function EditableCell({
  value: initialValue,
  editType = 'text',
  editOptions,
  editValidator,
  editPlaceholder,
  onSave,
  onCancel,
}: EditableCellProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement && editType !== 'checkbox') {
        inputRef.current.select();
      }
    }
  }, [editType]);

  const validate = (val: any): boolean => {
    if (!editValidator) return true;

    const result = editValidator(val);
    
    if (typeof result === 'boolean') {
      if (!result) {
        setError('Invalid value');
      }
      return result;
    }

    if (!result.valid) {
      setError(result.error || 'Invalid value');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    setError(null);
    
    if (validate(value)) {
      onSave(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editType !== 'select') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Delay to allow click on other elements
    setTimeout(() => {
      handleSave();
    }, 200);
  };

  const renderInput = () => {
    switch (editType) {
      case 'text':
      case 'number':
      case 'date':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={editType}
            className={styles.input}
            value={value ?? ''}
            onChange={(e) => setValue(editType === 'number' ? Number(e.target.value) : e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={editPlaceholder}
          />
        );

      case 'checkbox':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="checkbox"
            className={styles.checkbox}
            checked={Boolean(value)}
            onChange={(e) => {
              setValue(e.target.checked);
              // Auto-save for checkbox
              setTimeout(() => {
                if (validate(e.target.checked)) {
                  onSave(e.target.checked);
                }
              }, 0);
            }}
            onKeyDown={handleKeyDown}
          />
        );

      case 'select':
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            className={styles.select}
            value={value ?? ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(newValue);
              // Auto-save for select
              setTimeout(() => {
                if (validate(newValue)) {
                  onSave(newValue);
                }
              }, 0);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          >
            {editOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {renderInput()}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
