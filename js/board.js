window.MOSS = window.MOSS || {};
MOSS.createBoard = function (cols, rows, mineCount) {
  const t = cols * rows;
  return { cols, rows, mineCount: Math.min(mineCount, t - 1), mines: new Set(),
    counts: new Array(t).fill(0), revealed: new Array(t).fill(false),
    flagged: new Array(t).fill(false), placed: false, lost: false, exploded: -1 };
};
// Minas só são sorteadas no 1º clique: ele (e a vizinhança) nunca tem mina.
MOSS.placeMines = function (s, r0, c0) {
  const { cols, rows } = s, t = cols * rows;
  let pool = [];
  for (let i = 0; i < t; i++)
    if (Math.abs(Math.floor(i / cols) - r0) > 1 || Math.abs(i % cols - c0) > 1) pool.push(i);
  if (pool.length < s.mineCount) { pool = []; for (let i = 0; i < t; i++) if (i !== r0 * cols + c0) pool.push(i); }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  pool.slice(0, s.mineCount).forEach(i => s.mines.add(i));
  for (let i = 0; i < t; i++) {
    if (s.mines.has(i)) { s.counts[i] = -1; continue; }
    const r = Math.floor(i / cols), c = i % cols; let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const a = r + dr, b = c + dc;
      if ((dr || dc) && a >= 0 && a < rows && b >= 0 && b < cols && s.mines.has(a * cols + b)) n++;
    }
    s.counts[i] = n;
  }
  s.placed = true;
};
