# IIDAP: Data Excellence AI Knowledge Base

A curated AI knowledge base where GitHub repos, papers, and skills are first-class assets.

## Stack

- Plain HTML + CSS + Vanilla JavaScript
- Static JSON seed data from `src/data/repos.seed.json`
- Optional local Claude skill bundles in `src/skills/`

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
2. `script.js` loads the seed list in the browser and renders asset cards.
3. Each entry is typed as `GitHub Repo`, `Paper`, or `Skill` using `assetType`.
4. Skill entries can include `downloadUrl` (usually a local `.skill` file under `src/skills/`) for direct Claude downloads.
5. Search and filters run in the browser across asset type, category, tags, and text.
6. Dedicated paper and skill sections are rendered from paper and skill assets.
7. Suggestion CTA creates a pre-filled email draft via `mailto:`.

## Deployment

GitHub Actions workflow in `.github/workflows/deploy.yml` packages static files and deploys to GitHub Pages.

Expected Pages URL:

- `https://wenzelt-cg.github.io/idea_base_ai/`

## Updating Resources

1. Add or edit assets in `src/data/repos.seed.json`.
2. For downloadable skills, add the skill bundle file to `src/skills/` and reference it with `downloadUrl`.
3. Commit changes and push to `main`.

### Asset Entry Example

Use one entry per asset:

```json
{
  "assetType": "Paper",
  "title": "Attention Is All You Need",
  "url": "https://arxiv.org/abs/1706.03762",
  "category": "Foundation Models",
  "tags": ["transformers", "architecture", "nlp"],
  "description": "Foundational transformer paper introducing self-attention.",
  "featured": true
}
```

### Optional Use Case Field

```json
"useCase": "Create question-answering assistants over internal knowledge bases."
```

### Downloadable Skill Example

```json
{
   "assetType": "Skill",
   "title": "Jira Validator Skill Bundle",
   "url": "./src/skills/jira-validator.skill",
   "downloadUrl": "./src/skills/jira-validator.skill",
   "category": "Developer Tooling",
   "tags": ["claude", "skill", "jira", "validation"],
   "description": "Local skill bundle for validating Jira fields and workflows."
}
```

## Suggestion Email Setup

Set the target inbox in `index.html` on the main app shell element:

```html
<main id="content" class="app-shell" data-suggestion-email="your.email@example.com">
```

## Notes

- The page is intentionally static-first and lightweight.
- Search/filter runs fully in the browser, no backend required.
