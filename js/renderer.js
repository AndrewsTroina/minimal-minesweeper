window.MOSS = window.MOSS || {};
// Tabuleiro 100% SVG. A massa preta é UM único <path>: união de células vazias
// com cantos arredondados só onde não há vizinho (+ filetes nos cantos côncavos).
MOSS.Renderer = (function () {
  const NS = 'http://www.w3.org/2000/svg', U = 100, R = U / 2;
  let svg, mass, cells = [], cols = 0, H = null, bound = false;
  const mk = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

  function init() { svg = document.getElementById('boardSvg'); }

  function rebuild(s, handlers) {
    H = handlers; cols = s.cols; cells = [];
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + s.cols * U + ' ' + s.rows * U);
    mass = mk('path', { class: 'mass' }, svg);
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      const x = c * U + R, y = r * U + R;
      const g = mk('g', { class: 'cell', 'data-i': r * s.cols + c }, svg);
      const dot = mk('circle', { class: 'dot', cx: x, cy: y, r: 43 }, g);
      const num = mk('text', { class: 'num', x, y }, g);
      const mine = mk('circle', { class: 'mine', cx: x, cy: y, r: 22 }, g);
      const flag = mk('g', { class: 'flag' }, g);
      mk('rect', { x: x - 12, y: y - 30, width: 3.5, height: 60 }, flag);
      mk('path', { d: 'M' + (x - 12) + ' ' + (y - 30) + 'L' + (x + 20) + ' ' + (y - 16) + 'L' + (x - 12) + ' ' + (y - 2) + 'Z' }, flag);
      mk('rect', { class: 'hit', x: x - R, y: y - R, width: U, height: U }, g);
      cells.push({ dot, num, mine, flag });
    }
    if (!bound) { bind(); bound = true; }
  }

  function bind() {
    let timer = null, long = false, moved = false, sx = 0, sy = 0, ptype = 'mouse';
    const idx = e => { const g = e.target.closest && e.target.closest('.cell'); return g ? +g.dataset.i : -1; };
    const rc = i => [Math.floor(i / cols), i % cols];
    svg.addEventListener('contextmenu', e => {
      e.preventDefault();
      const i = idx(e); if (i >= 0 && ptype === 'mouse') H.onRight(...rc(i));
    });
    svg.addEventListener('pointerdown', e => {
      ptype = e.pointerType; long = false; moved = false; sx = e.clientX; sy = e.clientY;
      clearTimeout(timer);
      const i = idx(e);
      if (e.pointerType === 'touch' && i >= 0) timer = setTimeout(() => {
        long = true; if (navigator.vibrate) navigator.vibrate(15); H.onRight(...rc(i));
      }, 420);
    });
    svg.addEventListener('pointermove', e => {
      if (Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { moved = true; clearTimeout(timer); }
    });
    svg.addEventListener('pointerup', e => {
      clearTimeout(timer);
      if (long || moved || e.button !== 0 || e.ctrlKey) return;
      const i = idx(e); if (i >= 0) H.onLeft(...rc(i));
    });
    svg.addEventListener('pointercancel', () => { clearTimeout(timer); moved = true; });
  }

  function roundRect(x, y, w, h, tl, tr, br, bl) {
    return 'M' + (x + tl) + ' ' + y + 'H' + (x + w - tr) +
      (tr ? 'A' + tr + ' ' + tr + ' 0 0 1 ' + (x + w) + ' ' + (y + tr) : '') + 'V' + (y + h - br) +
      (br ? 'A' + br + ' ' + br + ' 0 0 1 ' + (x + w - br) + ' ' + (y + h) : '') + 'H' + (x + bl) +
      (bl ? 'A' + bl + ' ' + bl + ' 0 0 1 ' + x + ' ' + (y + h - bl) : '') + 'V' + (y + tl) +
      (tl ? 'A' + tl + ' ' + tl + ' 0 0 1 ' + (x + tl) + ' ' + y : '') + 'Z';
  }

  function massPath(s) {
    const ok = (r, c) => r >= 0 && r < s.rows && c >= 0 && c < s.cols && s.revealed[r * s.cols + c] && s.counts[r * s.cols + c] === 0;
    let d = '';
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      if (!ok(r, c)) continue;
      const u = ok(r - 1, c), dn = ok(r + 1, c), l = ok(r, c - 1), rt = ok(r, c + 1);
      const e = 0.5; // leve sobreposição: sem costuras entre células vizinhas
      d += roundRect(c * U - (l ? e : 0), r * U - (u ? e : 0), U + (l ? e : 0) + (rt ? e : 0), U + (u ? e : 0) + (dn ? e : 0),
        !u && !l ? R : 0, !u && !rt ? R : 0, !dn && !rt ? R : 0, !dn && !l ? R : 0);
    }
    // filetes côncavos: vértice com exatamente 3 células de massa
    for (let vr = 1; vr < s.rows; vr++) for (let vc = 1; vc < s.cols; vc++) {
      const q = [[vr - 1, vc - 1, -1, -1], [vr - 1, vc, 1, -1], [vr, vc - 1, -1, 1], [vr, vc, 1, 1]];
      const off = q.filter(([r, c]) => !ok(r, c));
      if (off.length !== 1) continue;
      const [, , sx, sy] = off[0], X = vc * U, Y = vr * U;
      d += 'M' + X + ' ' + Y + 'L' + (X + R * sx) + ' ' + Y + 'A' + R + ' ' + R + ' 0 0 ' + (sx * sy < 0 ? 1 : 0) + ' ' + X + ' ' + (Y + R * sy) + 'Z';
    }
    return d;
  }

  function renderAll(s) {
    cells.forEach((o, i) => {
      const rv = s.revealed[i], n = s.counts[i], fl = s.flagged[i], isNum = rv && n > 0;
      o.dot.style.display = rv ? 'none' : '';
      o.num.textContent = isNum ? n : '';
      o.num.setAttribute('class', 'num' + (isNum ? ' n' + Math.min(n, 4) : ''));
      o.mine.style.display = (n === -1 && !fl && (rv || s.lost)) ? '' : 'none';
      o.mine.setAttribute('r', i === s.exploded ? 30 : 22);
      o.flag.style.display = fl ? '' : 'none';
    });
    mass.setAttribute('d', massPath(s));
  }

  return { init, rebuild, renderAll };
})();
