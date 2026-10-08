const STORAGE_KEY = "theme";

function getStoredTheme() {
  try {
    const theme = localStorage.getItem(
      STORAGE_KEY
    );

    return theme === "light" || theme === "dark"
      ? theme
      : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
}

export function initializeTheme(button) {
  const stored = getStoredTheme();

  const theme =
    stored || getSystemTheme();

  applyTheme(theme, button);

  button.addEventListener(
    "click",
    () => {
      const current =
        document.documentElement.dataset.theme ||
        getSystemTheme();

      const next =
        current === "dark"
          ? "light"
          : "dark";

      try {
        localStorage.setItem(
          STORAGE_KEY,
          next
        );
      } catch {
        // Theme still applies for this session.
      }

      applyTheme(next, button);
    }
  );
}

function applyTheme(theme, button) {
  document.documentElement.dataset.theme =
    theme;

  button.setAttribute(
    "aria-pressed",
    String(theme === "dark")
  );

  button.setAttribute(
    "aria-label",
    theme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"
  );
}
