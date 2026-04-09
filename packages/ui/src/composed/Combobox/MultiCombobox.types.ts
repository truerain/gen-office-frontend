import type { ComboboxOption } from './Combobox.types';

export interface MultiComboboxProps {
  /**
   * Options to render in the dropdown.
   */
  options: ComboboxOption[];

  /**
   * Selected option values.
   */
  values?: string[];

  /**
   * Called when selection changes.
   */
  onValuesChange?: (values: string[], options: ComboboxOption[]) => void;

  /**
   * Placeholder for input.
   */
  placeholder?: string;

  /**
   * Message when no options match.
   */
  emptyMessage?: string;

  /**
   * Optional label for the input.
   */
  label?: string;

  /**
   * Optional helper text below the input.
   */
  helperText?: string;

  /**
   * Error state.
   */
  error?: boolean;

  /**
   * Required flag (shows asterisk).
   */
  required?: boolean;

  /**
   * Disabled state.
   */
  disabled?: boolean;

  /**
   * Show clear (x) button on hover when input has value.
   */
  clearable?: boolean;

  /**
   * Optional clear button aria-label.
   */
  clearLabel?: string;

  /**
   * Called after clear action.
   */
  onClear?: () => void;

  /**
   * Full width layout.
   */
  fullWidth?: boolean;

  /**
   * Root class.
   */
  className?: string;

  /**
   * Input class.
   */
  inputClassName?: string;

  /**
   * Dropdown list class.
   */
  listClassName?: string;

  /**
   * Open dropdown on focus.
   */
  openOnFocus?: boolean;

  /**
   * Custom filter function.
   */
  filterOptions?: (option: ComboboxOption, inputValue: string) => boolean;

  /**
   * Optional id for input.
   */
  id?: string;

  /**
   * Maximum visible option rows before scrolling.
   */
  maxVisibleItems?: number;

  /**
   * Estimated single option row height (px) used with `maxVisibleItems`.
   */
  optionItemHeight?: number;

  /**
   * Optional formatter for closed state input text.
   */
  formatDisplayValue?: (selectedOptions: ComboboxOption[]) => string;
}
