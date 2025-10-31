// ============================================================
// EyeWrite – Phase 1.5 Logic
// ============================================================

// ---------- Instructions ----------
window.addEventListener('load',()=>{
  if(!localStorage.getItem('instructionsDismissed'))
    document.getElementById('instructions').classList.remove('hidden');
  buildKeyboard(); initVoices(); attachGlobalDwell();
});
document.getElementById('closeInstructions').onclick=()=>{
  document.getElementById('instructions').classList.add('hidden');
  localStorage.setItem('instructionsDismissed',true);
};
document.getElementById('helpBtn').onclick=()=>document.getElementById('instructions').classList.toggle('hidden');

// ---------- Text Autosave ----------
const textBox=document.getElementById('textArea');
textBox.innerHTML=localStorage.getItem('textData')||'';
setInterval(()=>localStorage.setItem('textData',textBox.innerHTML),5000);

// ---------- Formatting ----------
['fontSelect','fontSize'].forEach(id=>{
  document.getElementById(id).addEventListener('change',e=>{
    if(id==='fontSelect')textBox.style.fontFamily=e.target.value;
    if(id==='fontSize')textBox.style.fontSize=e.target.value+'px';
  });
});
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
  const u=new SpeechSynthesisUtterance(textBox.innerText);
  u.voice=speechSynthesis.getVoices().find(v=>v.name===localStorage.getItem('voiceName'))||null;
  u.rate=parseFloat(localStorage.getItem('voiceRate')||1);
  u.pitch=parseFloat(localStorage.getItem('voicePitch')||1);
  speechSynthesis.speak(u);
};

// ---------- Layout / Cursor ----------
document.getElementById('fullBtn').onclick=()=>document.body.style.width='100%';
document.getElementById('halfBtn').onclick=()=>document.body.style.width='50%';
document.getElementById('cursorDefault').onclick=()=>document.body.style.cursor='default';
document.getElementById('cursorCross').onclick=()=>document.body.style.cursor='crosshair';
document.getElementById('cursorText').onclick=()=>document.body.style.cursor='text';

// ============================================================
// 🎹 Keyboard Logic
// ============================================================
const kb=document.getElementById('keyboard');
const kbKeys=document.getElementById('kbKeys');
let quickType=false,shiftOn=false,capsOn=false;
document.getElementById('keyboardToggle').onclick=()=>toggleKeyboard();
document.getElementById('kbClose').onclick=()=>closeKeyboard();
document.getElementById('kbToggle').onclick=()=>{
  quickType=!quickType;
  document.getElementById('kbMode').textContent=quickType?'⚡ QuickType':'🕊 Precision';
};
function toggleKeyboard(){
  kb.classList.toggle('hidden');
  document.getElementById('textArea').style.flex=kb.classList.contains('hidden')?'1':'0.5';
}
function closeKeyboard(){
  kb.classList.add('hidden');
  document.getElementById('textArea').style.flex='1';
}

function buildKeyboard(){
  kbKeys.innerHTML='';
  const rows=[
    ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
    ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
    ['Caps','A','S','D','F','G','H','J','K','L',';','\'','↵'],
    ['Shift','Z','X','C','V','B','N','M',',','.','/','↑'],
    ['Ctrl','␣','Alt','←','↓','→']
  ];
  rows.forEach(r=>{
    r.forEach(k=>{
      const b=document.createElement('button');
      b.textContent=k;b.dataset.key=k;
      addDwell(b);b.onclick=()=>keyAction(k);
      kbKeys.appendChild(b);
    });
  });
}

// ---------- Key Actions ----------
function keyAction(k){
  if(k==='␣')insertChar(' ');
  else if(k==='↵')insertChar('\n');
  else if(k==='⌫')backspace();
  else if(k==='Shift'){shiftOn=true;setTimeout(()=>shiftOn=false,1500);}
  else if(k==='Caps'){capsOn=!capsOn;}
  else if(k==='Tab')insertChar('    '); // 4 spaces
  else if(['↑','↓','←','→'].includes(k))moveCaret(k);
  else if(k==='Ctrl'||k==='Alt')return;
  else insertChar(formatChar(k));
}
function formatChar(k){
  const base=k.length===1?k:k.charAt(0);
  if(shiftOn^capsOn)return base.toUpperCase();
  return base.toLowerCase();
}
function insertChar(c){document.execCommand('insertText',false,c);}
function backspace(){document.execCommand('delete');}
function moveCaret(dir){
  const sel=window.getSelection();
  if(!sel.rangeCount)return;
  const range=sel.getRangeAt(0);
  const node=textBox.firstChild||textBox;
  let pos=range.startOffset;
  if(dir==='←')pos=Math.max(0,pos-1);
  if(dir==='→')pos=pos+1;
  range.setStart(node,pos);
  sel.removeAllRanges();sel.addRange(range);
}

// ============================================================
// 🕒 Dwell Ring Logic (global)
// ============================================================
function addDwell(el){
  el.addEventListener('pointerenter',()=>{
    const dwellTime=quickType?700:1500;
    el.style.setProperty('--dwellTime',dwellTime+'ms');
    const ring=document.createElement('div');
    ring.className='dwell-ring';el.appendChild(ring);
    const t=setTimeout(()=>{el.click();},dwellTime);
    el.addEventListener('pointerleave',()=>{clearTimeout(t);ring.remove();},{once:true});
  });
}
function attachGlobalDwell(){
  document.querySelectorAll('button,select,input[type=number],.scrollBand')
    .forEach(el=>addDwell(el));
}

// ============================================================
// 🎛 Voice Panel
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
  const v=speechSynthesis.getVoices();
  u.voice=v.find(x=>x.name===document.getElementById('voiceSelect').value);
  u.rate=parseFloat(document.getElementById('rateSlider').value);
  u.pitch=parseFloat(document.getElementById('pitchSlider').value);
  speechSynthesis.speak(u);
};
function initVoices(){
  const sel=document.getElementById('voiceSelect');
  const load=()=>{
    const v=speechSynthesis.getVoices();
    sel.innerHTML='';
    v.forEach(x=>{
      const o=document.createElement('option');
      o.value=x.name;o.textContent=x.name;
      if(x.name===localStorage.getItem('voiceName'))o.selected=true;
      sel.appendChild(o);
    });
  };
  load();speechSynthesis.onvoiceschanged=load;
  document.getElementById('rateSlider').value=localStorage.getItem('voiceRate')||1;
  document.getElementById('pitchSlider').value=localStorage.getItem('voicePitch')||1;
}
