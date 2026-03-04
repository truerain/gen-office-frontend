# Repository Agent Rules

## Encoding Safety (Korean Text)

- Treat all source text files as UTF-8.
- Prefer `apply_patch` for editing text files.
- Do not rewrite files using PowerShell `Get-Content`/`Set-Content` unless absolutely required.
- If shell-based rewrite is required, read/write with explicit UTF-8 and no BOM.
- Avoid any operation that can implicitly decode as CP949/ANSI.
- If a file contains Korean, verify no mojibake before commit.

## Pre-commit Guard

- `.githooks/pre-commit` runs `node scripts/check-encoding.mjs --staged`.
- The check blocks commits for:
  - UTF-8 BOM
  - invalid UTF-8 / replacement character (`�`)
  - suspicious mojibake patterns in Hangul lines

## GenGrid Layout Guard

- If touching `packages/gen-grid` or `packages/gen-grid-crud`, verify layout stability in demo pages using `GenGridCrud`.
- Keep `GenGridCrud` height chain intact:
  - Do not force `mergedGridProps.height` default in `GenGridCrud`; consumer/page should set `gridProps.height` when needed.
  - Keep `.gridArea > *` with `flex: 1 1 auto` and `min-height: 0` (avoid unconditional `height: 100%`).
- Keep ActionBar single-line behavior:
  - no wrapping in action groups
  - horizontal overflow should scroll, not clip/wrap controls.
- Reference before/after changes:
  - `docs/gen-grid/layout-contract.md`
  - `docs/gen-grid/layout-regression-playbook.md`
