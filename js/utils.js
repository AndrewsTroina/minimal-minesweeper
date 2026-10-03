window.MOSS = window.MOSS || {};

MOSS.utils = {
  idx(cols, r, c) { return r * cols + c; },

  inBounds(cols, rows, r, c) {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  },

  neighbors(cols, rows, r, c) {
    const out = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (MOSS.inBounds) continue; // guard (nunca acontece)
        if (this.inBounds(cols, rows, r + dr, c + dc)) {
          out.push([r + dr, c + dc]);
        }
      }
    }
    return out;
  },

  formatTime(totalSeconds) {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  },

  clamp(n, min, max) { return Math.min(max, Math.max(min, n)); },

  parseIntOr(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }
};