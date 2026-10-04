window.MOSS = window.MOSS || {};

MOSS.Fit = (function () {
  const MIN_CELL = 20;
  const MAX_CELL = 48;
  const DOT_RATIO = 0.86;   // círculos ocupam 86% da célula (antes 60%)
  const GAP_RATIO = 0.14;   // gap pequeno, círculos quase se tocam

  let wrapEl = null;
  let rafId = null;

  function cache() {
    wrapEl = document.querySelector('.board-wrap');
  }

  function compute() {
    const state = MOSS.Game && MOSS.Game.getState && MOSS.Game.getState();
    if (!wrapEl || !state) return;

    const cs = getComputedStyle(wrapEl);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop)  + parseFloat(cs.paddingBottom);

    const availW = wrapEl.clientWidth  - padX;
    const availH = wrapEl.clientHeight - padY;
    if (availW <= 0 || availH <= 0) return;

    const cellW = Math.floor(availW / state.cols);
    const cellH = Math.floor(availH / state.rows);
    let cell = Math.min(cellW, cellH);
    cell = Math.max(MIN_CELL, Math.min(MAX_CELL, cell));

    const dot = Math.max(10, Math.round(cell * DOT_RATIO));
    const gap = Math.max(2,  cell - dot);

    const realCell = dot + gap;

    const root = document.documentElement.style;
    root.setProperty('--cell', realCell + 'px');
    root.setProperty('--dot',  dot + 'px');
    root.setProperty('--gap',  gap + 'px');
  }

  function schedule() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      compute();
      const state = MOSS.Game && MOSS.Game.getState && MOSS.Game.getState();
      if (state && MOSS.Renderer) MOSS.Renderer.updateGoo(state);
    });
  }

  function init() {
    cache();
    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', () => {
      setTimeout(schedule, 50);
      setTimeout(schedule, 250);
    });
    if ('ResizeObserver' in window && wrapEl) {
      const ro = new ResizeObserver(schedule);
      ro.observe(wrapEl);
    }
  }

  return { init, schedule, compute };
})();