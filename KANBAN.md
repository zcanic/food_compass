# Food Compass Optimization Kanban

Status timestamp: 2026-05-31 20:49 CST

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
- Added a model-comparison mode that runs Cooc, Core, and Chem perspectives together.
- Model comparison hides the single-model selector and explains the three simultaneous views.
- Added E2E coverage for model-comparison results and labels.
- Full gate passed again: `npm run test:all` with 13 unit tests and 30 E2E checks.
- Moved examples below the primary task/input/model controls and compacted them into a two-column grid.
- Desktop/mobile screenshot review confirms the mobile first screen now keeps task, input, and model controls visible.
- Model-comparison results are now grouped into separate Cooc/Core/Chem sections instead of one mixed list.
- Added E2E coverage for grouped comparison result lists.
- Full gate passed again: `npm run test:all` with 13 unit tests and 30 E2E checks.
- Fuzzy search suggestions are now real buttons instead of click-only divs.
- Updated E2E coverage to select typo corrections through button semantics.
- Full gate passed again: `npm run test:all`.
- Recommendation rows now expose an accessible add-to-query action.
- Adding a recommendation clears stale result state so the user can intentionally re-run the expanded query.
- Added desktop/mobile E2E coverage for recommendation-driven exploration.
- Full gate passed again: `npm run test:all` with 13 unit tests and 32 E2E checks.
- Model-comparison results now include an overview with deduplicated candidates, repeated candidates, and per-model unique counts.
- Added unit coverage for the model-comparison summary logic.
- Expanded model-comparison E2E assertions to verify the comparison overview in desktop and mobile runs.
- Full gate passed again: `npm run test:all` with 15 unit tests and 32 E2E checks.
- Re-read the final design doc and Epicure paper to refocus improvements on model choice, closest-mode lookup, and navigation operators.
- Model comparison now includes closest-mode lookup from Cooc/Core/Chem so users see each sibling model's semantic neighborhood.
- Mode cards now expose model source, mode kind, member count, and mode-level z summary without implying member-level scores.
- Added unit coverage for canonical-to-atlas mode lookup and E2E coverage for model-comparison mode neighborhoods.
- Full gate passed again: `npm run test:all` with 17 unit tests and 32 E2E checks.

## In Progress

- Continue high-impact UX and test improvements before 23:30.

## Backlog

- Add a research-grounded data/source page using the paper, CC BY attribution, and explicit model limitations.
- Add a paper-evidence panel that explains Cooc/Core/Chem as recipe-context vs chemistry tradeoffs using local supplementary metrics.
- Revisit style shift against the paper's SLERP/angle framing while keeping it clearly experimental.
- Add mode lookup empty-state examples and model-bias explanations.
- Add visual regression snapshots for key viewport states.
