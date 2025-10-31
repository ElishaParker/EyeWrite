// ============== CORE ==============
const textBox=document.getElementById('textArea');
const kb=document.getElementById('keyboard');
const ring=document.getElementById('cursorRing');
let hoverMode=true, quickType=false, shiftOn=false, capsOn=false;
let dwellTimer=null, dwellTarget=null, dwellActive=false, debounce=false;

// ============== TOOLBAR ==============
document.getElementById('hoverToggle').onclick=()=>{
  hoverMode=!hoverMode;
  document.getElementById('hoverToggle').textContent=
    hoverMode?"Hover ON 🖱":"Hover OFF 🚫";
  ring.classList.add('hidden');
};
document.getElementById('keyboardToggle').onclick=()=>kb.classList.toggle('hidden');
document.getElementById('kbClose').onclick=()=>kb.classList.add('hidden');
document.getElementById('kbToggle').onclick=()=>{
  quickType=!quickType;
  document.getElementById('kbMode').textContent=quickType?'⚡ QuickType':'🕊 Precision';
};

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

// ============== SPEAK & SEARCH (same as before) ==============
document.getElementById('speakBtn').onclick=()=>{
  const u=new SpeechSynthesisUtterance(textBox.innerText);
  speechSynthesis.speak(u);
};
document.getElementById('searchBtn').onclick=()=>{
  window.open('https://duckduckgo.com/?q='+encodeURIComponent(textBox.innerText),
  '_blank',`width=${screen.availWidth/2},height=${screen.availHeight},left=${screen.availWidth/2},top=0`);
};
