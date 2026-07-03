# AGENTS.md

Purpose: guide any coding/content agent that adds or edits repository content for this project.

## Scope

- This file applies to content updates in `src/data/repos.seed.json`.
- The site renders directly from the seed file.
- Do not create generated data files or custom prebuild scripts for content updates.

## Source of Truth

- Only edit `src/data/repos.seed.json` for adding new assets.
- Keep JSON valid (no trailing comments, valid commas, double-quoted strings).

## Entry Schema (Asset-First)

Each entry must follow this shape:

- `assetType` (required): one of `GitHub Repo`, `Paper`, `Skill`.
- `title` (required for `Paper` and `Skill`; optional for `GitHub Repo`).
- `url` (recommended for all assets, required for `Paper` and `Skill`).
- `category` (required): one category from the allowed list below.
- `tags` (required): array of 2-5 short tags.
- `description` (optional but recommended): short, clear sentence.
- `summary` (recommended for `Paper`): concise 1-2 sentence abstract-style summary.
- `useCase` (optional): one practical, concise use-case sentence.
- `featured` (optional): boolean, default false.

Additional fields for GitHub repos:

- `owner` + `repo` (recommended): if both are set, UI can derive title/source as `owner/repo`.

Example GitHub repo entry:

{
  "assetType": "GitHub Repo",
  "owner": "example-org",
  "repo": "example-repo",
  "category": "Agents",
  "tags": ["agents", "automation", "workflows"],
  "description": "Short practical summary of what the repo is good for.",
  "useCase": "Automate multi-step research and reporting workflows.",
  "featured": false
}

Example paper entry:

{
  "assetType": "Paper",
  "title": "Attention Is All You Need",
  "url": "https://arxiv.org/abs/1706.03762",
  "category": "Foundation Models",
  "tags": ["transformers", "architecture", "nlp"],
  "summary": "Introduces the transformer architecture and self-attention for scalable sequence modeling.",
  "description": "Foundational transformer paper introducing self-attention.",
  "featured": true
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

## Quality Bar For New Assets

Only add assets that are:

- Clearly AI-related and useful to practitioners.
- Public and reachable links.
- Not duplicates of existing entries by normalized `title` + `url` (case-insensitive).

Prefer assets with at least one of:

- Active maintenance.
- Practical docs/examples.
- Strong community adoption.

## Ordering And Consistency

- Keep entries grouped by `assetType` first (GitHub Repo, Paper, Skill).
- Within a group, keep a stable and readable order (alphabetical by title is preferred).
- Keep description tone neutral, concise, and practical.
- Mark `featured: true` sparingly.

## Update Procedure

1. Open `src/data/repos.seed.json`.
2. Check for duplicates by title/url (case-insensitive).
3. Add the new object in the relevant asset type block.
4. Ensure tags and category follow this guide.
5. Ensure JSON remains valid.
6. Optionally run `python3 -m http.server 4173` and open the site for a quick sanity check.

## What Not To Do

- Do not add private/internal assets.
- Do not add marketing copy in descriptions.
- Do not refactor unrelated files while making content-only updates.
