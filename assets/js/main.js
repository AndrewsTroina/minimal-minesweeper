import { loadGames } from "./data.js";
import {
  searchGames,
  filterByTag,
  getAvailableTags
} from "./filtering.js";
import {
  selectFeaturedGame
} from "./featured.js";
import {
  renderFeatured,
  renderGames,
  renderTags
} from "./rendering.js";
import {
  initializeTheme
} from "./theme.js";

const featuredContainer =
  document.querySelector(
    "#featured-game"
  );

const gameGrid =
  document.querySelector(
    "#game-grid"
  );

const searchInput =
  document.querySelector(
    "#game-search"
  );

const tagFilters =
  document.querySelector(
    "#tag-filters"
  );

const emptyState =
  document.querySelector(
    "#empty-state"
  );

const clearFilters =
  document.querySelector(
    "#clear-filters"
  );

const themeButton =
  document.querySelector(
    ".theme-toggle"
  );

let allGames = [];
let activeTag = "all";

function showError(message) {
  featuredContainer.replaceChildren();

  const error = document.createElement("div");

  error.className = "error-state";
  error.setAttribute("role", "alert");
  error.textContent = message;

  featuredContainer.appendChild(error);

  gameGrid.replaceChildren();
}

function updateResults() {
  const searched = searchGames(
    allGames,
    searchInput.value
  );

  const filtered = filterByTag(
    searched,
    activeTag
  );

  renderGames(
    gameGrid,
    filtered
  );

  emptyState.hidden =
    filtered.length !== 0;
}

function selectTag(tag) {
  activeTag = tag;

  const buttons =
    tagFilters.querySelectorAll(
      ".tag-filter"
    );

  buttons.forEach((button) => {
    const active =
      button.dataset.tag === tag;

    button.classList.toggle(
      "is-active",
      active
    );

    button.setAttribute(
      "aria-pressed",
      String(active)
    );
  });

  updateResults();
}

function clearAllFilters() {
  searchInput.value = "";
  selectTag("all");
}

async function initialize() {
  initializeTheme(themeButton);

  clearFilters.addEventListener(
    "click",
    clearAllFilters
  );

  searchInput.addEventListener(
    "input",
    updateResults
  );

  try {
    allGames = await loadGames();

    const featured =
      selectFeaturedGame(allGames);

    renderFeatured(
      featuredContainer,
      featured
    );

    const tags =
      getAvailableTags(allGames);

    renderTags(
      tagFilters,
      tags,
      selectTag
    );

    updateResults();
  } catch (error) {
    console.error(
      "Game platform initialization failed:",
      error
    );

    showError(
      "The game collection could not be loaded."
    );
  }
}

initialize();
