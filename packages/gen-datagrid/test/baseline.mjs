// packages/gen-datagrid/test/baseline.mjs
// Verifies the GenDataGrid baseline export and DOM contract.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { GenDataGrid } from '../dist/index.mjs';

const requiredProps = {
  data: [
    { id: '1', name: 'Ada', age: 37 },
    { id: '2', name: 'Grace', age: 41 },
  ],
  columns: [
    { accessorKey: 'name', header: 'Name', size: 120 },
    { accessorKey: 'age', header: 'Age', size: 80 },
  ],
  getRowId: (row, index) => String(index),
};

test('exports GenDataGrid component', () => {
  assert.ok(GenDataGrid);
});

test('renders the baseline div grid root contract', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      className: 'test-grid',
      style: { height: 120 },
    })
  );

  assert.match(markup, /role="grid"/);
  assert.match(markup, /data-gen-datagrid-root="true"/);
  assert.match(markup, /class="gen-datagrid test-grid"/);
  assert.match(markup, /height:120px/);
});

test('renders header and body rowgroups with scoped cell attributes', () => {
  const markup = renderToStaticMarkup(React.createElement(GenDataGrid, requiredProps));

  assert.match(markup, /role="rowgroup" data-gen-datagrid-header="true"/);
  assert.match(markup, /role="rowgroup" data-gen-datagrid-body="true"/);
  assert.match(markup, /role="columnheader"/);
  assert.match(markup, /role="gridcell"/);
  assert.match(markup, /data-gen-datagrid-cell="true"/);
  assert.match(markup, /data-rowid="0"/);
  assert.match(markup, /data-colid="name"/);
  assert.match(markup, /data-colid="age"/);
  assert.match(markup, />Ada</);
  assert.match(markup, />41</);
});

test('renders one roving tab stop for the active cell', () => {
  const markup = renderToStaticMarkup(React.createElement(GenDataGrid, requiredProps));

  const activeMatches = markup.match(/data-active-cell="true"/g) ?? [];
  const tabStopMatches = markup.match(/tabindex="0"/g) ?? [];
  const inactiveMatches = markup.match(/tabindex="-1"/g) ?? [];

  assert.equal(activeMatches.length, 1);
  assert.equal(tabStopMatches.length, 1);
  assert.equal(inactiveMatches.length, 3);
  assert.match(markup, /data-grid-id="gen-datagrid-/);
});

test('uses controlled active cell when provided', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      activeCell: { rowId: '1', columnId: 'age' },
    })
  );

  assert.match(
    markup,
    /data-rowid="1" data-colid="age" data-active-cell="true"[^>]*tabindex="0"/
  );
});

test('uses one grid template source for rendered rows', () => {
  const markup = renderToStaticMarkup(React.createElement(GenDataGrid, requiredProps));

  const rowTemplateMatches = markup.match(/grid-template-columns:120px 80px/g) ?? [];
  assert.equal(rowTemplateMatches.length, 3);
});

test('uses TanStack column order, visibility, and sizing state', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      columnOrder: ['age', 'name'],
      columnVisibility: { name: false },
      columnSizing: { age: 96 },
    })
  );

  assert.match(markup, /grid-template-columns:96px/);
  assert.match(markup, /data-colid="age"/);
  assert.doesNotMatch(markup, /data-colid="name"/);
  assert.doesNotMatch(markup, />Ada</);
  assert.match(markup, />37</);
});

test('renders pinned column markers and sticky offsets', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      columnPinning: { left: ['name'], right: ['age'] },
    })
  );

  assert.match(markup, /data-colid="name" data-pinned-cell="left"/);
  assert.match(markup, /data-colid="age" data-pinned-cell="right"/);
  assert.match(markup, /data-pinned-edge="left-end"/);
  assert.match(markup, /data-pinned-edge="right-start"/);
  assert.match(markup, /position:sticky/);
  assert.match(markup, /left:0/);
  assert.match(markup, /right:0/);
});

test('uses pinning order for rendered columns and grid template', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      columnPinning: { left: ['age', 'name'] },
    })
  );

  assert.match(markup, /grid-template-columns:80px 120px/);
  assert.match(markup, /data-colid="age" data-pinned-cell="left"/);
  assert.match(markup, /data-colid="name" data-pinned-cell="left"/);
  assert.ok(markup.indexOf('data-colid="age"') < markup.indexOf('data-colid="name"'));
});

test('renders Gate 5 header resize and reorder affordances', () => {
  const markup = renderToStaticMarkup(React.createElement(GenDataGrid, requiredProps));

  assert.match(markup, /data-resizable-column="true"/);
  assert.match(markup, /data-reorderable-column="true"/);
  assert.match(markup, /data-column-resize-handle="true"/);
  assert.match(markup, /draggable="true"/);
});

test('supports per-row height in non-virtualized rendering', () => {
  const markup = renderToStaticMarkup(
    React.createElement(GenDataGrid, {
      ...requiredProps,
      rowHeight: 36,
      getRowHeight: ({ rowId }) => (rowId === '1' ? 72 : undefined),
    })
  );

  assert.match(markup, /--gen-datagrid-current-row-height:36px/);
  assert.match(markup, /--gen-datagrid-current-row-height:72px/);
});

test('keeps cell lookup root-scoped in DOM helpers', () => {
  const cellDomSource = readFileSync('./src/core/dom/cellDom.ts', 'utf8');

  assert.match(cellDomSource, /root\.querySelector/);
  assert.doesNotMatch(cellDomSource, /document\.querySelector/);
});

test('does not render table tags in the baseline component', () => {
  const markup = renderToStaticMarkup(React.createElement(GenDataGrid, requiredProps));

  assert.doesNotMatch(markup, /<table\b/i);
  assert.doesNotMatch(markup, /<thead\b/i);
  assert.doesNotMatch(markup, /<tbody\b/i);
  assert.doesNotMatch(markup, /<tr\b/i);
  assert.doesNotMatch(markup, /<td\b/i);
  assert.doesNotMatch(markup, /<th\b/i);
});
