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
