window.MOSS = window.MOSS || {};

/**
 * Ajusta dinamicamente as variáveis CSS do tabuleiro (--cell, --dot, --gap)
 * para que o grid inteiro caiba no espaço disponível dentro de .board-wrap,
 * sem rolagem, preservando a proporção visual entre dot e gap.
 */
MOSS.Fit = (function () {
  const MIN_CELL = 18;   // abaixo disso o tabuleiro fica ilegível no toque
  const MAX_CELL = 44;
  const DOT_RATIO = 0.60;   // dot = 60% da célula (resto é o gap)
  const GAP_RATIO = 0.40;   // gap = 40% da célula

  let wrapEl = null;
  let rafId = null;

  function cache() {
    wrapEl = document.querySelector('.board-wrap');
  }

  function compute() {
    const state = MOSS.Game && MOSS.Game.getState && MOSS.Game.getState();
    if (!wrapEl || !state) return;

    // Área disponível dentro do wrap
    const cs = getComputedStyle(wrapEl);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

    const availW = wrapEl.clientWidth  - padX;
    const availH = wrapEl.clientHeight - padY;

    if (availW <= 0 || availH <= 0) return;

    // Tamanho máximo da célula para caber nas duas direções
    const cellW = Math.floor(availW / state.cols);
    const cellH = Math.floor(availH / state.rows);
    let cell = Math.min(cellW, cellH);

    // Clamp de legibilidade
    cell = Math.max(MIN_CELL, Math.min(MAX_CELL, cell));

    const dot = Math.max(8, Math.round(cell * DOT_RATIO));
    const gap = Math.max(4, Math.round(cell * GAP_RATIO));

    // A célula real = dot + gap. Ajusta cell pra bater com o que o CSS usa.
    const realCell = dot + gap;

    const root = document.documentElement.style;
    root.setProperty('--cell', realCell + 'px');
    root.setProperty('--dot',  dot + 'px');
    root.setProperty('--gap',  gap + 'px');

    // Se a proporção foi clampada, pode ser que ainda estoure.
    // Nesse caso, o .board-wrap tem overflow:auto como fallback.
  }

  function schedule() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      rafId = null;
      compute();
      // Re-renderiza a massa preta com as novas métricas
      const state = MOSS.Game && MOSS.Game.getState && MOSS.Game.getState();
      if (state && MOSS.Renderer) MOSS.Renderer.updateGoo(state);
    });
  }

  function init() {
    cache();
    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', () => {
      // Duas chamadas: uma imediata e uma depois que o browser reflowa
      setTimeout(schedule, 50);
      setTimeout(schedule, 250);
    });
    // Também observa mudanças de layout (fonte carregando, modal, etc.)
    if ('ResizeObserver' in window && wrapEl) {
      const ro = new ResizeObserver(schedule);
      ro.observe(wrapEl);
    }
  }

  return { init, schedule, compute };
})();