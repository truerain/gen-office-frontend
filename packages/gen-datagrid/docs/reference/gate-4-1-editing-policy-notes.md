<!-- packages/gen-datagrid/docs/reference/gate-4-1-editing-policy-notes.md
Points to the canonical Gate 4.1 editing policy contract and test view.
-->

# GenDataGrid Gate 4.1 Editing Policy Notes

Gate 4.1 extends the deferred Gate 4 editing-policy slice.

**Canonical reference:** [`editor-implementation-contract.md`](editor-implementation-contract.md)

That document is the primary guide for:

- Gate 4.1 sub-slice status (4.1-b / 4.1-c / 4.1-d)
- policy axes for entry, continuation, open, keyboard, and blur
- `GenDataGridEditorContext` contract
- built-in editors as reference implementations
- checklist for future custom/popup/modal editors
- Storybook and test expectations

Slice-specific design detail remains in [`gate-4-1-editing-policy-architecture.md`](../architecture/gate-4-1-editing-policy-architecture.md).

## Quick Test View

### Automated

- printable-key edit entry
- `editPolicy` start/continuation triggers
- built-in keyboard ownership (4.1-c)
- inline blur and portal-safe blur policy (4.1-d planned)

### Storybook Manual

| Story | Slice |
| --- | --- |
| `Gate41BEditPolicy` | 4.1-b entry / continuation / open |
| `Gate41CEditNavigation` | 4.1-c keyboard ownership |
| `Gate41DBlurPolicy` | 4.1-d blur / portal / modal |

Built-in `date` native popup visibility remains manual verification unless a custom datepicker editor is used.
