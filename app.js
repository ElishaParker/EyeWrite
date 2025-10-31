/* ============================================================
   EyeWrite – Phase 1.4 Logic
   ============================================================ */

// ---------- Instructions ----------
window.addEventListener('load',()=>{
  const instr=document.getElementById('instructions');
  if(!localStorage.getItem('instructionsDismissed'))instr.classList.remove('hidden');
  buildKeyboard(); initVoices();
});
document.getElementById('closeInstructions').onclick=()=>{
  document.getElementById('instructions').classList.add('hidden');
  localStorage.setItem('instructionsDismissed',true);
};
document.getElementById('helpBtn').onclick=()=>document.getElementById('instructions').classList.toggle('hidden');

// ---------- Text & Formatting ----------
const textBox=document.getElementById('textArea');
textBox.innerHTML=localStorage.getItem('textData')||'';
setInterval(()=>localStorage.setItem('textData',textBox.innerHTML),5000);
document.getElementById('fontSelect').onchange=e=>textBox.style.fontFamily=e.target.value;
document.getElementById('fontSize').onchange=e=>textBox.style.fontSize=e.target.value+'px';
document.getElementById('boldBtn').onclick=()=>document.execCommand('bold');
document.getElementById('italicBtn').onclick=()=>document.execCommand('italic');
document.getElementById('underlineBtn').onclick=()=>document.execCommand('underline');

// ---------- Scroll ----------
document.getElementById('topScroll').onclick=()=>textBox.scrollBy({top:-100,behavior:'smooth'});
document.getElementById('bottomScroll').onclick=()=>textBox.scrollBy({top:100,behavior:'smooth'});

// ---------- Search ----------
document.getElementById('searchBtn').onclick=()=>{
  window.open('https://duckduckgo.com/?q='+encodeURIComponent(textBox.innerText),
    '_blank',`width=${screen.availWidth/2},height=${screen.availHeight},left=${screen.availWidth/2},top=0`);
};

// ---------- Speak ----------
document.getElementById('speakBtn').onclick=()=>{
  const utter=new SpeechSynthesisUtterance(textBox.innerText);
  utter.voice=speechSynthesis.getVoices().find(v=>v.name===localStorage.getItem('voiceName'))||null;
  utter.rate=parseFloat(localStorage.getItem('voiceRate')||1);
  utter.pitch=parseFloat(localStorage.getItem('voicePitch')||1);
  speechSynthesis.speak(utter);
};

// ---------- Layout / Cursor ----------
document.getElementById('fullBtn').onclick=()=>document.body.style.width='100%';
document.getElementById('halfBtn').onclick=()=>document.body.style.width='50%';
document.getElementById('cursorDefault').onclick=()=>document.body.style.cursor='default';
document.getElementById('cursorCross').onclick=()=>document.body.style.cursor='crosshair';
document.getElementById('cursorText').onclick=()=>document.body.style.cursor='text';

// ============================================================
// 🎹 Keyboard logic
// ============================================================
const kb=document.getElementById('keyboard');
const kbKeys=document.getElementById('kbKeys');
let quickType=false, shiftOn=false;
document.getElementById('keyboardToggle').onclick=()=>kb.classList.toggle('hidden');
document.getElementById('kbClose').onclick=()=>kb.classList.add('hidden');
document.getElementById('kbToggle').onclick=()=>{
  quickType=!quickType;
  document.getElementById('kbMode').textContent=quickType?'⚡ QuickType':'🕊 Precision';
};

function buildKeyboard(){
  kbKeys.innerHTML='';
  const rows=[
    ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
    ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['A','S','D','F','G','H','J','K','L',';','\'','↵'],
    ['⇧','Z','X','C','V','B','N','M',',','.','/','↑'],
    ['←','␣','→','↓']
  ];
  rows.forEach(row=>{
    row.forEach(ch=>{
      const btn=document.createElement('button');
      btn.textContent=ch;
      btn.dataset.key=ch;
      addDwell(btn);
      btn.onclick=()=>keyAction(ch);
      kbKeys.appendChild(btn);
    });
  });
}

// ---------- Key actions ----------
function keyAction(key){
  if(key==='␣'){insertChar(' ');}
  else if(key==='↵'){insertChar('\n');}
  else if(key==='⌫'){backspace();}
  else if(key==='⇧'){shiftOn=!shiftOn;}
  else if(key==='↑'){moveCaret('up');}
  else if(key==='↓'){moveCaret('down');}
  else if(key==='←'){moveCaret('left');}
  else if(key==='→'){moveCaret('right');}
  else{insertChar(shiftOn?key.toUpperCase():key.toLowerCase());}
}

function insertChar(c){
  document.execCommand('insertText',false,c);
}
function backspace(){
  document.execCommand('delete');
}
function moveCaret(dir){
  const sel=window.getSelection();
  if(!sel.rangeCount)return;
  const range=sel.getRangeAt(0);
  const node=textBox.firstChild||textBox;
  const pos=range.startOffset;
  if(dir==='left')range.setStart(node,pos>0?pos-1:0);
  if(dir==='right')range.setStart(node,pos+1);
  sel.removeAllRanges();sel.addRange(range);
}

// ============================================================
// 🕒 Dwell logic with soft ring
// ============================================================
function addDwell(el){
  el.addEventListener('pointerenter',()=>{
    const dwellTime=quickType?700:1500;
    el.style.setProperty('--dwellTime',dwellTime+'ms');
    const ring=document.createElement('div');
    ring.className='dwell-ring';
    el.appendChild(ring);
    const t=setTimeout(()=>{el.click();},dwellTime);
    el.addEventListener('pointerleave',()=>{
      clearTimeout(t);if(ring)ring.remove();
    },{once:true});
  });
}

// ============================================================
// 🎛 Voice panel
// ============================================================
const voicePanel=document.getElementById('voicePanel');
document.getElementById('voiceBtn').onclick=()=>voicePanel.classList.remove('hidden');
document.getElementById('voiceClose').onclick=()=>{
  localStorage.setItem('voiceName',document.getElementById('voiceSelect').value);
  localStorage.setItem('voiceRate',document.getElementById('rateSlider').value);
  localStorage.setItem('voicePitch',document.getElementById('pitchSlider').value);
  voicePanel.classList.add('hidden');
};
document.getElementById('voicePreview').onclick=()=>{
  const u=new SpeechSynthesisUtterance("This is a voice test.");
  const voices=speechSynthesis.getVoices();
  u.voice=voices.find(v=>v.name===document.getElementById('voiceSelect').value);
  u.rate=parseFloat(document.getElementById('rateSlider').value);
  u.pitch=parseFloat(document.getElementById('pitchSlider').value);
  speechSynthesis.speak(u);
};
function initVoices(){
  const sel=document.getElementById('voiceSelect');
  const load=()=>{
    const voices=speechSynthesis.getVoices();
    sel.innerHTML='';
    voices.forEach(v=>{
      const o=document.createElement('option');
      o.value=v.name;o.textContent=v.name;
      if(v.name===localStorage.getItem('voiceName'))o.selected=true;
      sel.appendChild(o);
    });
  };
  load();speechSynthesis.onvoiceschanged=load;
  document.getElementById('rateSlider').value=localStorage.getItem('voiceRate')||1;
  document.getElementById('pitchSlider').value=localStorage.getItem('voicePitch')||1;
}
