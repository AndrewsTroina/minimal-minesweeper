window.MOSS = window.MOSS || {};
MOSS.Game = (function () {
  let s = null, finished = false, started = false, seconds = 0, timerId = null;
  const L = {};
  const on = (e, f) => (L[e] = L[e] || []).push(f);
  const emit = (e, p) => (L[e] || []).forEach(f => f(p));
  const stop = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

  function newGame(cfg) {
    stop(); finished = false; started = false; seconds = 0;
    s = MOSS.createBoard(cfg.cols, cfg.rows, cfg.mines);
    emit('newgame', { state: s }); emit('tick', { seconds }); emit('mines', { remaining: s.mineCount });
  }
  function start() {
    if (started) return; started = true;
    timerId = setInterval(() => { seconds++; emit('tick', { seconds }); }, 1000);
  }
  function nb(r, c) {
    const o = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const a = r + dr, b = c + dc;
      if ((dr || dc) && a >= 0 && a < s.rows && b >= 0 && b < s.cols) o.push([a, b]);
    }
    return o;
  }
  function flood(r, c) {
    const st = [[r, c]]; let hit = false;
    while (st.length) {
      const [a, b] = st.pop(), i = a * s.cols + b;
      if (s.revealed[i] || s.flagged[i]) continue;
      s.revealed[i] = true;
      if (s.counts[i] === -1) { hit = true; s.exploded = i; continue; }
      if (s.counts[i] === 0) nb(a, b).forEach(p => st.push(p));
    }
    return hit;
  }
  function reveal(r, c) {
    if (finished || !s) return;
    const i = r * s.cols + c;
    if (s.flagged[i]) return;
    if (!s.placed) MOSS.placeMines(s, r, c);
    start();
    let hit = false;
    if (s.revealed[i]) {                       // "chording": número com bandeiras suficientes
      const n = nb(r, c);
      if (s.counts[i] < 1 || n.filter(([a, b]) => s.flagged[a * s.cols + b]).length !== s.counts[i]) return;
      n.forEach(([a, b]) => { if (flood(a, b)) hit = true; });
    } else hit = flood(r, c);
    emit('reveal', { state: s });
    if (hit) return end(false);
    if (won()) end(true);
  }
  function toggleFlag(r, c) {
    if (finished || !s) return;
    const i = r * s.cols + c;
    if (s.revealed[i]) return;
    s.flagged[i] = !s.flagged[i];
    emit('flag', { state: s });
    emit('mines', { remaining: Math.max(0, s.mineCount - s.flagged.filter(Boolean).length) });
  }
  function won() {
    for (let i = 0; i < s.counts.length; i++) if (s.counts[i] !== -1 && !s.revealed[i]) return false;
    return true;
  }
  function end(win) {
    finished = true; stop();
    if (win) { s.mines.forEach(i => s.flagged[i] = true); emit('mines', { remaining: 0 }); }
    else s.lost = true;
    emit('end', { state: s, win });
  }
  return { on, newGame, reveal, toggleFlag, getState: () => s, isFinished: () => finished };
})();
