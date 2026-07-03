const DATA_URL = "./src/data/repos.seed.json";

const elements = {
  shell: document.getElementById("content"),
  form: document.getElementById("repo-filters"),
  search: document.getElementById("search-input"),
  category: document.getElementById("category-select"),
  assetType: document.getElementById("type-select"),
  tag: document.getElementById("tag-select"),
  featured: document.getElementById("featured-only"),
  paperTotal: document.getElementById("paper-total"),
  paperLibraryCount: document.getElementById("paper-library-count"),
  paperList: document.getElementById("paper-list"),
  featuredTrack: document.getElementById("featured-track"),
  featuredLabel: document.getElementById("featured-carousel-label"),
  repoList: document.getElementById("repo-list"),
  resultCount: document.getElementById("result-count"),
  emptyState: document.getElementById("empty-state"),
  repoTotal: document.getElementById("repo-total"),
  categoryTotal: document.getElementById("category-total"),
  directMailtoLink: document.getElementById("direct-mailto-link"),
};

let assets = [];
let featuredAssets = [];

function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  const apply = (theme) => {
    root.dataset.theme = theme;

    if (!toggle) {
      return;
    }

    const isDark = theme === "dark";
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

    const label = toggle.querySelector(".theme-toggle__label");
    if (label) {
      label.textContent = isDark ? "Light" : "Dark";
    }
  };

  apply(root.dataset.theme === "dark" ? "dark" : "light");

  toggle?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";

    try {
      localStorage.setItem("atlas-theme", next);
    } catch (error) {
      /* storage may be unavailable; theme still applies for this session */
    }

    apply(next);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeAssetType(assetType, hasRepoCoordinates) {
  const type = String(assetType || "").trim().toLowerCase();

  if (!type && hasRepoCoordinates) {
    return "GitHub Repo";
  }

  if (type === "paper") {
    return "Paper";
  }

  if (type === "skill" || type === "skills") {
    return "Skill";
  }

  if (type === "github repo" || type === "repo" || type === "repository" || type === "github") {
    return "GitHub Repo";
  }

  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Asset";
}

function buildAssetTitle(raw) {
  const owner = String(raw.owner || "").trim();
  const repo = String(raw.repo || "").trim();
  const explicitTitle = String(raw.title || "").trim();

  if (explicitTitle) {
    return explicitTitle;
  }

  if (owner && repo) {
    return `${owner}/${repo}`;
  }

  return "Untitled asset";
}

function buildAssetUrl(raw) {
  const explicitUrl = String(raw.url || "").trim();
  const owner = String(raw.owner || "").trim();
  const repo = String(raw.repo || "").trim();

  if (explicitUrl) {
    return explicitUrl;
  }

  if (owner && repo) {
    return `https://github.com/${owner}/${repo}`;
  }

  return "#";
}

function buildSourceLabel(assetType, raw, url) {
  const owner = String(raw.owner || "").trim();
  const repo = String(raw.repo || "").trim();

  if (assetType === "GitHub Repo" && owner && repo) {
    return `${owner}/${repo}`;
  }

  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch (error) {
    return "external";
  }
}

function normalizeAsset(raw) {
  const owner = String(raw.owner || "").trim();
  const repo = String(raw.repo || "").trim();
  const hasRepoCoordinates = Boolean(owner && repo);
  const assetType = normalizeAssetType(raw.assetType, hasRepoCoordinates);
  const title = buildAssetTitle(raw);
  const url = buildAssetUrl(raw);
  const category = String(raw.category || "General").trim() || "General";
  const useCase = String(raw.useCase || "").trim();
  const rawDescription = String(raw.description || "").trim();
  const rawSummary = String(raw.summary || "").trim();
  const tags = (raw.tags || []).map((tag) => String(tag).toLowerCase().replace(/\s+/g, "-")).filter(Boolean);
  const tagPreview = tags.slice(0, 2).join(" and ") || "practical workflows";
  const generatedSummary = `${assetType} asset for ${tagPreview}.`;
  const description = rawDescription || useCase || generatedSummary;
  const summary = rawSummary || rawDescription || useCase || generatedSummary;
  const source = buildSourceLabel(assetType, raw, url);
  const id = `${assetType}:${title}:${url}`.toLowerCase().replace(/\s+/g, "-");

  return {
    id,
    assetType,
    title,
    url,
    category,
    tags,
    description,
    summary,
    useCase,
    featured: Boolean(raw.featured),
    source,
  };
}

function sortAssets(a, b) {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  const typeCompare = a.assetType.localeCompare(b.assetType);
  if (typeCompare !== 0) {
    return typeCompare;
  }

  return a.title.localeCompare(b.title);
}

function updateHeaderStats() {
  const categories = new Set(assets.map((asset) => asset.category));
  const paperCount = assets.filter((asset) => asset.assetType === "Paper").length;

  if (elements.repoTotal) {
    elements.repoTotal.textContent = `${assets.length} assets`;
  }

  if (elements.categoryTotal) {
    elements.categoryTotal.textContent = `${categories.size} categories`;
  }

  if (elements.paperTotal) {
    elements.paperTotal.textContent = `${paperCount} paper assets`;
  }
}

function collectPaperAssets(sourceAssets) {
  return sourceAssets
    .filter((asset) => asset.assetType === "Paper")
    .sort((a, b) => a.title.localeCompare(b.title));
}

function renderPaperLibrary(sourceAssets) {
  if (!elements.paperList || !elements.paperLibraryCount) {
    return;
  }

  const paperAssets = collectPaperAssets(sourceAssets);

  if (!paperAssets.length) {
    elements.paperList.replaceChildren();
    elements.paperLibraryCount.textContent = "0 paper assets in the current view.";
    return;
  }

  const paperItems = paperAssets.map((paper) => {
    const item = document.createElement("li");
    item.className = "paper-library__item";
    item.innerHTML = `
      <a class="paper-library__link" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(paper.title)}</a>
      <p class="paper-library__summary">${escapeHtml(paper.summary)}</p>
      <span class="paper-library__source">${escapeHtml(paper.category)} · ${escapeHtml(paper.source)}</span>
    `;
    return item;
  });

  elements.paperList.replaceChildren(...paperItems);
  elements.paperLibraryCount.textContent = `${paperAssets.length} paper assets in the current view.`;
}

function populateOptions() {
  const categories = [...new Set(assets.map((asset) => asset.category))].sort((a, b) => a.localeCompare(b));
  const assetTypes = [...new Set(assets.map((asset) => asset.assetType))].sort((a, b) => a.localeCompare(b));
  const tags = [...new Set(assets.flatMap((asset) => asset.tags))].sort((a, b) => a.localeCompare(b));

  if (elements.category) {
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      elements.category.appendChild(option);
    });
  }

  if (elements.assetType) {
    assetTypes.forEach((assetType) => {
      const option = document.createElement("option");
      option.value = assetType;
      option.textContent = assetType;
      elements.assetType.appendChild(option);
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

function createAssetCard(asset) {
  const article = document.createElement("article");
  article.className = "repo-card";
  article.dataset.assetId = asset.id;

  const tagsMarkup = asset.tags.length
    ? asset.tags.map((tag) => `<span class="repo-tag">#${escapeHtml(tag)}</span>`).join("")
    : '<span class="repo-tag repo-tag--muted">#untagged</span>';

  const useCaseMarkup = asset.useCase && asset.useCase !== asset.description
    ? `<p class="repo-use-case"><strong>Use case:</strong> ${escapeHtml(asset.useCase)}</p>`
    : "";

  article.innerHTML = `
    <header class="repo-card__head">
      <a class="repo-card__title" href="${escapeHtml(asset.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(asset.title)}</a>
      ${asset.featured ? '<span class="repo-badge">featured</span>' : ""}
    </header>

    <p class="repo-card__description">${escapeHtml(asset.description)}</p>

    ${useCaseMarkup}

    <ul class="repo-card__meta" aria-label="Asset metadata for ${escapeHtml(asset.title)}">
      <li>${escapeHtml(asset.assetType)}</li>
      <li>${escapeHtml(asset.category)}</li>
      <li>${escapeHtml(asset.source)}</li>
    </ul>

    <div class="repo-card__tags" aria-label="Tags">
      ${tagsMarkup}
    </div>
  `;

  return article;
}

function getDailySeed() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000);
}

function createSeededRng(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDailyFeatured(items, count) {
  if (!items.length || count <= 0) {
    return [];
  }

  const rng = createSeededRng(getDailySeed());
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function renderFeaturedCarousel() {
  if (!elements.featuredTrack || !elements.featuredLabel) {
    return;
  }

  if (!featuredAssets.length) {
    elements.featuredTrack.replaceChildren();
    elements.featuredLabel.textContent = "No featured assets available yet.";
    return;
  }

  const visible = pickDailyFeatured(featuredAssets, 3);

  const cards = visible.map((asset) => {
    const card = document.createElement("article");
    card.className = "featured-card";

    const tags = asset.tags.slice(0, 3).map((tag) => `#${escapeHtml(tag)}`).join(" ");

    card.innerHTML = `
      <a class="featured-card__title" href="${escapeHtml(asset.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(asset.title)}</a>
      <p class="featured-card__summary">${escapeHtml(asset.description)}</p>
      <p class="featured-card__meta">${escapeHtml(asset.assetType)} · ${escapeHtml(asset.category)}</p>
      <p class="featured-card__tags">${tags || "#untagged"}</p>
    `;

    return card;
  });

  elements.featuredTrack.replaceChildren(...cards);
  elements.featuredLabel.textContent = `Daily seed selection active · showing ${visible.length} of ${featuredAssets.length} featured assets.`;
}

function initFeaturedCarousel(allAssets) {
  featuredAssets = allAssets.filter((asset) => asset.featured);

  if (!featuredAssets.length) {
    featuredAssets = [...allAssets];
  }

  renderFeaturedCarousel();
}

function renderAssets(filteredAssets) {
  if (!elements.repoList || !elements.resultCount || !elements.emptyState) {
    return;
  }

  elements.repoList.replaceChildren(...filteredAssets.map((asset) => createAssetCard(asset)));
  renderPaperLibrary(filteredAssets);
  elements.resultCount.textContent = `Showing ${filteredAssets.length} assets.`;
  elements.emptyState.hidden = filteredAssets.length > 0;
}

function matchesQuery(asset, query) {
  if (!query) {
    return true;
  }

  const haystack = `${asset.title} ${asset.description} ${asset.assetType} ${asset.category} ${asset.tags.join(" ")}`.toLowerCase();
  return haystack.includes(query);
}

function runFilters() {
  const query = (elements.search?.value || "").trim().toLowerCase();
  const category = elements.category?.value || "all";
  const assetType = elements.assetType?.value || "all";
  const tag = elements.tag?.value || "all";
  const featuredOnly = Boolean(elements.featured?.checked);

  const filtered = assets.filter((asset) => {
    if (!matchesQuery(asset, query)) {
      return false;
    }

    if (category !== "all" && asset.category !== category) {
      return false;
    }

    if (assetType !== "all" && asset.assetType !== assetType) {
      return false;
    }

    if (tag !== "all" && !asset.tags.includes(tag)) {
      return false;
    }

    if (featuredOnly && !asset.featured) {
      return false;
    }

    return true;
  });

  renderAssets(filtered);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function readSetting(key, fallback = "") {
  return String(elements.shell?.dataset[key] || fallback).trim();
}

function buildSuggestionMailtoUrl() {
  const target = readSetting("suggestionEmail");
  const cc = readSetting("suggestionCc");
  const bcc = readSetting("suggestionBcc");
  const prefix = readSetting("suggestionSubjectPrefix", "[IIDA][Suggestion]");

  if (!isValidEmail(target)) {
    return null;
  }

  const subject = `${prefix}[ASSET] New Asset Suggestion`;
  const bodyLines = [
    "New suggestion for IIDA: Data Excellence AI Knowledge Base",
    "",
    "Tags: #iida #data-excellence #suggestion #asset",
    "Asset Type: Skill / Paper / GitHub Repo / Other",
    "Title: n/a",
    "Link: n/a",
    "Context: n/a",
    `Source URL: ${window.location.href}`,
  ];

  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", bodyLines.join("\n"));

  if (cc) {
    params.set("cc", cc);
  }

  if (bcc) {
    params.set("bcc", bcc);
  }

  return `mailto:${target}?${params.toString()}`;
}

function initDirectMailtoLink() {
  if (!elements.directMailtoLink) {
    return;
  }

  const mailtoUrl = buildSuggestionMailtoUrl();

  if (!mailtoUrl) {
    elements.directMailtoLink.setAttribute("href", "#");
    elements.directMailtoLink.setAttribute("aria-disabled", "true");
    elements.directMailtoLink.textContent = "Suggestion email is not configured";
    return;
  }

  elements.directMailtoLink.setAttribute("href", mailtoUrl);
}

function handleLoadError() {
  if (elements.resultCount) {
    elements.resultCount.textContent = "Unable to load asset data.";
  }

  if (elements.emptyState) {
    elements.emptyState.hidden = false;
    elements.emptyState.textContent = "The asset list could not be loaded. Please refresh and try again.";
  }
}

async function init() {
  initThemeToggle();

  if (!elements.form) {
    return;
  }

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch seed data: ${response.status}`);
    }

    const seedAssets = await response.json();
    assets = seedAssets.map((asset) => normalizeAsset(asset)).sort(sortAssets);

    updateHeaderStats();
    initFeaturedCarousel(assets);
    populateOptions();
    renderAssets(assets);

    elements.form.addEventListener("input", runFilters);
    elements.form.addEventListener("change", runFilters);
    initDirectMailtoLink();
  } catch (error) {
    console.error(error);
    handleLoadError();
  }
}

void init();
