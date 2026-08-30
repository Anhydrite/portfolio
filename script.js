/* ============================================================
   Portfolio Robin ZMUDA — refonte glacier + cramoisi
   ============================================================ */

const REDUCED_MOTION=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Marque de compétences (générée en JS : deux moitiés strictement identiques) ---- */
(function(){
  const words=['cybersécurité','pentest','rootme','cyberrange','neuroévolution','python','nodejs','eCPPTv2','crto','web','réseau','dataviz','gamedev','unity','typescript','c#','go','scraping','algorithmique','infra'];
  const track=document.getElementById('mqTrack');
  if(!track)return;
  const sep='&nbsp;&nbsp;●&nbsp;&nbsp;';
  const half=words.map(w=>'<span>'+w+'</span>'+sep).join('');
  track.innerHTML=half+half;
})();

/* ---- Navigation et progression : un seul passage par frame ---- */
const dockLinks=[...document.querySelectorAll('.dock a')];
const sections=[...document.querySelectorAll('section[id]')];
const rail=document.querySelector('.scroll-rail');
const railDot=rail?.querySelector('.scroll-rail-dot');
const railLabel=rail?.querySelector('.scroll-rail-label');
const prog=document.getElementById('prog');
const sectionLabels={hero:'01 · ACCUEIL',about:'02 · À PROPOS',skills:'03 · COMPÉTENCES',projects:'04 · PROJETS',contact:'05 · CONTACT'};
const sectionPositions=sections.map(section=>({section,top:section.offsetTop}));
let activeSection=null,scrollFrame=0;
function activateSection(section){
  if(!section||section===activeSection)return;
  activeSection=section;
  sections.forEach(s=>s.classList.toggle('section-live',s===section));
  dockLinks.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+section.id));
  const index=Math.max(0,sections.indexOf(section));
  if(railDot){railDot.style.top=`${index/(Math.max(1,sections.length-1))*123}px`;railDot.style.background=section.id==='projects'?'var(--crimson)':'var(--bcyan)';}
  if(railLabel)railLabel.textContent=sectionLabels[section.id]||section.id;
}
function updateScrollState(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const progress=max>0?window.scrollY/max:0;
  if(prog)prog.style.transform=`scaleX(${progress})`;
  const marker=window.scrollY+window.innerHeight*.42;
  let current=sectionPositions[0]?.section;
  sectionPositions.forEach(({section,top})=>{if(marker>=top)current=section;});
  activateSection(current);
}
function scheduleScrollState(){
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateScrollState();});
}
if(sections[0])activateSection(sections[0]);
window.addEventListener('scroll',scheduleScrollState,{passive:true});
window.addEventListener('resize',()=>{sectionPositions.forEach(item=>{item.top=item.section.offsetTop;});scheduleScrollState();},{passive:true});
/* Recalcule après chargement des polices/ressources : les hauteurs bougent, la spy doit suivre. */
(function(){
  function remeasure(){sectionPositions.forEach(item=>{item.top=item.section.offsetTop;});scheduleScrollState();}
  window.addEventListener('load',remeasure,{passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(remeasure);
})();
updateScrollState();

/* ---- Signature "Robin" (canvas calligraphique) ---- */
const sigC=document.getElementById('sig'),sigCtx=sigC.getContext('2d'),DPR=Math.min(devicePixelRatio||1,2);
function sizeSig(){sigC.width=760*DPR;sigC.height=200*DPR;sigCtx.setTransform(DPR,0,0,DPR,0,0);sigCtx.clearRect(0,0,760,200);}
sizeSig();
async function initSig(){
  let ok=false;
  try{const f=new FontFace('ZapfinoForteLTPro','url(./assets/font/ZapfinoForteLTPro.otf)');await f.load();document.fonts.add(f);ok=true;}catch(e){}
  const fam=ok?'ZapfinoForteLTPro':'cursive';
  const txt='Robin';let active=false;
  function draw(){
    const w=760,h=200;sigCtx.clearRect(0,0,w,h);sigCtx.font='128px '+fam;sigCtx.textBaseline='alphabetic';
    let sz=128,tw=sigCtx.measureText(txt).width;
    while(tw>w-46&&sz>52){sz*=.94;sigCtx.font=sz+'px '+fam;tw=sigCtx.measureText(txt).width;}
    const y=h-38,gap=10;const L=[];
    txt.split('').forEach(c=>L.push({c,x:0,y,wd:sigCtx.measureText(c).width}));
    let x=(w-L.reduce((a,l)=>a+l.wd+gap,0)+gap)/2;
    L.forEach(l=>{l.x=x;x+=l.wd+gap;});
    sigCtx.lineWidth=2;sigCtx.lineCap='round';sigCtx.strokeStyle='#ffffff';
    if(REDUCED_MOTION){sigCtx.setLineDash([]);L.forEach(l=>sigCtx.strokeText(l.c,l.x,l.y));return;}
    let li=0,brush=600;
    (function go(){
      const L2=L[li];
      sigCtx.setLineDash([brush,brush-6]);
      sigCtx.clearRect(L2.x-4,L2.y-150,L2.wd+8,170);
      sigCtx.strokeText(L2.c,L2.x,L2.y);
      brush-=6;
      if(brush>0){requestAnimationFrame(go);}
      else{sigCtx.setLineDash([]);sigCtx.clearRect(L2.x-4,L2.y-150,L2.wd+8,170);sigCtx.strokeText(L2.c,L2.x,L2.y);
        li++;if(li<L.length){brush=600;requestAnimationFrame(go);}}
    })();
  }
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&!active){active=true;io.disconnect();draw();}});},{threshold:.3});
  io.observe(sigC);
}
initSig();

/* ---- Typing (sous-titre hero) ---- */
const phrases=['Expert et développeur cybersécurité','Cybersécurité · réseau · automatisation'];
const typeEl=document.getElementById('typeText');let p=0,ch=0,del=false;
(function tick(){
  if(REDUCED_MOTION){typeEl.textContent=phrases[0];return;}
  const cur=phrases[p];typeEl.textContent=cur.slice(0,ch);
  if(!del){if(ch<cur.length){ch++;setTimeout(tick,46);}else{del=true;setTimeout(tick,2600);}}
  else{if(ch>0){ch--;setTimeout(tick,18);}else{del=false;p=(p+1)%phrases.length;setTimeout(tick,600);}}
})();

/* ---- Terminal (typing) ---- */
const tLines=[
  {p:'$ whoami',out:'Expert & développeur cybersécurité',cls:'v'},
  {p:'$ cat stack.txt',out:'Python · NodeJS · C · C# · JS',cls:'v'},
  {p:'$ ./certifs --list',out:'eJPT · eCPPTv2 · CRTO (en cours)',cls:'cr'},
  {p:'$ status',out:'OK · dispo pour de nouveaux projets',cls:'ok'}
];
const tBody=document.getElementById('termBody');let tL=0,tC=0,tP='p';
if(REDUCED_MOTION)tBody.innerHTML=tLines.map(l=>`<span class="p">${l.p}</span>\n<span class="${l.cls}">${l.out}</span>`).join('\n');
(function tTick(){
  if(REDUCED_MOTION)return;
  const l=tLines[tL];
  if(tP==='p'){tBody.innerHTML='<span class="p">'+l.p.slice(0,tC+1)+'</span><span class="cb">|</span>';
    if(tC+1<l.p.length){tC++;setTimeout(tTick,40);}else{tP='o';tC=0;setTimeout(tTick,300);}}
  else{const c=l.out.slice(0,tC+1);
    tBody.innerHTML='<span class="p">'+l.p+'</span>\n<span class="'+l.cls+'">'+c+'</span><span class="cb">|</span>';
    if(tC+1<l.out.length){tC++;setTimeout(tTick,28);}else{tL=(tL+1)%tLines.length;tC=0;tP='p';setTimeout(tTick,2200);}}
})();

/* ---- Compétences (domaines + tags) ---- */
const domains=[
  {ico:'<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><rect x="12.4" y="8.6" width="2" height="6.8" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect></svg>',nm:'Langages',tags:['Python','C','C#','JavaScript','TypeScript','HTML5','CSS3','PHP','Shell']},
  {ico:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4" ry="9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="7s" repeatCount="indefinite"/></ellipse></svg>',nm:'Web',tags:['NodeJS','jQuery','Canvas 2D','d3.js']},
  {ico:'<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>',ac:'#d42a54',nm:'Sécurité',tags:['RootMe','eJPT','eCPPTv2','CRTO']},
  {ico:'<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2 6.6 17M12 7.2l5.4 9.8"/><circle cx="12" cy="5" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;.2;1" dur="1.8s" repeatCount="indefinite"/></circle><circle cx="5" cy="19" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".2;1;.2" dur="1.8s" repeatCount="indefinite" begin=".6s"/></circle><circle cx="19" cy="19" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".2;1;.2" dur="1.8s" repeatCount="indefinite" begin="1.2s"/></circle></svg>',nm:'Réseau',tags:['Cyberrange','Infra entreprise','Paquets']},
  {ico:'<svg viewBox="0 0 24 24"><path d="M7 6h10a5 5 0 0 1 5 5v4a4 4 0 0 1-7.3 2.3L13.5 16h-3l-1.2 1.3A4 4 0 0 1 2 15v-4a5 5 0 0 1 5-5z"/><path d="M6 12h4M8 10v4"/><circle cx="16" cy="11.5" r=".7" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;.15;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="18.2" cy="13.8" r=".7" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".15;1;.15" dur="1.5s" repeatCount="indefinite" begin=".75s"/></circle></svg>',nm:'Jeux',tags:['Unity','Allegro','Neuroévolution']}
];
document.getElementById('skillsGrid').innerHTML=domains.map(d=>`<div class="sk box r"${d.ac?` style="--ac:${d.ac}"`:''}><i class="bracket t"></i><i class="bracket b"></i><span class="ico fi">${d.ico}</span><span class="nm"${d.ac?` style="color:${d.ac}"`:''}>${d.nm}</span><div class="tags">${d.tags.map(t=>`<span>${t}</span>`).join('')}</div></div>`).join('');

/* ---- Projets (repos GitHub) ---- */
const repos=[
  {name:'Spiderer',lang:'Python',desc:'Website url crawler — given an URL, return all urls found on the website.',stars:7,img:null,url:'https://github.com/Anhydrite/Spiderer'},
  {name:'doc-torn-skills',lang:'Go',desc:'Skills de documentation structurée pour agents de coding IA.',stars:4,img:null,url:'https://github.com/Anhydrite/doc-torn-skills'},
  {name:'BotDiscord2',lang:'TypeScript',desc:'Bot Discord — stream de musique, nouvelles fonctionnalités en cours.',stars:1,img:null,url:'https://github.com/Anhydrite/BotDiscord2'},
  {name:'Stegosaurus',lang:'JavaScript',desc:'Stegosaurus Neuroévolution — reprise du jeu de Google piloté par neuroévolution.',stars:0,img:'./assets/stegosaurus.png',url:'https://github.com/Anhydrite/Stegosaurus'},
  {name:'Neuroevolution1',lang:'JavaScript',desc:'Monopong Neuroévolution — un pong pour un seul joueur piloté par neuroévolution.',stars:0,img:'./assets/pong.png',url:'https://github.com/Anhydrite/Neuroevolution1'},
  {name:'OT-EQ',lang:'HTML',desc:'Orateur Typographique — retranscrire la tonalité de la voix à l\'écrit (Chrome uniquement).',stars:0,img:'./assets/orateur.png',url:'https://github.com/Anhydrite/OT-EQ'},
  {name:'d3-weather-dataviz',lang:'JavaScript',desc:'Dashboard météo — visualisation de la météo de différentes stations.',stars:0,img:'./assets/dataviz.png',url:'https://github.com/Anhydrite/d3-weather-dataviz'},
  {name:'SimpleXSSWebsite',lang:'HTML',desc:'Expérimentations XSS en conditions réelles.',stars:0,img:null,url:'https://github.com/Anhydrite/SimpleXSSWebsite'},
  {name:'GarticPhoneAutoDrawer',lang:'Python',desc:'Automatisation de dessin sur Gartic Phone.',stars:2,img:null,url:'https://github.com/Anhydrite/GarticPhoneAutoDrawer'}
];
const lc={Python:'#2b6cb0',Go:'#0967d2',JavaScript:'#b08f00',TypeScript:'#0967d2',HTML:'#e8722a'};
function phImg(p){
  const col=lc[p.lang]||'#5d9fc9';
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='236'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${col}' stop-opacity='.3'/><stop offset='1' stop-color='#081221' stop-opacity='.92'/></linearGradient></defs><rect width='420' height='236' fill='url(#g)'/><text x='210' y='150' font-family='monospace' font-size='92' fill='#d7e9f8' fill-opacity='.45' text-anchor='middle'>${(p.name[0]||'❯').toUpperCase()}</text><circle cx='60' cy='52' r='4' fill='#d7e9f8' fill-opacity='.3'/><circle cx='360' cy='190' r='6' fill='#8ccdda' fill-opacity='.35'/><circle cx='320' cy='48' r='3' fill='#8ccdda' fill-opacity='.25'/></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
document.getElementById('projGrid').innerHTML=repos.map((p,i)=>`<a class="pcard box r" href="${p.url}" target="_blank" rel="noopener" style="transition-delay:${(i%3)*.08}s"><i class="bracket t"></i><i class="bracket b"></i><span class="thumb"><img loading="lazy" src="${p.img||phImg(p)}" alt=""></span><div class="body"><div class="meta"><span class="ld" style="background:${lc[p.lang]||'var(--muted)'}"></span><span>${p.lang}</span>${p.stars>0?`<span class="star">★ ${p.stars}</span>`:''}</div><h3>${p.name}</h3><p class="desc">${p.desc}</p><div class="go">Voir sur GitHub <span class="arr">→</span></div></div></a>`).join('');

/* ---- Réseaux ---- */
const socials=[
  {icon:'./assets/twitter.png',l:'Twitter',u:'https://twitter.com/RobineEtBatman',ext:true},
  {icon:'./assets/lk.png',l:'LinkedIn',u:'https://www.linkedin.com/in/robin-zmuda-bb5288200/',ext:true},
  {icon:'./assets/Root-Me.png',l:'RootMe',u:'https://www.root-me.org/Iced?lang=fr#23374ededbc440a52699097304859043',ext:true},
  {icon:'./assets/github.png',l:'Github',u:'https://github.com/Anhydrite',ext:true},
  {icon:'./assets/discord.png',l:'Discord : Anhydrite#8817',u:'#',ext:false},
  {icon:'./assets/mailt.png',l:'contact@robinzmuda.fr',u:'mailto:contact@robinzmuda.fr',ext:false}
];
document.getElementById('socGrid').innerHTML=socials.map(s=>`<a class="soc box" href="${s.u}"><i class="bracket t"></i><i class="bracket b"></i><span class="ico"><img src="${s.icon}" alt=""></span><span><span class="nm">${s.l}</span><span class="sub">${s.ext?'lien externe':'me contacter'}</span></span><span class="arr">→</span></a>`).join('');

/* ---- Reveal ---- */
const ioR=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ioR.unobserve(e.target);}});},{threshold:.08});
document.querySelectorAll('.r').forEach(el=>ioR.observe(el));

/* ---- TextScramble (titres) ---- */
(function(){
  const chars='!<>-_\\/[]{}—=+*^?#________';
  const els=[...document.querySelectorAll('.sc')];
  const st=els.map(el=>({el,txt:el.textContent,running:false,frame:0,raf:0,timer:0,qchars:chars.split(''),queue:[]}));
  function setText(s){
    if(REDUCED_MOTION){s.el.textContent=s.txt;return;}
    const t0=s.el.innerText||s.txt;const len=Math.max(t0.length,s.txt.length);
    s.queue=[];
    for(let i=0;i<len;i++){s.queue.push({from:t0[i]||'',to:s.txt[i]||'',start:Math.floor(Math.random()*40),end:0});s.queue[i].end=s.queue[i].start+Math.floor(Math.random()*40);}
    cancelAnimationFrame(s.raf);s.frame=0;upd(s);
  }
  function upd(s){
    let o='',c=0;
    for(let i=0;i<s.queue.length;i++){const{from,to,start,end}=s.queue[i];
      if(s.frame>=end){c++;o+=to;}
      else if(s.frame>=start){o+=`<span class="dud">${s.qchars[Math.floor(Math.random()*s.qchars.length)]}</span>`;}
      else o+=from;}
    s.el.innerHTML=o;
    if(c===s.queue.length){s.running=false;}
    else s.raf=requestAnimationFrame(()=>{s.frame++;upd(s);});
  }
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){const s=st.find(x=>x.el===e.target);if(s&&!s.running){s.running=true;setText(s);}io.unobserve(e.target);}});},{threshold:.5});
  st.forEach(s=>io.observe(s.el));
})();

/* Les cartes restent volontairement plates : aucun calcul de perspective au survol. */
