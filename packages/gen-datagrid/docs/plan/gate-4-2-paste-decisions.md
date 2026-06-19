<!-- packages/gen-datagrid/docs/plan/gate-4-2-paste-decisions.md
Decision table for Gate 4.2 paste application policy.
-->

# GenDataGrid Gate 4.2 Paste Decisions

Gate 4.2 adds paste application on top of the Gate 4 and Gate 4.1 editing
runtime. The main goal is to turn clipboard text into committed cell changes
without changing the existing data ownership model.

## Recommended MVP

The recommended first slice is conservative:

- Paste starts at the active cell.
- Clipboard text is parsed as a tab/newline matrix.
- Only editable destination cells receive changes.
- Each accepted cell change goes through the existing `onCellValueChange` path.
- GenDataGrid does not mutate `data` internally.
- Existing dirty-state tracking observes the emitted cell changes.
- Paste application remains synchronous and client-side.
- Paste errors are silent by default, but important grids can opt into error
  reporting and whole-paste cancellation.

## Implementation Status

Gate 4.2 MVP is implemented with the recommended policy:

- Root-level `paste` events read `event.clipboardData.getData('text/plain')`.
- Paste is ignored inside interactive editors so native input paste keeps working.
- Clipboard text is parsed through the existing plain-text grid parser.
- Paste starts at the active cell and targets current visible rows/columns.
- Read-only and non-editable cells are skipped by default.
- `pasteOptions.errorMode: 'report'` calls `pasteOptions.onError`.
- `pasteOptions.failureBehavior: 'cancelPaste'` cancels the whole paste when
  errors are present.
- Accepted cells emit the existing `onCellValueChange` event and therefore feed
  the existing dirty-state path.
- The active cell moves to the last accepted pasted cell, and the accepted target
  rectangle is selected when range selection is enabled.
- Storybook includes `Gate42ClipboardPaste` for manual paste checks with
  `skipCell` and `cancelPaste` error behavior.

## Decision Table

| Decision Point | Options | Recommendation | Reason | Deferred / Risk |
| --- | --- | --- | --- | --- |
| Paste entry trigger | `Ctrl/Cmd+V`, imperative handle, toolbar command | Start with `Ctrl/Cmd+V` only | Matches copy shortcut ownership and keeps MVP small | Handle/toolbar paste can be added after the core apply path is stable |
| Clipboard source | Browser clipboard API, paste event text, internal buffer | Use paste event `clipboardData.getData('text/plain')` | Avoids async permission prompts and works with normal browser paste | Programmatic paste through `navigator.clipboard.readText()` needs permission handling |
| Start cell | Active cell, selection anchor, selection focus | Active cell | Current grid already has a clear active-cell model | Selection-anchor paste can be added if users expect Excel-style range paste |
| Selection interaction | Ignore selection, start at selection anchor, fill selected range | Ignore selected range for MVP except preserving/refreshing selection after paste | Reduces ambiguity around multi-range and repeat-fill behavior | Range fill/repeat behavior needs separate policy |
| Matrix parsing | TSV only, CSV support, Excel-compatible parser | TSV/newline parser | Spreadsheet copy normally provides tab/newline plain text | Quoted CSV, embedded tabs/newlines, rich HTML tables are deferred |
| Destination bounds | Clip to grid bounds, expand rows, emit overflow error | Clip to existing visible row/column bounds | GenDataGrid does not own data creation yet | Row creation and paste overflow reporting need data ownership policy |
| Hidden/filtered columns | Paste into visible columns only, all columns by definition order | Visible ordered columns only | Matches rendered navigation and user-visible target cells | Pasting into hidden columns would surprise users |
| Filtered/paginated rows | Current row model only, full original data, server target | Current rendered row model | Matches current UI and TanStack row model wiring | Server/manual pagination paste needs explicit app callback |
| Non-editable cells | Skip, cancel whole paste, fail with report | Skip non-editable cells | Partial paste is more useful and respects existing editable predicates | A failure report API can be added later |
| Read-only grid | Ignore paste, warn, call failure callback | Ignore paste and return false internally | Consistent with disabled edit behavior | User-facing paste failure UX is deferred |
| Value coercion | Raw string, editType-based parsing, custom parser | Raw string for MVP, with checkbox/number/date parsing deferred | Keeps event payload predictable and avoids invalid conversion policy | Type coercion should use column meta in a later refinement |
| Select options | Accept any string, validate against options, skip invalid | Accept raw string for MVP | `onCellValueChange` consumer still owns data validation | Option validation can be added with typed paste parser |
| Event shape | One `onCellValueChange` per cell, batch callback, transaction API | Reuse `onCellValueChange` per accepted cell | Reuses dirty state and current commit contract | Batch paste callback may be needed for validation, undo, and performance |
| Dirty state | Existing dirty state, separate paste dirty state, no dirty tracking | Existing dirty state through `handleCellValueChange` | Avoids duplicate state paths | Large paste performance may require batch dirty updates |
| Active cell after paste | Stay at start, move to last pasted cell, move one row down | Move to last accepted pasted cell | Gives visible feedback and matches navigation expectations | If all cells are skipped, keep the original active cell |
| Selection after paste | Clear selection, select pasted rectangle, keep previous selection | Select accepted paste rectangle if any | Makes paste result inspectable | Sparse skipped cells make a perfect rectangle inaccurate |
| Editing state during paste | Cancel current edit, commit current edit first, paste into editor | If grid editor is active, let the editor handle paste | Avoids stealing text paste inside input/select/textarea | Grid-level paste should only run when target is not an interactive editor |
| Virtualization | Apply against row model, require visible DOM cells, disable paste | Apply against row model | Paste should not depend on mounted DOM rows | Very large paste with virtualization still needs performance limits |
| Error reporting | Silent skip, callback report, console warn | Silent by default with optional callback report | Normal grids should not be noisy, but important data workflows need visible failure handling | Grid should not render error UI directly |
| Paste failure behavior | Skip failed cells, cancel entire paste | Default `skipCell`; allow `cancelPaste` through options | Skip is ergonomic for normal paste; cancel is safer for high-importance data | Requires result/error collection before applying changes |
| Public API addition | No new API, `pasteOptions`, `onPasteError`, handle method | Add a small `pasteOptions` surface for error reporting only | Error behavior is product-critical and should be caller-configurable | Broader paste APIs can wait until validation/type parsing exists |
| Tests | Parser unit only, interaction only, both | Both parser/unit and interaction tests | Parser edge cases and DOM shortcut ownership need separate coverage | Browser clipboard permission paths are not covered by jsdom |

## Proposed MVP Contract

```ts
type ParsedPasteMatrix = string[][];

type PasteApplyResult = {
  appliedCellCount: number;
  skippedCellCount: number;
  targetRange: {
    anchor: { rowId: string; columnId: string };
    focus: { rowId: string; columnId: string };
  } | null;
};

type GenDataGridPasteErrorReason =
  | 'readOnly'
  | 'nonEditableCell'
  | 'outOfBounds'
  | 'parseError'
  | 'validationError';

type GenDataGridPasteError = {
  reason: GenDataGridPasteErrorReason;
  rowId?: string;
  columnId?: string;
  rowIndex?: number;
  columnIndex?: number;
  value?: string;
};

type GenDataGridPasteOptions = {
  errorMode?: 'silent' | 'report';
  failureBehavior?: 'skipCell' | 'cancelPaste';
  onError?: (errors: GenDataGridPasteError[]) => void;
};
```

`PasteApplyResult` can remain internal for the first implementation.
`pasteOptions` should be public because error visibility is a product decision:
normal grids can keep the default silent behavior, while important-data grids can
set `errorMode: 'report'` and optionally `failureBehavior: 'cancelPaste'`.

## Implementation Order

1. Add a clipboard text parser under `features/range-selection` or
   `features/editing`.
2. Add a paste target resolver that maps matrix coordinates to visible row and
   column ids from the current row model.
3. Apply editable/read-only filtering through the existing editable-cell
   predicate.
4. Collect paste errors and apply `pasteOptions.failureBehavior`.
5. Emit accepted changes through the existing `onCellValueChange` flow.
6. Call `pasteOptions.onError` when `errorMode: 'report'` and errors exist.
7. Update active cell and selected range to show the pasted result.
8. Add unit tests for parsing, target resolution, and failure behavior.
9. Add interaction tests for `Ctrl/Cmd+V`, editable filtering, read-only guard,
   and interactive-editor paste bypass.

## Open Questions For Product Decision

| Question | Recommended Answer |
| --- | --- |
| Should paste use active cell or selected range anchor? | Active cell for MVP |
| Should non-editable cells skip or cancel the whole paste? | Skip |
| Should GenDataGrid parse numbers/dates/checkboxes now? | No, keep raw strings first |
| Should we add a batch paste callback now? | No, reuse `onCellValueChange` first |
| Should paste errors be visible? | Silent by default; expose `pasteOptions.onError` for important grids |
| Should a failed cell cancel the whole paste? | No by default; allow `failureBehavior: 'cancelPaste'` |
| Should paste create new rows when matrix exceeds current rows? | No, clip to current rows |
| Should the pasted rectangle become the selected range? | Yes, if at least one cell is applied |
