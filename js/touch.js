window.MOSS = window.MOSS || {};

/**
 * Habilita toque longo para marcar bandeira em dispositivos touch.
 * Toque curto (< LONG_PRESS ms) revela; toque longo marca bandeira.
 * Ignora eventos em dispositivos com mouse (mouse continua usando contextmenu).
 */
MOSS.Touch = (function () {
  const LONG_PRESS_MS = 420;
  const MOVE_TOLERANCE = 10;

  function attach(cell, onShort, onLong) {
    let pressTimer = null;
    let startX = 0, startY = 0;
    let triggered = false;

    function clearTimer() {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    }

    function onStart(e) {
      const t = e.touches ? e.touches[0] : e;
      startX = t.clientX; startY = t.clientY;
      triggered = false;
      clearTimer();
      pressTimer = setTimeout(() => {
        pressTimer = null;
        triggered = true;
        if (navigator.vibrate) navigator.vibrate(15);
        onLong();
      }, LONG_PRESS_MS);
    }

    function onMove(e) {
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.hypot(dx, dy) > MOVE_TOLERANCE) clearTimer();
    }

    function onEnd(e) {
      const wasLong = triggered;
      clearTimer();
      if (!wasLong) {
        // toque curto
        e.preventDefault && e.preventDefault();
        onShort();
      }
      triggered = false;
    }

    function onCancel() {
      clearTimer();
      triggered = false;
    }

    cell.addEventListener('touchstart',  onStart,  { passive: true });
    cell.addEventListener('touchmove',   onMove,   { passive: true });
    cell.addEventListener('touchend',    onEnd);
    cell.addEventListener('touchcancel', onCancel, { passive: true });
    // Evita menu de contexto no long press nativo
    cell.addEventListener('contextmenu', e => e.preventDefault());
  }

  return { attach };
})();