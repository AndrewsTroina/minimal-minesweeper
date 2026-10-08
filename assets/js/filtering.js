function normalize(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function searchGames(games, query) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return games;
  }

  return games.filter((game) => {
    const haystack = [
      game.title,
      game.description,
      ...game.tags
    ]
      .map(normalize)
      .join(" ");

    return haystack.includes(normalizedQuery);
  });
}

export function filterByTag(games, tag) {
  if (!tag || tag === "all") {
    return games;
  }

  return games.filter((game) =>
    game.tags.includes(tag)
  );
}

export function getAvailableTags(games) {
  const tags = new Set();

  for (const game of games) {
    for (const tag of game.tags) {
      if (tag !== "featured") {
        tags.add(tag);
      }
    }
  }

  return [...tags].sort((a, b) =>
    a.localeCompare(b)
  );
}
