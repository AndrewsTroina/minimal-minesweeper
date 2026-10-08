function escapeText(value) {
  return String(value);
}

function createImage(game, eager = false) {
  const image = document.createElement("img");

  image.src = game.image;
  image.alt = `${escapeText(game.title)} game cover`;

  image.width = 1200;
  image.height = 900;

  image.decoding = "async";

  if (!eager) {
    image.loading = "lazy";
  }

  image.addEventListener(
    "error",
    () => {
      image.removeAttribute("src");
      image.alt = `${game.title} cover unavailable`;
      image.classList.add("image-failed");
    },
    { once: true }
  );

  return image;
}

function createTags(tags) {
  const container = document.createElement("div");

  container.className = "game-tags";

  for (const tag of tags) {
    if (tag === "featured") {
      continue;
    }

    const span = document.createElement("span");

    span.textContent = tag.toUpperCase();

    container.appendChild(span);
  }

  return container;
}

export function renderFeatured(container, game) {
  container.replaceChildren();

  if (!game) {
    const empty = document.createElement("div");

    empty.className = "empty-state";
    empty.textContent = "No games available.";

    container.appendChild(empty);

    return;
  }

  const article = document.createElement("article");

  article.className = "featured-game";

  const link = document.createElement("a");

  link.className = "game-image";
  link.href = `/games/${game.slug}/`;

  link.appendChild(
    createImage(game, true)
  );

  const copy = document.createElement("div");

  copy.className = "game-copy";

  const label = document.createElement("div");

  label.className = "section-label";
  label.textContent = "PLAY NOW";

  const title = document.createElement("h2");

  title.textContent = game.title;

  const description = document.createElement("p");

  description.textContent = game.description;

  const play = document.createElement("a");

  play.className = "play-link";
  play.href = `/games/${game.slug}/`;
  play.textContent = "Open game →";

  copy.append(
    label,
    title,
    description,
    play
  );

  article.append(link, copy);

  container.appendChild(article);
}

export function renderGames(container, games) {
  container.replaceChildren();

  games.forEach((game, index) => {
    const article = document.createElement("article");

    const pattern = index % 4;

    if (pattern === 0) {
      article.className = "game-card game-card--wide";
    } else if (pattern === 1) {
      article.className = "game-card game-card--small";
    } else if (pattern === 2) {
      article.className = "game-card game-card--small";
    } else {
      article.className = "game-card game-card--wide";
    }

    const link = document.createElement("a");

    link.href = `/games/${game.slug}/`;

    const image = document.createElement("div");

    image.className = "game-image";

    image.appendChild(
      createImage(game)
    );

    const info = document.createElement("div");

    info.className = "game-info";

    const text = document.createElement("div");

    const title = document.createElement("h2");

    title.className = "game-title";
    title.textContent = game.title;

    const description = document.createElement("p");

    description.className = "game-description";
    description.textContent = game.description;

    text.append(title, description);

    info.append(
      text,
      createTags(game.tags)
    );

    link.append(image, info);

    article.appendChild(link);

    container.appendChild(article);
  });
}

export function renderTags(container, tags, onSelect) {
  const fragment = document.createDocumentFragment();

  const allButton = createTagButton(
    "all",
    true,
    onSelect
  );

  fragment.appendChild(allButton);

  for (const tag of tags) {
    fragment.appendChild(
      createTagButton(
        tag,
        false,
        onSelect
      )
    );
  }

  container.replaceChildren(fragment);
}

function createTagButton(
  tag,
  active,
  onSelect
) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "tag-filter";

  if (active) {
    button.classList.add("is-active");
  }

  button.dataset.tag = tag;
  button.setAttribute(
    "aria-pressed",
    String(active)
  );

  button.textContent =
    tag === "all"
      ? "ALL"
      : tag.toUpperCase();

  button.addEventListener(
    "click",
    () => onSelect(tag)
  );

  return button;
    }
