# Flavor Compass · 食材罗盘

A food ingredient semantic navigator powered by [Epicure](https://arxiv.org/abs/2605.22391) ingredient embeddings. Search for ingredients, explore pairings, find substitutes, shift culinary styles, and browse ingredient neighborhoods — all computed in the browser.

## How It Works

Flavor Compass loads 1,790 canonical ingredients and their 300-dimensional embeddings from three sibling models:

| UI Label | Model | Signal | Best For |
|----------|-------|--------|----------|
| 常见搭配 (Common Pairings) | Epicure-Cooc | Recipe co-occurrence | "What goes well with tomato?" |
| 风味相似 (Flavor Similarity) | Epicure-Chem | Flavor chemistry compounds | "What can I use instead of basil?" |
| 综合推荐 (Balanced) | Epicure-Core | Hybrid cooc + chem | "Give me a safe recommendation" |

All vector retrieval runs locally via Web Worker. No server required after initial data load (~7 MB total).

## Quick Start

```bash
# Install dependencies
npm install

# Preprocess data (CSV → optimized static assets)
npx tsx scripts/preprocess-data.ts

# Start dev server
npm run dev

# Run all tests
npm run test:all
```

## Project Structure

```
src/
├── engine/         ← Core: embedding store, matcher, mode lookup, style shift
├── worker/         ← Web Worker for vector search
├── skills/         ← Skill executor shared by normal + Ask mode
├── ask/            ← Ask mode: intent routing, skill planning, response composing
├── components/     ← React UI components
├── hooks/          ← Custom React hooks
├── pages/          ← HomePage (workbench) + AboutPage (research evidence)
├── store/          ← Zustand state management
├── types/          ← TypeScript type definitions
├── utils/          ← Math, text, constants
├── research/       ← Evidence display constants (probe, WEAT, sensory, etc.)
└── data/           ← Static data loader
scripts/
└── preprocess-data.ts  ← CSV → .f32.bin + .json converter
public/data/            ← Preprocessed assets (git-tracked)
```

## Key Design Decisions

- **No precomputed recommendation table**. All Top-K results are computed at query time, never hardcoded.
- **Three model lenses**. Cooc → Core → Chem is a recipe-context to flavor-chemistry axis, not three random buttons.
- **Ask Mode = LLM + local skills**. The LLM parses intent and composes answers; local embedding skills do the actual retrieval.
- **Style shift uses product seed sets + vector interpolation**, not the paper's SLERP direction arithmetic (evidence only).
- **Constraint filter has an API stub** — no reliable dietary/health database exists in v1.

## Tech Stack

Vite · React 18 · TypeScript · Capacitor (mobile) · Zustand · Web Worker · Vitest + Playwright

## Data Attribution

This product uses ingredient embeddings and related artifacts from:

> Radzikowski, J. & Chen, J. (2026). *Epicure: Navigating the Emergent Geometry of Food Ingredient Embeddings*. arXiv:2605.22391.

Original research artifacts licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This product is independent and not affiliated with, sponsored by, or endorsed by the original authors or KAIKAKU.AI.

## License

MIT — see [LICENSE](LICENSE) for details. Data files in `public/data/` are derived from CC BY 4.0 sources.
