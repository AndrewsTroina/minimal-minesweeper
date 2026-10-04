window.MOSS = window.MOSS || {};

MOSS.Renderer = (function () {
  let boardEl, gooSvg, gooGroup;
  let metrics = { cell: 30, dot: 16, radius: 8 };

  function cacheDom() {
    boardEl  = document.getElementById('board');
    gooSvg   = document.getElementById('gooSvg');
    gooGroup = document.getElementById('gooGroup');
  }

  function readMetrics() {
    const cs = getComputedStyle(document.documentElement);
    const cell = parseFloat(cs.getPropertyValue('--cell')) || 30;
    const dot  = parseFloat(cs.getPropertyValue('--dot'))  || 16;
    metrics = { cell, dot, radius: dot / 2 };
  }

  function setGridVars(cols, rows) {
    boardEl.style.setProperty('--cols', cols);
    boardEl.style.setProperty('--rows', rows);
  }

  function clearCells() {
    boardEl.querySelectorAll('.cell').forEach(el => el.remove());
  }

  function buildCells(cols, rows, onLeft, onRight) {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.r = r;
        cell.dataset.c = c;

        const dot  = document.createElement('div'); dot.className  = 'dot';
        const num  = document.createElement('div'); num.className  = 'num';
        const mine = document.createElement('div'); mine.className = 'mine';
        const flag = document.createElement('div'); flag.className = 'flag';
        flag.innerHTML =
          '<svg viewBox="0 0 12 14" aria-hidden="true">' +
            '<rect x="1" y="1" width="1" height="12" fill="#1F3A2E"/>' +
            '<path d="M2 1 L10 4 L2 7 Z" fill="#1F3A2E"/>' +
          '</svg>';

        cell.append(dot, num, mine, flag);
        boardEl.appendChild(cell);

        if (isTouch && MOSS.Touch && typeof MOSS.Touch.attach === 'function') {
          MOSS.Touch.attach(cell, () => onLeft(r, c), () => onRight(r, c));
        } else {
          cell.addEventListener('click', () => onLeft(r, c));
          cell.addEventListener('contextmenu', e => {
            e.preventDefault();
            onRight(r, c);
          });
        }
      }
    }
  }

  function refreshCell(state, r, c) {
    const i = r * state.cols + c;
    const cell = boardEl.querySelector('.cell[data-r="' + r + '"][data-c="' + c + '"]');
    if (!cell) return;

    const revealed = state.revealed[i];
    const count    = state.counts[i];

    cell.classList.toggle('revealed', revealed);
    cell.classList.toggle('flagged',  state.flagged[i]);
    cell.classList.toggle('mine-cell', count === -1);

    const isNum = revealed && count > 0;
    cell.classList.toggle('has-num', isNum);

    const numEl = cell.querySelector('.num');
    numEl.textContent = isNum ? String(count) : '';
  }

  function renderAll(state) {
    readMetrics();
    setGridVars(state.cols, state.rows);
    for (let r = 0; r < state.rows; r++)
      for (let c = 0; c < state.cols; c++)
        refreshCell(state, r, c);
    updateGoo(state);
  }

  function updateGoo(state) {
    readMetrics();
    const { cell, radius } = metrics;
    const W = cell * state.cols;
    const H = cell * state.rows;

    gooSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    gooGroup.innerHTML = '';

    // Raio de fusão = raio visual do dot cinza.
    // Assim os círculos vazios conectados se tocam exatamente como os cinza
    // apareceriam se estivessem lado a lado — fusão sem "inchar".
    const fusionRadius = radius;

    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const i = r * state.cols + c;
        if (!state.revealed[i]) continue;
        if (state.counts[i] !== 0) continue;   // apenas células VAZIAS entram na massa

        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;

        const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circ.setAttribute('cx', cx);
        circ.setAttribute('cy', cy);
        circ.setAttribute('r', fusionRadius);
        gooGroup.appendChild(circ);
      }
    }
  }

  function rebuild(state, handlers) {
    clearCells();
    setGridVars(state.cols, state.rows);
    readMetrics();
    buildCells(state.cols, state.rows, handlers.onLeft, handlers.onRight);
  }

  function init() { cacheDom(); readMetrics(); }

  return { init, rebuild, renderAll, refreshCell, updateGoo, readMetrics };
})();