// packages/gen-datagrid/test/builtinEditorKeyboard.test.ts
// Verifies Gate 4.1-c built-in editor keyboard ownership helpers.

import { describe, expect, it, vi } from 'vitest';

import {
  delegatesArrowKeysToGrid,
  handleBuiltinEditorArrowNavigation,
  handleBuiltinEditorKeyDown,
} from '../src/features/editing/builtinEditorKeyboard';

describe('builtinEditorKeyboard', () => {
  it('delegates Arrow keys to the grid for text-like and checkbox editors', () => {
    expect(delegatesArrowKeysToGrid('text')).toBe(true);
    expect(delegatesArrowKeysToGrid('number')).toBe(true);
    expect(delegatesArrowKeysToGrid('date')).toBe(true);
    expect(delegatesArrowKeysToGrid('checkbox')).toBe(true);
    expect(delegatesArrowKeysToGrid(undefined)).toBe(true);
  });

  it('keeps Arrow keys editor-local for textarea and select editors', () => {
    expect(delegatesArrowKeysToGrid('textarea')).toBe(false);
    expect(delegatesArrowKeysToGrid('select')).toBe(false);
  });

  it('does not route textarea Arrow keys to grid navigation', () => {
    const arrowNavigate = vi.fn();
    const prevented = { value: false };

    handleBuiltinEditorArrowNavigation(
      {
        key: 'ArrowDown',
        preventDefault: () => {
          prevented.value = true;
        },
      } as React.KeyboardEvent<HTMLElement>,
      {
        editType: 'textarea',
        arrowNavigate,
      } as never
    );

    expect(arrowNavigate).not.toHaveBeenCalled();
    expect(prevented.value).toBe(false);
  });

  it('commits text editors on Enter but not textarea editors', () => {
    const commit = vi.fn();

    handleBuiltinEditorKeyDown(
      {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as React.KeyboardEvent<HTMLElement>,
      {
        editType: 'text',
        commit,
      } as never
    );

    handleBuiltinEditorKeyDown(
      {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as React.KeyboardEvent<HTMLElement>,
      {
        editType: 'textarea',
        commit,
      } as never
    );

    expect(commit).toHaveBeenCalledTimes(1);
  });
});
