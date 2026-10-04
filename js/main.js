window.MOSS = window.MOSS || {};
(function () {
  const { CONFIG } = MOSS;
  const { Renderer, Game, UI } = MOSS;
  const Fit  = MOSS.Fit;
  const Touch = MOSS.Touch;

  function safe(fn, label) {
    return function () {
      try { return fn.apply(null, arguments); }
      catch (err) {
        console.error('[MOSS] erro em ' + label + ':', err);
      }
    };
  }

  function boot() {
    try {
      console.log('[MOSS] boot');
      UI.cache();
      Renderer.init();

      UI.setActivePreset(CONFIG.defaults.preset);
      const initial = CONFIG.presets[CONFIG.defaults.preset];
      startNewGame({ cols: initial.cols, rows: initial.rows, mines: initial.mines });

      wireGameEvents();
      wireUIEvents();
      wireResize();

      if (Fit) Fit.init();
      console.log('[MOSS] boot ok');
    } catch (err) {
      console.error('[MOSS] erro no boot:', err);
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

  function wireGameEvents() {
    Game.on('newgame', safe(({ state }) => {
      UI.setMineCount(state.mineCount);
      UI.setTimer(0);
    }, 'newgame'));

    Game.on('tick', safe(({ seconds }) => UI.setTimer(seconds), 'tick'));
    Game.on('mines', safe(({ remaining }) => UI.setMineCount(remaining), 'mines'));
    Game.on('reveal', safe(({ state }) => Renderer.renderAll(state), 'reveal'));
    Game.on('flag',   safe(({ state, r, c }) => Renderer.refreshCell(state, r, c), 'flag'));
    Game.on('end',    safe(({ state, win }) => {
      Renderer.renderAll(state);
      UI.setStatus(win ? 'Você venceu' : 'Fim de jogo');
    }, 'end'));
  }

  function wireUIEvents() {
    UI.els.difficulty.querySelectorAll('.difficulty__btn').forEach(btn => {
      btn.addEventListener('click', safe(() => {
        const key = btn.dataset.preset;
        console.log('[MOSS] click preset:', key);
        if (key === 'custom') { UI.openCustomModal(); return; }
        const preset = CONFIG.presets[key];
        if (!preset) { console.warn('[MOSS] preset inexistente:', key); return; }
        UI.setActivePreset(key);
        startNewGame({ cols: preset.cols, rows: preset.rows, mines: preset.mines });
      }, 'preset click'));
    });

    UI.els.restart.addEventListener('click', safe(() => {
      console.log('[MOSS] click novo jogo');
      const key = UI.getActivePreset();
      if (key === 'custom') { UI.openCustomModal(); return; }
      const preset = CONFIG.presets[key];
      startNewGame({ cols: preset.cols, rows: preset.rows, mines: preset.mines });
    }, 'restart click'));

    UI.els.modal.querySelectorAll('[data-close-modal]').forEach(el => {
      el.addEventListener('click', safe(() => UI.closeCustomModal(), 'close modal'));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !UI.els.modal.hidden) UI.closeCustomModal();
    });

    ['colInput','rowInput','mineInput'].forEach(id => {
      UI.els[id].addEventListener('input', safe(UI.updateCustomHint, 'hint'));
    });

    UI.els.form.addEventListener('submit', safe(e => {
      e.preventDefault();
      const { cols, rows, mines } = UI.readCustomValues();
      const total = cols * rows;
      const maxMines = Math.min(CONFIG.custom.maxMines,
        Math.max(1, Math.floor(total * CONFIG.custom.safeRatio)));
      if (mines > maxMines) {
        UI.flashHintError('Máximo ' + maxMines + ' minas para este tamanho.');
        return;
      }
      UI.closeCustomModal();
      UI.setActivePreset('custom');
      startNewGame({ cols, rows, mines });
    }, 'custom submit'));
  }

  function wireResize() {
    let raf = null;
    window.addEventListener('resize', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const s = Game.getState();
        if (s) {
          Renderer.updateGoo(s);
          if (Fit) Fit.schedule();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();