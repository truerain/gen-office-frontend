<!-- packages/gen-datagrid/docs/architecture/gate-3-architecture.md
Documents the Gate 3 range selection architecture for GenDataGrid.
-->

# GenDataGrid Gate 3 Architecture

용어 기준: Active Cell, Selected Cell, Range Selection, Anchor Cell, Focus Cell, Copy Selection은 `../reference/terminology.md`를 따른다.

This document describes the current Gate 3 range selection and clipboard slice. Plain-text paste application was added in Gate 4.2; paste-to-selection remains deferred.

## Component Relationship

```mermaid
flowchart TD
  Root["DataGridRoot<br/>root-level event delegation"]
  Hook["useRangeSelection<br/>mouse range state"]
  Model["rangeSelection<br/>coordinate helpers"]
  Body["DataGridBody<br/>selected state calculation"]
  Cell["DataGridCell<br/>selected DOM marker"]
  Css["index.css<br/>selected cell style"]
  Selectors["selectors<br/>root boundary contract"]
  Clipboard["useClipboardActions<br/>copy command"]
  ClipboardModel["clipboard<br/>matrix + serialization"]
  Handle["GenDataGridHandle<br/>imperative actions"]

  Root --> Hook
  Hook --> Selectors
  Hook --> Model
  Root --> Clipboard
  Root --> Handle
  Clipboard --> ClipboardModel
  ClipboardModel --> Model
  Root --> Body
  Body --> Model
  Body --> Cell
  Cell --> Css
```

## Clipboard Copy Flow

```mermaid
flowchart LR
  Key["Ctrl/Cmd+C<br/>Shift includes header"]
  Root["DataGridRoot"]
  Action["useClipboardActions.copySelection"]
  Matrix["buildClipboardMatrix"]
  Serialize["serializeClipboardMatrix"]
  Clipboard["navigator.clipboard.writeText"]

  Key --> Root
  Root --> Action
  Action --> Matrix
  Matrix --> Serialize
  Serialize --> Clipboard
```

## Selection Data Flow

```mermaid
flowchart LR
  MouseDown["mousedown on body cell"]
  Coord["resolve cell coord<br/>root-scoped"]
  Anchor["selection anchor"]
  MouseOver["mouseover body cell while dragging"]
  Focus["selection focus"]
  Ranges["selections[]"]
  Body["DataGridBody"]
  Check["isCellInRangeSelection"]
  Marker["data-selected-cell"]

  MouseDown --> Coord
  Coord --> Anchor
  Anchor --> Ranges
  Anchor --> MouseOver
  MouseOver --> Focus
  Focus --> Ranges
  Ranges --> Body
  Body --> Check
  Check --> Marker
```

## Interaction Flow

```mermaid
sequenceDiagram
  participant User
  participant Root as DataGridRoot
  participant Hook as useRangeSelection
  participant Body as DataGridBody
  participant Cell as DataGridCell

  User->>Root: mouseDown on body cell
  Root->>Hook: handleMouseDown(event)
  Hook->>Hook: ignore non-left button / interactive descendants / foreign roots
  Hook->>Hook: replace, extend, or append range
  User->>Root: mouseOver another body cell
  Root->>Hook: handleMouseOver(event)
  Hook->>Hook: update focus
  Root->>Body: pass rangeSelection
  Body->>Cell: pass isSelected
  Cell->>Cell: render data-selected-cell
  User->>Window: mouseUp
  Hook->>Hook: stop drag tracking
```

## Current Boundaries

- Range selection starts only from body cells inside the current grid root.
- Interactive descendants such as `input`, `select`, `textarea`, `button`, and `contenteditable` do not start range selection.
- Selection supports controlled and uncontrolled state through `selectedRanges`, `defaultSelectedRanges`, and `onSelectedRangesChange`.
- Normal mouse selection replaces existing ranges.
- Shift selection extends the last range from its anchor.
- `Shift` keyboard navigation extends the last range from its anchor while moving `activeCell`.
- Ctrl/Meta selection appends a separate range.
- Selection rendering uses per-cell `data-selected-cell="true"` markers.
- Active cell state remains separate from range selection state.
- `Ctrl/Cmd+C` copies the current focused grid selection.
- `Shift+Ctrl/Cmd+C` includes visible column headers in copied text.
- `Escape`, root empty area click, and `clearSelection()` clear selected ranges.
- Plain-text paste application (Gate 4.2) via root-level `paste` and `pasteOptions`.

## Implemented State Surface

- `GenDataGridRangeSelections`
- `selectedRanges`
- `defaultSelectedRanges`
- `onSelectedRangesChange`
- `selection.anchor`
- `selection.focus`
- multiple internal ranges for Ctrl/Meta additive selection
- `data-selected-cell` DOM marker
- `enableRangeSelection`
- `enableClipboard`
- `clipboardOptions.includeHeader`
- `GenDataGridHandle.rootElement`
- `GenDataGridHandle.clearSelection()`
- `GenDataGridHandle.copySelection(options)`

## Deferred Features

- Paste-to-selection and paste type coercion
- Selection overlay for complex pinned/virtualized layouts
