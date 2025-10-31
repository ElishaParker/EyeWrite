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

// ============== CURSOR RING ==============
document.addEventListener('mousemove',e=>{
  ring.style.left=e.clientX-10+'px';
  ring.style.top=e.clientY-10+'px';
});

// start dwell when entering clickable
function startDwell(el){
  if(!hoverMode||debounce)return;
  dwellActive=true;dwellTarget=el;
  ring.classList.remove('hidden');
  const dwellTime=quickType?700:1500;
  ring.style.animation=`none`;
  void ring.offsetWidth; // reset
  ring.style.transition='stroke-dashoffset '+dwellTime+'ms linear';
  ring.style.animation=`dwellFill ${dwellTime}ms linear forwards`;
  dwellTimer=setTimeout(()=>{
    if(dwellTarget===el){triggerClick(el);}
  },dwellTime);
}
function endDwell(){
  dwellActive=false;dwellTarget=null;
  ring.classList.add('hidden');
  clearTimeout(dwellTimer);
}
function triggerClick(el){
  if(debounce)return;
  debounce=true;setTimeout(()=>debounce=false,250);
  el.click();
}

// register hover listeners globally
function registerHoverables(){
  document.querySelectorAll('button,select,input').forEach(el=>{
    el.addEventListener('mouseenter',()=>startDwell(el));
    el.addEventListener('mouseleave',endDwell);
  });
}
registerHoverables();

// ============== KEYBOARD LAYOUT ==============
const layout=[
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],
  ['Caps','A','S','D','F','G','H','J','K','L',';','\'','↵'],
  ['Shift','Z','X','C','V','B','N','M',',','.','/','↑'],
  ['Ctrl','␣','Alt','←','↓','→']
];
const rows=['row1','row2','row3','row4','row5'];
rows.forEach((r,i)=>{
  const row=document.getElementById(r);
  layout[i].forEach(k=>{
    const b=document.createElement('button');
    b.textContent=k;
    if(['⌫','Tab','Caps','Shift','Ctrl','Alt','␣','↵'].includes(k))
      b.classList.add(k==='␣'?'extraWide':'wide');
    b.onclick=()=>keyAction(k);
    row.appendChild(b);
  });
});

// ============== KEY ACTIONS ==============
function keyAction(k){
  if(debounce)return;
  debounce=true;setTimeout(()=>debounce=false,200);
  switch(k){
    case '␣': insert(' ');break;
    case '↵': insert('\n');break;
    case '⌫': document.execCommand('delete');break;
    case 'Tab': insert('    ');break;
    case 'Caps': capsOn=!capsOn;break;
    case 'Shift': shiftOn=true;setTimeout(()=>shiftOn=false,800);break;
    default: insert(formatChar(k));
  }
}
function formatChar(k){
  const base=k.length===1?k:k.charAt(0);
  if(shiftOn^capsOn)return base.toUpperCase();
  return base.toLowerCase();
}
function insert(c){document.execCommand('insertText',false,c);}

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
