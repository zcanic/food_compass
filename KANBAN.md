# Food Compass Optimization Kanban

Status timestamp: 2026-05-31 20:29 CST

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
- Ask Mode now renders structured tool recommendations below the natural language answer.
- Ask parsing output has an accessible `Ask 解析结果` region.
- Added E2E coverage for Ask constraint warnings so the UI does not pretend to perform reliable filtering.
- Full gate passed again: `npm run test:all` with 18 E2E checks.
- Added versioned localStorage-backed recent ingredients.
- Search now shows recent ingredient shortcuts for quick re-entry.
- Added unit coverage for recent ingredient storage and E2E coverage for persistence across reload.
- Full gate passed again: `npm run test:all` with 11 unit tests and 20 E2E checks.
- Added clear-current-selection and clear-recent-ingredients controls for faster correction.
- Added unit coverage for clearing recent ingredients and E2E coverage for both clear actions.
- Full gate passed again: `npm run test:all` with 12 unit tests and 22 E2E checks.
- Added first-run example buttons for pairing, substitute, style shift, and mode lookup workflows.
- Example buttons set mode, model, ingredients, optional style, and immediately run retrieval.
- Added E2E coverage for example pairing and example style-shift flows.
- Full gate passed again: `npm run test:all` with 12 unit tests and 26 E2E checks.
- Added typo-tolerant ingredient suggestions using bounded edit distance.
- Added unit coverage for typo suggestions and unrelated-word rejection.
- Added E2E coverage for selecting a typo correction.
- Full gate passed again: `npm run test:all` with 13 unit tests and 28 E2E checks.

## In Progress

- Continue high-impact UX and test improvements before 21:30.

## Backlog

- Expand style-shift tests and UI copy around experimental directions.
- Add result grouping and clearer model-comparison affordances.
- Add mode lookup empty-state examples.
- Add visual regression snapshots for key viewport states.
