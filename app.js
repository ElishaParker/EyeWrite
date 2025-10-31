/* ============================================================
   EyeWrite v1.6.2 — Stability & Hover Mode Patch
   Includes: Scrollbar controls, Hover toggle, Toolbar & Save fixes
   ============================================================ */
window.addEventListener('load', () => {
  console.log("EyeWrite fully loaded ✅");
});

// ---------- Initialization ----------
document.addEventListener('DOMContentLoaded', () => {
  const textBox = document.getElementById('textArea');
  const kb = document.getElementById('keyboard');
  const ring = document.getElementById('cursorRing');
  let quickType = false, shiftOn = false, capsOn = false;
  let hoverMode = true, dwellTimer = null, debounce = false;

  // ---------- Toolbar Controls ----------
document.getElementById('keyboardToggle').addEventListener('click', () => {
  kb.classList.toggle('hidden');
  kb.scrollIntoView({ behavior: 'smooth', block: 'end' });
  console.log('Keyboard toggled:', !kb.classList.contains('hidden'));
});

  document.getElementById('kbClose').onclick = () => kb.classList.add('hidden');
  document.getElementById('kbToggle').onclick = () => {
    quickType = !quickType;
    document.getElementById('kbMode').textContent = quickType ? '⚡ QuickType' : '🕊 Precision';
  };

  document.getElementById('fullBtn').onclick = () => {
    window.moveTo(0, 0);
    window.resizeTo(screen.availWidth, screen.availHeight);
  };
  document.getElementById('halfBtn').onclick = () => {
    window.moveTo(0, 0);
    window.resizeTo(screen.availWidth / 2, screen.availHeight);
  };

  document.getElementById('cursorDefault').onclick = () => textBox.style.cursor = 'default';
  document.getElementById('cursorCross').onclick = () => textBox.style.cursor = 'crosshair';
  document.getElementById('cursorText').onclick = () => textBox.style.cursor = 'text';

  // Hover toggle button
  const hoverBtn = document.getElementById('hoverToggle');
  hoverBtn.onclick = () => {
    hoverMode = !hoverMode;
    hoverBtn.textContent = hoverMode ? '🌀 Hover ON' : '🌀 Hover OFF';
    hoverBtn.classList.toggle('active', hoverMode);
    hoverBtn.classList.toggle('inactive', !hoverMode);
  };

  document.getElementById('voiceBtn').onclick = () =>
    alert('Voice Modulation controls coming soon.');

  // ---------- Formatting ----------
  ['fontSelect', 'fontSize'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('change', e => {
      if (id === 'fontSelect') textBox.style.fontFamily = e.target.value;
      else textBox.style.fontSize = e.target.value + 'px';
    });
  });
  ['boldBtn', 'italicBtn', 'underlineBtn'].forEach(id => {
    const cmd = id === 'boldBtn' ? 'bold' : id === 'italicBtn' ? 'italic' : 'underline';
    document.getElementById(id).onclick = () => document.execCommand(cmd);
  });

  // ---------- Autosave ----------
  textBox.innerHTML = localStorage.getItem('textData') || '';
  setInterval(() => localStorage.setItem('textData', textBox.innerHTML), 5000);

  // ---------- Scroll Buttons ----------
  document.getElementById('scrollUp').onclick = () =>
    textBox.scrollBy({ top: -100, behavior: 'smooth' });
  document.getElementById('scrollDown').onclick = () =>
    textBox.scrollBy({ top: 100, behavior: 'smooth' });

  // ---------- Cursor Dwell Ring ----------
  document.addEventListener('mousemove', e => {
    ring.style.left = e.clientX - 11 + 'px';
    ring.style.top = e.clientY - 11 + 'px';
  });

  function startDwell(el) {
    if (debounce || !hoverMode) return;
    if (!el.matches('button,select,input')) return;
    ring.classList.remove('hidden');
    const dwellTime = quickType ? 700 : 1500;
    ring.style.animation = 'none';
    void ring.offsetWidth;
    ring.style.animation = `ringFill ${dwellTime}ms linear forwards`;
    dwellTimer = setTimeout(() => el.click(), dwellTime);
  }
  function endDwell() {
    ring.classList.add('hidden');
    clearTimeout(dwellTimer);
  }

  function registerHoverables() {
    document.querySelectorAll('button,select,input').forEach(el => {
      el.onmouseenter = () => startDwell(el);
      el.onmouseleave = endDwell;
    });
  }
  registerHoverables();
  new MutationObserver(registerHoverables).observe(document.body, { childList: true, subtree: true });

  // ---------- Keyboard Layout ----------
  const layout = [
    ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['Caps','A','S','D','F','G','H','J','K','L',';','\'','↵'],
    ['Shift','Z','X','C','V','B','N','M',',','.','/','↑'],
    ['Ctrl','␣','Alt','←','↓','→']
  ];
  const rows = ['row1','row2','row3','row4','row5'];

  function buildKeyboard() {
    rows.forEach((r, i) => {
      const row = document.getElementById(r);
      row.innerHTML = '';
      layout[i].forEach(k => {
        const b = document.createElement('button');
        b.textContent = k;
        if (['⌫','Tab','Caps','Shift','Ctrl','Alt','␣','↵'].includes(k))
          b.classList.add(k === '␣' ? 'extraWide' : 'wide');
        b.onclick = () => keyAction(k);
        row.appendChild(b);
      });
    });
    registerHoverables(); // ensure dwell works on keys
  }
  buildKeyboard();

  function keyAction(k) {
    if (debounce) return;
    debounce = true; setTimeout(() => debounce = false, 200);
    switch (k) {
      case '␣': insert(' '); break;
      case '↵': insert('\n'); break;
      case '⌫': document.execCommand('delete'); break;
      case 'Tab': insert('    '); break;
      case 'Caps': capsOn = !capsOn; break;
      case 'Shift': shiftOn = true; setTimeout(() => shiftOn = false, 800); break;
      default: insert(formatChar(k));
    }
  }

  function formatChar(k) {
    const base = k.length === 1 ? k : k.charAt(0);
    if (shiftOn ^ capsOn) return base.toUpperCase();
    return base.toLowerCase();
  }
  function insert(c) { document.execCommand('insertText', false, c); }

  // ---------- Search & Speak ----------
  document.getElementById('searchBtn').onclick = () =>
    window.open('https://duckduckgo.com/?q=' + encodeURIComponent(textBox.innerText),
      '_blank',
      `width=${screen.availWidth / 2},height=${screen.availHeight},left=${screen.availWidth / 2},top=0`
    );

  document.getElementById('speakBtn').onclick = () => {
    const u = new SpeechSynthesisUtterance(textBox.innerText);
    speechSynthesis.speak(u);
  };

  // ---------- Save Dropdown ----------
  const saveBtn = document.getElementById('saveBtn');
  const saveMenu = document.getElementById('saveMenu');
  saveMenu.classList.add('hidden');

  saveBtn.onclick = e => {
    e.stopPropagation();
    saveMenu.classList.toggle('hidden');
  };
  saveMenu.querySelectorAll('button').forEach(b => {
    b.onclick = e => {
      e.stopPropagation();
      saveMenu.classList.add('hidden');
      saveFile(b.dataset.format);
    };
  });
  document.addEventListener('click', () => {
    if (!saveMenu.classList.contains('hidden')) saveMenu.classList.add('hidden');
  });

  function saveFile(fmt) {
    const name = prompt('Enter file name:', 'EyeWrite-note');
    if (!name) return;
    const text = textBox.innerText;

    if (fmt === 'txt') {
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name + '.txt';
      a.click();
    } else if (fmt === 'pdf') {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const lines = pdf.splitTextToSize(text, 500);
      pdf.text(lines, 40, 60);
      pdf.save(name + '.pdf');
    } else if (fmt === 'docx') {
      const { Document, Packer, Paragraph, TextRun } = window.docx;
      const doc = new Document({
        sections: [{ children: text.split('\n').map(line =>
          new Paragraph({ children: [new TextRun(line)] })) }]
      });
      Packer.toBlob(doc).then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name + '.docx';
        a.click();
      });
    }
  }
});
