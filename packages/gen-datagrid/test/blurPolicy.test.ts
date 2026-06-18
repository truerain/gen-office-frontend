// packages/gen-datagrid/test/blurPolicy.test.ts
// Verifies Gate 4.1-d blur ownership helpers.

import { describe, expect, it } from 'vitest';
import type * as React from 'react';

import {
  defaultBlurOwnershipForEditType,
  GEN_DATAGRID_EDITOR_SURFACE_ATTR,
  isInsideEditorSurface,
  resolveBlurOwnership,
  resolveEditingDeactivateAction,
  shouldIgnoreEditorBlur,
} from '../src/features/editing/blurPolicy';

describe('blurPolicy', () => {
  it('defaults select editors to portal blur ownership', () => {
    expect(defaultBlurOwnershipForEditType('select')).toBe('portal');
    expect(defaultBlurOwnershipForEditType('text')).toBe('inline');
  });

  it('resolves blur ownership with column and policy overrides', () => {
    expect(
      resolveBlurOwnership({
        editType: 'text',
        columnBlurOwnership: 'modal',
      })
    ).toBe('modal');

    expect(
      resolveBlurOwnership({
        editType: 'text',
        gridPolicy: { blurOwnership: 'portal' },
      })
    ).toBe('portal');
  });

  it('cancels modal-owned editors on deactivate regardless of commitOnBlur', () => {
    expect(
      resolveEditingDeactivateAction({
        commitOnBlur: true,
        blurOwnership: 'modal',
      })
    ).toBe('cancel');
  });

  it('ignores blur when focus moves into a marked editor surface', () => {
    const gridRoot = document.createElement('div');
    const input = document.createElement('input');
    const surface = document.createElement('div');
    surface.setAttribute(GEN_DATAGRID_EDITOR_SURFACE_ATTR, 'true');
    const option = document.createElement('button');
    option.type = 'button';
    option.textContent = 'Option';

    gridRoot.append(input, surface);
    surface.append(option);

    expect(
      isInsideEditorSurface(option, {
        gridRoot,
        editorSurfaces: [surface],
      })
    ).toBe(true);

    gridRoot.remove();
    surface.remove();
  });

  it('ignores inline editor blur for modal ownership', () => {
    const input = document.createElement('input');
    const target = document.createElement('button');
    document.body.append(input, target);

    const ignored = shouldIgnoreEditorBlur(
      {
        relatedTarget: target,
        currentTarget: input,
      } as unknown as React.FocusEvent<HTMLElement>,
      {
        blurOwnership: 'modal',
        gridRoot: document.createElement('div'),
        editorSurfaces: [],
      }
    );

    expect(ignored).toBe(true);

    input.remove();
    target.remove();
  });
});
