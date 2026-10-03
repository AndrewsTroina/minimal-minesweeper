window.MOSS = window.MOSS || {};

/**
 * Constrói o estado lógico do tabuleiro.
 * Retorna: { cols, rows, mines, counts, revealed, flagged }
 */
MOSS.createBoard = function (cols, rows, mineCount) {
  const total = cols * rows;
  const mines = new Set();
  const safeMineCount = Math.min(mineCount, total - 1);

  while (mines.size < safeMineCount) {
    mines.add(Math.floor(Math.random() * total));
  }

  const counts = new Array(total).fill(0);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (mines.has(i)) { counts[i] = -1; continue; }
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (mines.has(nr * cols + nc)) n++;
        }
      }
      counts[i] = n;
    }
  }

  return {
    cols, rows,
    mineCount: safeMineCount,
    mines,
    counts,
    revealed: new Array(total).fill(false),
    flagged:  new Array(total).fill(false)
  };
};