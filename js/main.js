window.MOSS = window.MOSS || {};

(function () {
  const { CONFIG } = MOSS;
  const { Renderer, Game, UI, utils } = MOSS;

  function boot() {
    UI.cache();
    Renderer.init();

    // Preset inicial
    UI.setActivePreset(CONFIG.defaults.preset);
    const initial = CONFIG.presets[CONFIG.defaults.preset];

    startNewGame({
      cols: initial.cols,
      rows: initial.rows,
      mines: initial.mines
    });

    wireGameEvents();
    wireUIEvents();
    wireResize();
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
  }

  function wireGameEvents() {
    Game.on('newgame', ({ state }) => {
      UI.setMineCount(state.mineCount);
      UI.setTimer(0);
    });

    Game.on('tick', ({ seconds }) => UI.setTimer(seconds));

    Game.on('mines', ({ remaining }) => UI.setMineCount(remaining));

    Game.on('reveal', ({ state }) => {
      // Atualiza todas as células afetadas + massa preta
      Renderer.renderAll(state);
    });

    Game.on('flag', ({ state, r, c }) => {
      Renderer.refreshCell(state, r, c);
    });

    Game.on('end', ({ state, win }) => {
      Renderer.renderAll(state);
      UI.setStatus(win ? 'Você venceu' : 'Fim de jogo');
    });
  }

  function wireUIEvents() {
    // Preset buttons
    UI.els.difficulty.querySelectorAll('.difficulty__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        if (key === 'custom') {
          UI.openCustomModal();
          return;
        }
        const preset = CONFIG.presets[key];
        UI.setActivePreset(key);
        startNewGame({
          cols: preset.cols,
          rows: preset.rows,
          mines: preset.mines
        });
      });
    });

    // Restart
    UI.els.restart.addEventListener('click', () => {
      const key = UI.getActivePreset();
      if (key === 'custom') {
        UI.openCustomModal();
        return;
      }
      const preset = CONFIG.presets[key];
      startNewGame({
        cols: preset.cols,
        rows: preset.rows,
        mines: preset.mines
      });
    });

    // Modal close
    UI.els.modal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', () => UI.closeCustomModal());
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !UI.els.modal.hidden) {
        UI.closeCustomModal();
      }
    });

    // Modal inputs -> hint dinâmico
    ['colInput', 'rowInput', 'mineInput'].forEach(id => {
      UI.els[id].addEventListener('input', UI.updateCustomHint);
    });

    // Submit custom
    UI.els.form.addEventListener('submit', e => {
      e.preventDefault();
      const { cols, rows, mines } = UI.readCustomValues();
      const total = cols * rows;
      const maxMines = Math.min(
        CONFIG.custom.maxMines,
        Math.max(1, Math.floor(total * CONFIG.custom.safeRatio))
      );
      if (mines > maxMines) {
        UI.flashHintError(`Máximo ${maxMines} minas para este tamanho.`);
        return;
      }
      UI.closeCustomModal();
      UI.setActivePreset('custom');
      startNewGame({ cols, rows, mines });
    });
  }

  function wireResize() {
    let raf = null;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const state = Game.getState();
        if (state) Renderer.updateGoo(state);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();