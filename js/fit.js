window.MOSS = window.MOSS || {};
MOSS.Fit = (function () {
  let wrap, svg, raf;
  function compute() {
    const s = MOSS.Game.getState();
    if (!wrap || !s) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (w <= 0 || h <= 0) return;
    const cell = Math.max(16, Math.min(44, Math.floor(Math.min(w / s.cols, h / s.rows))));
    svg.style.width = cell * s.cols + 'px';
    svg.style.height = cell * s.rows + 'px';
    document.documentElement.style.setProperty('--board-w', cell * s.cols + 'px');
  }
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(compute); }
  function init() {
    wrap = document.querySelector('.board-wrap'); svg = document.getElementById('boardSvg');
    schedule(); addEventListener('resize', schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(wrap);
  }
  return { init, schedule };
})();
