# AGENTS.md

Purpose: guide any coding/content agent that adds or edits repository content for this project.

## Scope

- This file applies to content updates in `src/data/repos.seed.json`.
- The site renders directly from the seed file.
- Do not create generated data files or custom prebuild scripts for content updates.

## Source of Truth

- Only edit `src/data/repos.seed.json` for adding new resources.
- Keep JSON valid (no trailing comments, valid commas, double-quoted strings).

## Entry Schema

Each entry must follow this shape:

- `owner` (required): GitHub org/user name.
- `repo` (required): repository name.
- `category` (required): one category from the allowed list below.
- `tags` (required): array of 2-5 short tags.
- `description` (optional but recommended): short, clear sentence.
- `featured` (optional): boolean, default false.

Example:

{
  "owner": "example-org",
  "repo": "example-repo",
  "category": "Agents",
  "tags": ["agents", "automation", "workflows"],
  "description": "Short practical summary of what the repo is good for.",
  "featured": false
}

## Allowed Categories

Use an existing category whenever possible:

- Foundation Models
- Inference
- Local AI
- Developer Tooling
- Frameworks
- RAG
- Prompt Engineering
- Agents
- AI UI
- Evaluation
- Embeddings
- Vector Databases

If a new category is absolutely needed, keep naming concise and title-cased.

## Tag Rules

- Use lowercase tags.
- Prefer short, commonly used terms.
- Use kebab-case for multi-word tags (for example: `semantic-search`).
- Avoid duplicate tags within one entry.

## Quality Bar For New Repos

Only add repositories that are:

- Clearly AI-related and useful to practitioners.
- Public GitHub repositories with a valid URL pattern: `https://github.com/<owner>/<repo>`.
- Not duplicates of existing `owner/repo` entries (case-insensitive check).

Prefer repositories with at least one of:

- Active maintenance.
- Practical docs/examples.
- Strong community adoption.

## Ordering And Consistency

- Keep entries grouped by category as in the current file.
- Within a category block, keep a stable and readable order (alphabetical is preferred).
- Keep description tone neutral, concise, and practical.
- Mark `featured: true` sparingly.

## Update Procedure

1. Open `src/data/repos.seed.json`.
2. Check for duplicates by `owner/repo` (case-insensitive).
3. Add the new object in the relevant category block.
4. Ensure tags and category follow this guide.
5. Ensure JSON remains valid.
6. Optionally run `npm run dev` or `npm run build` for a quick sanity check.

## What Not To Do

- Do not add non-GitHub links to the seed list.
- Do not add private/internal repositories.
- Do not add marketing copy in descriptions.
- Do not refactor unrelated files while making content-only updates.
