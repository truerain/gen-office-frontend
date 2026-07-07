// packages/ui/src/composed/MaskedInput/MaskedInput.tsx
// Provides a fixed-pattern masked input composed from the core Input.

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEventHandler } from 'react';
import { Input } from '../../core/Input';
import type { MaskedInputProps } from './MaskedInput.types';
import {
  extractUnmaskedValue,
  formatMaskedValue,
  getCaretPositionForUnmaskedIndex,
  getDefaultInputMode,
} from './maskEngine';

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      value,
      defaultValue,
      unmask = false,
      definitions,
      inputMode,
      onChange,
      onValueChange,
      onClear,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const pendingCaretRef = useRef<number | null>(null);

    const formatValue = useMemo(
      () => (nextValue: string) => formatMaskedValue(nextValue, mask, definitions),
      [definitions, mask]
    );

    const toDisplayValue = (nextValue: string) => {
      if (unmask) {
        return formatValue(nextValue).value;
      }

      return formatValue(extractUnmaskedValue(nextValue, mask, definitions)).value;
    };

    const [uncontrolledValue, setUncontrolledValue] = useState(() =>
      toDisplayValue(defaultValue ?? '')
    );

    const isControlled = value !== undefined;
    const displayValue = isControlled ? toDisplayValue(value ?? '') : uncontrolledValue;
    const resolvedInputMode = inputMode ?? getDefaultInputMode(mask, definitions);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
      if (!inputRef.current || pendingCaretRef.current === null) {
        return;
      }

      const nextCaret = Math.min(pendingCaretRef.current, inputRef.current.value.length);
      inputRef.current.setSelectionRange(nextCaret, nextCaret);
      pendingCaretRef.current = null;
    }, [displayValue]);

    const emitValueChange = (nextDisplayValue: string) => {
      const next = formatValue(extractUnmaskedValue(nextDisplayValue, mask, definitions));
      onValueChange?.(next);
      return next;
    };

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      const selectionStart = event.target.selectionStart ?? event.target.value.length;
      const unmaskedBeforeCaret = extractUnmaskedValue(
        event.target.value.slice(0, selectionStart),
        mask,
        definitions
      ).length;
      const next = emitValueChange(event.target.value);

      pendingCaretRef.current = getCaretPositionForUnmaskedIndex(
        next.value,
        mask,
        unmaskedBeforeCaret,
        definitions
      );

      if (!isControlled) {
        setUncontrolledValue(next.value);
      }

      event.target.value = next.value;
      onChange?.(event);
    };

    const handleClear = () => {
      onClear?.();
    };

    return (
      <Input
        {...props}
        ref={inputRef}
        value={displayValue}
        inputMode={resolvedInputMode}
        onChange={handleChange}
        onClear={handleClear}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';
