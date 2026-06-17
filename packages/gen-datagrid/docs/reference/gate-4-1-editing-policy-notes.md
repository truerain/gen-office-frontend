<!-- packages/gen-datagrid/docs/reference/gate-4-1-editing-policy-notes.md
Summarizes the Gate 4.1 editing policy follow-up scope and test view.
-->

# GenDataGrid Gate 4.1 Editing Policy Notes

Gate 4.1 extends the deferred Gate 4 editing-policy slice.

## Policy Additions

- printable-key edit entry
- `editOnActiveCell`
- `keepEditingOnNavigate`
- open-on-edit-start behavior for dropdown, datepicker, popover, and modal editor surfaces
- advanced blur / portal / modal editor commit policy

## Built-in Editor View

- `text`, `number`, `textarea`
  - fully participate in printable-key entry and navigation policy
- `select`
  - should support open-on-edit-start
- `date`
  - participates in edit entry and commit/cancel policy
  - native browser date popup visibility remains a manual verification item
- `checkbox`
  - participates in edit entry and navigation policy
  - does not require a popover-open contract

## Custom Editor View

Custom popover and modal editors should receive enough policy context to decide:

- why edit mode started
- whether the editor should open immediately on mount
- whether navigation should keep editing alive
- whether blur is owned by inline, portal, or modal lifecycle

## Test View

### Automated

- printable-key edit entry
- `editOnActiveCell`
- `keepEditingOnNavigate`
- open-on-edit-start signal propagation
- inline blur and portal-safe blur policy

### Storybook Manual

- built-in `text`, `number`, `textarea`
- built-in `select`
- built-in `date`
- custom popover editor
- custom modal editor
