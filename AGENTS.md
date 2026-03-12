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
  - invalid UTF-8 / replacement character (`\\uFFFD`)
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

## Source Editing Safety (when apply_patch is unavailable)

- Keep edits minimal: one file and one logical block at a time.
- Before edit, capture target context lines and verify exact location.
- Do not use broad/global replacement across the whole file.
- Allow only single-match replacement (exact string or regex). If match count is not 1, stop.
- After each edit, immediately verify changed lines and git diff -- <file>.
- Run relevant typecheck/build after code edits (tsc --noEmit when applicable).
- If unexpected diff, mojibake, or syntax issue appears, stop and fix before additional edits.
- In new sessions, remind the agent to follow AGENTS.md rules in the first message.
