# AI Resource Atlas

A scrollable GitHub Pages overview of high-impact AI repositories.

## Stack

- Astro (static output)
- Fuse.js for lightweight client-side search

## Local Development

1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`

## Build

- Build static site: `npm run build`

## Data Flow

1. Curated input list lives in `src/data/repos.seed.json`.
2. The page is rendered directly from this seed list.
3. Search and filters run in the browser.

## Environment Variables

- `SITE_URL`: deployment site origin for Astro config.
- `BASE_PATH`: path prefix for project pages (for this repo: `/idea_base_ai`).

## Deployment

GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys to GitHub Pages.

Expected Pages URL:

- `https://wenzelt-cg.github.io/idea_base_ai/`

## Updating Resources

1. Add or edit repositories in `src/data/repos.seed.json`.
2. Commit changes and push to `main`.

## Notes

- The page is intentionally static-first and lightweight.
- Search/filter runs fully in the browser, no backend required.
