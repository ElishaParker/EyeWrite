/* ============================================================
   EyeWrite v1.6.4 — Stable Layout + Hover + Save Patch
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const textBox = document.getElementById("textArea");
  const ring = document.getElementById("cursorRing");
  const kb = document.getElementById("keyboard");
  const hoverBtn = document.getElementById("hoverToggle");
  const saveBtn = document.getElementById("saveBtn");
  const saveMenu = document.getElementById("saveMenu");
  let quickType = false, shiftOn = false, capsOn = false;
  let hoverMode = true, dwellTimer = null, debounce = false;

// ---------- Cursor Mode Controls ----------
document.getElementById("cursorDefault").onclick = () => {
  textBox.style.cursor = "default";
};
document.getElementById("cursorCross").onclick = () => {
  textBox.style.cursor = "crosshair";
};
document.getElementById("cursorText").onclick = () => {
  textBox.style.cursor = "text";
};


  // ---------- Hover Toggle ----------
  hoverBtn.onclick = () => {
    hoverMode = !hoverMode;
    hoverBtn.textContent = hoverMode ? "🌀 Hover ON" : "🌀 Hover OFF";
    hoverBtn.classList.toggle("active", hoverMode);
  };

  // ---------- Font & Formatting ----------
  document.getElementById("fontSelect").onchange = e => textBox.style.fontFamily = e.target.value;
  document.getElementById("fontSize").onchange = e => textBox.style.fontSize = e.target.value + "px";
  document.getElementById("boldBtn").onclick = () => document.execCommand("bold");
  document.getElementById("italicBtn").onclick = () => document.execCommand("italic");
  document.getElementById("underlineBtn").onclick = () => document.execCommand("underline");

  // ---------- Autosave ----------
  textBox.innerHTML = localStorage.getItem("textData") || "";
  setInterval(() => localStorage.setItem("textData", textBox.innerHTML), 5000);

  // ---------- Scroll Bars ----------
  const scrollStep = 150;
  document.getElementById("scrollUp").onclick = () =>
    textBox.scrollBy({ top: -scrollStep, behavior: "smooth" });
  document.getElementById("scrollDown").onclick = () =>
    textBox.scrollBy({ top: scrollStep, behavior: "smooth" });

  // ---------- Dwell Ring ----------
  document.addEventListener("mousemove", e => {
    ring.style.left = `${e.clientX - 11}px`;
    ring.style.top = `${e.clientY - 11}px`;
  });

  function startDwell(el) {
  if (debounce || !hoverMode) return;
  if (!el.matches("button,select,input")) return;

  ring.classList.remove("hidden");
  const dwellTime = quickType ? 700 : 1500; // synced with mode
  ring.style.animation = "none";
  void ring.offsetWidth;
  ring.style.animation = `ringFill ${dwellTime}ms linear forwards`;
  dwellTimer = setTimeout(() => {
    el.click();
  }, dwellTime);
}

  function endDwell() {
    ring.classList.add("hidden");
    clearTimeout(dwellTimer);
  }
  function registerHoverables() {
    document.querySelectorAll("button,select,input").forEach(el => {
      el.onmouseenter = () => startDwell(el);
      el.onmouseleave = endDwell;
    });
  }
  registerHoverables();
  new MutationObserver(registerHoverables).observe(document.body, { childList: true, subtree: true });

  // ---------- Keyboard ----------
  const layout = [
    ["`","1","2","3","4","5","6","7","8","9","0","-","=","⌫"],
    ["Tab","Q","W","E","R","T","Y","U","I","O","P","[","]","\\"],
    ["Caps","A","S","D","F","G","H","J","K","L",";","'","↵"],
    ["Shift","Z","X","C","V","B","N","M",",",".","/","↑"],
    ["Ctrl","␣","Alt","←","↓","→"]
  ];
  const rows = ["row1","row2","row3","row4","row5"];

  function buildKeyboard() {
    rows.forEach((r, i) => {
      const row = document.getElementById(r);
      row.innerHTML = "";
      layout[i].forEach(k => {
        const b = document.createElement("button");
        b.textContent = k;
        if (["⌫","Tab","Caps","Shift","Ctrl","Alt","␣","↵"].includes(k))
          b.classList.add(k === "␣" ? "extraWide" : "wide");
        b.onclick = () => keyAction(k);
        row.appendChild(b);
      });
    });
    registerHoverables();
  }
  buildKeyboard();

  function keyAction(k) {
    if (debounce) return;
    debounce = true; setTimeout(() => debounce = false, 200);
    switch (k) {
      case "␣": insert(" "); break;
      case "↵": insert("\n"); break;
      case "⌫": document.execCommand("delete"); break;
      case "Tab": insert("    "); break;
      case "Caps": capsOn = !capsOn; break;
      case "Shift": shiftOn = true; setTimeout(() => shiftOn = false, 800); break;
      default: insert(formatChar(k));
    }
  }
  function formatChar(k) {
    const base = k.length === 1 ? k : k.charAt(0);
    return (shiftOn ^ capsOn) ? base.toUpperCase() : base.toLowerCase();
  }
  function insert(c) { document.execCommand("insertText", false, c); }

  // ---------- Search & Speak ----------
  document.getElementById("searchBtn").onclick = () => {
    window.open(
      "https://duckduckgo.com/?q=" + encodeURIComponent(textBox.innerText),
      "_blank",
      `width=${screen.availWidth / 2},height=${screen.availHeight},left=${screen.availWidth / 2},top=0`
    );
  };
  document.getElementById("speakBtn").onclick = () => {
    const u = new SpeechSynthesisUtterance(textBox.innerText);
    speechSynthesis.speak(u);
  };

   // ---------- QuickType Button ----------
// ---------- QuickType Button ----------

// ---------- Hover Speed Mode Toggle ----------
document.getElementById('kbToggle').onclick = () => {
  quickType = !quickType;
  document.getElementById('kbMode').textContent = quickType
    ? '⚡ QuickType'
    : '🕊 Precision';
};


   // Also update the keyboard mode label dynamically
const kbModeLabel = document.getElementById("kbModeText");
if (kbModeLabel) {
  kbModeLabel.textContent = quickType ? "⚡ QuickType" : "🕊 Precision";
}

quickTypeBtn.addEventListener("click", () => {
  quickType = !quickType;
  quickTypeBtn.textContent = quickType ? "⚡ QuickType" : "🕊 Precision";

  // Adjust dwell timing dynamically
  dwellTime = quickType ? 700 : 1500;

  // Update label text below keyboard
  if (kbModeLabel) {
    kbModeLabel.textContent = quickType ? "⚡ QuickType" : "🕊 Precision";
  }
});

   
// ---------- Save Dropdown ----------
const saveBtn = document.getElementById("saveBtn");
const saveMenu = document.getElementById("saveMenu");

// ensure dropdown starts hidden
if (saveMenu) saveMenu.classList.add("hidden");

if (saveBtn && saveMenu) {
  saveBtn.addEventListener("click", e => {
    e.stopPropagation();

    // toggle open/close
    const visible = !saveMenu.classList.contains("hidden");

    // hide all open menus before showing this one
    document.querySelectorAll("#saveMenu").forEach(m => m.classList.add("hidden"));

    if (!visible) saveMenu.classList.remove("hidden");
  });

  // handle file format button clicks
  saveMenu.querySelectorAll("button").forEach(b => {
    b.addEventListener("click", e => {
      e.stopPropagation();
      saveMenu.classList.add("hidden");
      saveFile(b.dataset.format);
    });
  });

  // hide dropdown when clicking outside
  document.addEventListener("click", e => {
    if (!saveBtn.contains(e.target) && !saveMenu.contains(e.target)) {
      saveMenu.classList.add("hidden");
    }
  });
}

/* ================= Save Dropdown ================= */ 
.saveWrapper {
  position: relative;
}

#saveMenu {
  position: absolute;
  top: 110%;               /* show directly below the Save button */
  left: 0;
  background: #222;
  border: 1px solid #333;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-5px);
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s linear 0.2s;
}

/* Fade-in when .hidden class is removed by JS */
#saveMenu:not(.hidden) {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0s;
}

#saveMenu button {
  padding: 6px 20px;
  background: #333;
  color: #fff;
  border: none;
  border-bottom: 1px solid #444;
}
#saveMenu button:last-child {
  border-bottom: none;
}
#saveMenu button:hover {
  background: #555;
}
