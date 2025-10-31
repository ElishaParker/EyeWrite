/* ============================================================
   EyeWrite – Phase 1.3 Logic
   ============================================================ */

// ---------- Instruction Overlay ----------
window.addEventListener('load', () => {
  const instr = document.getElementById('instructions');
  if (!localStorage.getItem('instructionsDismissed')) instr.classList.remove('hidden');
  initKeyboard();
  initVoices();
});
document.getElementById('closeInstructions').onclick = () => {
  document.getElementById('instructions').classList.add('hidden');
  localStorage.setItem('instructionsDismissed', true);
};
document.getElementById('helpBtn').onclick = () =>
  document.getElementById('instructions').classList.toggle('hidden');

// ---------- Text Autosave ----------
const textBox = document.getElementById('textArea');
textBox.innerHTML = localStorage.getItem('textData') || '';
setInterval(() => localStorage.setItem('textData', textBox.innerHTML), 5000);

// ---------- Formatting ----------
document.getElementById('fontSelect').onchange = e => textBox.style.fontFamily = e.target.value;
document.getElementById('fontSize').onchange = e => textBox.style.fontSize = e.target.value + 'px';
document.getElementById('boldBtn').onclick = () => document.execCommand('bold');
document.getElementById('italicBtn').onclick = () => document.execCommand('italic');
document.getElementById('underlineBtn').onclick = () => document.execCommand('underline');

// ---------- Scroll ----------
document.getElementById('topScroll').onclick = () => textBox.scrollBy({top:-100,behavior:'smooth'});
document.getElementById('bottomScroll').onclick = () => textBox.scrollBy({top:100,behavior:'smooth'});

// ---------- Search ----------
document.getElementById('searchBtn').onclick = () => {
  window.open(
    'https://duckduckgo.com/?q=' + encodeURIComponent(textBox.innerText),
    '_blank',
    `width=${screen.availWidth/2},height=${screen.availHeight},left=${screen.availWidth/2},top=0`
  );
};

// ---------- Speak ----------
document.getElementById('speakBtn').onclick = () => {
  const utter = new SpeechSynthesisUtterance(textBox.innerText);
  utter.voice = speechSynthesis.getVoices().find(v=>v.name===localStorage.getItem('voiceName')) || null;
  utter.rate = parseFloat(localStorage.getItem('voiceRate')||1);
  utter.pitch = parseFloat(localStorage.getItem('voicePitch')||1);
  speechSynthesis.speak(utter);
};

// ---------- Layout Toggles ----------
document.getElementById('fullBtn').onclick = ()=>document.body.style.width='100%';
document.getElementById('halfBtn').onclick = ()=>document.body.style.width='50%';

// ---------- Cursor Styles ----------
document.getElementById('cursorDefault').onclick = ()=>document.body.style.cursor='default';
document.getElementById('cursorCross').onclick = ()=>document.body.style.cursor='crosshair';
document.getElementById('cursorText').onclick = ()=>document.body.style.cursor='text';

// ---------- Keyboard ----------
const kb = document.getElementById('keyboard');
const kbKeys = document.getElementById('kbKeys');
let quickType = false;
document.getElementById('keyboardToggle').onclick = ()=>kb.classList.toggle('hidden');
document.getElementById('kbClose').onclick = ()=>kb.classList.add('hidden');
document.getElementById('kbToggle').onclick = ()=>{
  quickType=!quickType;
  document.getElementById('kbMode').textContent = quickType?'⚡ QuickType':'🕊 Precision';
};

function initKeyboard(){
  const keys="QWERTYUIOPASDFGHJKLZXCVBNM ".split('');
  kbKeys.innerHTML='';
  keys.forEach(ch=>{
    const btn=document.createElement('button');
    btn.textContent=ch===' '?'␣':ch;
    btn.addEventListener('click',()=>document.execCommand('insertText',false,ch==='␣'?' ':ch));
    addDwell(btn);
    kbKeys.appendChild(btn);
  });
}

// ---------- Voice Modulation ----------
const voicePanel=document.getElementById('voicePanel');
document.getElementById('voiceBtn').onclick=()=>voicePanel.classList.remove('hidden');
document.getElementById('voiceClose').onclick=()=>{
  localStorage.setItem('voiceName',document.getElementById('voiceSelect').value);
  localStorage.setItem('voiceRate',document.getElementById('rateSlider').value);
  localStorage.setItem('voicePitch',document.getElementById('pitchSlider').value);
  voicePanel.classList.add('hidden');
};
document.getElementById('voicePreview').onclick=()=>{
  const u=new SpeechSynthesisUtterance("This is a test of your selected voice.");
  const voices=speechSynthesis.getVoices();
  u.voice=voices.find(v=>v.name===document.getElementById('voiceSelect').value);
  u.rate=parseFloat(document.getElementById('rateSlider').value);
  u.pitch=parseFloat(document.getElementById('pitchSlider').value);
  speechSynthesis.speak(u);
};
function initVoices(){
  const select=document.getElementById('voiceSelect');
  const loadVoices=()=>{
    const voices=speechSynthesis.getVoices();
    select.innerHTML='';
    voices.forEach(v=>{
      const opt=document.createElement('option');
      opt.value=v.name; opt.textContent=v.name;
      if(v.name===localStorage.getItem('voiceName')) opt.selected=true;
      select.appendChild(opt);
    });
  };
  loadVoices();
  speechSynthesis.onvoiceschanged=loadVoices;
  document.getElementById('rateSlider').value=localStorage.getItem('voiceRate')||1;
  document.getElementById('pitchSlider').value=localStorage.getItem('voicePitch')||1;
}

// ---------- Dwell Simulation ----------
function addDwell(el){
  let timer=null;
  el.addEventListener('mouseenter',()=>{
    timer=setTimeout(()=>el.click(),quickType?700:1500);
  });
  el.addEventListener('mouseleave',()=>clearTimeout(timer));
}

// ---------- Placeholders for gaze / blink integration ----------
function onDoubleBlink(){}; function onTripleBlink(){}; function onDwellTarget(t){};
