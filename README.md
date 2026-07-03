# AI Resource Atlas

A curated AI knowledge base with practical GitHub repositories, relevant paper links, and concise use-case hints.

## Stack

- Plain HTML + CSS + Vanilla JavaScript
- Static JSON seed data from `src/data/repos.seed.json`

## Local Development

Use any static server from the project root. Example:

1. Start a local server:
   - `python3 -m http.server 4173`
2. Open:
   - `http://localhost:4173/`

## Build

No framework build step is required.

## Data Flow

1. Curated input list lives in `src/data/repos.seed.json`.
2. `script.js` loads the seed list in the browser and renders repository cards.
3. Optional `papers` links from the seed are rendered on cards.
4. Optional `useCase` summaries are rendered on cards.
5. Search and filters run in the browser (including paper titles).
6. Suggestion form creates a pre-filled email draft via `mailto:`.

## Deployment

GitHub Actions workflow in `.github/workflows/deploy.yml` packages static files and deploys to GitHub Pages.

Expected Pages URL:

- `https://wenzelt-cg.github.io/idea_base_ai/`

## Updating Resources

1. Add or edit repositories in `src/data/repos.seed.json`.
2. Commit changes and push to `main`.

### Optional Papers Field

You can attach relevant AI papers to any repository entry:

```json
"papers": [
   {
      "title": "Attention Is All You Need",
      "url": "https://arxiv.org/abs/1706.03762"
   }
]
```

### Optional Use Case Field

```json
"useCase": "Create question-answering assistants over internal knowledge bases."
```

## Suggestion Email Setup

Set the target inbox in `index.html` on the main app shell element:

```html
<main id="content" class="app-shell" data-suggestion-email="your.email@example.com">
```

## Notes

- The page is intentionally static-first and lightweight.
- Search/filter runs fully in the browser, no backend required.
