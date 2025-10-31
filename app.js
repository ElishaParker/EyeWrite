document.addEventListener('DOMContentLoaded', () => {
  const textBox = document.getElementById('textArea');
  const kb = document.getElementById('keyboard');
  const ring = document.getElementById('cursorRing');
  let hoverMode = true, quickType = false, shiftOn = false, capsOn = false;
  let dwellTimer = null, dwellTarget = null, debounce = false;

  // Safe event binding
  function safeBind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.onclick = fn;
  }

  safeBind('hoverToggle', () => {
    hoverMode = !hoverMode;
    document.getElementById('hoverToggle').textContent =
      hoverMode ? 'Hover ON 🖱' : 'Hover OFF 🚫';
    ring.classList.add('hidden');
  });

  safeBind('keyboardToggle', () => kb.classList.toggle('hidden'));
  safeBind('kbClose', () => kb.classList.add('hidden'));
  safeBind('kbToggle', () => {
    quickType = !quickType;
    document.getElementById('kbMode').textContent =
      quickType ? '⚡ QuickType' : '🕊 Precision';
  });

  // cursor tracking
  document.addEventListener('mousemove', e => {
    ring.style.left = e.clientX - 10 + 'px';
    ring.style.top = e.clientY - 10 + 'px';
  });

  // safe hover registration
  function registerHoverables() {
    document.querySelectorAll('button,select,input').forEach(el => {
      el.addEventListener('mouseenter', () => startDwell(el));
      el.addEventListener('mouseleave', endDwell);
    });
  }

  function startDwell(el) {
    if (!hoverMode || debounce) return;
    ring.classList.remove('hidden');
    const dwellTime = quickType ? 700 : 1500;
    ring.style.animation = `dwellFill ${dwellTime}ms linear forwards`;
    dwellTimer = setTimeout(() => {
      el.click();
    }, dwellTime);
  }

  function endDwell() {
    ring.classList.add('hidden');
    clearTimeout(dwellTimer);
  }

  function triggerClick(el) {
    if (debounce) return;
    debounce = true;
    setTimeout(() => (debounce = false), 250);
    el.click();
  }

  registerHoverables();
  buildKeyboard();
});
