const DATA_URL = "./src/data/repos.seed.json";

const elements = {
  shell: document.getElementById("content"),
  form: document.getElementById("repo-filters"),
  search: document.getElementById("search-input"),
  category: document.getElementById("category-select"),
  tag: document.getElementById("tag-select"),
  featured: document.getElementById("featured-only"),
  papersOnly: document.getElementById("papers-only"),
  paperTotal: document.getElementById("paper-total"),
  paperLibraryCount: document.getElementById("paper-library-count"),
  paperList: document.getElementById("paper-list"),
  repoList: document.getElementById("repo-list"),
  resultCount: document.getElementById("result-count"),
  emptyState: document.getElementById("empty-state"),
  repoTotal: document.getElementById("repo-total"),
  categoryTotal: document.getElementById("category-total"),
  suggestionForm: document.getElementById("suggestion-form"),
  suggestionStatus: document.getElementById("suggestion-status"),
};

let repos = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizePapers(papers) {
  if (!Array.isArray(papers)) {
    return [];
  }

  return papers
    .map((paper) => {
      if (!paper || typeof paper !== "object") {
        return null;
      }

      const title = String(paper.title || "").trim();
      const url = String(paper.url || "").trim();

      if (!title || !url) {
        return null;
      }

      return { title, url };
    })
    .filter(Boolean);
}

function normalizeRepo(repo) {
  const fullName = `${repo.owner}/${repo.repo}`;
  const useCase = String(repo.useCase || "").trim();
  const rawDescription = String(repo.description || "").trim();
  const category = String(repo.category || "Uncategorized").trim() || "Uncategorized";
  const tags = (repo.tags || []).map((tag) => String(tag).toLowerCase().replace(/\s+/g, "-")).filter(Boolean);
  const tagPreview = tags.slice(0, 2).join(" and ") || "practical AI workflows";
  const generatedSummary = `A ${category} repository focused on ${tagPreview}.`;
  const description = rawDescription || useCase || generatedSummary;

  return {
    id: fullName.toLowerCase().replace("/", "-"),
    owner: repo.owner,
    repo: repo.repo,
    fullName,
    url: `https://github.com/${repo.owner}/${repo.repo}`,
    description,
    category,
    tags,
    featured: Boolean(repo.featured),
    useCase,
    papers: normalizePapers(repo.papers),
  };
}

function sortRepos(a, b) {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  return a.fullName.localeCompare(b.fullName);
}

function updateHeaderStats() {
  const categories = new Set(repos.map((repo) => repo.category));
  const paperCount = repos.reduce((acc, repo) => acc + repo.papers.length, 0);

  if (elements.repoTotal) {
    elements.repoTotal.textContent = `${repos.length} repositories`;
  }

  if (elements.categoryTotal) {
    elements.categoryTotal.textContent = `${categories.size} categories`;
  }

  if (elements.paperTotal) {
    elements.paperTotal.textContent = `${paperCount} paper links`;
  }
}

function collectPapers(sourceRepos) {
  const paperMap = new Map();

  sourceRepos.forEach((repo) => {
    repo.papers.forEach((paper) => {
      const key = paper.url.toLowerCase();

      if (!paperMap.has(key)) {
        paperMap.set(key, {
          title: paper.title,
          url: paper.url,
          sources: [repo.fullName],
        });
        return;
      }

      const existing = paperMap.get(key);
      existing.sources.push(repo.fullName);
    });
  });

  return [...paperMap.values()].sort((a, b) => a.title.localeCompare(b.title));
}

function renderPaperLibrary(sourceRepos) {
  if (!elements.paperList || !elements.paperLibraryCount) {
    return;
  }

  const papers = collectPapers(sourceRepos);

  if (!papers.length) {
    elements.paperList.replaceChildren();
    elements.paperLibraryCount.textContent = "0 curated paper links in the current view.";
    return;
  }

  const paperItems = papers.map((paper) => {
    const item = document.createElement("li");
    item.className = "paper-library__item";

    const sourcePreview = paper.sources.slice(0, 2).join(" · ");
    const sourceSuffix = paper.sources.length > 2 ? ` +${paper.sources.length - 2} more` : "";

    item.innerHTML = `
      <a class="paper-library__link" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(paper.title)}</a>
      <span class="paper-library__source">from ${escapeHtml(sourcePreview)}${escapeHtml(sourceSuffix)}</span>
    `;

    return item;
  });

  elements.paperList.replaceChildren(...paperItems);
  elements.paperLibraryCount.textContent = `${papers.length} curated paper links in the current view.`;
}

function populateOptions() {
  const categories = [...new Set(repos.map((repo) => repo.category))].sort((a, b) => a.localeCompare(b));
  const tags = [...new Set(repos.flatMap((repo) => repo.tags))].sort((a, b) => a.localeCompare(b));

  if (elements.category) {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      elements.category.appendChild(option);
    });
  }

  if (elements.tag) {
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      elements.tag.appendChild(option);
    });
  }
}

function createRepoCard(repo) {
  const article = document.createElement("article");
  article.className = "repo-card";
  article.dataset.repoId = repo.id;
  article.dataset.paperCount = String(repo.papers.length);

  const tagsMarkup = repo.tags.length
    ? repo.tags.map((tag) => `<span class="repo-tag">#${escapeHtml(tag)}</span>`).join("")
    : '<span class="repo-tag repo-tag--muted">#untagged</span>';

  const papersMarkup = repo.papers.length
    ? `
      <section class="repo-card__papers" aria-label="Relevant papers for ${escapeHtml(repo.fullName)}">
        <h3>Papers</h3>
        <ul>
          ${repo.papers
            .map(
              (paper) =>
                `<li><a class="repo-paper-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(paper.title)}</a></li>`,
            )
            .join("")}
        </ul>
      </section>
    `
    : "";

  const useCaseMarkup = repo.useCase && repo.useCase !== repo.description
    ? `<p class="repo-use-case"><strong>Use case:</strong> ${escapeHtml(repo.useCase)}</p>`
    : "";

  article.innerHTML = `
    <header class="repo-card__head">
      <a class="repo-card__title" href="${escapeHtml(repo.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(repo.fullName)}</a>
      ${repo.featured ? '<span class="repo-badge">featured</span>' : ""}
    </header>

    <p class="repo-card__description">${escapeHtml(repo.description)}</p>

    ${useCaseMarkup}

    <ul class="repo-card__meta" aria-label="Repository metadata for ${escapeHtml(repo.fullName)}">
      <li>${escapeHtml(repo.category)}</li>
      <li>GitHub resource</li>
      ${repo.papers.length ? `<li>${repo.papers.length} paper link${repo.papers.length > 1 ? "s" : ""}</li>` : ""}
    </ul>

    <div class="repo-card__tags" aria-label="Tags">
      ${tagsMarkup}
    </div>

    ${papersMarkup}
  `;

  return article;
}

function renderRepos(filteredRepos) {
  if (!elements.repoList || !elements.resultCount || !elements.emptyState) {
    return;
  }

  elements.repoList.replaceChildren(...filteredRepos.map((repo) => createRepoCard(repo)));
  renderPaperLibrary(filteredRepos);
  elements.resultCount.textContent = `Showing ${filteredRepos.length} repositories.`;
  elements.emptyState.hidden = filteredRepos.length > 0;
}

function matchesQuery(repo, query) {
  if (!query) {
    return true;
  }

  const paperText = repo.papers.map((paper) => paper.title).join(" ");
  const haystack = `${repo.fullName} ${repo.description} ${repo.tags.join(" ")} ${paperText}`.toLowerCase();
  return haystack.includes(query);
}

function runFilters() {
  const query = (elements.search?.value || "").trim().toLowerCase();
  const category = elements.category?.value || "all";
  const tag = elements.tag?.value || "all";
  const featuredOnly = Boolean(elements.featured?.checked);
  const papersOnly = Boolean(elements.papersOnly?.checked);

  const filtered = repos.filter((repo) => {
    if (!matchesQuery(repo, query)) {
      return false;
    }

    if (category !== "all" && repo.category !== category) {
      return false;
    }

    if (tag !== "all" && !repo.tags.includes(tag)) {
      return false;
    }

    if (featuredOnly && !repo.featured) {
      return false;
    }

    if (papersOnly && repo.papers.length === 0) {
      return false;
    }

    return true;
  });

  renderRepos(filtered);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setSuggestionStatus(message, isError = false) {
  if (!elements.suggestionStatus) {
    return;
  }

  elements.suggestionStatus.textContent = message;
  elements.suggestionStatus.classList.toggle("suggestion-status--error", isError);
}

function buildSuggestionMailtoUrl(formData) {
  const target = String(elements.shell?.dataset.suggestionEmail || "").trim();

  if (!isValidEmail(target) || target === "SET_YOUR_EMAIL@example.com") {
    return null;
  }

  const type = String(formData.get("type") || "Other").trim();
  const title = String(formData.get("title") || "Untitled suggestion").trim();
  const link = String(formData.get("link") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  const subject = `[AI Atlas Suggestion] ${type}: ${title}`;
  const bodyLines = [
    "New suggestion for AI Resource Atlas",
    "",
    `Type: ${type}`,
    `Title: ${title}`,
    `Link: ${link || "n/a"}`,
    `Contact: ${contact || "n/a"}`,
    "",
    "Notes:",
    notes || "n/a",
  ];

  return `mailto:${target}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
}

function onSuggestionSubmit(event) {
  event.preventDefault();

  if (!(event.currentTarget instanceof HTMLFormElement)) {
    return;
  }

  const formData = new FormData(event.currentTarget);
  const mailtoUrl = buildSuggestionMailtoUrl(formData);

  if (!mailtoUrl) {
    setSuggestionStatus(
      "Suggestion email is not configured yet. Set data-suggestion-email in index.html to your inbox address.",
      true,
    );
    return;
  }

  window.location.href = mailtoUrl;
  setSuggestionStatus("Your email app was opened with a pre-filled suggestion draft.");
  event.currentTarget.reset();
}

function handleLoadError() {
  if (elements.resultCount) {
    elements.resultCount.textContent = "Unable to load repository data.";
  }

  if (elements.emptyState) {
    elements.emptyState.hidden = false;
    elements.emptyState.textContent = "The repository list could not be loaded. Please refresh and try again.";
  }
}

async function init() {
  if (!elements.form) {
    return;
  }

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch seed data: ${response.status}`);
    }

    const seedRepos = await response.json();
    repos = seedRepos.map((repo) => normalizeRepo(repo)).sort(sortRepos);

    updateHeaderStats();
    populateOptions();
    renderRepos(repos);

    elements.form.addEventListener("input", runFilters);
    elements.form.addEventListener("change", runFilters);

    if (elements.suggestionForm) {
      elements.suggestionForm.addEventListener("submit", onSuggestionSubmit);
    }
  } catch (error) {
    console.error(error);
    handleLoadError();
  }
}

init();
