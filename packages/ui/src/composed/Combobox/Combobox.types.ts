export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface ComboboxProps {
  /**
   * Options to render in the dropdown.
   */
  options: ComboboxOption[];

  /**
   * Selected option value.
   */
  value?: string;

  /**
   * Called when selection changes.
   */
  onValueChange?: (value: string, option: ComboboxOption | null) => void;

  /**
   * Input text value (controlled).
   */
  inputValue?: string;

  /**
   * Called when input text changes.
   */
  onInputValueChange?: (value: string) => void;

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
}
