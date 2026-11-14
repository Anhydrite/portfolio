/* ============================================================
   Portfolio Robin ZMUDA - refonte glacier + cramoisi
   ============================================================ */

const REDUCED_MOTION=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Marque de compétences (générée en JS : deux moitiés strictement identiques) ---- */
(function(){
  const words=['cybersécurité','pentest','rootme','cyberrange','neuroévolution','python','nodejs','eCPPTv2','web','réseau','dataviz','gamedev','unity','typescript','c#','go','scraping','algorithmique','infra'];
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
const SPY_TOL=0.12;                // une section devient active dès que son haut entre de SPY_TOL×hauteur
                                   // de fenêtre : absorbe les arrondis de défilement et les micro-décalages
                                   // de mise en page (polices, images) qui laissaient le surlignage sur la
                                   // section précédente pour 2 px
let pinnedUntil=0;                 // clic sur le dock : la section cliquée reste active le temps que le
                                   // défilement fluide se stabilise (remis à zéro par un scroll manuel)
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
/* Section courante : celle qui occupe le BORD SUPÉRIEUR de la fenêtre.
   Pourquoi pas une ligne repère à hauteur fixe (ex. 42 % de la fenêtre) ? Parce qu'une section
   plus courte que cette ligne n'était JAMAIS détectée (sur un écran de 1080 px, « Compétences »
   fait 439 px : cliquer sur Compétences surlignait Projets) et que la DERNIÈRE section ne pouvait
   pas l'être non plus (la page ne défile plus assez pour amener son haut sous la ligne repère :
   « Contact » n'était jamais surligné à 1920×1080). Le bord supérieur, lui, est atteint par
   chaque section, et c'est le contenu qu'on est en train de lire.
   Les positions sont relues à CHAQUE passage (getBoundingClientRect) : plus d'offsetTop mis en
   cache, qui se périmait dès que la mise en page bougeait (images, polices, apparitions).
   Aux deux extrémités du document, on force la première / dernière section. */
function updateScrollState(){
  const max=document.documentElement.scrollHeight-window.innerHeight;
  const y=window.scrollY;
  if(prog)prog.style.transform=`scaleX(${max>0?Math.max(0,Math.min(1,y/max)):0})`;
  if(performance.now()<pinnedUntil)return;       // section épinglée par un clic : on ne l'écrase pas
  let current=sections[0];
  if(y>1){
    if(max>0&&y>=max-1){
      current=sections[sections.length-1];          // bas de page : la dernière section reste active
    }else{
      // dernière section dont le haut est entré dans la fenêtre (sections dans l'ordre du DOM)
      const tol=window.innerHeight*SPY_TOL;
      for(const section of sections){
        if(section.getBoundingClientRect().top<=tol)current=section;else break;
      }
    }
  }
  activateSection(current);
}
function scheduleScrollState(){
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;updateScrollState();});
}
/* Clic sur le dock : la section visée est activée immédiatement et « épinglée » le temps du
   défilement fluide → le surlignage ne dépend jamais de la position d'arrivée au pixel près. */
dockLinks.forEach(link=>{
  link.addEventListener('click',()=>{
    const target=sections.find(section=>'#'+section.id===link.getAttribute('href'));
    if(!target)return;
    activateSection(target);
    pinnedUntil=performance.now()+1500;
  });
});
/* Un défilement manuel rend la main au calcul par position (fin de l'épinglage). */
['wheel','touchmove','keydown','mousedown'].forEach(type=>{
  window.addEventListener(type,()=>{pinnedUntil=0;},{passive:true});
});
if(sections[0])activateSection(sections[0]);
window.addEventListener('scroll',scheduleScrollState,{passive:true});
window.addEventListener('resize',scheduleScrollState,{passive:true});
/* Après chargement des polices/ressources la mise en page bouge sans événement de scroll :
   on relance simplement une évaluation (aucune mesure n'est mise en cache). */
window.addEventListener('load',scheduleScrollState,{passive:true});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(scheduleScrollState);
updateScrollState();

/* ---- Signature « Robin Zmuda » (canvas calligraphique) - écriture au pinceau ----
   Les DEUX mots sont écrits en Lavishly Yours avec un pinceau (setLineDash qui progresse),
   SANS temps mort entre les lettres : la durée de chaque lettre est proportionnelle à son tracé
   réel (mesuré), donc la pointe du pinceau ne s'arrête jamais. Le tracé reste en trait fin,
   sans remplissage. Le canvas est recadré sur l'encre réelle ; tailles cohérentes et
   responsives. */
const sigC=document.getElementById('sig'),sigCtx=sigC.getContext('2d'),DPR=Math.min(devicePixelRatio||1,2);
async function initSig(){
  /* Police : Lavishly Yours (calligraphie, chargée localement) - les DEUX mots dans cette police */
  let ok=false;
  try{const f=new FontFace('Lavishly Yours','url(./assets/font/LavishlyYours-Regular.ttf)');await f.load();document.fonts.add(f);ok=true;}catch(e){}
  const famC=ok?'Lavishly Yours':'cursive';
  const txtR='Robin';        // calligraphié en Lavishly Yours
  const txtZ='Zmuda';        // calligraphié en Lavishly Yours (même police que Robin)
  let active=false,raf=0,ld=null;
  const inView=()=>{const r=sigC.getBoundingClientRect();return r.top<window.innerHeight&&r.bottom>0;};
  /* Taille de « Zmuda » : même clamp que l'ancien .zmuda CSS (rem→px calculé en JS) */
  const zmudaSize=()=>{
    const rem=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
    const vw=window.innerWidth;
    return Math.max(2.8*rem,Math.min(5.8*rem,vw*0.08));
  };
  /* Mesure + mise en page : les deux mots en Lavishly Yours, même taille, sur la même baseline */
  function layout(){
    const SIZEZ=Math.round(zmudaSize());      // taille commune (Lavishly Yours)
    const SIZER=SIZEZ;                         // même taille pour Robin et Zmuda
    const gapL=Math.round(SIZEZ*0.05);        // espace entre les lettres d'un même mot
    const gapW=Math.round(SIZEZ*0.34);        // espace entre les mots (Robin / Zmuda)
    function measure(txt,px,fontFull){
      // fontFull = chaîne complète (ex: '104px "Lavishly Yours"')
      sigCtx.font=fontFull;sigCtx.textBaseline='alphabetic';sigCtx.textAlign='left';
      const letters=txt.split('').map(c=>({c,font:fontFull,px}));
      letters.forEach(l=>{const m=sigCtx.measureText(l.c);l.wd=m.width;l.bbL=m.actualBoundingBoxLeft||0;l.bbR=m.actualBoundingBoxRight||0;});
      const mt=sigCtx.measureText(txt);
      return {letters,ascent:mt.actualBoundingBoxAscent||px*.72,descent:mt.actualBoundingBoxDescent||px*.16,px};
    }
    const famQ=/"/.test(famC)?famC:'"'+famC+'"';   // nom de police avec espace → entre guillemets
    const segR=measure(txtR,SIZER,SIZER+'px '+famQ);
    const segZ=measure(txtZ,SIZEZ,SIZEZ+'px '+famQ);
    // positionne les lettres : Robin puis espace puis Zmuda
    let x=0;
    segR.letters.forEach(l=>{l.x=x;x+=l.wd+gapL;});
    x=x-gapL+gapW;
    segZ.letters.forEach(l=>{l.x=x;x+=l.wd+gapL;});
    const Wtotal=x-gapL;
    // débordements d'encre globaux (ornements calligraphiques à gauche/droite)
    const all=[...segR.letters,...segZ.letters];
    const minL=Math.min(0,...all.map(l=>l.bbL));
    const maxR=Math.max(...all.map(l=>l.x+l.wd+l.bbR));
    const padL=Math.max(2,Math.round(-minL)+2);
    const padR=Math.max(2,Math.round(Wtotal-(maxR))+2);
    const ascent=Math.max(segR.ascent,segZ.ascent);
    const descent=Math.max(segR.descent,segZ.descent);
    const padT=Math.round(SIZEZ*0.05);
    const padB=Math.max(2,Math.round(SIZEZ*0.02));
    const W=padL+Wtotal+padR;
    const H=padT+Math.ceil(ascent+descent)+padB;
    const baseY=padT+Math.ceil(ascent);
    // décale toutes les lettres du padL
    all.forEach(l=>{l.x+=padL;});
    // les lettres ont déjà {c,font,px,wd,bbL,bbR,x} (font = chaîne complète)
    const L=[...segR.letters,...segZ.letters];
    const ld2={w:W,h:H,L,SIZEZ,SIZER,baseY,nR:segR.letters.length};
    // dimensionne le canvas natif + fixe la taille d'affichage (1:1 CSS, robuste au DPR)
    sigC.width=Math.round(W*DPR);sigC.height=Math.round(H*DPR);
    sigCtx.setTransform(DPR,0,0,DPR,0,0);
    sigCtx.clearRect(0,0,W,H);
    sigC.style.width=Math.round(W)+'px';sigC.style.height=Math.round(H)+'px';
    return ld2;
  }
  /* Dégradé vertical du thème (haut clair → bas cramoisi), lu depuis les variables CSS de la rampe.
     Ces stops colorent le tracé au pinceau des lettres. */
  function themeStops(){                 // → [[pos, couleur], …]
    const cs=getComputedStyle(document.documentElement);
    const v=n=>{const s=cs.getPropertyValue(n).trim();return s||null;};
    const snow=v('--ramp-snow'),ice=v('--ice'),cyan=v('--cyan'),crimson=v('--crimson');
    return [[0,snow||'#f0f6ff'],[.15,snow||'#f0f6ff'],[.45,ice||'#bcd6ea'],[.70,cyan||'#74bccb'],[1,crimson||'#b32247']];
  }
  function makeThemeGrad(ctx,stops){    // dégradé vertical 0→h sur un contexte donné
    const {h}=ld;
    const g=ctx.createLinearGradient(0,0,0,h);
    stops.forEach(s=>g.addColorStop(s[0],s[1]));
    return g;
  }
  function themeGrad(){ return makeThemeGrad(sigCtx,themeStops()); }
  /* Écriture au pinceau CONTINUE, « Robin » puis « Zmuda », à la suite - AUCUN temps mort :
     la durée de chaque lettre est proportionnelle à la longueur de trait réellement nécessaire
     pour la révéler (mesurée hors-écran, même sémantique de dash que le rendu). Le pinceau
     enchaîne donc les lettres sans pause ; seule une courte respiration sépare les deux mots.
     Le tracé reste en trait fin (aucun remplissage) : on écrit → pause → effacement.
     Piloté par le temps (pas le framerate). Phases : trace → pause → erase. */
  function writeLoop(){
    const {w,h,L,baseY,nR}=ld;
    const GAP_MOT=250;         // respiration courte entre « Robin » et « Zmuda » (fin de mot)
    const TRACE_TOTAL=3400;    // durée totale de l'écriture des deux mots (continue, hors respirations)
    const PAUSE=5800;
    const ERASE=560;
    let li=0,phase='trace',lastT=null,pauseAcc=0,eraseT0=0;
    let trT0=-1;                 // chrono de la lettre courante (-1 : à initialiser au 1er frame)
    sigCtx.lineCap='round';sigCtx.lineJoin='round';
    sigCtx.strokeStyle=themeGrad();
    /* Longueur de trait (dash) qui révèle ENTIÈREMENT chaque lettre - mesurée une fois sur un
       canvas hors-écran : on peint la lettre avec un tiret croissant jusqu'à obtenir le même
       encre que le trait plein (même police, même épaisseur, même sémantique dash). C'est ce
       « besoin réel » qui pilote la durée de la lettre → plus de temps mort entre les lettres. */
    const neededDash=l=>{
      const px=l.px,span=Math.max(10,l.wd+(l.bbL<0?-l.bbL:0)+(l.bbR>0?l.bbR:0));
      const cv=document.createElement('canvas');
      cv.width=Math.ceil(span+px*0.8);cv.height=Math.ceil(px*2.6);
      const c=cv.getContext('2d');
      const gx=Math.ceil(px*0.4+(l.bbL<0?-l.bbL:0)),gy=Math.ceil(px*1.9);
      const lw=Math.max(1.4,px*0.016);
      const countAt=D=>{
        c.clearRect(0,0,cv.width,cv.height);
        c.font=l.font;c.textBaseline='alphabetic';c.textAlign='left';
        c.strokeStyle='#000';c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';
        if(D>0)c.setLineDash([D,1e6]);else c.setLineDash([]);
        c.strokeText(l.c,gx,gy);
        const img=c.getImageData(0,0,cv.width,cv.height).data;
        let n=0;for(let i=3;i<img.length;i+=4){if(img[i]>8)n++;}
        return n;
      };
      const full=countAt(0);
      if(full<=0)return Math.max(span,px*0.9);
      let lo=0,hi=Math.max(span,px*1.2);
      while(countAt(hi)<full&&hi<px*80)hi*=2;
      for(let i=0;i<14;i++){const mid=(lo+hi)/2;if(countAt(mid)>=full)hi=mid;else lo=mid;}
      return Math.max(12,hi+2);
    };
    const need=L.map(neededDash);                       // trait nécessaire par lettre
    const needTot=need.reduce((a,b)=>a+b,0)||1;
    const durT=L.map((l,i)=>Math.max(110,Math.round(need[i]/needTot*TRACE_TOTAL)));   // durée de tracé de chaque lettre
    function paint(l,alpha,dash){
      sigCtx.save();
      sigCtx.globalAlpha=alpha;
      sigCtx.font=l.font;
      sigCtx.lineWidth=Math.max(1.4,l.px*0.016);
      sigCtx.strokeStyle=themeGrad();
      if(dash)sigCtx.setLineDash(dash);
      sigCtx.strokeText(l.c,l.x,baseY);
      sigCtx.restore();
    }
    /* Rendu de l'état courant (tracé uniquement, sans remplissage).
       Lettres terminées : trait seul. Lettre courante : trait en cours d'écriture.
       Lettres suivantes : pas encore visibles. */
    function drawState(liCur,k){
      sigCtx.clearRect(0,0,w,h);
      for(let i=0;i<L.length;i++){
        const l=L[i];
        if(i<liCur){paint(l,1,null);}        // lettre déjà écrite : trait seul
        else if(i===liCur&&k>0){             // k<=0 : respiration entre les mots → la lettre n'a pas commencé
          const B=need[i];                   // trait calibré sur la lettre : fini pile quand sa durée s'écoule
          paint(l,1,[Math.max(0,B*k),Math.max(2,B*(1-k)+22)]); // écriture du trait
        }
      }
    }
    function frame(now){
      if(!active)return;
      if(!inView()){raf=requestAnimationFrame(frame);return;}
      const dt=lastT==null?0:now-lastT;lastT=now;
      if(window.__ph)window.__ph(phase+':'+li);
      if(phase==='trace'){
        const cur=L[li];
        if(trT0<0)trT0=now;              // 1er frame (ou reprise après effacement) : démarre la lettre ici
        const k=Math.min(1,(now-trT0)/durT[li]);
        drawState(li,k);
        if(k>=1){
          paint(cur,1,null);   // lettre finie : trait seul
          li++;
          if(li>=L.length){li=0;phase='pause';pauseAcc=0;lastT=null;} // TOUTES écrites → pause puis effacement
          else trT0=now+(li===nR?GAP_MOT:0);   // la lettre suivante démarre IMMÉDIATEMENT (pas de temps mort)
        }
      }
      else if(phase==='pause'){
        pauseAcc+=dt;
        if(pauseAcc>=PAUSE){eraseT0=now;phase='erase';}
      }
      else if(phase==='erase'){
        const k=1-Math.min(1,(now-eraseT0)/ERASE);
        sigCtx.clearRect(0,0,w,h);
        sigCtx.globalAlpha=k;
        L.forEach(l=>{paint(l,1,null);});
        sigCtx.globalAlpha=1;
        if(k<=0){li=0;trT0=-1;phase='trace';}
      }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
  }
  /* (Re)lance l'animation avec la mise en page courante */
  function start(){
    if(!active)return;
    cancelAnimationFrame(raf);
    ld=layout();
    if(REDUCED_MOTION){
      sigCtx.lineCap='round';sigCtx.lineJoin='round';
      ld.L.forEach(l=>{sigCtx.font=l.font;sigCtx.lineWidth=Math.max(1.4,l.px*.016);sigCtx.strokeStyle=themeGrad();sigCtx.strokeText(l.c,l.x,ld.baseY);});
    }
    else writeLoop();
  }
  /* Au resize, la taille de police change : on recalcule la mise en page (debounce). */
  let rt=0;
  window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(start,180);},{passive:true});
  const io=new IntersectionObserver(es=>{es.forEach(e=>{
    if(e.isIntersecting&&!active){active=true;io.disconnect();start();}
  });},{threshold:.3});
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
  {p:'$ ./certifs --list',out:'eJPT · eCPPTv2',cls:'v'},
  {p:'$ cat langues.txt',out:'français · anglais (TOEIC 885) · espagnol (A2)',cls:'v'},
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
  {ico:'<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><rect x="12.4" y="8.6" width="2" height="6.8" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect></svg>',nm:'Langages',tags:['Python','C','C++','C#','JavaScript','TypeScript','PHP','HTML5','CSS3','Shell']},
  {ico:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4" ry="9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="7s" repeatCount="indefinite"/></ellipse></svg>',nm:'Web',tags:['NodeJS','Symfony','CakePHP','WordPress','PrestaShop','jQuery','Canvas 2D','d3.js']},
  {ico:'<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>',ac:'#d42a54',nm:'Sécurité',tags:['eJPT','eCPPTv2','RootMe','Burp Suite','sqlmap','Metasploit','Sliver','NetExec','Nmap','Wireshark','Scapy']},
  {ico:'<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2.2"/><circle cx="5" cy="19" r="2.2"/><circle cx="19" cy="19" r="2.2"/><path d="M12 7.2 6.6 17M12 7.2l5.4 9.8"/><circle cx="12" cy="5" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;.2;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="5" cy="19" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" repeatCount="indefinite" begin=".75s"/></circle><circle cx="19" cy="19" r=".9" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".2;1;.2" dur="1.5s" repeatCount="indefinite" begin="1.2s"/></circle></svg>',nm:'Réseau',tags:['Cisco','Open vSwitch','FRRouting','OSPF','BGP','VLAN','NAC','MPLS','Proxmox','ESXi','OpenNebula','Bastion','Cyberrange']},
  {ico:'<svg viewBox="0 0 24 24"><path d="M7 6h10a5 5 0 0 1 5 5v4a4 4 0 0 1-7.3 2.3L13.5 16h-3l-1.2 1.3A4 4 0 0 1 2 15v-4a5 5 0 0 1 5-5z"/><path d="M6 12h4M8 10v4"/><circle cx="16" cy="11.5" r=".7" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;.15;1" dur="1.5s" repeatCount="indefinite"/></circle><circle cx="18.2" cy="13.8" r=".7" fill="currentColor" stroke="none"><animate attributeName="opacity" values=".15;1;.15" dur="1.5s" repeatCount="indefinite" begin=".75s"/></circle></svg>',nm:'Jeux',tags:['Unity','Allegro','Neuroévolution']},
  // Setup de travail « vibecoding » : les technos et les outils réellement utilisés - pi (agent de
  // code en terminal) et opencode (avec DeepSeek comme modèle), des serveurs MCP, des skills que
  // j'écris et publie (doc-torn-skills), mes extensions pi et mes propres outils CLI (doc-torn-scan,
  // rtk), le tout piloté par des sous-agents.
  {ico:'<svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="14" rx="2.5"/><path d="M6.8 11.2 9.4 13.8 6.8 16.4"/><path d="M12.2 16.4h5.8"/><path d="M18.6 1.6l.55 1.5 1.5.55-1.5.55-.55 1.5-.55-1.5-1.5-.55 1.5-.55z" fill="currentColor" stroke="none"><animate attributeName="opacity" values="1;.2;1" dur="2.6s" repeatCount="indefinite"/></path></svg>',ac:'var(--violet)',nm:'Vibecoding',tags:['pi','opencode','DeepSeek','MCP','skills maison','extensions pi','doc-torn-scan','rtk','sub-agents']}
];
document.getElementById('skillsGrid').innerHTML=domains.map(d=>`<div class="sk box r"${d.ac?` style="--ac:${d.ac}"`:''}><i class="bracket t"></i><i class="bracket b"></i><span class="ico fi">${d.ico}</span><span class="nm"${d.ac?` style="color:${d.ac}"`:''}>${d.nm}</span><div class="tags">${d.tags.map(t=>`<span>${t}</span>`).join('')}</div></div>`).join('');

/* ---- Projets (repos GitHub) ---- */
const repos=[
  {name:'Spiderer',lang:'Python',desc:'Website url crawler · given an URL, return all urls found on the website.',stars:7,img:null,url:'https://github.com/Anhydrite/Spiderer'},
  {name:'Ordum',lang:'Python',desc:'Générateur d\'infrastructures : topologie réseau aléatoire type entreprise, déployable sur hyperviseur, avec un panel de vulnérabilités à venir (WIP).',stars:0,img:null,url:'https://github.com/Anhydrite/Ordum'},
  {name:'doc-torn-skills',lang:'Go',desc:'Skills de documentation structurée pour agents de coding IA.',stars:6,img:null,url:'https://github.com/Anhydrite/doc-torn-skills'},
  {name:'BotDiscord2',lang:'TypeScript',desc:'Bot Discord · stream de musique, nouvelles fonctionnalités en cours.',stars:1,img:null,url:'https://github.com/Anhydrite/BotDiscord2'},
  {name:'pi-keep-model',lang:'TypeScript',desc:'Extension pi : garde le modèle actif d\'une session à l\'autre, en démarrage par défaut.',stars:1,img:null,url:'https://github.com/Anhydrite/pi-keep-model'},
  {name:'a-star_with_ascii',lang:'Python',desc:'Algorithme A* sur une carte ASCII : murs, routes, brouillard, chemin le plus court, carte rafraîchie à chaque mouvement.',stars:0,img:null,url:'https://github.com/Anhydrite/a-star_with_ascii'},
  {name:'Stegosaurus',lang:'JavaScript',desc:'Stegosaurus Neuroévolution · reprise du jeu de Google piloté par neuroévolution.',stars:0,img:'./assets/stegosaurus.png',url:'https://github.com/Anhydrite/Stegosaurus',demo:'./projects/Stegosaurus/index.html'},
  {name:'Neuroevolution1',lang:'JavaScript',desc:'Monopong Neuroévolution · un pong pour un seul joueur piloté par neuroévolution.',stars:0,img:'./assets/pong.png',url:'https://github.com/Anhydrite/Neuroevolution1',demo:'./projects/Neuroevolution1/index.html'},
  {name:'OT-EQ',lang:'HTML',desc:'Orateur Typographique · retranscrire la tonalité de la voix à l\'écrit (Chrome uniquement).',stars:0,img:'./assets/orateur.png',url:'https://github.com/Anhydrite/OT-EQ',demo:'./projects/OT-EQ/index.html'},
  {name:'d3-weather-dataviz',lang:'JavaScript',desc:'Dashboard météo · visualisation de la météo de différentes stations.',stars:0,img:'./assets/dataviz.png',url:'https://github.com/Anhydrite/d3-weather-dataviz',demo:'./projects/dataviz/index.html'},
  {name:'SimpleXSSWebsite',lang:'HTML',desc:'Expérimentations XSS en conditions réelles.',stars:0,img:null,url:'https://github.com/Anhydrite/SimpleXSSWebsite'},
  {name:'GarticPhoneAutoDrawer',lang:'Python',desc:'Automatisation de dessin sur Gartic Phone.',stars:2,img:null,url:'https://github.com/Anhydrite/GarticPhoneAutoDrawer'}
];
const lc={Python:'#2b6cb0',Go:'#0967d2',JavaScript:'#b08f00',TypeScript:'#0967d2',HTML:'#e8722a'};
function phImg(p){
  const col=lc[p.lang]||'#5d9fc9';
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='420' height='236'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${col}' stop-opacity='.3'/><stop offset='1' stop-color='#081221' stop-opacity='.92'/></linearGradient></defs><rect width='420' height='236' fill='url(#g)'/><text x='210' y='150' font-family='monospace' font-size='92' fill='#d7e9f8' fill-opacity='.45' text-anchor='middle'>${(p.name[0]||'❯').toUpperCase()}</text><circle cx='60' cy='52' r='4' fill='#d7e9f8' fill-opacity='.3'/><circle cx='360' cy='190' r='6' fill='#8ccdda' fill-opacity='.35'/><circle cx='320' cy='48' r='3' fill='#8ccdda' fill-opacity='.25'/></svg>`;
  return 'data:image/svg+xml,'+encodeURIComponent(svg);
}
const projectGrid=document.getElementById('projGrid');
/* Cartes projets : la carte n'est plus un <a> englobant (impossible d'y imbriquer le lien de
   démo) - la vignette et le titre portent un lien « étiré » vers le dépôt GitHub (toute la
   carte reste cliquable), et la ligne d'actions repasse au-dessus pour proposer la démo locale
   (./projects/<nom>/, cf. repos[].demo) quand elle existe. */
projectGrid.innerHTML=repos.map((p,i)=>`<article class="pcard box r" style="transition-delay:${(i%3)*.08}s"><i class="bracket t"></i><i class="bracket b"></i><span class="thumb"><img loading="lazy" decoding="async" src="${p.img||phImg(p)}" alt=""></span><div class="body"><div class="meta"><span class="ld" style="background:${lc[p.lang]||'var(--muted)'}"></span><span>${p.lang}</span>${p.stars>0?`<span class="star">★ ${p.stars}</span>`:''}</div><h3><a class="stretch" href="${p.url}" target="_blank" rel="noopener">${p.name}</a></h3><p class="desc">${p.desc}</p><div class="go"><a class="go-repo" href="${p.url}" target="_blank" rel="noopener">Voir sur GitHub <span class="arr">→</span></a>${p.demo?`<a class="go-demo" href="${p.demo}" target="_blank" rel="noopener">▶ Démo live <span class="arr">→</span></a>`:''}</div></div></article>`).join('');
projectGrid.querySelectorAll('img').forEach(img=>{if(img.decode)img.decode().catch(()=>{});});

/* ---- Réseaux ---- */
const socials=[
  {icon:'./assets/twitter.png',l:'Twitter',u:'https://twitter.com/RobineEtBatman',ext:true},
  {icon:'./assets/lk.png',l:'LinkedIn',u:'https://www.linkedin.com/in/rzmuda',ext:true},
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
  const chars='!<>-_\\/[]{}=+*^?#________';
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

/* ---- Fond lampe à lave : fluide SPH (mécanique des fluides réelle) ---- */
(function initLava(){
  const host=document.getElementById('lava-bg'),canvas=document.getElementById('lava-canvas');
  if(!host||!canvas)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'high-performance'});
  if(!gl){host.classList.add('is-fallback');return;}

  // Pas de DPR ici : le fond est rendu à RENDER_SCALE × taille CSS (voir resize()). Le `DPR`
  // global du fichier ne concerne que le canvas de la signature.
  let reduced=motion.matches,raf=0,last=0,W=0,H=0,scrolling=false,scrollTimer=0,accumulator=0;
  const fpsValue=document.querySelector('#fps-counter strong');
  let fpsFrames=0,fpsStamp=performance.now();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

  // ---------- Paramètres physiques (tunables) ----------
  const N=620;                     // nb de particules : surface encore PLUS dense
                                    // → rendu ultra-lisse, détail fin maximal
  const RENDER_MAX=680;            // particules rendues (toutes → surface lisse)
  const H_SMOOTH=0.042;            // rayon d'interaction SPH (unités = hauteur d'écran)
  const REST_DENSITY=1.6;          // densité de repos
  const K_PRESSURE=0.18;           // raideur de pression
  const K_NEAR=0.024;              // raideur de pression proche (tension de surface) - arrondit les gouttes détachées
  const VISCOSITY=0.15;            // viscosité (XSPH) - laminaire mais pas étouffante
  const COHESION=0.045;            // cohésion (tension de surface) - blobs ronds, convection préservée
  const COH_RANGE=1.30;            // portée de la cohésion (× H_SMOOTH)
  const GRAVITY=0.34;              // gravité (unités/s²) - réduite : la base chaude (temp≈1.0) peut vaincre
                                    // la gravité et monter (poussée ~0.6 > 0.34) ; le dessus froid (0.3-0.5)
                                    // reste plus lourd que sa poussée → redescend (matière au sol)
  const BUOYANCY=0.92;             // poussée d'Archimède (unités/s² par écart de température) - forte :
                                    // la base chaude (≈1.0) monte franchement, le dessus froid redescend
  const HEAT_RATE=0.75;            // taux de chauffe de la plaque → la base du pool devient franchement
                                    // chaude (≈0.9-1.0) et perce le seuil pour détacher des colonnes ;
                                    // le reste du pool reste tiède (0.5-0.6) → matière au sol
  const WARMUP=35;                 // durée de PRÉCHAUFFE au chargement (s) : la plaque monte de 0 → pleine puissance (courbe smoothstep)
  const HEAT_THICK=0.09;           // épaisseur de la plaque chauffante - couche basse épaissie :
                                    // plus de matière est chauffée au sol → plus de colonnes se détachent
                                    // (moins de matière qui reste figée au fond)
  const BURNERS=4;                 // nombre de SPOTS DE CHAUFFE (brûleurs discrets) espacés sur la largeur :
                                    // des colonnes naissent à des points précis, le reste du pool reste froid
                                    // et ancré (matière au sol) - mécanisme Rayleigh-Taylor localisé
  const COOL_RATE=0.008;           // refroidissement ambiant FAIBLE (proportionnel à T) : le pool reste un
                                    // réservoir tiède stable ; la base accumule la chaleur et perce le seuil
                                    // pour détacher des colonnes (la convection, pas le refroidissement, ferme le cycle)
  const COOL_TOP=0.18;             // refroidissement en l'air RÉDUIT (relaxation) : le liquide qui monte
                                    // reste chaud et léger plus longtemps (colonnes longues, gouttes qui
                                    // flottent avant de retomber) ; il redescend plus lentement
  const COOL_TOP_Z=0.55;           // seuil de hauteur RELEVÉ : le refroidissement n'agit qu'à partir de 0.55 - 
                                    // la matière monte très haut encore chaude, ne refroidit que là-haut
  const CEIL_RECALL=0.20;          // force de rappel vers le bas au-dessus de CEIL_Z (ferme le cycle) - douce
  const CEIL_Z=0.85;               // altitude au-delà de laquelle le liquide est rabattu - haute :
                                    // la matière peut monter haut avant le rappel
  const CONDUCT=0.06;               // conduction thermique - anisotrope (voir CONDUCT_VBIAS) :
                                    // verticale pour chauffer la colonne au-dessus des spots (elle devient
                                    // légère et monte), horizontale pour diffuser la chaleur dans le pool
  const CONDUCT_VBIAS=3.0;          // BIAIS VERTICAL de conduction (×3 sur l'axe vertical) : la chaleur
                                    // monte dans les colonnes au-dessus des spots (elles deviennent légères et
                                    // montent) ; elle ne s'étale presque pas latéralement (le pool reste froid)
  const T_CRITICAL=0.52;           // seuil critique : au-delà, le liquide s'allège et vole (détachement des colonnes)
  const THERMAL_NOTEFF=0.50;       // expansion : xREST_DENSITY effectif en dessous de ce seuil
  const THERMAL_BOOST=0.55;        // surchauffe locale → détachement serein de bulles (compense la dissipation)
  const RESTITUTION=0.35;          // rebond (sol/murs) - suffisant pour des éclaboussures vivantes
  const DAMPING=0.992;             // amortissement global
  const GROUND_FRICTION=0.96;      // friction au sol
  const MAX_FALL=0.16;             // vitesse terminale - un peu plus haute : les blobs montent/descendent
                                    // plus vite → plus de matière circule, moins de stagnation au sol
  const PART_RADIUS=0.026;         // rayon de rendu d'une particule (lisse)
  const RENDER_SCALE=0.7;          // canvas = RENDER_SCALE × taille CSS (fond flouté 54px : le détail
                                    // sous ~27 px CSS est détruit → rendre plus fin est du gaspillage)
  const DENS_REF=960;              // hauteur de référence du champ de densité (calibrage du relief)
  const DENS_H=480, DENS_W=768;    // champ de densité : aspect FIXE 1,6 (le monde est borné à
                                    // [0.4;3.0] : le splat n'est isotrope qu'à 1,6 - c'était déjà
                                    // le cas de l'ancienne texture 1536×960, même rapport 1,6)
  const SPLAT_WORLD=0.128;         // diamètre d'un splat en fraction de la hauteur monde (calibré sur
                                    // l'ancien réglage 123 px pour une texture de 960 px)
  // --- Graine de Rayleigh-Taylor : perturbation douce de l'interface (colonnes espacées) ---
  const RT_SEED=0.008;             // amplitude de la graine (décalage latéral) - pool large & bas → colonnes régulières sur toute la largeur
  const RT_FREQ=22.0;              // fréquence spatiale → espacement des colonnes ≈ 2π/RT_FREQ
  // --- Traînée de Stokes : le blob compact glisse, le petit traîne (v ∝ r²) ---
  const DRAG_RATE=0.35;            // traînée de base (s⁻¹)
  const DRAG_AMB=1.5;              // surcroît de traînée quand peu de voisins (petits blobs → lents)
  const DRAG_NB=10;                // voisins de référence
  // --- Plateau-Rayleigh : pincement des brins verticaux fins en gouttes ---
  // Fracture du cou (rupture du film) :
  const PR_SNAP=0.05;              // ouverture latérale du cou après PBD (survit à la relaxation) - douce : les gouttes se détachent lentement, sans éclabousser
  const PR_BANDS=24;               // tranches horizontales pour détecter le cou
  const PR_MIN_OCC=4;              // particules min. par tranche candidate
  const PR_MAX_NECK=0.10;          // largeur max. du cou pour déclencher la fracture
  const PR_FRAC_TOL=0.05;          // demi-épaisseur du plan de fracture autour du cou
  const PR_LATCH=120;              // verrouillage (en pas) : la fracture reste active après la détection
  // La suppression du flick/rollback est faite par RÉCONCILIATION PBD (voir plus bas) :
  // on recale la vitesse sur le déplacement réel après la relaxation de pression.
  // Plus de besoin de couche d'amortissement qui étouffait l'éclaboussure et les bulles.

  let aspect=1;
  let simTime=0;                   // horloge du simulateur (phase de la graine RT)
  let neckY=-1;                    // altitude du cou de colonne détecté (fracture Plateau-Rayleigh), -1 = aucun
  let neckLatch=0;                 // verrouillage : la fracture reste active après la dernière détection
  const P=[];                      // particules {x,y,vx,vy,px,py,temp,r}

  function initParticles(){
    // 1) Pool de cire PLEINE LARGEUR posé sur la plaque (le "gros bloc") :
    //    dôme large et bas (~94 % de l'écran), la matière au sol.
    const cx=aspect*0.5, s=0.020, floorY=0.02, topY=0.16, halfW=aspect*0.47;
    P.length=0;
    const rows=Math.ceil((topY-floorY)/(s*0.80));
    for(let row=0;row<rows&&P.length<Math.floor(N*0.55);row++){
      const y=floorY+row*s*0.80;
      const dy=(y-floorY)/(topY-floorY);
      const rw=Math.sqrt(Math.max(0,1-dy*dy));
      const off=(row&1)?s*0.5:0;
      const cols=Math.floor((rw*halfW)/s);
      for(let col=-cols;col<=cols&&P.length<Math.floor(N*0.55);col++){
        const x=cx+col*s+off;
        if(x>s&&x<aspect-s){
          P.push({x,y,vx:0,vy:0,px:x,py:y,temp:0.18,r:PART_RADIUS}); // cire froide → la préchauffe est visible
        }
      }
    }
    // 2) BOULE DE LIQUIDE qui tombe d'en haut au chargement : une masse compacte et froide
    //    placée au-dessus du pool, avec une vitesse de chute → elle s'écrase sur le pool
    //    et éclabousse (comme la version d'origine).
    const dropR=Math.min(aspect*0.14, 0.24);          // rayon de la boule (proportionnel à la largeur)
    const dropCx=cx, dropCy=0.80;                     // centre de la boule (HAUT, pour une chute visible)
    const dropS=s*1.05;
    const dropRows=Math.ceil((dropR*2)/dropS);
    const remaining=N-P.length;
    let added=0;
    for(let row=-dropRows;row<=dropRows&&added<remaining;row++){
      const y=dropCy+row*dropS*0.866;
      const dy=(y-dropCy)/dropR;
      const rw=Math.sqrt(Math.max(0,1-dy*dy));
      const off=(row&1)?dropS*0.5:0;
      const cols=Math.floor((rw*dropR)/dropS);
      for(let col=-cols;col<=cols&&added<remaining;col++){
        const x=dropCx+col*dropS+off;
        if(x>dropS&&x<aspect-dropS&&y>0.05&&y<0.98){
          P.push({x,y,vx:0,vy:0.9,px:x,py:y-dropS,temp:0.10,r:PART_RADIUS}); // chute un peu plus lente → splash visible
          added++;
        }
      }
    }
    // Si la boule a dépassé le pool (petits écrans), on complète avec les particules restantes
    // dans le pool pour garder la masse au sol.
    while(P.length<N){
      const x=cx+(Math.random()-0.5)*aspect*0.9, y=floorY+Math.random()*topY;
      P.push({x,y,vx:0,vy:0,px:x,py:y,temp:0.18,r:PART_RADIUS});
    }
  }

  // ---------- Fluide SPH : double density relaxation (Clavet 2005) ----------
  const density=new Float32Array(N), nearDensity=new Float32Array(N);
  const pressure=new Float32Array(N);
  const dispX=new Float32Array(N), dispY=new Float32Array(N);
  const nbC=new Float32Array(N);
  const prLo=new Float32Array(32), prHi=new Float32Array(32), prCnt=new Uint16Array(32); // cou de colonne

  /* ---------- Grille spatiale : voisinage en O(N) au lieu de O(N²) ----------
     Le domaine monde [0,aspect]×[0,1] est l'image exacte du plein écran (le shader mappe
     x/aspect et y sur [-1,1]) : un delta monde = une distance écran, la métrique est
     isotrope. On le découpe donc en cellules CARRÉES de côté ≥ GRID_CELL (division entière :
     aspect/gridW ≥ GRID_CELL par construction) : un voisinage 3×3 GARANTIT alors de couvrir
     tout rayon ≤ GRID_CELL (pire cas : particule au coin de sa cellule), donc toutes les
     interactions jusqu'à la portée de cohésion (H_SMOOTH×COH_RANGE).
     Chaque pas : tri des particules par cellule (tri par comptage, O(N)) puis construction
     d'une liste PLATE de paires uniques `(i, j, dx, dy, r²)` - chaque paire voisine est
     enregistrée exactement une fois, quel que soit l'ordre des indices.
     Les boucles lourdes (cohésion, densités, pression ×2, viscosité, conduction) itèrent
     ensuite cette liste (~2 500 paires réelles) au lieu des 191 900 paires de l'ancien
     double balayage → ~75× moins de tests de distance par pas. */
  const COH_R=H_SMOOTH*COH_RANGE, COH_R2=COH_R*COH_R;
  const GRID_CELL=COH_R;                    // côté de cellule = portée max d'interaction
  let gridW=1,gridH=1,gridN=1;
  let cellOf=new Int32Array(N),cellCount=new Int32Array(1),cellStart=new Int32Array(2),sortIdx=new Int32Array(N);
  // Liste PLATE des paires uniques (i < j implicite) : les boucles lourdes itèrent cette liste
  // et appliquent la mise à jour symétrique des deux particules, exactement comme l'ancienne
  // boucle « for(j=i+1…N) » - sans tranche par particule ni double stockage.
  let pairI=new Int32Array(N*24),pairJ=new Int32Array(N*24);
  let pairDX=new Float32Array(N*24),pairDY=new Float32Array(N*24),pairR2=new Float32Array(N*24);
  let nPairs=0;

  /* Dimensionne la grille selon l'aspect courant (appelé à chaque redimensionnement).
     Division ENTIÈRE (pas d'arrondi au supérieur) : la taille de cellule aspect/gridW reste
     ≥ GRID_CELL, condition de la garantie de couverture du 3×3. */
  function setupGrid(){
    gridW=Math.max(1,Math.floor(aspect/GRID_CELL));
    gridH=Math.max(1,Math.floor(1/GRID_CELL));
    gridN=gridW*gridH;
    if(cellCount.length!==gridN){cellCount=new Int32Array(gridN);cellStart=new Int32Array(gridN+1);}
  }

  /* Double la capacité des listes de paires (très rare : ~15 voisins réels par particule,
     on réserve 24 emplacements par particule). */
  function growPairs(){
    const cap=pairJ.length*2;
    const ni=new Int32Array(cap), nj=new Int32Array(cap);
    const ndx=new Float32Array(cap), ndy=new Float32Array(cap), nr2=new Float32Array(cap);
    ni.set(pairI); nj.set(pairJ); ndx.set(pairDX); ndy.set(pairDY); nr2.set(pairR2);
    pairI=ni; pairJ=nj; pairDX=ndx; pairDY=ndy; pairR2=nr2;
  }

  /* Tri par cellule + liste de paires candidates par parcours des PAIRES DE CELLULES :
     chaque paire de particules est testée UNE SEULE fois - paires internes à une cellule puis
     demi-voisinage de Moore (E, S, SE, SO) - au lieu d'être retestée jusqu'à 9 fois par les
     balayages 3×3 particule par particule. Même ensemble de paires, ~4× moins de tests. */
  const CELL_DX=[1,0,1,-1], CELL_DY=[0,1,1,1];      // demi-voisinage : E, S, SE, SO
  function buildNeighbors(){
    const n=P.length;
    cellCount.fill(0);
    for(let i=0;i<n;i++){
      const p=P[i];
      let gx=(p.x/GRID_CELL)|0; if(gx<0)gx=0; else if(gx>=gridW)gx=gridW-1;
      let gy=(p.y/GRID_CELL)|0; if(gy<0)gy=0; else if(gy>=gridH)gy=gridH-1;
      const c=gy*gridW+gx; cellOf[i]=c; cellCount[c]++;
    }
    let s=0;
    for(let c=0;c<gridN;c++){cellStart[c]=s; s+=cellCount[c];}
    cellStart[gridN]=s;
    for(let c=0;c<gridN;c++)cellCount[c]=cellStart[c];    // curseurs de remplissage
    for(let i=0;i<n;i++)sortIdx[cellCount[cellOf[i]]++]=i;
    let k=0;
    for(let cy=0;cy<gridH;cy++){
      for(let cx=0;cx<gridW;cx++){
        const c=cy*gridW+cx, s0=cellStart[c], e0=cellStart[c+1];
        if(s0===e0)continue;
        // (1) paires INTERNES à la cellule
        for(let t=s0;t<e0-1;t++){
          const i=sortIdx[t], p=P[i], xi=p.x, yi=p.y;
          for(let u=t+1;u<e0;u++){
            const j=sortIdx[u], q=P[j];
            const dx=q.x-xi, dy=q.y-yi, r2=dx*dx+dy*dy;
            if(r2>=COH_R2||r2<1e-10)continue;
            if(k===pairI.length)growPairs();
            pairI[k]=i; pairJ[k]=j; pairDX[k]=dx; pairDY[k]=dy; pairR2[k]=r2;
            k++;
          }
        }
        // (2) paires avec la moitié positive des cellules voisines
        for(let d=0;d<4;d++){
          const nx=cx+CELL_DX[d], ny=cy+CELL_DY[d];
          if(nx<0||nx>=gridW||ny<0||ny>=gridH)continue;
          const c2=ny*gridW+nx, s2=cellStart[c2], e2=cellStart[c2+1];
          if(s2===e2)continue;
          for(let t=s0;t<e0;t++){
            const i=sortIdx[t], p=P[i], xi=p.x, yi=p.y;
            for(let u=s2;u<e2;u++){
              const j=sortIdx[u], q=P[j];
              const dx=q.x-xi, dy=q.y-yi, r2=dx*dx+dy*dy;
              if(r2>=COH_R2||r2<1e-10)continue;
              if(k===pairI.length)growPairs();
              pairI[k]=i; pairJ[k]=j; pairDX[k]=dx; pairDY[k]=dy; pairR2[k]=r2;
              k++;
            }
          }
        }
      }
    }
    nPairs=k;
  }

  function step(h){
    const h2=H_SMOOTH*H_SMOOTH;
    const invH=1/H_SMOOTH;

    // 1. Forces (gravité + poussée d'Archimède thermique + rappel plafond) + intégration
    for(let i=0;i<P.length;i++){
      const p=P[i];
      // Poussée d'Archimède + expansion critique : le chaud devient léger et monte
      const boost=p.temp>T_CRITICAL?THERMAL_BOOST*(p.temp-T_CRITICAL)/(1.0-T_CRITICAL):0.0;
      p.vy+=(-GRAVITY + BUOYANCY*(p.temp-0.5) + boost)*h;
      // Graine de Rayleigh-Taylor : décalage latéral périodique doux → colonnes espacées
      p.vx+=RT_SEED*Math.sin(p.x*RT_FREQ+simTime*0.4)*h;
      // Rappel gravitaire : les gouttes trop hautes retombent (ferme le cycle, pas de plafond)
      if(p.y>CEIL_Z){p.vy-=(p.y-CEIL_Z)*CEIL_RECALL*h;}
      // Traînée de Stokes (nb = voisins du pas précédent) : un blob compact glisse vite,
      // un petit blob traîne → le gros rattrape le petit → coalescence émergente
      const drag=DRAG_RATE*(1.0+DRAG_AMB*Math.max(0,DRAG_NB-nbC[i])/DRAG_NB);
      p.vx*=Math.max(0,1-drag*h); p.vy*=Math.max(0,1-drag*h);
      p.vx*=DAMPING; p.vy*=DAMPING;
      if(p.vy<-MAX_FALL)p.vy=-MAX_FALL;
      if(p.vy>MAX_FALL)p.vy=MAX_FALL;
      if(p.vx>MAX_FALL)p.vx=MAX_FALL;
      if(p.vx<-MAX_FALL)p.vx=-MAX_FALL;
      p.px=p.x; p.py=p.y;
      p.x+=p.vx*h; p.y+=p.vy*h;
    }
    simTime+=h;
    // Voisinage : listes de paires candidates reconstruites sur les positions courantes
    // (après intégration) - même base topologique que l'ancienne passe O(N²).
    buildNeighbors();

    // 1b. Détection du COU de colonne (Plateau-Rayleigh macroscopique) : la tranche la plus
    //     étroite au-dessus du pool, avec du matériau en dessous (pool) ET au-dessus (tête).
    //     Verrouillage : une fois détecté, le cou reste actif PR_LATCH pas → la fracture a le
    //     temps de séparer complètement la tête (évite le clignotement ouvert/fermé).
    let newNeck=-1;
    for(let b=0;b<PR_BANDS;b++){prLo[b]=1e9;prHi[b]=-1e9;prCnt[b]=0;}
    for(let i=0;i<P.length;i++){
      const p=P[i];
      const b=Math.min(PR_BANDS-1,Math.max(0,Math.floor(p.y*PR_BANDS)));
      prCnt[b]++;
      if(p.x<prLo[b])prLo[b]=p.x;
      if(p.x>prHi[b])prHi[b]=p.x;
    }
    const poolB=Math.floor(0.18*PR_BANDS);
    let bestW=1e9;
    for(let b=poolB+1;b<PR_BANDS-1;b++){
      if(prCnt[b]<PR_MIN_OCC)continue;
      const w=prHi[b]-prLo[b];
      const belowW=(prCnt[b-1]>=PR_MIN_OCC)?(prHi[b-1]-prLo[b-1]):1e9;
      const headW=(prCnt[b+1]>=PR_MIN_OCC)?(prHi[b+1]-prLo[b+1]):1e9;
      if(w<bestW && belowW>w*2 && headW>w*1.2 && w<PR_MAX_NECK){bestW=w;newNeck=(b+0.5)/PR_BANDS;}
    }
    if(newNeck>=0){neckY=newNeck;neckLatch=PR_LATCH;}
    else if(neckLatch>0){neckLatch--;}
    else{neckY=-1;}

    // 2. Cohésion (tension de surface) : attire les particules proches
    for(let k=0;k<nPairs;k++){
      const a=P[pairI[k]], b=P[pairJ[k]];
      const r=Math.sqrt(pairR2[k]);
      const f=COHESION*(1-r/COH_R)*h/r;
      const fx=f*pairDX[k], fy=f*pairDY[k];
      a.vx+=fx; a.vy+=fy;
      b.vx-=fx; b.vy-=fy;
    }

    // 3. Densités (noyau (1-q)^2 et (1-q)^3) + comptage de voisinage (traînée de Stokes)
    for(let i=0;i<P.length;i++){density[i]=0;nearDensity[i]=0;nbC[i]=0;}
    for(let k=0;k<nPairs;k++){
      const r2=pairR2[k];
      if(r2>=h2)continue;                              // noyau nul au-delà du rayon d'interaction
      const aq=1-Math.sqrt(r2)*invH, aq2=aq*aq, aq3=aq2*aq;
      const i=pairI[k], j=pairJ[k];
      density[i]+=aq2; density[j]+=aq2;
      nearDensity[i]+=aq3; nearDensity[j]+=aq3;
      nbC[i]++; nbC[j]++;
    }

    // 4. Pression : densité de repos effective dépend de la température (expansion thermique)
    for(let i=0;i<P.length;i++){
      const pt=P[i].temp;
      const restEff=REST_DENSITY*(pt>THERMAL_NOTEFF?(1.0-(pt-THERMAL_NOTEFF)*0.9):1.0);
      pressure[i]=Math.max(0,K_PRESSURE*(density[i]-restEff));
    }

    // 5. Déplacements de pression (double density relaxation) - 2 passes stables.
    //    Le voisinage est reconstruit après CHAQUE passe : la relaxation peut rapprocher deux
    //    particules de bien plus que la marge de la liste (déplacements clampés à maxDisp, donc
    //    jusqu'à ~0.045 de rapprochement relatif à deux), et l'ancienne boucle O(N²) retestait
    //    TOUTES les paires à chaque étape - une liste figée en début de pas manquerait ces paires.
    const maxDisp=0.015;
    for(let pass=0;pass<2;pass++){
      for(let i=0;i<P.length;i++){dispX[i]=0;dispY[i]=0;}
      for(let k=0;k<nPairs;k++){
        const i=pairI[k], j=pairJ[k];
        const a=P[i], b=P[j];
        const dx=pairDX[k], dy=pairDY[k], r2=pairR2[k];
        if(r2>=h2)continue;
        const r=Math.sqrt(r2)||1e-6;
        const aq=1-r*invH;
        const inv=1/r, nx=dx*inv, ny=dy*inv;
        // Fracture Plateau-Rayleigh : si un cou de colonne est détecté, on coupe
        // l'interaction (pression + tension) entre les particules de part et d'autre
        // du plan du cou → le "film" casse, la colonne se sépare en deux.
        if(neckY>=0){
          const ay=a.y-neckY, by=b.y-neckY;
          if(ay*by<0 && Math.abs(ay)<PR_FRAC_TOL+0.06 && Math.abs(by)<PR_FRAC_TOL+0.06)continue;
        }
        // j pousse i ; i pousse j
        const near_i=aq*aq*K_NEAR*nearDensity[i];
        const near_j=aq*aq*K_NEAR*nearDensity[j];
        const Di=(pressure[j]+near_j)*aq*0.5;
        const Dj=(pressure[i]+near_i)*aq*0.5;
        dispX[i]-=Di*nx; dispY[i]-=Di*ny;
        dispX[j]+=Dj*nx; dispY[j]+=Dj*ny;
      }
      for(let i=0;i<P.length;i++){
        let dx=dispX[i], dy=dispY[i];
        const m=Math.sqrt(dx*dx+dy*dy);
        const limit=pass===0?maxDisp:maxDisp*0.5;
        if(m>limit){dx=dx/m*limit; dy=dy/m*limit;}
        P[i].x+=dx; P[i].y+=dy;
      }
      // Les positions viennent de changer : le voisinage est reconstruit pour la passe suivante,
      // pour la viscosité et pour la conduction qui suivent (positions stables jusqu'à la fin du pas).
      buildNeighbors();
    }

    // 5b. RÉCONCILIATION PBD : vitesse = déplacement effectif depuis le début du pas.
    //     Élimine le flick/rollback (le fluide posé gardait une vitesse de chute que la
    //     relaxation contraint, d'où des remontées brusques). Permet de se passer de la
    //     couche d'amortissement au sol → l'eau descend au fond, éclabousse et forme des bulles.
    for(let i=0;i<P.length;i++){
      const p=P[i];
      p.vx=(p.x-p.px)/h; p.vy=(p.y-p.py)/h;
      if(p.vy<-MAX_FALL)p.vy=-MAX_FALL; if(p.vy>MAX_FALL)p.vy=MAX_FALL;
      if(p.vx>MAX_FALL)p.vx=MAX_FALL; if(p.vx<-MAX_FALL)p.vx=-MAX_FALL;
    }

    // 5c. Ouverture active du cou : après la réconciliation (donc non effacée), on pousse
    //     latéralement les particules du plan du cou (gauche à gauche, droite à droite) + on
    //     soulève la tête → le cou s'ouvre et la goutte se détache.
    if(neckY>=0){
      const cx=(prLo[Math.floor(neckY*PR_BANDS)]+prHi[Math.floor(neckY*PR_BANDS)])/2;
      for(let i=0;i<P.length;i++){
        const p=P[i];
        const dy=Math.abs(p.y-neckY);
        if(dy<PR_FRAC_TOL){
          p.vx+=(p.x<cx?-1:1)*PR_SNAP*h;
        } else if(p.y>neckY+PR_FRAC_TOL && p.y<0.75){
          p.vy-=PR_SNAP*0.5*h;
        }
      }
    }

    // 6. Viscosité (XSPH) : lissage des vitesses entre voisins - listes de paires reconstruites
    //    à la fin de la relaxation de pression (positions stables depuis), deltas toujours valides
    for(let k=0;k<nPairs;k++){
      const a=P[pairI[k]], b=P[pairJ[k]];
      const r2=pairR2[k];
      if(r2>=h2)continue;
      const w=(1-Math.sqrt(r2)*invH)*VISCOSITY*h;
      a.vx+=w*(b.vx-a.vx); a.vy+=w*(b.vy-a.vy);
      b.vx+=w*(a.vx-b.vx); b.vy+=w*(a.vy-b.vy);
    }

    // 7. Collisions (sol, murs, plafond) - absorbantes + friction au sol
    for(let i=0;i<P.length;i++){
      const p=P[i];
      if(p.x<p.r){p.x=p.r; if(p.vx<0)p.vx=-p.vx*RESTITUTION;}
      if(p.x>aspect-p.r){p.x=aspect-p.r; if(p.vx>0)p.vx=-p.vx*RESTITUTION;}
      if(p.y<p.r){
        p.y=p.r; if(p.vy<0){p.vy=-p.vy*RESTITUTION;}
        p.vx*=GROUND_FRICTION;
      }
      // (plus de couche d'amortissement au sol : la réconciliation PBD gère le flick)
      if(p.y>1-p.r){p.y=1-p.r; if(p.vy>0){p.vy=-p.vy*RESTITUTION;} p.vx*=0.90;}
    }

    // 8. Thermique : PLAQUE au sol qui chauffe vers le chaud, et refroidissement par
    //    RELAXATION vers le froid (proportionnel à T). Ce couplage fond-chaud / sommet-froid
    //    maintient un gradient vertical STABLE : la cire chaude (plus légère) monte,
    //    se densifie en altitude (passe sous la densité de croisement ~0.5) et redescend.
    // Préchauffe progressive au chargement : la plaque monte de 0 → pleine puissance
    // sur WARMUP s (courbe smoothstep) → la lave démarre froide et chauffe petit à petit.
    const ramp=Math.min(1,simTime/WARMUP), heatRamp=ramp*ramp*(3-2*ramp);
    // Positions des spots de chauffe (brûleurs discrets) espacés sur la largeur.
    const burnerX=[];
    for(let b=0;b<BURNERS;b++){burnerX.push((b+1)*aspect/(BURNERS+1));}
    for(let i=0;i<P.length;i++){
      const p=P[i];
      const depth=p.y; // y=0 = le fond (plaque chauffante)
      if(depth<HEAT_THICK){
        // Chauffe par spots : chaque particule chauffe selon sa proximité au brûleur le plus proche
        // (gaussienne étroite). Les zones entre les spots restent froides → le pool est ancré.
        let nearest=1e9;
        for(let b=0;b<BURNERS;b++){const d=Math.abs(p.x-burnerX[b]); if(d<nearest)nearest=d;}
        const spot=Math.exp(-(nearest*nearest)/(0.10*0.10)); // largeur du spot ≈ 10% de la largeur
        p.temp+=HEAT_RATE*(1.0-depth/HEAT_THICK)*4.0*h*heatRamp*spot;
      }
      // Refroidissement par relaxation vers le froid (stable, pas de saignée constante)
      p.temp-=COOL_RATE*p.temp*h;                                     // ambiant partout
      if(p.y>COOL_TOP_Z){p.temp-=COOL_TOP*(p.y-COOL_TOP_Z)*p.temp*h;} // fort en altitude → redensifie la cire montée
      p.temp=clamp(p.temp,0,1);
    }
    // Conduction ANISOTROPE : forte sur l'axe vertical (la colonne au-dessus des spots
    // chauffe et devient légère → monte), faible sur l'axe horizontal (le pool reste froid
    // et ancré). La chaleur monte par conduction dans les colonnes, pas latéralement.
    // La viscosité ne déplace pas les particules : les deltas mémorisés sont encore valides.
    for(let k=0;k<nPairs;k++){
      const a=P[pairI[k]], b=P[pairJ[k]];
      const r2=pairR2[k];
      if(r2>=h2)continue;
      const vert=Math.abs(pairDY[k])/Math.sqrt(r2||1e-12);  // 1 = voisin au-dessus/en-dessous, 0 = latéral
      const transfer=CONDUCT*(1.0+(CONDUCT_VBIAS-1.0)*vert)*(b.temp-a.temp)*h;
      a.temp+=transfer; b.temp-=transfer;
    }
  }

// =====================================================================
  // RENDU 2D PAR SPLAT (perf : coût GPU indépendant du nombre de particules)
  // Pass 1 : les particules sont splattées comme des POINTS gaussiens
  //          dans une texture basse résolution (densité + température)
  // Pass 2 : composite fullscreen O(1) → fond + dégradé thermique + lissage
  // =====================================================================
  function makeProg(vs,fs,names){
    const v=gl.createShader(gl.VERTEX_SHADER);gl.shaderSource(v,vs);gl.compileShader(v);
    if(!gl.getShaderParameter(v,gl.COMPILE_STATUS))throw Error('VS:'+gl.getShaderInfoLog(v));
    const f=gl.createShader(gl.FRAGMENT_SHADER);gl.shaderSource(f,fs);gl.compileShader(f);
    if(!gl.getShaderParameter(f,gl.COMPILE_STATUS))throw Error('FS:'+gl.getShaderInfoLog(f));
    const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('LINK:'+gl.getProgramInfoLog(p));
    const u={};names.forEach(n=>{u[n]=gl.getUniformLocation(p,n);});
    return {p,u};
  }

  // --- Pass 1 : champ de densité (métaballe) : les particules splattent leur densité
  //              + température dans une texture basse résolution ---
  const splatVS=`#version 300 es
    in vec2 aPos; in float aTemp;
    uniform vec2 uRes;          // résolution de la TEXTURE de densité
    uniform float uAspect;      // aspect monde (x ∈ [0,aspect])
    out float vTemp;
    void main(){
      vTemp=aTemp;
      // y=0 (sol) → bas de la texture ; x ∈ [0,aspect] → [0,1]
      vec2 ndc=vec2(aPos.x/uAspect*2.0-1.0, aPos.y*2.0-1.0);
      gl_Position=vec4(ndc,0.0,1.0);
      gl_PointSize=${(SPLAT_WORLD*DENS_H).toFixed(2)};  // diamètre du splat en PIXELS de la texture de
                                // densité : dérivé de SPLAT_WORLD×DENS_H → couverture monde invariante
                                // par la résolution (l'ancien 123 px valait pour une texture de 960 px)
    }`;
  const splatFS=`#version 300 es
    precision highp float;
    in float vTemp;
    out vec4 outColor;
    void main(){
      vec2 uv=gl_PointCoord*2.0-1.0;
      float d=length(uv);
      float w=exp(-d*d*4.0);   // gaussienne large → champ de densité lisse
      w*=0.51;                  // NORMALISATION pour N=620 : le pool dense atteint R≈0.9-1.0
                                // sans saturer → le ratio G/R reste la vraie température
      outColor=vec4(w, w*vTemp, 0.0, 0.0);  // R=densité, G=densité×température (somme pondérée), A=0
                                              // (le canal A est réservé à la température MAX, passe suivante)
    }`;
  // Passe température : splatte la TEMPÉRATURE MAX (blend MAX) dans le canal A - les points
  // chauds des colonnes restent visibles même sous un pool dense.
  const splatTempFS=`#version 300 es
    precision highp float;
    in float vTemp;
    out vec4 outColor;
    void main(){
      vec2 uv=gl_PointCoord*2.0-1.0;
      float d=length(uv);
      float w=exp(-d*d*4.0);
      w*=0.51;                 // même normalisation que la passe densité (N=620)
      outColor=vec4(0.0, 0.0, 0.0, vTemp); // A=température max
    }`;
  const splat=makeProg(splatVS,splatFS,['uRes','uAspect']);
  const splatTemp=makeProg(splatVS,splatTempFS,['uRes','uAspect']);

  // --- Pass 2 : iso-surface (seuil de densité) + fond ---
  const compVS=`#version 300 es
    in vec2 aPos;
    void main(){gl_Position=vec4(aPos,0.0,1.0);}`;
  const compFS=`#version 300 es
    precision highp float;
    uniform vec2 uRes;         // résolution écran
    uniform sampler2D uDens;   // champ de densité
    uniform vec2 uDensSize;    // taille de la texture de densité
    out vec4 outColor;
    vec3 tempToColor(float t){
      t=clamp(t,0.0,1.0);
      // Palette à la CHARTE GRAPHIQUE du site (glacier → cramoisi), ÉTALÉE et SATURÉE pour
      // que chaque variation de température soit clairement visible (pas de blanc précoce,
      // pas de zone grise) :
      // bleu nuit → glacier → teal → pervenche → cramoisi → rose → rose clair (pic)
      // (pas de blanc : il était atteint par 13-35 % de la surface visible, cf. calibration ci-dessous)
      vec3 c0=vec3(0.03,0.07,0.16);   // bleu nuit profond (fond / cire froide)
      vec3 c1=vec3(0.22,0.42,0.62);   // glacier foncé
      vec3 c2=vec3(0.31,0.55,0.72);   // glacier    #4f8db8 (--blue)
      vec3 c3=vec3(0.45,0.74,0.80);   // teal       #74bccb (--cyan)
      vec3 c4=vec3(0.55,0.59,0.74);   // pervenche  #8d97bc (--purple)
      vec3 c5=vec3(0.72,0.20,0.36);   // cramoisi   #b32247 (--crimson) - saturation renforcée
      vec3 c6=vec3(0.88,0.40,0.58);   // rose       #d96d9a (--rose)
      vec3 c7=vec3(0.94,0.62,0.71);   // rose clair (pic) - PAS de blanc : le blanc de la charte
                                      // était atteint par 13-35 % de la surface visible (mesuré)
      // Segment cramoisi/rose élargi : le pool tiède (0.5-0.75) est déjà dans les rouges,
      // les colonnes chaudes (0.75-1.0) passent par rose → blanc rosé.
      if(t<0.12)return mix(c0,c1,t/0.12);
      if(t<0.28)return mix(c1,c2,(t-0.12)/0.16);
      if(t<0.44)return mix(c2,c3,(t-0.28)/0.16);
      if(t<0.58)return mix(c3,c4,(t-0.44)/0.14);
      if(t<0.72)return mix(c4,c5,(t-0.58)/0.14);
      if(t<0.88)return mix(c5,c6,(t-0.72)/0.16);
      return mix(c6,c7,(t-0.88)/0.12);
    }
    void main(){
      vec2 uv=gl_FragCoord.xy/uRes;
      // fond bleu nuit + vignette
      vec2 px=uv*2.0-1.0; px.x*=uRes.x/uRes.y;
      float cd=length(px);
      vec3 bg=mix(vec3(0.012,0.016,0.040),vec3(0.0,0.0,0.010),clamp(uv.y,0.0,1.0));
      bg+=vec3(0.04,0.07,0.12)*(1.0-smoothstep(0.0,0.85,cd))*0.4;
      float vig=1.0-smoothstep(0.35,1.4,cd);
      bg*=mix(0.80,1.0,vig);
      // échantillonnage du champ de densité
      vec4 dtex=texture(uDens, uv);
      float dens=dtex.r;
      float tAvg=dens>1e-4?(dtex.g/dtex.r):0.0;   // moyenne pondérée (corps du pool)
      float tMax=dtex.a;                           // température max (colonnes chaudes)
      // Fusion : corps du pool → moyenne (sa vraie couleur) ; zones peu denses (colonnes,
      // gouttes) → le max ressort (chaud visible même dilué par le splat).
      float blendHot=smoothstep(0.55, 0.18, dens); // 1 quand densité faible (colonnes)
      float t=mix(tAvg, tMax, blendHot);
      // CALIBRATION de l'axe de température (mesurée sur le champ de densité réel, cf. AGENTS.md) :
      // en régime établi la surface visible vit à p50 = 0.70 / p90 = 0.90, et pendant la
      // préchauffe le pool atteint 1.0 sur de grandes surfaces. Recadrage léger (0.98x - 0.03)
      // pour que ce maximum tombe dans le rose clair (et non sur le bord de la palette) :
      // 0.70 -> cramoisi, 0.90 -> rose, 1.00 -> rose clair. Jamais de blanc.
      t=clamp(t*0.98-0.03, 0.0, 1.0);
      // ISO-SURFACE : seuil de densité → forme pleine, bords adoucis
      float iso=0.38;               // seuil de densité - ne garde que les zones denses
      float soft=0.10;              // adoucissement du bord resserré : contour précis
      float surf=smoothstep(iso, iso+soft, dens);
      vec3 col=tempToColor(t);

      // ===== LUMIÈRE 3D (effet liquide) : gradient de densité = normale de surface =====
      // On dérive la densité pour obtenir la normale → lumière d'en haut-gauche (relief).
      // Échelle de dérivation = 2 texels (moins de samples, relief stable, coût réduit). Le relief
      // dépend du pas de dérivation EN UNITÉS MONDE (= 2/DENS_H) : on compense sur la 3e composante
      // de la normale pour retrouver exactement l'ombrage calibré sur DENS_REF.
      vec2 texel=2.0/uDensSize;
      float dL=texture(uDens, uv+vec2(-texel.x,0.0)).r;
      float dR=texture(uDens, uv+vec2( texel.x,0.0)).r;
      float dD=texture(uDens, uv+vec2(0.0,-texel.y)).r;
      float dU=texture(uDens, uv+vec2(0.0, texel.y)).r;
      vec3 nrm=normalize(vec3(dL-dR, dU-dD, ${(1.2*DENS_REF/DENS_H).toFixed(3)}));  // normale approchée
      vec3 lightDir=normalize(vec3(0.45, 0.65, 0.6)); // lumière haut-gauche
      float diff=max(0.0, dot(nrm, lightDir));
      // Speculaire : reflet net sur les zones courbes (gouttes brillantes)
      vec3 viewDir=vec3(0.0, 0.0, 1.0);
      vec3 halfVec=normalize(lightDir+viewDir);
      float spec=pow(max(0.0, dot(nrm, halfVec)), 24.0)*0.55;
      // Rim light : liseré lumineux sur les bords (effet verre/liquide)
      float rim=pow(1.0-max(0.0, dot(nrm, viewDir)), 3.0)*0.35;

      vec3 outCol=bg;
      if(surf>0.0){
        outCol=mix(bg, col, surf);
        // ombrage diffus (relief)
        outCol*=mix(0.82, 1.08, diff);
        // ===== SUBSURFACE SCATTERING : la chaleur interne brille à travers le liquide =====
        // Les zones chaudes éclairent leur voisinage (glow interne rose/cramoisi)
        outCol+=vec3(0.16,0.06,0.10)*t*t*surf;
        // ===== FRESNEL VERRE : les bords deviennent transparents/brillants (effet liquide) =====
        float fres=pow(1.0-max(0.0, dot(nrm, viewDir)), 2.0);
        outCol=mix(outCol, bg*0.4 + vec3(0.5,0.7,0.9)*fres, fres*0.35*surf);
        // reflet spéculaire blanc glacial (charte)
        outCol+=vec3(0.75,0.85,1.0)*spec;
        // rim light bleu glacier
        outCol+=vec3(0.35,0.55,0.80)*rim;
        // lueur chaude interne (transitions de température)
        outCol+=vec3(0.09,0.03,0.06)*surf;
        // éclat au bord du pool (chaud)
        outCol+=col*0.12*surf;
      }
      // ===== OMBRE DE CONTACT : le pool s'assombrit au niveau du sol =====
      // (la matière posée sur la plaque absorbe la lumière, donne de la profondeur)
      float floorShadow=smoothstep(0.03, 0.10, uv.y)*surf*0.25;
      outCol=mix(outCol, outCol*0.72, floorShadow);
      outColor=vec4(outCol,1.0);
    }`;
  const comp=makeProg(compVS,compFS,['uRes','uDens','uDensSize']);

  // --- Rendu métaballe 2 passes : champ de densité (FBO basse résolution) + iso-surface ---
  const fullTri=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,fullTri);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  // VBO points (interleaved x,y,temp)
  const ptVBO=gl.createBuffer();
  const ptArr=new Float32Array(RENDER_MAX*3);
  const splatPosLoc=gl.getAttribLocation(splat.p,'aPos');
  const splatTempLoc=gl.getAttribLocation(splat.p,'aTemp');
  const compPosLoc=gl.getAttribLocation(comp.p,'aPos');

  // FBO + texture de densité (RGBA8 portable ; dimensions déclarées avec les constantes de rendu)
  const densTex=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,densTex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,DENS_W,DENS_H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const densFBO=gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER,densFBO);
  gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,densTex,0);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);

  function render(){
    const n=Math.min(P.length,RENDER_MAX);
    for(let i=0;i<n;i++){
      const p=P[i];
      ptArr[i*3]=p.x; ptArr[i*3+1]=p.y; ptArr[i*3+2]=p.temp;
    }

    // ---- Passe 1a : densité (additive) dans la texture basse résolution ----
    gl.bindFramebuffer(gl.FRAMEBUFFER,densFBO);
    gl.viewport(0,0,DENS_W,DENS_H);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE,gl.ONE);   // accumulation additive
    gl.useProgram(splat.p);
    gl.uniform2f(splat.u.uRes,DENS_W,DENS_H);
    gl.uniform1f(splat.u.uAspect,aspect);
    gl.bindBuffer(gl.ARRAY_BUFFER,ptVBO);
    gl.bufferData(gl.ARRAY_BUFFER,ptArr,gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(splatPosLoc);
    gl.vertexAttribPointer(splatPosLoc,2,gl.FLOAT,false,12,0);
    gl.enableVertexAttribArray(splatTempLoc);
    gl.vertexAttribPointer(splatTempLoc,1,gl.FLOAT,false,12,8);
    gl.drawArrays(gl.POINTS,0,n);

    // ---- Passe 1b : température MAX (blend MAX) - les points chauds restent visibles ----
    gl.blendEquation(gl.MAX);
    gl.blendFunc(gl.ONE,gl.ONE);
    gl.useProgram(splatTemp.p);
    gl.uniform2f(splatTemp.u.uRes,DENS_W,DENS_H);
    gl.uniform1f(splatTemp.u.uAspect,aspect);
    gl.enableVertexAttribArray(splatPosLoc);
    gl.vertexAttribPointer(splatPosLoc,2,gl.FLOAT,false,12,0);
    gl.enableVertexAttribArray(splatTempLoc);
    gl.vertexAttribPointer(splatTempLoc,1,gl.FLOAT,false,12,8);
    gl.drawArrays(gl.POINTS,0,n);
    gl.blendEquation(gl.FUNC_ADD);

    // ---- Passe 2 : iso-surface sur le champ de densité + fond ----
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.disable(gl.BLEND);
    gl.useProgram(comp.p);
    gl.uniform2f(comp.u.uRes,canvas.width,canvas.height);
    gl.uniform2f(comp.u.uDensSize,DENS_W,DENS_H);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,densTex);
    gl.uniform1i(comp.u.uDens,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,fullTri);
    gl.enableVertexAttribArray(compPosLoc);
    gl.vertexAttribPointer(compPosLoc,2,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLES,0,3);

    // restore default blend
    gl.blendEquation(gl.FUNC_ADD);
  }
  function resize(){
    // Dimensions de la BOÎTE CSS du canvas (fixed inset:0 → viewport hors barres de défilement),
    // pas window.innerWidth/innerHeight qui incluent la barre de défilement classique : l'aspect
    // du monde doit correspondre à la boîte réellement affichée.
    W=Math.max(1,document.documentElement.clientWidth);
    H=Math.max(1,document.documentElement.clientHeight);
    const newAspect=clamp(W/H,0.4,3.0);
    if(!P.length){aspect=newAspect;initParticles();}
    else{const k=newAspect/aspect;for(let i=0;i<P.length;i++){P[i].x*=k;P[i].px*=k;}aspect=newAspect;}
    setupGrid();
    // Résolution du canvas : le fond est TOUJOURS flouté par `filter:blur(54px)` côté
    // compositeur (voir style.css) : toute fréquence spatiale plus fine que ~27 px CSS est
    // détruite avant l'écran. Rendre à RENDER_SCALE px CSS par pixel (sans tenir compte du
    // DPR) divise par (DPR/RENDER_SCALE)² le nombre de fragments de la passe composite ET
    // le coût du flou, sans différence visible (mesuré par diff d'images).
    canvas.width=Math.max(1,Math.round(W*RENDER_SCALE));
    canvas.height=Math.max(1,Math.round(H*RENDER_SCALE));
    gl.viewport(0,0,canvas.width,canvas.height);
    render();
  }

  function onScroll(){
    // Plus aucune réallocation du canvas au scroll : changer canvas.width/height force le
    // compositeur à recréer la surface GPU (à-coup) - le rendu reste à la même résolution.
    if(!scrolling){scrolling=true;document.documentElement.classList.add('is-scrolling');}
    clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;document.documentElement.classList.remove('is-scrolling');},180);
  }

  function updateFps(now){
    if(!fpsValue)return;
    fpsFrames++;const elapsed=now-fpsStamp;if(elapsed<500)return;
    const fps=Math.round(fpsFrames*1000/elapsed);
    fpsValue.textContent=String(fps);fpsValue.dataset.level=fps<30?'low':fps<55?'mid':'good';
    fpsFrames=0;fpsStamp=now;
  }

  const FIXED=1/240;
  function frame(now){
    raf=0;
    if(document.hidden||reduced)return;
    const dt=last?Math.min(0.05,(now-last)/1000):FIXED;last=now;
    accumulator+=dt;
    let steps=0;
    while(accumulator>=FIXED&&steps<12){step(FIXED);accumulator-=FIXED;steps++;}
    if(steps===12)accumulator=0;
    render();updateFps(now);
    raf=requestAnimationFrame(frame);
  }

  function stop(){if(raf){cancelAnimationFrame(raf);raf=0;}last=0;}
  function start(){if(!reduced&&!document.hidden&&!raf){last=0;accumulator=0;raf=requestAnimationFrame(frame);}}
  function updateMotion(){
    reduced=motion.matches;stop();
    if(reduced){if(fpsValue)fpsValue.textContent='-';}
    else{fpsFrames=0;fpsStamp=performance.now();start();}
  }

  // Hook de debug (test visuel / fast-forward / mesure) : piloter la sim, figer un état exact
  // (snapshot/restore, y compris les comptages de voisinage) et mesurer le rendu.
  const dbg={step,render,P,neckY:()=>neckY,get aspect(){return aspect;},get N(){return N;},
    get simTime(){return simTime;},set simTime(v){simTime=v;},
    get pairs(){return nPairs;},get canvasPx(){return [canvas.width,canvas.height];},
    snapshot:()=>P.map((p,i)=>({x:p.x,y:p.y,vx:p.vx,vy:p.vy,px:p.px,py:p.py,temp:p.temp,nbC:nbC[i]})),
    restore:s=>{for(let i=0;i<P.length;i++){const d=s[i],p=P[i];
      p.x=d.x;p.y=d.y;p.vx=d.vx;p.vy=d.vy;p.px=d.px;p.py=d.py;p.temp=d.temp;
      nbC[i]=d.nbC;}},
    // debug : expose la texture de densité pour mesurer la saturation
    _densTex:densTex,_densW:DENS_W,_densH:DENS_H,
    // debug : force la reconstruction du voisinage et expose la liste (validation vs force brute)
    rebuild:buildNeighbors,pairList:()=>({i:pairI,j:pairJ,r2:pairR2,n:nPairs})};
  window.__lava=dbg;

  try{
    gl.clearColor(0,0,0,1);resize();render();
    if(reduced&&fpsValue)fpsValue.textContent='-';else start();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();host.classList.add('is-fallback');},{passive:false});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start(),{passive:true});
    addEventListener('resize',resize,{passive:true});
    addEventListener('scroll',onScroll,{passive:true});
    if(motion.addEventListener)motion.addEventListener('change',updateMotion);else if(motion.addListener)motion.addListener(updateMotion);
  }catch(error){console.warn('Fond lampe à lave indisponible',error);host.classList.add('is-fallback');stop();}
})();

/* Les cartes restent volontairement plates : aucun calcul de perspective au survol. */
