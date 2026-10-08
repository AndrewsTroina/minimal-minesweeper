const MANIFEST_URL = "/games.json";

export async function loadGames() {
  const response = await fetch(MANIFEST_URL, {
    cache: "no-cache"
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load game manifest (${response.status}).`
    );
  }

  const data = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray(data.games)
  ) {
    throw new Error("Invalid game manifest.");
  }

  return data.games;
}
