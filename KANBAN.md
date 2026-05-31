# Food Compass Optimization Kanban

Status timestamp: 2026-05-31 17:43 CST

## Done

- Established baseline gates: `npm run lint`, `npm run build`.
- Fixed the initial lint failure in `src/engine/constraint-filter.ts`.
- Reworked the main workbench into task, ingredient, model, and result regions.
- Removed the duplicate ordinary ingredient input from Ask Mode.
- Mode changes now select intended defaults: pairing uses Cooc, substitute uses Chem, combination/style/mode use Core.
- Ingredient input now accepts comma, Chinese comma, dunhao, semicolon, and newline separated lists.
- Added Ask Mode text extraction from aliases and vocab instead of whitespace-only splitting.
- Fixed intent priority so style-shift prompts with generic "add what" language route to style shift.
- Fixed fuzzy false positives such as `price` matching `rice`.
- Added Vitest and Playwright infrastructure.
- Added unit tests for matching, alias extraction, false-positive matching, and intent priority.
- Added browser tests for desktop and mobile bulk entry, model defaults, stale-state clearing, Ask extraction, unsupported search, no-ingredient Ask recovery, and mode lookup.
- Fixed accessible-name ambiguity across nav, task, model, and action buttons.
- Added query-state tracking so post-search empty states are accurate.
- Full gate passed: `npm run test:all`.
- Added Chinese labels for style-shift directions and strengths while keeping internal keys stable.
- Added accessible labels for ingredient chip removal.
- Expanded browser coverage to 16 passed desktop/mobile checks, including style shift and stale-result clearing after chip edits.
- Full gate passed again: `npm run test:all`.
- Added a query summary region with task, ingredients, model, style, and search status.
- Scoped browser assertions to the summary region to preserve accessibility and avoid duplicate-text ambiguity.
- Full gate passed again: `npm run test:all`.
- Result scores now display as cosine similarity instead of misleading percentages.
- Result lists include candidate counts, score caveats, and accessible list/listitem structure.
- Full gate passed again: `npm run test:all`.

## In Progress

- Plan the next UX/test improvement round before 19:30.

## Backlog

- Expand style-shift tests and UI copy around experimental directions.
- Add result grouping and clearer model-comparison affordances.
- Add mode lookup empty-state examples.
- Add a persistent local recent-ingredients list.
- Add visual regression snapshots for key viewport states.
