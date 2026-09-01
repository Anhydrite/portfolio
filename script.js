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
    const w=760,h=200;sigCtx.clearRect(0,0,w,h);sigCtx.font='120px '+fam;sigCtx.textBaseline='alphabetic';
    let sz=120,tw=sigCtx.measureText(txt).width;
    while(tw>w-46&&sz>48){sz*=.94;sigCtx.font=sz+'px '+fam;tw=sigCtx.measureText(txt).width;}
    const y=h-36,gap=8;const L=[];
    txt.split('').forEach(c=>L.push({c,x:0,y,wd:sigCtx.measureText(c).width}));
    let x=(w-L.reduce((a,l)=>a+l.wd+gap,0)+gap)/2;
    L.forEach(l=>{l.x=x;x+=l.wd+gap;});
    // Rendu plein (fillText) : lettres pleines et lisses, sans liseré ni cassure
    sigCtx.fillStyle='#ffffff';sigCtx.textAlign='left';
    if(REDUCED_MOTION){L.forEach(l=>sigCtx.fillText(l.c,l.x,l.y));return;}
    // Apparition lettre par lettre avec fondu (chaque lettre est redessinée pendant son fade)
    let li=0,alpha=0;
    (function go(){
      const L2=L[li];
      alpha=Math.min(1,alpha+0.12);
      sigCtx.clearRect(L2.x-6,L2.y-150,L2.wd+16,176);
      sigCtx.globalAlpha=alpha;
      sigCtx.fillText(L2.c,L2.x,L2.y);
      sigCtx.globalAlpha=1;
      if(alpha<1){requestAnimationFrame(go);}
      else{li++;alpha=0;if(li<L.length){requestAnimationFrame(go);}}
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
const projectGrid=document.getElementById('projGrid');
projectGrid.innerHTML=repos.map((p,i)=>`<a class="pcard box r" href="${p.url}" target="_blank" rel="noopener" style="transition-delay:${(i%3)*.08}s"><i class="bracket t"></i><i class="bracket b"></i><span class="thumb"><img loading="lazy" decoding="async" src="${p.img||phImg(p)}" alt=""></span><div class="body"><div class="meta"><span class="ld" style="background:${lc[p.lang]||'var(--muted)'}"></span><span>${p.lang}</span>${p.stars>0?`<span class="star">★ ${p.stars}</span>`:''}</div><h3>${p.name}</h3><p class="desc">${p.desc}</p><div class="go">Voir sur GitHub <span class="arr">→</span></div></div></a>`).join('');
projectGrid.querySelectorAll('img').forEach(img=>{if(img.decode)img.decode().catch(()=>{});});

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

/* ---- Fond lampe à lave : fluide SPH (mécanique des fluides réelle) ---- */
(function initLava(){
  const host=document.getElementById('lava-bg'),canvas=document.getElementById('lava-canvas');
  if(!host||!canvas)return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,depth:false,stencil:false,powerPreference:'high-performance'});
  if(!gl){host.classList.add('is-fallback');return;}

  let reduced=motion.matches,raf=0,last=0,W=0,H=0,DPR=1,scrolling=false,scrollTimer=0,accumulator=0;
  const fpsValue=document.querySelector('#fps-counter strong');
  let fpsFrames=0,fpsStamp=performance.now();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

  // ---------- Paramètres physiques (tunables) ----------
  const MAX=520, N=480;            // capacité max + nb de particules : pool PLEINE LARGEUR (~94 % de l'écran) avec une vraie épaisseur
  const RENDER_MAX=520;            // particules rendues (toutes → surface lisse)
  const H_SMOOTH=0.042;            // rayon d'interaction SPH (unités = hauteur d'écran)
  const REST_DENSITY=1.6;          // densité de repos
  const K_PRESSURE=0.18;           // raideur de pression
  const K_NEAR=0.024;              // raideur de pression proche (tension de surface) — arrondit les gouttes détachées
  const VISCOSITY=0.15;            // viscosité (XSPH) — laminaire mais pas étouffante
  const COHESION=0.045;            // cohésion (tension de surface) — blobs ronds, convection préservée
  const COH_RANGE=1.30;            // portée de la cohésion (× H_SMOOTH)
  const GRAVITY=0.34;              // gravité (unités/s²) — réduite : la base chaude (temp≈1.0) peut vaincre
                                    // la gravité et monter (poussée ~0.6 > 0.34) ; le dessus froid (0.3-0.5)
                                    // reste plus lourd que sa poussée → redescend (matière au sol)
  const BUOYANCY=0.92;             // poussée d'Archimède (unités/s² par écart de température) — forte :
                                    // la base chaude (≈1.0) monte franchement, le dessus froid redescend
  const HEAT_RATE=0.75;            // taux de chauffe de la plaque → la base du pool devient franchement
                                    // chaude (≈0.9-1.0) et perce le seuil pour détacher des colonnes ;
                                    // le reste du pool reste tiède (0.5-0.6) → matière au sol
  const WARMUP=35;                 // durée de PRÉCHAUFFE au chargement (s) : la plaque monte de 0 → pleine puissance (courbe smoothstep)
  const HEAT_ZONE=0.30;            // (réservé) hauteur plafond de la zone de chauffe
  const HEAT_THICK=0.09;           // épaisseur de la plaque chauffante — couche basse épaissie :
                                    // plus de matière est chauffée au sol → plus de colonnes se détachent
                                    // (moins de matière qui reste figée au fond)
  const BURNERS=4;                 // nombre de SPOTS DE CHAUFFE (brûleurs discrets) espacés sur la largeur :
                                    // des colonnes naissent à des points précis, le reste du pool reste froid
                                    // et ancré (matière au sol) — mécanisme Rayleigh-Taylor localisé
  const COOL_RATE=0.008;           // refroidissement ambiant FAIBLE (proportionnel à T) : le pool reste un
                                    // réservoir tiède stable ; la base accumule la chaleur et perce le seuil
                                    // pour détacher des colonnes (la convection, pas le refroidissement, ferme le cycle)
  const COOL_TOP=0.30;             // refroidissement au-dessus du pool (relaxation) → la cire montée
                                    // se densifie et redescend ; le liquide ambiant reste froid (instabilité)
  const COOL_TOP_Z=0.45;           // seuil de hauteur RELEVÉ : le refroidissement n'agit qu'à partir de 0.45 —
                                    // la matière monte haut (colonnes longues) avant de refroidir et redescendre,
                                    // au lieu de retomber juste au-dessus du pool
  const CEIL_RECALL=0.20;          // force de rappel vers le bas au-dessus de CEIL_Z (ferme le cycle) — douce
  const CEIL_Z=0.85;               // altitude au-delà de laquelle le liquide est rabattu — haute :
                                    // la matière peut monter haut avant le rappel
  const CONDUCT=0.06;               // conduction thermique — anisotrope (voir CONDUCT_VBIAS) :
                                    // verticale pour chauffer la colonne au-dessus des spots (elle devient
                                    // légère et monte), horizontale pour diffuser la chaleur dans le pool
  const CONDUCT_VBIAS=3.0;          // BIAIS VERTICAL de conduction (×3 sur l'axe vertical) : la chaleur
                                    // monte dans les colonnes au-dessus des spots (elles deviennent légères et
                                    // montent) ; elle ne s'étale presque pas latéralement (le pool reste froid)
  const T_CRITICAL=0.52;           // seuil critique : au-delà, le liquide s'allège et vole (détachement des colonnes)
  const THERMAL_NOTEFF=0.50;       // expansion : xREST_DENSITY effectif en dessous de ce seuil
  const THERMAL_BOOST=0.55;        // surchauffe locale → détachement serein de bulles (compense la dissipation)
  const RESTITUTION=0.35;          // rebond (sol/murs) — suffisant pour des éclaboussures vivantes
  const DAMPING=0.992;             // amortissement global
  const GROUND_FRICTION=0.96;      // friction au sol
  const MAX_FALL=0.16;             // vitesse terminale — un peu plus haute : les blobs montent/descendent
                                    // plus vite → plus de matière circule, moins de stagnation au sol
  const PART_RADIUS=0.026;         // rayon de rendu d'une particule (lisse)
  // --- Graine de Rayleigh-Taylor : perturbation douce de l'interface (colonnes espacées) ---
  const RT_SEED=0.008;             // amplitude de la graine (décalage latéral) — pool large & bas → colonnes régulières sur toute la largeur
  const RT_FREQ=22.0;              // fréquence spatiale → espacement des colonnes ≈ 2π/RT_FREQ
  // --- Traînée de Stokes : le blob compact glisse, le petit traîne (v ∝ r²) ---
  const DRAG_RATE=0.35;            // traînée de base (s⁻¹)
  const DRAG_AMB=1.5;              // surcroît de traînée quand peu de voisins (petits blobs → lents)
  const DRAG_NB=10;                // voisins de référence
  // --- Plateau-Rayleigh : pincement des brins verticaux fins en gouttes ---
  const PR_LATERAL_MAX=3;          // un "brin" : peu de voisins latéraux
  const PR_VERTICAL_MIN=2;         // mais assez de voisins au-dessus/en dessous
  // Fracture du cou (rupture du film) :
  const PR_SNAP=0.05;              // ouverture latérale du cou après PBD (survit à la relaxation) — douce : les gouttes se détachent lentement, sans éclabousser
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
    // Pool de cire compact posé sur la plaque (le "gros bloc") : dôme ellipsoïdal étroit,
    // comme la masse de cire d'une vraie lampe (~15 % de la largeur de chaque côté).
    // Pool de cire PLEINE LARGEUR : dôme large et bas posé sur la plaque (~94 % de l'écran),
    // assez épais pour garder de la matière au sol. La lave occupe tout l'écran.
    const cx=aspect*0.5, s=0.020, floorY=0.02, topY=0.20, halfW=aspect*0.47;
    P.length=0;
    const rows=Math.ceil((topY-floorY)/(s*0.80));
    for(let row=0;row<rows&&P.length<N;row++){
      const y=floorY+row*s*0.80;
      const dy=(y-floorY)/(topY-floorY);
      const rw=Math.sqrt(Math.max(0,1-dy*dy));
      const off=(row&1)?s*0.5:0;
      const cols=Math.floor((rw*halfW)/s);
      for(let col=-cols;col<=cols&&P.length<N;col++){
        const x=cx+col*s+off;
        if(x>s&&x<aspect-s){
          P.push({x,y,vx:0,vy:0,px:x,py:y,temp:0.18,r:PART_RADIUS}); // cire froide au chargement → la préchauffe est visible
        }
      }
    }
  }

  // ---------- Fluide SPH : double density relaxation (Clavet 2005) ----------
  const density=new Float32Array(N), nearDensity=new Float32Array(N);
  const pressure=new Float32Array(N);
  const dispX=new Float32Array(N), dispY=new Float32Array(N);
  const nbC=new Float32Array(N), nbUp=new Float32Array(N), nbDn=new Float32Array(N);
  const prLo=new Float32Array(32), prHi=new Float32Array(32), prCnt=new Uint16Array(32); // cou de colonne

  function step(h){
    const h2=H_SMOOTH*H_SMOOTH;
    const cohR=H_SMOOTH*COH_RANGE, cohR2=cohR*cohR;

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
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const r2=dx*dx+dy*dy;
        if(r2>=cohR2 || r2<1e-10)continue;
        const r=Math.sqrt(r2);
        const w=1-r/cohR;
        const f=COHESION*w*h;
        const nx=dx/r, ny=dy/r;
        a.vx+=f*nx; a.vy+=f*ny;
        b.vx-=f*nx; b.vy-=f*ny;
      }
    }

    // 3. Densités (noyau (1-q)^2 et (1-q)^3)
    for(let i=0;i<P.length;i++){density[i]=0;nearDensity[i]=0;nbC[i]=0;nbUp[i]=0;nbDn[i]=0;}
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const r2=dx*dx+dy*dy;
        if(r2>=h2)continue;
        const r=Math.sqrt(r2)||1e-6;
        const q=r/H_SMOOTH;
        const aq=1-q, aq2=aq*aq;
        density[i]+=aq2; density[j]+=aq2;
        const aq3=aq2*aq;
        nearDensity[i]+=aq3; nearDensity[j]+=aq3;
        nbC[i]++; nbC[j]++;
        if(b.y>a.y){nbUp[i]++; nbDn[j]++;}
        else{nbDn[i]++; nbUp[j]++;}
      }
    }

    // 4. Pression : densité de repos effective dépend de la température (expansion thermique)
    for(let i=0;i<P.length;i++){
      const pt=P[i].temp;
      const restEff=REST_DENSITY*(pt>THERMAL_NOTEFF?(1.0-(pt-THERMAL_NOTEFF)*0.9):1.0);
      pressure[i]=Math.max(0,K_PRESSURE*(density[i]-restEff));
    }

    // 5. Déplacements de pression (double density relaxation) — 2 passes stables
    const maxDisp=0.015;
    for(let pass=0;pass<2;pass++){
      for(let i=0;i<P.length;i++){dispX[i]=0;dispY[i]=0;}
      for(let i=0;i<P.length;i++){
        for(let j=i+1;j<P.length;j++){
          const a=P[i], b=P[j];
          const dx=b.x-a.x, dy=b.y-a.y;
          const r2=dx*dx+dy*dy;
          if(r2>=h2)continue;
          const r=Math.sqrt(r2)||1e-6;
          const q=r/H_SMOOTH, aq=1-q;
          const nx=dx/r, ny=dy/r;
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
      }
      for(let i=0;i<P.length;i++){
        let dx=dispX[i], dy=dispY[i];
        const m=Math.sqrt(dx*dx+dy*dy);
        const limit=pass===0?maxDisp:maxDisp*0.5;
        if(m>limit){dx=dx/m*limit; dy=dy/m*limit;}
        P[i].x+=dx; P[i].y+=dy;
      }
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

    // 6. Viscosité (XSPH) : lissage des vitesses entre voisins
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const r2=dx*dx+dy*dy;
        if(r2>=h2)continue;
        const r=Math.sqrt(r2)||1e-6;
        const q=r/H_SMOOTH;
        const w=(1-q)*VISCOSITY*h;
        a.vx+=w*(b.vx-a.vx); a.vy+=w*(b.vy-a.vy);
        b.vx+=w*(a.vx-b.vx); b.vy+=w*(a.vy-b.vy);
      }
    }

    // 7. Collisions (sol, murs, plafond) — absorbantes + friction au sol
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
    for(let i=0;i<P.length;i++){
      for(let j=i+1;j<P.length;j++){
        const a=P[i], b=P[j];
        const dx=b.x-a.x, dy=b.y-a.y;
        const r2=dx*dx+dy*dy;
        if(r2>=h2)continue;
        const r=Math.sqrt(r2)||1e-6;
        const vert=Math.abs(dy)/r;                    // 1 = voisin au-dessus/en-dessous, 0 = latéral
        const transfer=CONDUCT*(1.0+(CONDUCT_VBIAS-1.0)*vert)*(b.temp-a.temp)*h;
        a.temp+=transfer; b.temp-=transfer;
      }
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
      gl_PointSize=82.0;        // splat adapté à la texture haute résolution (1024×640) :
                                // même couverture monde qu'avant → bords d'iso-surface nets
    }`;
  const splatFS=`#version 300 es
    precision highp float;
    in float vTemp;
    out vec4 outColor;
    void main(){
      vec2 uv=gl_PointCoord*2.0-1.0;
      float d=length(uv);
      float w=exp(-d*d*4.0);   // gaussienne large → champ de densité lisse
      w*=0.19;                  // NORMALISATION : le pool dense (~15 particules/texel) atteint
                                // R≈0.9-1.0 sans saturer brutalement → le ratio G/R reste la vraie
                                // température (sinon R et G saturent à 1.0 → blanc partout)
      outColor=vec4(w, w*vTemp, 0.0, 0.0);  // R=densité, G=densité×température (somme pondérée), A=0
                                              // (le canal A est réservé à la température MAX, passe suivante)
    }`;
  // Passe température : splatte la TEMPÉRATURE MAX (blend MAX) dans le canal A — les points
  // chauds des colonnes restent visibles même sous un pool dense.
  const splatTempFS=`#version 300 es
    precision highp float;
    in float vTemp;
    out vec4 outColor;
    void main(){
      vec2 uv=gl_PointCoord*2.0-1.0;
      float d=length(uv);
      float w=exp(-d*d*4.0);
      w*=0.19;                 // même normalisation que la passe densité
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
      // bleu nuit → glacier → teal → pervenche → cramoisi → rose → blanc rosé (pic extrême)
      vec3 c0=vec3(0.03,0.07,0.16);   // bleu nuit profond (fond / cire froide)
      vec3 c1=vec3(0.22,0.42,0.62);   // glacier foncé
      vec3 c2=vec3(0.31,0.55,0.72);   // glacier    #4f8db8 (--blue)
      vec3 c3=vec3(0.45,0.74,0.80);   // teal       #74bccb (--cyan)
      vec3 c4=vec3(0.55,0.59,0.74);   // pervenche  #8d97bc (--purple)
      vec3 c5=vec3(0.72,0.20,0.36);   // cramoisi   #b32247 (--crimson) — saturation renforcée
      vec3 c6=vec3(0.88,0.40,0.58);   // rose       #d96d9a (--rose)
      vec3 c7=vec3(1.00,0.86,0.88);   // blanc rosé lumineux (point le plus chaud, rare)
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
      // ISO-SURFACE : seuil de densité → forme pleine, bords adoucis
      // (texture RGBA8 → valeurs normalisées 0-1 ; la densité du pool sature vers 1.0)
      float iso=0.38;               // seuil de densité — légèrement relevé : ne garde que les zones
                                    // denses → silhouettes plus nettes, moins de bordure floue
      float soft=0.10;              // largeur d'adoucissement du bord — resserrée : contour précis
      float surf=smoothstep(iso, iso+soft, dens);
      vec3 col=tempToColor(t);
      // lueur chaude sous la surface (transitions de température)
      vec3 outCol=bg;
      if(surf>0.0){
        outCol=mix(bg, col, surf);
        // léger éclat au bord (ambient)
        outCol+=vec3(0.09,0.03,0.06)*surf;   // lueur rose/cramoisi (charte)
      }
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

  // FBO + texture de densité (basse résolution, RGBA8 portable)
  const DENS_W=1024, DENS_H=640;  // texture de densité TRÈS HAUTE résolution → qualité maximale
                                    // (bords nets, lissage fin, pas de flou d'upscale)
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

    // ---- Passe 1b : température MAX (blend MAX) — les points chauds restent visibles ----
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
    W=Math.max(1,innerWidth);H=Math.max(1,innerHeight);
    DPR=Math.min(devicePixelRatio||1,2.0);
    const newAspect=clamp(W/H,0.4,3.0);
    if(!P.length){aspect=newAspect;initParticles();}
    else{const k=newAspect/aspect;for(let i=0;i<P.length;i++){P[i].x*=k;P[i].px*=k;}aspect=newAspect;}
    // Résolution du canvas : rendu PLEINE RÉSOLUTION (DPR complet, pas d'upscale CSS)
    // → image nette ; la surface reste lisse grâce à l'iso-surface sur la texture fine.
    const base=1.0;                  // qualité maximale : canvas = résolution écran × DPR
    const quality=scrolling?Math.min(0.8,base):base;
    canvas.width=Math.max(1,Math.round(W*DPR*quality));
    canvas.height=Math.max(1,Math.round(H*DPR*quality));
    gl.viewport(0,0,canvas.width,canvas.height);
    render();
  }

  function onScroll(){
    if(!scrolling){scrolling=true;resize();document.documentElement.classList.add('is-scrolling');}
    clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{scrolling=false;document.documentElement.classList.remove('is-scrolling');resize();},180);
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
    if(reduced){if(fpsValue)fpsValue.textContent='—';}
    else{fpsFrames=0;fpsStamp=performance.now();start();}
  }

  // Hook de debug (test visuel / fast-forward)
  window.__lava={step,render,P,neckY:()=>neckY,get aspect(){return aspect;},get N(){return N;},
    // debug : expose la texture de densité pour mesurer la saturation
    _densTex:densTex,_densW:DENS_W,_densH:DENS_H};

  try{
    gl.clearColor(0,0,0,1);resize();render();
    if(reduced&&fpsValue)fpsValue.textContent='—';else start();
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();stop();host.classList.add('is-fallback');},{passive:false});
    document.addEventListener('visibilitychange',()=>document.hidden?stop():start(),{passive:true});
    addEventListener('resize',resize,{passive:true});
    addEventListener('scroll',onScroll,{passive:true});
    if(motion.addEventListener)motion.addEventListener('change',updateMotion);else if(motion.addListener)motion.addListener(updateMotion);
  }catch(error){console.warn('Fond lampe à lave indisponible',error);host.classList.add('is-fallback');stop();}
})();

/* Les cartes restent volontairement plates : aucun calcul de perspective au survol. */
