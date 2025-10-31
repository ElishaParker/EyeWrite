/* ============================================================
   EyeWrite – Core Logic (Phase 1 Stable Baseline)
   ============================================================ */

// ---- Instruction Overlay ----
window.addEventListener('load', () => {
  const instr = document.getElementById('instructions');
  if (!localStorage.getItem('instructionsDismissed')) instr.classList.remove('hidden');
  initKeyboard();
});
document.getElementById('closeInstructions').onclick = () => {
  document.getElementById('instructions').classList.add('hidden');
  localStorage.setItem('instructionsDismissed', true);
};
document.getElementById('helpBtn').onclick = () =>
  document.getElementById('instructions').classList.toggle('hidden');

// ---- Text Area Autosave ----
const textBox = document.getElementById('textArea');
textBox.innerHTML = localStorage.getItem('textData') || '';
setInterval(() => localStorage.setItem('textData', textBox.innerHTML), 5000);

// ---- Toolbar Formatting ----
document.getElementById('fontSelect').onchange = e => textBox.style.fontFamily = e.target.value;
document.getElementById('fontSize').onchange = e => textBox.style.fontSize = e.target.value + 'px';
document.getElementById('boldBtn').onclick = () => document.execCommand('bold');
document.getElementById('italicBtn').onclick = () => document.execCommand('italic');
document.getElementById('underlineBtn').onclick = () => document.execCommand('underline');

// ---- Scroll Bands ----
document.getElementById('topScroll').onclick = () => textBox.scrollBy({top: -100, behavior: 'smooth'});
document.getElementById('bottomScroll').onclick = () => textBox.scrollBy({top: 100, behavior: 'smooth'});

// ---- Search ----
document.getElementById('searchBtn').onclick = () => {
  window.open(
    'https://duckduckgo.com/?q=' + encodeURIComponent(textBox.innerText),
    '_blank',
    `width=${screen.availWidth/2},height=${screen.availHeight},left=${screen.availWidth/2},top=0`
  );
  window.resizeTo(screen.availWidth/2, screen.availHeight);
};

// ---- Text-to-Speech ----
document.getElementById('speakBtn').onclick = () => {
  const utter = new SpeechSynthesisUtterance(textBox.innerText);
  utter.rate = 1.0;
  utter.pitch = 1.0;
  speechSynthesis.speak(utter);
};

// ---- Screen Width Controls ----
document.getElementById('fullBtn').onclick = () => {
  window.moveTo(0,0);
  window.resizeTo(screen.availWidth, screen.availHeight);
};
document.getElementById('halfBtn').onclick = () => {
  window.moveTo(0,0);
  window.resizeTo(screen.availWidth/2, screen.availHeight);
};

// ---- Cursor Menu ----
const cursorMenu = document.getElementById('cursorMenu');
document.getElementById('cursorMenuBtn').onclick = () => cursorMenu.classList.toggle('hidden');
function setCursor(type) {
  document.body.style.cursor = type;
  cursorMenu.classList.add('hidden');
}

// ---- Keyboard Initialization ----
const kb = document.getElementById('keyboard');
const kbKeys = document.getElementById('kbKeys');
let quickType = false;

function initKeyboard() {
  const keys = "QWERTYUIOPASDFGHJKLZXCVBNM ".split('');
  kbKeys.innerHTML = '';
  keys.forEach(ch => {
    const btn = document.createElement('button');
    btn.textContent = ch === ' ' ? '␣' : ch;
    btn.onclick = () => insertChar(ch === '␣' ? ' ' : ch);
    kbKeys.appendChild(btn);
  });
}

function insertChar(c) {
  document.execCommand('insertText', false, c);
}

// ---- Keyboard Controls ----
document.getElementById('kbClose').onclick = () => kb.classList.add('hidden');
document.getElementById('kbToggle').onclick = () => {
  quickType = !quickType;
  document.getElementById('kbMode').textContent = quickType ? '⚡ QuickType' : '🕊️ Precision';
};

// ---- Placeholder Blink / Gaze Hooks ----
// (to be activated when WebGazer + MediaPipe integrated)
function onDoubleBlink() { /* trigger click */ }
function onTripleBlink() { /* enter selection mode */ }
function onDwell(target) { /* dwell selection */ }
