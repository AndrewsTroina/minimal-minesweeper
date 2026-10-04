window.MOSS = window.MOSS || {};
(function () {
  const { CONFIG } = MOSS;
  const { Renderer, Game, UI } = MOSS;
  const Fit = MOSS.Fit;

  function boot() {
    try {
      UI.cache();
      Renderer.init();
      UI.ensureModalClosed && UI.ensureModalClosed();

      UI.setActivePreset(CONFIG.defaults.preset);
      const initial = CONFIG.presets[CONFIG.defaults.preset];
      startNewGame({ cols: initial.cols, rows: initial.rows, mines: initial.mines });

      wireGameEvents();
      wireModalEvents();

      if (Fit) Fit.init();
    } catch (err) {
      console.error('[MOSS] boot:', err);
    }
  }

  function startNewGame(config) {
    Game.newGame(config);
    const state = Game.getState();
    Renderer.rebuild(state, {
      onLeft:  (r, c) => Game.reveal(r, c),
      onRight: (r, c) => Game.toggleFlag(r, c)
    });
    Renderer.renderAll(state);
    UI.setStatus('');
    if (Fit) Fit.schedule();
  }

  // ---- API GLOBAL (usada pelos onclick inline do HTML) ----
  MOSS.startPreset = function (key) {
    if (key === 'custom') { UI.openCustomModal(); return; }
    const preset = CONFIG.presets[key];
    if (!preset) return;
    UI.setActivePreset(key);
    startNewGame({ cols: preset.cols, rows: preset.rows, mines: preset.mines });
  };

  MOSS.restart = function () {
    const key = UI.getActivePreset();
    if (key === 'custom') { UI.openCustomModal(); return; }
    const preset = CONFIG.presets[key];
    startNewGame({ cols: preset.cols, rows: preset.rows, mines: preset.mines });
  };

  MOSS.openCustom = function () {
    UI.openCustomModal();
  };

  // ---- eventos do jogo ----
  function wireGameEvents() {
    Game.on('newgame', ({ state }) => {
      UI.setMineCount(state.mineCount);
      UI.setTimer(0);
    });
    Game.on('tick',    ({ seconds })    => UI.setTimer(seconds));
    Game.on('mines',   ({ remaining })  => UI.setMineCount(remaining));
    Game.on('reveal',  ({ state })      => Renderer.renderAll(state));
    Game.on('flag',    ({ state, r, c }) => Renderer.refreshCell(state, r, c));
    Game.on('end',     ({ state, win }) => {
      Renderer.renderAll(state);
      UI.setStatus(win ? 'Você venceu' : 'Fim de jogo');
    });
  }

  // ---- eventos do modal (esses continuam via listener) ----
  function wireModalEvents() {
    UI.els.modal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', () => UI.closeCustomModal());
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !UI.els.modal.hidden) UI.closeCustomModal();
    });

    ['colInput','rowInput','mineInput'].forEach(id => {
      UI.els[id].addEventListener('input', () => UI.updateCustomHint());
    });

    UI.els.form.addEventListener('submit', e => {
      e.preventDefault();
      const { cols, rows, mines } = UI.readCustomValues();
      const total = cols * rows;
      const maxMines = Math.min(CONFIG.custom.maxMines,
        Math.max(1, Math.floor(total * CONFIG.custom.safeRatio)));
      if (mines > maxMines) {
        UI.flashHintError('Máximo ' + maxMines + ' minas.');
        return;
      }
      UI.closeCustomModal();
      UI.setActivePreset('custom');
      startNewGame({ cols, rows, mines });
    });

    // Redimensionamento
    let raf = null;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = Game.getState();
        if (s) { Renderer.updateGoo(s); if (Fit) Fit.schedule(); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();