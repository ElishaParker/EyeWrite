window.addEventListener('load', () => {
  const instr = document.getElementById('instructions');
  if (!localStorage.getItem('instructionsDismissed')) instr.classList.remove('hidden');
});
document.getElementById('closeInstructions').onclick = () => {
  document.getElementById('instructions').classList.add('hidden');
  localStorage.setItem('instructionsDismissed', true);
};
document.getElementById('helpBtn').onclick = () =>
  document.getElementById('instructions').classList.toggle('hidden');

const textBox = document.getElementById('textArea');
textBox.innerHTML = localStorage.getItem('textData') || '';
setInterval(() => localStorage.setItem('textData', textBox.innerHTML), 5000);

document.getElementById('topScroll').onclick = () => textBox.scrollBy(0, -50);
document.getElementById('bottomScroll').onclick = () => textBox.scrollBy(0, 50);

const kb = document.getElementById('keyboard');
document.getElementById('kbClose').onclick = () => kb.classList.add('hidden');

document.getElementById('speakBtn').onclick = () => {
  const utter = new SpeechSynthesisUtterance(textBox.innerText);
  speechSynthesis.speak(utter);
};

document.getElementById('searchBtn').onclick = () => {
  window.open(
    'https://duckduckgo.com/?q=' + encodeURIComponent(textBox.innerText),
    '_blank',
    `width=${screen.availWidth / 2},height=${screen.availHeight},left=${screen.availWidth / 2},top=0`
  );
  window.resizeTo(screen.availWidth / 2, screen.availHeight);
};

document.getElementById('fullBtn').onclick = () => {
  window.moveTo(0, 0); window.resizeTo(screen.availWidth, screen.availHeight);
};
document.getElementById('halfBtn').onclick = () => {
  window.moveTo(0, 0); window.resizeTo(screen.availWidth / 2, screen.availHeight);
};

function openKeyboard() { kb.classList.remove('hidden'); textBox.focus(); }
