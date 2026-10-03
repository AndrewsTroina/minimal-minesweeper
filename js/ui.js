window.MOSS = window.MOSS || {};

MOSS.UI = (function () {
  let els = {};
  let currentPreset = MOSS.CONFIG.defaults.preset;

  function cache() {
    els = {
      board:       document.getElementById('board'),
      mineCount:   document.getElementById('mineCount'),
      timer:       document.getElementById('timer'),
      status:      document.getElementById('status'),
      restart:     document.getElementById('restart'),
      difficulty:  document.getElementById('difficulty'),
      modal:       document.getElementById('customModal'),
      form:        document.getElementById('customForm'),
      colInput:    document.getElementById('colInput'),
      rowInput:    document.getElementById('rowInput'),
      mineInput:   document.getElementById('mineInput'),
      customHint:  document.getElementById('customHint')
    };
  }

  function setMineCount(n)  { els.mineCount.textContent = String(n); }
  function setTimer(sec)    { els.timer.textContent = MOSS.utils.formatTime(sec); }
  function setStatus(txt)   { els.status.textContent = txt; }

  function setActivePreset(preset) {
    currentPreset = preset;
    els.difficulty.querySelectorAll('.difficulty__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.preset === preset);
    });
  }
  function getActivePreset() { return currentPreset; }

  function openCustomModal() {
    const c = MOSS.CONFIG.custom;
    els.colInput.value  = MOSS.utils.clamp(11, c.minCols, c.maxCols);
    els.rowInput.value  = MOSS.utils.clamp(10, c.minRows, c.maxRows);
    els.mineInput.value = 10;
    updateCustomHint();
    els.modal.hidden = false;
    setTimeout(() => els.colInput.focus(), 30);
  }
  function closeCustomModal() { els.modal.hidden = true; }

  function readCustomValues() {
    const c = MOSS.CONFIG.custom;
    const cols  = MOSS.utils.clamp(MOSS.utils.parseIntOr(els.colInput.value, 11), c.minCols, c.maxCols);
    const rows  = MOSS.utils.clamp(MOSS.utils.parseIntOr(els.rowInput.value, 10), c.minRows, c.maxRows);
    const total = cols * rows;
    const maxMines = Math.min(c.maxMines, Math.max(1, Math.floor(total * c.safeRatio)));
    const mines = MOSS.utils.clamp(MOSS.utils.parseIntOr(els.mineInput.value, 10), 1, maxMines);
    return { cols, rows, mines, maxMines, total };
  }

  function updateCustomHint() {
    const { cols, rows, maxMines, total } = readCustomValues();
    els.customHint.textContent = `Tabuleiro ${cols} × ${rows} · máx. ${maxMines} minas (${total} células)`;
    els.customHint.classList.remove('is-error');
  }

  function flashHintError(msg) {
    els.customHint.textContent = msg;
    els.customHint.classList.add('is-error');
  }

  return {
    cache,
    setMineCount, setTimer, setStatus,
    setActivePreset, getActivePreset,
    openCustomModal, closeCustomModal,
    readCustomValues, updateCustomHint, flashHintError,
    els
  };
})();