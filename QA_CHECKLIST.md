# QA Checklist

Run before pushing UI or engine changes:

```bash
npm run test:all
```

## Manual Smoke

- Start dev server: `npm run dev -- --host 127.0.0.1 --port 5173`.
- Open `http://127.0.0.1:5173/`.
- Verify desktop width around 1440px and mobile width around 390px.
- Confirm the first screen shows the workbench, not a marketing page.
- Confirm the primary status pill says at least one ingredient is needed.

## Ingredient Entry

- Enter `番茄、鸡蛋`; preview should show `tomato、egg`.
- Press Enter; chips should appear and the input should clear.
- Remove a chip; stale results should clear.
- Enter `zzzznotfood`; the unsupported-food message should appear.
- Enter `price`; it must not match `rice`.

## Mode Defaults

- Initial mode is pairing and the active model is `常见搭配`.
- Switching to substitute selects `风味相似`.
- Switching to group completion, style shift, or mode lookup selects `综合推荐`.
- Switching modes clears stale recommendations and explanations.

## Query Results

- Pairing with `tomato` returns results labeled `常见搭配`.
- Substitute with `basil` returns the wind-similarity explanation and cross labels when available.
- Combination with `tomato, egg` returns recommendations and may show mode context.
- Mode lookup with `酱油` shows neighborhood cards without the old "click explore" empty state.
- Unsupported or empty-result states explain the next recovery action.

## Ask Mode

- Ask mode shows one question box only.
- Prompt: `我有番茄和鸡蛋，想做得更日式一点，可以加什么？`
- Parsed intent should be `style_shift`.
- Extracted ingredients should be `tomato、egg`.
- Tool trace should include `shift_style`.
- Prompt without a food should show a no-ingredient recovery message.
- Constraint prompts should warn that dietary filtering is not reliable yet.

## Accessibility

- Top nav uses `工作台` and `关于`.
- Task buttons have accessible names prefixed with `任务：`.
- Model buttons have accessible names prefixed with `模型：`.
- The main action button is the only visible button named `探索` in the workbench controls.

## Artifacts

- Do not commit `dist/`, `test-results/`, `playwright-report/`, or screenshots.
- Keep generated screenshots only long enough for review.
