import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const GAMES_DIR = path.join(ROOT, "games");
const MANIFEST_PATH = path.join(ROOT, "games.json");

const VALID_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const REQUIRED_FIELDS = [
  "title",
  "description",
  "image",
  "tags"
];

function fail(message) {
  console.error(`ERROR: ${message}`);
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(
    tags
      .filter((tag) => typeof tag === "string")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )];
}

function validateGame(slug, metadata) {
  const errors = [];

  if (!VALID_SLUG.test(slug)) {
    errors.push(`invalid slug "${slug}"`);
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    errors.push("metadata must be an object");
    return errors;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in metadata)) {
      errors.push(`missing "${field}"`);
    }
  }

  if (typeof metadata.title !== "string" || !metadata.title.trim()) {
    errors.push("title must be a non-empty string");
  }

  if (
    typeof metadata.description !== "string" ||
    !metadata.description.trim()
  ) {
    errors.push("description must be a non-empty string");
  }

  if (typeof metadata.image !== "string" || !metadata.image.trim()) {
    errors.push("image must be a non-empty string");
  }

  if (!Array.isArray(metadata.tags)) {
    errors.push("tags must be an array");
  } else {
    for (const tag of metadata.tags) {
      if (typeof tag !== "string") {
        errors.push("every tag must be a string");
        break;
      }
    }
  }

  return errors;
}

function readGame(slug) {
  const directory = path.join(GAMES_DIR, slug);
  const metadataPath = path.join(directory, "game.json");

  if (!fs.existsSync(metadataPath)) {
    fail(`${slug}: missing game.json`);
    return null;
  }

  let metadata;

  try {
    metadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf8")
    );
  } catch (error) {
    fail(`${slug}: invalid JSON`);
    return null;
  }

  const errors = validateGame(slug, metadata);

  if (errors.length > 0) {
    fail(`${slug}: ${errors.join("; ")}`);
    return null;
  }

  const imagePath = path.resolve(
    directory,
    metadata.image
  );

  if (!imagePath.startsWith(path.resolve(directory))) {
    fail(`${slug}: image path escapes game directory`);
    return null;
  }

  if (!fs.existsSync(imagePath)) {
    fail(`${slug}: image does not exist: ${metadata.image}`);
    return null;
  }

  return {
    slug,
    title: metadata.title.trim(),
    description: metadata.description.trim(),
    image: `/games/${slug}/${metadata.image.replaceAll("\\", "/")}`,
    tags: normalizeTags(metadata.tags)
  };
}

function getGameDirectories() {
  if (!fs.existsSync(GAMES_DIR)) {
    return [];
  }

  return fs.readdirSync(GAMES_DIR, {
    withFileTypes: true
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function generate() {
  const directories = getGameDirectories();
  const games = [];
  const slugs = new Set();

  for (const slug of directories) {
    if (slugs.has(slug)) {
      fail(`duplicate slug: ${slug}`);
      continue;
    }

    slugs.add(slug);

    const game = readGame(slug);

    if (game) {
      games.push(game);
    }
  }

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    games
  };

  fs.writeFileSync(
    MANIFEST_PATH,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `Generated games.json with ${games.length} valid game(s).`
  );

  return games;
}

const games = generate();

if (process.argv.includes("--check") && games.length === 0) {
  console.warn(
    "WARNING: no valid games were found."
  );
}
