# Gen-Office Frontend — Agent Rules

> 공통: [`../AGENTS.md`](../AGENTS.md) · 문서 [`../docs/`](../docs/README.md) · Cursor [`../.cursor/rules/project-core.mdc`](../.cursor/rules/project-core.mdc)

워크스페이스는 **상위 `100 gen-office`** 기준. 이 파일은 프론트·GenGrid 상세 규칙입니다.

## 문서 (SSOT)

- 통합 문서 정본: `../docs/` (이후 `gen-office-docs` repo)
- 새 가이드는 `../docs/`에만. `frontend/docs/`는 **이전 스텁**만
- 레거시: `docs/gen-grid/layout-contract.md` 등 — 이전 전까지 참고

## 아키텍처 (demo)

- **네비**: URL 라우터 없음 → MDI 탭 + DB 메뉴 `componentName`
- **로딩**: `apps/demo/src/app/config/componentRegistry.dynamic.ts` lazy map
- **API**: `apps/demo/src/shared/api/http.ts` — `credentials: 'include'`, envelope `{ success, code, data }`
- **인증**: `shared/api/auth.ts`, 세션 쿠키 — [session-login](../docs/guides/auth/session-login.md) (상위 `docs/` 있을 때)

## 빠른 검증

```bash
pnpm install && pnpm build && pnpm demo
pnpm lint
```

배포: Vercel — 이 repo 루트(또는 `frontend`를 root directory로 설정).

## Source File Header Comments

- When creating a new source file under `frontend`, add a short header comment at the top.
- The header should state the workspace-relative file path, the file's purpose and creation date.
- Apply this to source-like files such as `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.md`, `.mjs`, and `.cjs`.
- Do not add header comments to formats that do not support comments, such as `.json`.
- Do not duplicate headers. If an existing file already has a clear header comment, preserve it.
- Keep the header concise and avoid legal/copyright text unless explicitly requested.

Examples:

```ts
// packages/gen-datagrid/src/GenDataGrid.tsx
// Provides the public GenDataGrid React component.
```

```css
/* packages/gen-datagrid/src/index.css
 * Defines baseline styles for GenDataGrid.
 */
```

```md
<!-- packages/gen-datagrid/docs/api-structure.md
Documents the public API grouping for GenDataGrid.
-->
```

## GenDataGrid Documentation Log

- When implementing or changing `packages/gen-datagrid`, update documentation under `packages/gen-datagrid/docs`.
- Record meaningful implementation decisions, API changes, test gate updates, known limitations, and migration notes.
- Do not leave implementation-only knowledge only in chat or code comments.
- Prefer adding or updating focused docs instead of appending unrelated notes to a single large document.
- At minimum, update one of:
  - `docs/implementation-log.md`
  - `docs/api-structure.md`
  - `docs/api-comparison-with-gen-grid.md`
  - `docs/div-datagrid-development-plan.md`
  - `docs/mvp-test-gates.md`
  - a new focused document under `docs/`
- If a code change affects a test gate, update `docs/mvp-test-gates.md`.
- If a code change affects public API, update `docs/api-structure.md` and `docs/api-comparison-with-gen-grid.md`.
- If a code change introduces a known limitation or deferred behavior, record it in `docs/implementation-log.md`.

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
  - invalid UTF-8 / replacement character (`\uFFFD`)
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
- After each edit, immediately verify changed lines and `git diff -- <file>`.
- Run relevant typecheck/build after code edits (`tsc --noEmit` when applicable).
- If unexpected diff, mojibake, or syntax issue appears, stop and fix before additional edits.
