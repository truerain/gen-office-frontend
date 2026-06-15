# GenOffice Frontend Agent Rules

This file defines the working rules for AI coding agents in the GenOffice frontend repository.

Use this file as the shared instruction source across Codex, ChatGPT, Claude, Gemini, Cursor, Copilot, and other coding agents. If another tool has its own instruction file, mirror the same project rules from this document instead of creating conflicting guidance.

## Repository Context

- This repository is the frontend workspace for GenOffice, a React-based framework for building enterprise back-office applications.
- The repository is a pnpm monorepo with apps under `apps/*` and reusable packages under `packages/*`.
- The main package scope is `@gen-office/*`.
- The primary demo app is `apps/demo`.
- The integrated Storybook app is `apps/storybook-all`.

## Core Stack

- React 18
- TypeScript 5.7
- Vite
- pnpm 9
- Turbo
- Nx
- Storybook 8

## Package Boundaries

Keep package responsibilities clear.

- `packages/theme`: design tokens, global styles, fonts, and theme primitives.
- `packages/ui`: domain-neutral UI components.
- `packages/utils`: shared utility functions.
- `packages/mdi`: multiple document interface layout and tab/window behavior.
- `packages/gen-grid`: core grid package based on TanStack Table.
- `packages/gen-grid-crud`: CRUD behavior built on top of GenGrid.
- `packages/gen-grid-chart`: grid and chart integration.
- `packages/gen-chart`: chart components.
- `packages/gen-datagrid`: experimental or alternative data grid implementation.
- `packages/tsconfig`: shared TypeScript configuration.

Preferred dependency direction:

```text
apps -> feature packages -> ui -> theme/utils
```

Avoid reverse dependencies and circular dependencies.

Large feature components with heavy third-party engines should usually become separate feature packages instead of being added to `packages/ui`. For example, a rich HTML editor should be considered as a package such as `@gen-office/html-editor` because it may own editor engine dependencies, serialization, sanitization, toolbar commands, and editor-specific policies.

## Documentation Rules

- Update documentation when changing public APIs, package boundaries, behavior contracts, setup steps, or architectural decisions.
- Put project-level documentation under `docs/`.
- Put package-specific documentation in the relevant package directory when it is only useful for that package.
- Do not leave important implementation decisions only in chat history.
- Keep README files focused on orientation, setup, and public usage.

## Work Log Rules

- Every file-changing task must leave a written log.
- For repository-level changes, update `docs/logs/work-log.md`.
- For architecture, package boundary, or technology decisions, update `docs/logs/decisions.md`.
- For package-specific source, API, behavior, or documentation changes, update that package's implementation log. Most packages use `docs/implementation-log.md`; packages with a deeper docs structure may use a package-specific path such as `docs/log/implementation-log.md`.
- Write all work log and decision log entries in Korean.
- Log entries should be concise but must include the date, summary, changed area, and relevant files.
- Keep log files in reverse chronological order.
- Add new log entries near the top of the file.
- Within the same date section, place the newest entry first.
- Do not rely on chat history as the only record of why a change was made.
- If a change intentionally skips a log update, explain the reason in the final response.

## AI Coding Workflow

- Default to Plan Mode for all development work.
- In Plan Mode, do not modify source files, configuration files, documentation, or generated assets until the user explicitly asks you to implement, code, edit, apply, or update files.
- Before editing files, first inspect the relevant context, explain the proposed plan, and wait for the user's confirmation.
- A discussion about possible design, architecture, package boundaries, or implementation approach is not permission to edit files.
- A request to "review", "analyze", "plan", "recommend", "explain", or "think through" is not permission to edit files.
- Start modifying files only after the user clearly requests implementation, for example: "implement it", "make the change", "edit the file", "apply this", "코딩해줘", "수정해줘", or equivalent wording.
- If the user asks a direct question, answer the question first and do not make code changes unless implementation is also explicitly requested.
- Read `README.md` and this `AGENTS.md` before making significant changes.
- Inspect the existing code and package conventions before proposing new abstractions.
- Prefer existing patterns, local helpers, and package boundaries over new one-off structures.
- Keep edits scoped to the requested change.
- Do not refactor unrelated code while solving a narrow task.
- If user changes are present, preserve them and work with them.
- Do not revert files unless the user explicitly asks for it.
- Do not delete files unless the user explicitly requests it or the deletion is clearly part of the requested change.

## Source Editing Rules

- Treat all text files as UTF-8.
- Prefer patch-based edits for text changes.
- Avoid tools or commands that can rewrite Korean text as CP949/ANSI.
- If a file contains Korean text, verify that no mojibake was introduced.
- Keep comments concise and useful.
- Do not add legal or copyright headers unless requested.

## New Source Files

When creating a new source-like file under this repository, add a short header comment if the file format supports comments.

The header should state:

- repository-relative file path
- purpose of the file
- creation date when useful

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
<!-- packages/gen-datagrid/docs/reference/api-structure.md
Documents the public API grouping for GenDataGrid.
-->
```

Do not add such headers to formats that do not support comments, such as JSON.

## GenGrid And GenGridCrud Rules

When touching `packages/gen-grid` or `packages/gen-grid-crud`:

- Preserve layout stability in demo pages using `GenGridCrud`.
- Do not force a default `mergedGridProps.height` in `GenGridCrud`; consumers should set `gridProps.height` when needed.
- Keep flex height chains intact with `min-height: 0` where required.
- Keep action bars single-line unless a design explicitly requires wrapping.
- Horizontal overflow should scroll instead of clipping or wrapping controls unexpectedly.
- Check related documents under `docs/gen-grid/` when changing layout behavior.

## GenDataGrid Documentation

When implementing or changing `packages/gen-datagrid`, update documentation under `packages/gen-datagrid/docs` when relevant.

Record:

- meaningful implementation decisions
- API changes
- test gate updates
- known limitations
- migration notes

At minimum, consider updating one of:

- `packages/gen-datagrid/docs/log/implementation-log.md`
- `packages/gen-datagrid/docs/reference/api-structure.md`
- `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`
- `packages/gen-datagrid/docs/plan/div-datagrid-development-plan.md`
- `packages/gen-datagrid/docs/plan/mvp-test-gates.md`

If a code change affects a test gate, update `packages/gen-datagrid/docs/plan/mvp-test-gates.md`.
If a code change affects public API, update `packages/gen-datagrid/docs/reference/api-structure.md` and `packages/gen-datagrid/docs/reference/api-comparison-with-gen-grid.md`.
If a code change introduces a known limitation or deferred behavior, record it in `packages/gen-datagrid/docs/log/implementation-log.md`.

## Verification

Use the narrowest meaningful verification for the change.

For setup, build, run, and troubleshooting steps, refer to `docs/01.BUILD_GUIDE.md`.

Common commands:

```bash
pnpm build
pnpm lint
pnpm test
pnpm -C apps/demo build
pnpm -C packages/gen-grid exec tsc -p tsconfig.json --noEmit
pnpm -C packages/gen-grid-crud exec tsc -p tsconfig.json --noEmit
pnpm -C packages/ui build
```

If verification cannot be run, explain why in the final response.

## Pre-commit Guard

The repository has an encoding guard:

```bash
node scripts/check-encoding.mjs --staged
```

The guard blocks:

- UTF-8 BOM
- invalid UTF-8
- replacement characters
- suspicious mojibake patterns in Korean text

Run the guard when editing Korean documentation or files that previously had encoding issues.
