window.MOSS = window.MOSS || {};
(function () {
  const { CONFIG, Renderer, Game, UI, Fit } = MOSS;
  let last = null;

  function startNewGame(cfg) {
    last = cfg;
    Game.newGame(cfg);
    const s = Game.getState();
    Renderer.rebuild(s, { onLeft: (r, c) => Game.reveal(r, c), onRight: (r, c) => Game.toggleFlag(r, c) });
    Renderer.renderAll(s);
    UI.setStatus('');
    Fit.schedule();
  }
  function preset(key) {
    if (key === 'custom') return UI.openCustomModal();
    const p = CONFIG.presets[key]; if (!p) return;
    UI.setActivePreset(key);
    startNewGame({ cols: p.cols, rows: p.rows, mines: p.mines });
  }

  function boot() {
    UI.cache(); Renderer.init(); UI.ensureModalClosed();
    document.querySelectorAll('.difficulty__btn').forEach(b => b.addEventListener('click', () => preset(b.dataset.preset)));
    document.getElementById('restart').addEventListener('click', () => startNewGame(last));
    document.querySelectorAll('.site-nav a').forEach(a => a.addEventListener('click', e => e.preventDefault()));

    Game.on('newgame', ({ state }) => { UI.setMineCount(state.mineCount); UI.setTimer(0); });
    Game.on('tick', ({ seconds }) => UI.setTimer(seconds));
    Game.on('mines', ({ remaining }) => UI.setMineCount(remaining));
    Game.on('reveal', ({ state }) => Renderer.renderAll(state));
    Game.on('flag', ({ state }) => Renderer.renderAll(state));
    Game.on('end', ({ state, win }) => { Renderer.renderAll(state); UI.setStatus(win ? 'Você venceu' : 'Fim de jogo'); });

    UI.els.modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', UI.closeCustomModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !UI.els.modal.hidden) UI.closeCustomModal(); });
    ['colInput', 'rowInput', 'mineInput'].forEach(id => UI.els[id].addEventListener('input', UI.updateCustomHint));
    UI.els.form.addEventListener('submit', e => {
      e.preventDefault();
      const { cols, rows, mines, maxMines } = UI.readCustomValues();
      if (mines > maxMines) return UI.flashHintError('Máximo ' + maxMines + ' minas.');
      UI.closeCustomModal(); UI.setActivePreset('custom');
      startNewGame({ cols, rows, mines });
    });

    UI.setActivePreset(CONFIG.defaults.preset);
    const p = CONFIG.presets[CONFIG.defaults.preset];
    startNewGame({ cols: p.cols, rows: p.rows, mines: p.mines });
    Fit.init();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
