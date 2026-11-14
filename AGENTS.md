
# AGENT.md — Portfolio Robin ZMUDA

Ce fichier décrit les **guidelines de travail** que tout agent doit suivre pour toucher à ce projet, et surtout la **vision technique et artistique** de l'animation de fond (la "lampe à lave").

---

## 1. Vue d'ensemble du projet

- Portfolio statique : `index.html` + `style.css` + `script.js`, quelques fichiers annexes (`*.php`, `projects/`).
- Design : esthétique **hacker/terminal**, thème "glacier + cramoisi" (bleu glacier `--blue`, teal `--cyan`, rouge cramoisi `--crimson`), fond noir.
- L'essentiel du travail récent porte sur **l'animation de fond** : une lampe à lave physique (pool de cire au fond → colonnes → bulles → retour au pool).
- Rendu via **WebGL2** dans `<canvas id="lava-canvas">` (conteneur `#lava-bg`).

---

## 2. Guidelines de travail (ce qu'il faut toujours faire)

### 2.1 Exhaustivité et rigueur
- Traiter chaque demande de manière approfondie ; ne pas bâcler.
- Documenter les comportements et réglages courants dans le code (commentaires en français).
- Ne pas laisser de code mort ni de constantes orphelines.

### 2.2 Bug → reproduction avant correction
- Toujours **reproduire un bug** dans les conditions réelles (navigateur, `cdax` headless + screenshots) avant de corriger.
- Vérifier que la correction résout réellement le symptôme, pas seulement en théorie.

### 2.3 Validation visuelle systématique
- **Aucun visual agent** (sous-agent dédié à la lecture de screenshots/images) **sauf demande explicite de l'utilisateur** : ne jamais déléguer la validation visuelle à un visual agent par défaut.
- Le modèle de l'agent ne lit pas les images : utiliser l'outil **image analysis (MiniMax)** sur les screenshots pour valider le rendu (toujours autorisé, ce n'est pas un visual agent).
- **Pour un changement de rendu, préférer un test A/B quantitatif** (plus fort qu'une lecture d'image) : capturer deux screenshots au **même état de particules** (gel + `window.__lava.restore(etat)`), puis comparer les pixels (numpy/PIL) et publier `mean |Δ|`, `max |Δ|` et le % de pixels au-delà d'un seuil. C'est ce qui a validé l'optimisation du fond : max 2/255 à DPR 1 et DPR 2.
- Vérifier par mesure quantitative quand possible (positions/champs via le hook de debug `window.__lava`).

### 2.4 Ne pas sur-ajuster
- Les simulations physiques sont sensibles : **toujours changer une seule variable à la fois**, mesurer, puis ajuster.
- Éviter les extrêmes qui basculent le comportement (tout monte / rien ne monte).

### 2.5 Cache busting
- Toute modification de `script.js` doit incrémenter la **version du cache** dans `index.html` :
  `<script src="./script.js?v=N"></script>`
- On est actuellement à `v=112` (`style.css` : `v=49`).

### 2.6 Outils de validation
- Serveur local : `python3 -m http.server <port>`.
- **Harnais CDP maison (recommandé)** : `node tools/cdp-harness.mjs --url http://localhost:<port>/index.html --w 1440 --h 900 --dpr 1 --wait 3000 --evalfile <script.js> --shot <capture.png> --profile <profil.json> --out <resultat.json>`.
  - Pilote directement `chrome-headless-shell` (aucune dépendance npm) : évaluation JS asynchrone (`--evalfile`), capture d'écran (`--shot`), profil CPU CDP (`--profile`), émulation de média (`--media prefers-reduced-motion=reduce`), viewport/DPR (`--w/--h/--dpr`).
  - Le résultat est renvoyé en JSON sur stdout **et** écrit dans `--out` (utiliser `--out` : stdout est tronqué par l'outil d'appel au-delà de 64 KB).
  - `CHROME_PATH` permet de forcer le binaire ; par défaut il prend le Chromium de Playwright.
  - ⚠️ **`/opt/google/chrome/chrome` est un lien vers `/root/.cache/ms-playwright/...`, illisible** (permissions 700 sur `/root`). Installer un shell accessible : `pip install playwright && playwright install chromium-headless-shell`, puis `CHROME_PATH=~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.
  - Le profil CPU (`--profile`) démarre **après** le `--wait` : il ne couvre que l'exécution du `--evalfile`, pas la phase de chargement.
  - Un `--evalfile` qui commence par une affectation doit la terminer par `;` : sinon l'IIFE suivante est appelée comme une fonction (`[...] is not a function`).
  - **Deux runs indépendants ne rejouent pas le même état** (le pas de temps réel de `frame()` et la boucle de la signature diffèrent). Pour un A/B visuel : exporter `snapshot()` puis `restore()` avant la capture. Contrôle de reproductibilité mesuré (même code deux fois) : `mean 0,03/255` mais `max 219` sur 0,05 % des pixels (bords) → toujours publier `mean` ET `max`.
- **`cdax`** (chrome-devtools-axi) : le lanceur `~/.local/bin/cdax` avait été écrasé (fichier corrompu) — réparé — mais le bridge ne démarre pas Chrome dans cet environnement (`Target closed`). Le harnais ci-dessus le remplace.
- ⚠️ **Pas de GPU** sur cette machine (`/dev/dri/card0` = `vgem`) : le WebGL passe par **SwiftShader** (rendu logiciel). Les FPS absolus ne sont donc **pas représentatifs** ; en revanche les **rapports** de coût (avant/après, variantes) et tous les comptages de travail (fragments, pas de simulation, ms de CPU JS) le sont.
- Hook de debug : `window.__lava` expose `{P, step(h), render(), snapshot(), restore(s), simTime, pairs, canvasPx, rebuild(), pairList(), _densTex}` — pilotage de la sim, gel d'un état exact (test de reproductibilité) et comptage du voisinage.
- Gel d'un état pour un test : `Object.defineProperty(document,'hidden',{get:()=>true})` arrête la boucle `frame()` (elle teste `document.hidden`) ; on pilote alors `step()`/`render()` à la main.

---

## 3. L'animation de fond (la "lampe à lave" physique)

### 3.1 Ce qui est désiré (vision)
Une **vraie mécanique des fluides**, pas une animation pré-calculée. Le comportement cible est celui d'une **vraie lampe à lave** :
1. **Pool compact au fond (le "gros bloc")** : une masse de cire ~15-20 % de l'écran, posée en dôme sur la plaque chauffante.
2. **Chauffage localisé (le brûleur)** : spot gaussien au centre du fond ; la couche basse chauffe, le reste par conduction → gradient vertical (bas chaud, haut dense).
3. **Naissance des colonnes (instabilité de Rayleigh-Taylor)** : le toit chaud du pool s'allège, l'interface devient instable (graine périodique `RT_SEED`/`RT_FREQ`), des **colonnes** s'élèvent.
4. **Pincement en gouttes (Plateau-Rayleigh)** : la colonne s'étire, un **cou** se forme (tranche la plus étroite au-dessus du pool) ; la **fracture** coupe la pression à travers le plan du cou → la colonne **casse en gouttes** rondes.
5. **Montée + température** : les bulles montent d'autant plus vite qu'elles sont grosses (**traînée de Stokes**, v ∝ r²), refroidissent en altitude et se densifient.
6. **Coalescence** : le gros rattrape le petit → **fusion** des bulles au contact (émergente, non programmée).
7. **Retour** : la cire refroidie redevient plus dense que le liquide, redescend et **fusionne au pool** — cycle fermé, en continu, sans seuil d'animation arbitraire.

La **chaleur nulle** doit ramener le système à un **état stable** : la cire figée dans le pool, sans inertie.

Exigences de qualité :
- Surface **lisse et unie** (pas un amas de billes, pas de pics).
- **Aucun glitch / flick** : les particules ne doivent pas "revenir en arrière" brutalement.
- **Rythmé / relaxant** : chauffe nette mais calme, convection lente.
- À **chaleur nulle**, le système doit retomber dans un **état stable** (l'eau figée, sans inertie).

### 3.2 Modèle physique utilisé (SPH)
Méthode **Double Density Relaxation** (Clavet 2005), en 2D, par particules :

- `P[]` = particules `{x,y,vx,vy,px,py,temp,r}`.
- **Pas de temps fixe** : `FIXED=1/240` avec accumulateur et sous-pas (borné à 12) → stabilité, pas de traversée du rayon d'interaction.
- **Double passes de relaxation de pression** (2 passes, 2e passe à demi-intensité) → pas de flick.
- Ordre dans `step()` :
  0. **détection du cou de colonne** (`neckY`) : tranche la plus étroite au-dessus du pool, avec pool dessous + tête dessus ; **verrouillage** `PR_LATCH` pour éviter le clignotement
  1. forces + intégration + dissipation : gravité, **Archimède thermique**, **graine de Rayleigh-Taylor**, **traînée de Stokes** (∝ 1/voisins), rappel plafond
  2. cohésion (tension de surface)
  3. densités (noyau `(1-q)^2` / near `(1-q)^3`) + comptage de voisins (traînée de Stokes)
  4. pression (densité de repos **effective** = f(temp) → expansion thermique)
  5. déplacements de pression (clampés, 2 passes) — **fracture Plateau-Rayleigh** : si un cou existe, les paires de part et d'autre du plan du cou n'interagissent plus (pression + tension coupées → le film casse)
  6. **réconciliation PBD** : `vx=(x-px)/dt` (élimine le flick)
  7. **ouverture active du cou** : poussée latérale des particules du cou (gauche→gauche, droite→droite) + soulèvement de la tête — appliquée APRÈS le PBD pour survivre à la relaxation
  8. viscosité XSPH
  9. collisions (sol/murs absorbants + friction au sol)
  10. thermique (chauffe au fond, refroidissement ambiant + altitude, conduction)

### 3.3 Paramètres clés (constants tunables dans `script.js`)
Ce sont des constantes `const` en haut de la section `initLava`. Ajuster **prudemment** :

| Paramètre | Rôle |
|---|---|
| `FIXED` | pas de temps (1/240) — stabilité |
| `H_SMOOTH` | rayon d'interaction SPH |
| `REST_DENSITY` / `K_PRESSURE` | incompressibilité |
| `K_NEAR` | pression proche (tension) — sur-élevé → pics |
| `VISCOSITY` | lissage des vitesses (XSPH) — laminaire sans étouffer la convection (0.15) |
| `COHESION` / `COH_RANGE` | cohésion (tension de surface) — les blobs restent cohérents et se détachent en gouttes rondes (0.045) |
| `GRAVITY` | gravité (chute + étalement) |
| `BUOYANCY` / `T_CRITICAL` / `THERMAL_NOTEFF` / `THERMAL_BOOST` | Archimède thermique + seuil critique → le chaud monte, le froid descend ; boost **doux** (~0.6) |
| `RT_SEED` / `RT_FREQ` | **graine de Rayleigh-Taylor** : perturbation périodique de l'interface → naissance des colonnes, espacement = 2π/RT_FREQ |
| `DRAG_RATE` / `DRAG_AMB` / `DRAG_NB` | **traînée de Stokes** : un blob compact (nb de voisins élevé) glisse vite, un petit blob traîne → v ∝ taille, le gros rattrape le petit (coalescence) |
| `PR_SNAP` / `PR_BANDS` / `PR_MIN_OCC` / `PR_MAX_NECK` / `PR_FRAC_TOL` / `PR_LATCH` | **fracture de Plateau-Rayleigh** : détection du cou de colonne (tranche étroite avec pool dessous + tête dessus), coupure de la pression à travers le plan du cou + ouverture latérale après PBD + verrouillage anti-clignotement |
| `HEAT_RATE` / `HEAT_THICK` / `CONDUCT` | brûleur **localisé** (spot gaussien au centre) + conduction → gradient vertical (bas chaud, haut dense) |
| `COOL_RATE` / `COOL_TOP` / `COOL_TOP_Z` | refroidissement par **relaxation** vers le froid (ferme le retour) |
| `CEIL_RECALL` / `CEIL_Z` | rappel gravitaire (évite l'accumulation au plafond) |
| `DAMPING` | dissipation globale → état stable à chaleur nulle |
| `RESTITUTION` / `GROUND_FRICTION` | rebond + friction au sol |
| `MAX_FALL` | vitesse terminale max (montée ET descente) — basse → rythme langoureux |
| `GRID_CELL` | côté de cellule de la **grille spatiale** de voisinage (= `COH_R`, portée max d'interaction) — perf CPU, pas de physique |
| `RENDER_SCALE` | canvas = `RENDER_SCALE × taille CSS` (0.7) — les splats se font en pixels de **texture**, donc la résolution du canvas ne change ni la physique ni la forme ; le fond étant flouté 54 px, descendre à 0.5 ne change rien de mesurable |
| `DENS_W`/`DENS_H`/`SPLAT_WORLD` | résolution du champ de densité (768×480) et diamètre de splat en fraction de hauteur monde (0.128) → couverture monde **invariante par la résolution** ; `DENS_REF` (960) recale l'ombrage dérivé |

Règles d'équilibre importantes :
- La poussée au-dessus du seuil doit **dépasser de peu** la gravité pour détacher des bulles sans tout soulever (boost doux).
- Le **brûleur doit être localisé** (spot gaussien étroit) et **HEAT_THICK faible** : si tout le pool chauffe uniformément, toute la masse devient flottante et s'envole en un blob unique (piège « toute la masse s'envole »). Le gradient vertical bas-chaud/haut-dense est ce qui maintient le pool ancré.
- **La fracture de Plateau-Rayleigh doit s'appliquer APRÈS la réconciliation PBD** : toute impulsion de vitesse dans la passe de forces est effacée par la relaxation de pression + PBD. La coupure de pression à travers le plan du cou + l'ouverture post-PBD sont les seules choses qui survivent.
- Un **gradient vertical net** doit se maintenir : plaque → fortement chaud au contact, refroidissement par RELAXATION proportionnel à T en altitude → la cire montée se densifie et redescend. Sans ce retour, tout le bloc monte et l'équilibre donne un **gros bloc figé**.
- Le refroidissement en altitude + le rappel plafond ferment le cycle (monte → refroidit → descend).

### 3.4 Rendu
- **Rendu métaballe 2 passes (2025, redimensionné pour la perf en 2026)** :
  1. **Pass 1a** : les particules splattent leur **champ de densité** (gaussiennes `exp(-d²·4)` × 0.51) dans une **texture 768×480** (FBO RGBA8, accumulation additive `ONE,ONE`) — R = densité, G = densité×température (somme pondérée), A = 0.
  2. **Pass 1b** : **température MAX** (blend `MAX`) dans le canal A — les points chauds des colonnes restent visibles même sous le pool dense (pas de moyenne grise).
  3. **Pass 2** : quad plein écran qui échantillonne le champ et applique une **iso-surface** (`smoothstep(0.38, 0.48, dens)`) → forme pleine à bords adoucis + palette thermique + fond/vignette + lumière 3D (normale dérivée du gradient de densité), Fresnel, subsurface scattering. Température = moyenne pondérée (corps du pool) fusionnée avec le max (colonnes) selon la densité.
- **Normalisation cruciale** : la densité est mise à l'échelle (×0.51) pour que le pool dense atteigne R≈1.0 **sans saturer** — sinon R et G saturent à 1.0 et `G/R` donne 1.0 → blanc partout, couleurs perdues (piège découvert avec le pool pleine largeur à N=480).
- C'est ce qui donne la surface **continue et lisse** (pas de grain de particules) : le seuil de densité fusionne les particules en un volume visqueux.
- **Performance (mesurée, SwiftShader)** — les 3 postes :
  - Le **canvas n'est plus rendu à la résolution écran** : `RENDER_SCALE=0.7` (px CSS par pixel), **indépendamment du DPR**. Le fond est de toute façon flouté par `filter:blur(54px)` côté compositeur : toute fréquence plus fine que ~27 px CSS est détruite avant l'écran. Sur un écran DPR 2 (1512×982 CSS), on passe de 3024×1964 à 1058×687 → **~8× moins de pixels** dans la passe composite ET dans le flou. Sans DPR 2, gain ~2×.
  - Le **champ de densité** est passé de 1536×960 à **768×480** (4× moins de fragments de FBO, de clear et de lecture en compositing) et le **splat** est défini en fraction de hauteur monde (`SPLAT_WORLD=0.128`) : la taille en pixels suit la texture (61.4 px pour 480), donc la couverture monde est identique au réglage historique « 123 px pour 960 ». L'ombrage dérivé (normale = gradient de densité à ±2 texels) est compensé par `DENS_REF` pour retrouver exactement l'éclairage d'avant.
  - Le **pas de simulation** passe des 191 900 paires du double balayage aux **~2 000-2 400 paires réelles** de la liste plate (chaque paire candidate testée une seule fois) : **1,47 → 0,34 ms** par pas (**×4,4**), dont 3 × 0,065 ms de reconstruction du voisinage.
- **Calibration des couleurs de température (2026)** : l'axe brut va jusqu'à la température de plaque (1.0) sur de grandes surfaces. Mesuré en relisant la texture de densité et en refaisant le calcul du shader : en régime établi la surface visible vit à p50 = 0.70 / p90 = 0.90, et pendant la préchauffe (20-60 s) le pool atteint 1.0 presque partout → **13 à 35 % de la surface tombait dans la bande blanche** de la palette ; en plus, R et G saturant à 255, `G/R` valait 1.0 → blanc quelle que soit la température. Correctif : `c7` devient un **rose clair** `(0.94, 0.62, 0.71)` (la charte s'arrête au rose ; seul le reflet spéculaire reste blanc) + recadrage `t = clamp(t*0.98 - 0.03)` → 0.70 cramoisi, 0.90 rose, 1.00 rose clair. Mesuré sur l'image affichée (blur 54 px + `saturate(1.18)` inclus, à état de particules identique) : surface laiteuse (lum > 45 %, sat < 25 %) **28.5 % → 4.1 %**, surface très pâle **15.9 % → 0 %**, saturation moyenne **35.7 % → 42.0 %**, même géométrie. Deux recadrages plus forts (0.94/−0.045 et 0.90/−0.06) suppriment aussi le blanc mais refroidissent le régime établi (42-50 % de pervenche au lieu de 30 %) : rejetés.
- **Anti-aliasing désactivé** sur le contexte WebGL (`antialias:false`) : on ne dessine qu'un triangle plein écran (aucune arête de géométrie) — le MSAA ne coûtait que de la bande passante de résolution.
- **Pas de réallocation du canvas au scroll** : l'ancien code changeait `canvas.width/height` au début et à la fin de chaque défilement (qualité 0.8), ce qui force le compositeur à recréer la surface GPU (à-coup). La classe `html.is-scrolling` reste posée pour mettre le marquee en pause.
- **Palette** (charte graphique glacier/cramoisi, étalée pour voir les variations) : bleu nuit → glacier `--blue` → teal `--cyan` → pervenche `--purple` → cramoisi `--crimson` → rose `--rose` → blanc rosé (pic).
- **Vérification du rendu après optimisation** : captures composites (blur CSS inclus) à état de particules **identique** (`snapshot`/`restore`), DPR 1 et DPR 2, baseline vs optimisé → **écart moyen 0.065/255, max 2/255, 0,000 % des pixels au-delà de 2/255** ; identique en poussant `RENDER_SCALE` à 0.5 (marge de réglage disponible).

### 3.5 Pièges connus (leçons apprises)
- **Le cycle s'effondre en un bloc figé** : si le refroidissement est une simple **soustraction constante** et trop faible, toute la masse se réchauffe à ~0.6-0.7, le gradient thermique s'aplatit et il ne reste qu'un gros bloc immobile au fond (plus de bulles après 2-3 min). **Solution : refroidissement par RELAXATION vers le froid** (`p.temp -= COOL_TOP*(y-Z)*p.temp*h`, proportionnel à T) + chauffe plaque forte (`HEAT_RATE=0.75`) + cohésion modérée (`COHESION=0.045`) + conduction réduite (`CONDUCT=0.06` pour garder le gradient).
- **Flicks / rollback** : un fluide posé garde une vitesse de chute que la relaxation de pression contrarie, d'où des remontées brusques en fin de cycle. **Solution retenue : réconciliation PBD** — recalculer la vitesse à partir du déplacement effectif (`vx=(x-px)/dt`) après la relaxation de pression. Élimine le flick à la source **sans couche d'amortissement au sol** (une telle couche étouffait l'éclaboussure + la convection + empêchait l'eau de descendre).
- **Toute la masse s'envole** : chauffe trop uniforme ou boost thermique trop fort → concentrer la chauffe au fond, équilibrer boost/gravité.
- **Aucune convection / l'eau reste plate en bas** : chauffe trop localisée (`HEAT_THICK` minuscule) + `CONDUCT` trop faible → la chaleur ne monte pas. Épaissir la plaque et augmenter la conduction.
- **Ça colle au plafond** : ajouter rappel gravitaire (`CEIL_RECALL`) + refroidissement en altitude.
- **Surface bosselée / "amas de billes"** : besoin de plus de particules et/ou de rendu lissé (métaballe continue, pas de point séparés).
- **FBO RG16F non supporté** sur certains GPU (Swiftshader) → préférer une approche portable.
- **Pool écrasé en crêpe** : `POOL_WEIGHT` trop élevé aplatit le dôme du pool contre la plaque. Réduire (0.9 sert à tenir la masse froide, pas à l'écraser).
- **Rien ne décolle** : si aucune particule n'atteint ~0.70 (seuil de montée), le pool reste un gros bloc figé — vérifier `HEAT_RATE`/`CONDUCT`/`T_CRITICAL` (dwell trop long) et que le toit du pool reçoit bien la chaleur.
- **Colonnes fusionnées en une seule** : `RT_FREQ` trop petit (λ trop grande) ou `RT_SEED` trop faible → toute l'interface décolle d'un bloc. Espacement des colonnes ≈ 2π/RT_FREQ.
- **Pulvérisation par le pincement (historique)** : un pincement local trop fort (`PR_STRENGTH`, constante supprimée) arrachait les blobs au lieu de pincer le cou des colonnes. Aujourd'hui seule la **fracture macroscopique** est utilisée, et elle reste douce (`PR_SNAP=0.05`).
- **Aucune coalescence visible** : si `COHESION` (positionnelle) est trop faible, deux bulles en contact restent séparées (pression trop raide). La fusion est émergente : elle dépend de `COHESION` + `K_NEAR` + la traînée de Stokes (le gros rattrape le petit).
- **Pool PLEINE LARGEUR : le pool s'envole en bloc** : avec un pool large (~94 % de l'écran), la conduction isotrope réchauffe tout le pool uniformément → toute la masse passe au-dessus du seuil et décolle. **Solution : brûleurs discrets** (`BURNERS=4`) + conduction anisotrope (`CONDUCT_VBIAS`) + refroidissement ambiant modéré (`COOL_RATE=0.008`) + refroidissement au-dessus du pool (`COOL_TOP_Z=0.55`).
- **Pool large : équilibre figé (rien ne monte)** : si la force nette (flottabilité + boost) reste sous la gravité (`GRAVITY=0.40` → la base à temp=1.0 ne peut pas vaincre 0.40), rien ne perce jamais. **Solution : réduire `GRAVITY` (0.34) et augmenter `BUOYANCY` (0.92)** pour que la base chaude monte franchement, le dessus froid redescende.
- **Rendu blanc partout (RGBA8 saturé)** : avec N=480 et un pool dense, R et G saturent à 1.0 → `G/R` = 1.0 → blanc. **Solution : normaliser le splat** (`w*=0.19`, aujourd'hui `0.51` pour N=620) pour que le pool atteigne R≈1.0 sans saturer ; température MAX dans le canal A (passe séparée, blend `MAX`) pour garder les points chauds visibles.
- **Performance — le fond WebGL EST tout le coût** : canvas masqué, la page passe de ~8-14 à 54-60 FPS (SwiftShader) ; le `backdrop-filter` du dock et le `blur(54px)` du canvas sont négligeables à côté. **Toujours mesurer avant d'optimiser** : coût décomposé par variantes (splats seuls = 21 ms, composite seul = 12 ms, texture réduite, splat réduit, canvas réduit).
- **Piège de la « résolution pour la netteté »** : le canvas était rendu en pleine résolution `DPR×1.0` alors que le CSS le floute à **54 px** — payer 8× le prix en pixels pour du détail que le flou détruit ensuite. Un `filter: blur()` sur un canvas plein écran change complètement la résolution optimale de rendu (`RENDER_SCALE`).
- **Piège de la taille de splat en pixels absolus** : `gl_PointSize=123.0` était couplé à une texture de 960 px de haut ; changer la texture sans changer le splat modifie la forme du fluide. Exprimer toute taille en **unités monde** et dériver les pixels (`SPLAT_WORLD×DENS_H`). Même piège pour le pas de dérivation de la normale (±2 texels) : le relief dépend du pas **en unités monde** → compenser (`DENS_REF`).
- **Un voisinage 3×3 couvre 1 cellule, pas 1,41** : avec des cellules de côté C, le rayon *garanti* est C (pire cas : particule au coin de sa cellule). Avec `GRID_CELL = H_SMOOTH` et une cohésion de portée 1,3×H_SMOOTH, des paires manquaient. **Solution : `GRID_CELL = COH_R`** (= portée max), avec une division **entière** dans `setupGrid` pour que la taille réelle de cellule reste ≥ `GRID_CELL`. Vérification : comparer la liste de paires à une force brute sur un état réel (pool initial dense : 2 200 paires ; état chaud : 1 476 → 0 manquante, 0 en trop, 0 doublon).
- **La lave devient laiteuse / blanche** : deux causes cumulées. (1) Le haut de la palette (`c7` blanc rosé) est atteint par **13-35 %** de la surface visible, parce que la cire se met à la température de plaque (1.0) sur une grande aire pendant la préchauffe. (2) Dans la cire la plus chaude, R **et** G saturent à 255 → `G/R` = 1.0 → blanc, indépendamment de la température réelle. **Toujours calibrer la palette sur la distribution MESURÉE** : relire la texture de densité (`_densTex` + FBO temporaire dans un script de test) et refaire exactement le calcul du shader, puis compter les texels par bande ; une palette « étalée » sur [0 ; 1] est fausse si le rendu n'utilise que [0.45 ; 1.0]. Mesurer aussi sur l'IMAGE AFFICHÉE (blur CSS inclus) : la métrique utile est la surface « laiteuse » (lum > 45 % et saturation < 25 %), pas le blanc pur. Côté physique, l'épaisseur de la couche vraiment à 1.0 dépend de `HEAT_THICK` (0.09) — à revoir si la première minute reste trop claire.
- **Le bruit flottant dégénère en chaos** : après l'optimisation du voisinage, l'écart de trajectoire est de 1,7e-6 après 0,5 s (donc équivalence machine) mais atteint l'amplitude du fluide après ~10 s de simulation — c'est le comportement normal d'un système chaotique amorcé par une perturbation de 1e-6. Valider les optimisations de fluide sur les **régimes** (métriques macroscopiques sur 10 min) et **toujours avec un contrôle** : mesuré sur 10 min depuis le même état, base vs optimisé donne `big` 534→491 (−8,0 %), clusters 9→11 (+27,2 %), `poolFrac` 0,373→0,357 ; la **baseline perturbée de 1e-6** donne, elle, 503 (−5,9 %) et 11 (+27,6 %) — écart du même ordre, donc dérive chaotique et non changement de modèle. Sans ce contrôle, un écart de quelques % sur des moyennes chaotiques se lirait à tort comme une régression physique.
- **Les noyaux d'interaction ne sont jamais tronqués par la grille** : `H_SMOOTH=0.042` reste sous la taille de cellule minimale pour tout aspect de 0,4 à 3,0 (la garantie du 3×3 est `min(cw,ch)` avec `cw=aspect/gridW ≥ GRID_CELL`, d'où la division entière dans `setupGrid`), et `GRID_CELL=COH_R` couvre la portée de cohésion. Vérifié par comparaison à une force brute sur des états réels (0 paire manquante, 0 en trop).
- **Une liste de voisins figée en début de pas est fausse** : la relaxation de pression peut rapprocher deux particules de ~0.045 (déplacements clampés à `maxDisp`), bien plus que la marge entre `H_SMOOTH` et `COH_R` (0.0126). `buildNeighbors()` est donc rappelé **après chaque passe** de pression (3 constructions par pas, **0,065 ms chacune** — soit ~20 % du pas) : c'est exactement ce que faisait l'ancienne boucle O(N²), qui retestait toutes les paires à chaque étape. Correction indispensable à l'équivalence, et abordable parce que la liste plate rend la construction très bon marché.
- **Tester une paire 9 fois est du gaspillage** : le balayage 3×3 particule par particule reteste chaque paire jusqu'à 9 fois (et filtre `j > i`). Le **parcours des paires de cellules** (paires internes + demi-voisinage E/SE/S/SO) teste chaque paire une seule fois : **0,143 → 0,065 ms** par reconstruction (×2,2) à ensemble de paires identique, et il supprime la tranche `pairStart` par particule (les boucles itèrent simplement la liste plate).
- **Une liste de voisins figée en début de pas est fausse** : la relaxation de pression peut rapprocher deux particules de ~0.045 (déplacements clampés à `maxDisp`), bien plus que la marge entre `H_SMOOTH` et `COH_R` (0.0126). `buildNeighbors()` est donc rappelé **après chaque passe** de pression (3 constructions par pas) : c'est ce que faisait l'ancienne boucle O(N²), qui retestait toutes les paires à chaque étape. Coût négligeable (voir §3.4), correction indispensable à l'équivalence.

### 3.6 Coût de composition mesuré (2026-11)

Mesures sur `chrome-headless-shell` + **SwiftShader** (la machine de dev n'a pas de GPU), viewport 1440×900 sauf mention. Méthode : gel de la simulation (`document.hidden`), puis période de frame **médiane** en retirant un calque à la fois.

| Élément retiré | Période de frame |
|---|---|
| rien (site complet) | **50 ms** (20 FPS) |
| canvas `#lava-canvas` masqué | **16,7 ms** (= vsync 60 FPS) |
| `filter` du canvas (`blur(54px) saturate(1.18)`) | **16,7 ms** |
| `backdrop-filter` (45 éléments mesurés) | 49,9 ms (négligeable) |
| `will-change` / `transform:translateZ(0)` | 49,9 ms (négligeable) |
| `mix-blend-mode:screen` de `.lava-tint` | 33,4 ms (rejeté, voir plus bas) |
| boîte CSS du canvas à 50 % (`width:50%`) | 33,3 ms |

Conclusions :
- **Le coût est le compositeur, pas le rendu WebGL.** `render()` + `gl.finish()` coûte ~0,01 ms, et une variante `RENDER_SCALE=0.35` + texture 384×240 ne change **rien** à la période de frame. Le coût suit la **surface écran floutée**, pas la résolution de rendu : baisser `RENDER_SCALE` ou `DENS_*` ne soulage pas le scroll (contrairement à ce que laissait croire l'optimisation « résolution de la lave », qui a supprimé du travail GPU réel mais pas le poste dominant).
- Le coût croît avec la surface écran : **50 ms** (1440×900), **67 ms** (1920×1080), **100-117 ms** (2560×1440).
- **CPU JS** : `step()` 0,34-0,43 ms par pas, 4 pas par frame à 60 FPS → ~1,6 ms/frame, soit **~6 % d'un cœur**. Tout le reste du temps est du compositeur (nœud `(program)` du profil, non attribuable au JS).
- **`mix-blend-mode:screen` sur `.lava-tint`** : gagnait 50 → 33 ms en SwiftShader, mais le diff visuel est massif (`mean 4,5/255`, 48 % des pixels > 2/255, `max 218`) et le gain disparaît à 2560×1440 → **rejeté**. À retester sur GPU réel si la marge manque (c'est un coût de relecture plein écran de la destination).
- **Extrapolation petit PC** : sur un GPU intégré, un flou plein écran 1440×900 coûte typiquement 1-2 ms → 60 FPS attendus. Le risque n'existe qu'en **rendu logiciel** (VM sans accélération, pilote absent) : ~20 FPS en 900p, ~10 FPS en 1440p. `prefers-reduced-motion` désactive déjà entièrement la lave.
- **Leviers** si l'on veut de la marge : baisser le rayon de flou (54 → 32 px, quasi invisible puisque tout est déjà flou) ou réduire la boîte CSS du canvas (~70 %, étirée). Changer la résolution de rendu est un faux levier.

---

## 4. Navigation, cartes projets et démos

### 4.1 Scroll-spy du dock (surlignage de la section courante)
- **Règle** : la section courante est celle qui occupe le **bord supérieur** de la fenêtre, avec une tolérance de `SPY_TOL = 12 %` de la hauteur de fenêtre, et deux cas forcés : haut de page → première section, bas de page → dernière section.
- **Pourquoi pas une ligne repère à hauteur fixe ?** L'ancien code utilisait une ligne à **42 % de la fenêtre** avec des `offsetTop` **mis en cache**. Reproduit : sur un écran de 1080 px, « Compétences » (439 px de haut) n'était **jamais** détectée (cliquer sur Compétences surlignait Projets) et « Contact » non plus (la page ne défile plus assez pour amener son haut sous la ligne) ; sur mobile, cliquer « Accueil » surlignait « À propos ».
- **Positions relues à chaque frame** (`getBoundingClientRect`) : plus de cache qui se périme quand la mise en page bouge (polices, images paresseuses, apparitions `.r`). 5 lectures de rect par frame de scroll = négligeable (aucune écriture intercalée, donc pas de layout thrash).
- **Épinglage au clic** : le clic sur le dock active immédiatement la section visée et la garde active 1,5 s (ou jusqu'à un `wheel`/`touchmove`/`keydown`/`mousedown`) — le défilement fluide (`scroll-behavior:smooth`) laisse parfois la position d'arrivée à quelques px du haut de section (micro-décalage de mise en page) et le surlignage restait sur la section précédente.
- **Validation (invariants, 5 viewports : 1440×900, 1920×1080, 2560×1440, 1280×720, 390×844)** : haut de chaque section → cette section surlignée ; bas de page → `contact` ; clic sur chacun des 5 liens → ce lien surligné ; aucun retour en arrière de l'index pendant une descente.

### 4.2 Cartes projets : dépôt GitHub + démo locale
- Les **démos locales** existent dans `projects/` (`Stegosaurus`, `Neuroevolution1`, `OT-EQ`, `dataviz`) et sont servies sous `./projects/<nom>/index.html` ; `repos[].demo` porte le lien (4 projets sur 9).
- La carte n'est **plus un `<a>` englobant** (on ne peut pas imbriquer un `<a>` de démo dedans) : la vignette et le titre portent un `<a class="stretch">` vers GitHub (patron « stretched link » : `::after` en `position:absolute; inset:0`, `z-index:1`) → **toute la carte reste cliquable** ; la ligne `.go` repasse au-dessus (`z-index:2; pointer-events:none`, avec `pointer-events:auto` sur les liens — sinon le blanc de la ligne devient une zone morte) avec « Voir sur GitHub » et « ▶ Démo live ». Vérifié : pas d'ancre imbriquée, le clic sur la vignette atteint le lien GitHub, le clic sur la démo atteint le lien de démo, le clic dans le blanc de la ligne atteint le lien étiré, liens focusables au clavier.
- **Bugs corrigés dans les démos** (liens cassés = pire que pas de lien) :
  - `Neuroevolution1/sketch.js` : ligne résiduelle `jean.manger()` → `ReferenceError` à l'initialisation (supprimée).
  - `dataviz` : les `<script>` sont dans `<head>`, donc `initSelect()` s'exécutait avant que le `<body>` existe (`appendChild of undefined`) → démarrage sur `DOMContentLoaded`. Suppression aussi d'un `<script src="http://labratrevenge.com/…">` **inutilisé** (le `d3-tip` n'est jamais appelé, et un `http://` serait bloqué en contenu mixte sur le site HTTPS).
  - `OT-EQ` dépend du **micro** (Web Speech API) : affiche « You must allow your microphone. » — nécessite HTTPS en production, normal. Le fichier `NotoSans-Regular.ttf` référencé par son CSS est absent (repli de police, non bloquant).
  - Reste : `projects/Neuroevolution1/Paddle.js~` est un fichier de sauvegarde versionné (inoffensif).

### 4.3 Section « Compétences » (domaines) et carte « Vibecoding »
- La grille `.skills-grid` est générée par le tableau `domains` de `script.js` (un objet par domaine : `ico` = SVG inline 24×24, `nm`, `tags`, `ac` = couleur d'accent optionnelle). Les icônes sont en `fill:none;stroke:currentColor` (voir `.ico svg` dans `style.css`) : un nouveau domaine doit suivre ce format, et peut inclure un `<animate attributeName="opacity">` comme les autres.
- **6 domaines** : Langages, Web, Sécurité, Réseau, Jeux, **Vibecoding**. La grille est en `repeat(6,1fr)` (une seule rangée sur grand écran), `repeat(3,1fr)` sous **1180 px** (deux rangées équilibrées : c'est la raison du passage de 5 à 6 domaines, 6 cartes en 5 colonnes laissaient une carte orpheline) et `repeat(2,1fr)` sous 600 px. Contrôlé par mesure : 6/1, 3/2 et 2/3 (colonnes/rangées) sans aucun débordement de carte.
- **Carte « Vibecoding »** = les **technos et les outils** du setup agentique réellement utilisé (vérifiés dans l'environnement, pas des mots-clés marketing) : `pi` (agent de code en terminal, `@earendil-works/pi-coding-agent`) et `opencode` (avec **DeepSeek** comme modèle), des serveurs `MCP` (chrome-devtools-mcp via le wrapper `cdax`, `agent-browser`), **`skills maison`** (l'utilisateur écrit et publie ses propres skills, cf. le projet `doc-torn-skills` ; `chrome-devtools-axi` et `lavish`, eux, sont de Kun Chen et simplement utilisés), `extensions pi` (`keep-model`, `obfuscate-sh`), et ses propres outils CLI `doc-torn-scan` et `rtk` (filtre de sorties CLI avant le contexte du modèle), le tout piloté par des `sub-agents` (pi-subagents : scout, reviewer, worker, oracle, researcher). Config versionnée dans `~/dotfiles/pi/`.
- Pour ajouter/renommer un domaine : modifier le tableau `domains`, ajuster si besoin le nombre de colonnes de `.skills-grid`, puis incrémenter la version de cache de `script.js`.

### 4.4 Données du CV (source externe)
- **Source** : `CV_Robin_Zmuda.pdf` (côté Windows `C:\Users\robin\Downloads\`, vu depuis WSL sous `/mnt/c/Users/robin/Downloads/`). Extraction : `poppler-utils` (installé via apt) avec `pdftotext -layout` — c'est le moyen le plus fidèle (les outils Python de PDF n'étaient pas installés).
- **Méthode** : le CV a servi à **compléter** les données du site, mais les faits vérifiables ont été recoupés plutôt que recopiés : `api.github.com/users/Anhydrite/repos` a confirmé les URL, langages et étoiles des projets (`doc-torn-skills` 4→**6** étoiles, `Ordum` Python, `a-star_with_ascii` Python, `pi-keep-model` TypeScript), et a montré que le projet « réseau de neurones from scratch » (C++) du CV n'a **pas** de dépôt public — il n'a donc pas été ajouté comme carte (la grille projets ne liste que de vrais dépôts).
- **Complété grâce au CV** :
  - Compétences : `C++` (Langages) ; `Symfony`, `CakePHP`, `WordPress`, `PrestaShop` (Web) ; outils d'audit `Burp Suite`, `sqlmap`, `Metasploit`, `Sliver`, `NetExec`, `Nmap`, `Wireshark`, `Scapy` (Sécurité) ; `Cisco`, `Open vSwitch`, `FRRouting`, `OSPF`, `BGP`, `VLAN`, `NAC`, `MPLS`, `Proxmox`, `ESXi`, `OpenNebula`, `Bastion` (Réseau).
  - Formation : **Bac scientifique 2015-2018** (Lycée Maurice Genevoix, Decize) → 3 entrées.
  - Frise : **stage IA SumiRiko 2020** (visualisation de données, prédiction de ventes) → 6 étapes (le pied de la frise a été mis à jour), et sous-titres enrichis (pentest/automatisation Python, web Symfony/WordPress, SQL/SSIS).
  - Terminal : ligne `$ cat langues.txt` → `français · anglais (TOEIC 885) · espagnol (A2)`.
  - Projets : cartes `Ordum` et `a-star_with_ascii` (CV) + `pi-keep-model` (outillage agent).
  - À propos : contributions open source nommées (`pywerview`, `NetExec`, `Pwndoc-ng`).
- **Questions ouvertes à poser à l'utilisateur** (ne pas trancher seul) : l'employeur s'appelle « Knock Knock » sur le CV mais « Haryon » sur le site (renommage ?) ; le téléphone et la ville du CV (`07.67.17.60.00`, Bordeaux) ne sont **pas** affichés sur le site — à confirmer si on les rend publics.

### 4.5 Typographie : pas de tiret cadratin
- **Aucun tiret cadratin (U+2014) dans le site** : ni dans le texte rendu, ni dans les commentaires de `index.html`, `script.js`, `style.css` (vérifié : 0 occurrence ; le contrôle automatisé lit `document.body.innerText` + le titre et compte les occurrences).
- Conventions de remplacement : `·` pour les libellés/listes (« Robin ZMUDA · Développeur Cybersécurité », descriptions de projets, frise), `:` quand le tiret introduisait une explication, `,` pour une incise dans une phrase, `-` (trait d'union entouré d'espaces) dans les commentaires de code.
- Le compteur FPS affiche `-` (et non un tiret cadratin) quand `prefers-reduced-motion` est actif ; le jeu de caractères du `textScramble` des titres n'en contient plus ; le connecteur invisible de la frise git utilise `&nbsp;` (même encombrement, aucun glyphe).
- **Restent en U+2014** : `AGENTS.md` (documentation interne, pas le site) et les bibliothèques tierces minifiées (`projects/Stegosaurus/p5.min.js`). Le **tiret demi-cadratin** (U+2013) est conservé dans les plages de dates (« 2021 – 2025 ») : à confirmer avec l'utilisateur si elles aussi doivent passer au trait d'union.

---

## 5. État actuel & prochaines étapes

- La physique SPH fonctionne (**0 flick**, FPS 60 en temps réel) et simule le cycle complet d'une lampe à lave : **pool compact au fond → dwell de chauffe → colonnes (Rayleigh-Taylor) → pincement/fracture (Plateau-Rayleigh) → bulles qui montent → refroidissement → redescente → fusion au pool**.
- **Modèle validé quantitativement sur 10 min simulées** : pool stable (31-43 % des particules), température soutenue (0.72-0.74), **2-10 clusters, 1-4 blobs détachés** (bulles discrètes), `big` (plus gros cluster) 122-259 → le pool n'est pas la masse entière, des bulles se détachent réellement.
- **Mécanique clé (2025) — fracture de Plateau-Rayleigh** : une colonne qui s'étire forme un **cou** (tranche la plus étroite au-dessus du pool, avec pool dessous + tête dessus, verrouillée `PR_LATCH` pas) ; la **pression est coupée à travers le plan du cou** (les paires de part et d'autre n'interagissent plus) + **ouverture latérale après la réconciliation PBD** → le film casse, la goutte se détache. *Piège découvert* : toute impulsion de vitesse dans la passe de forces est effacée par la relaxation de pression + PBD (comme l'ancienne cohésion, code mort) — seules les coupes d'interaction et les forces post-PBD survivent.
- **Pièges corrigés au fil du dev** : (1) pool trop haut → hors de la zone de chauffe → jamais assez chaud ; (2) chauffage uniforme → toute la masse flotte en un blob (il faut un brûleur localisé + `HEAT_THICK` faible) ; (3) pincement local (brins fins) inopérant car la colonne est épaisse — seule la fracture macroscopique fonctionne ; (4) fausse détection de cou sur le sommet du dôme → exiger une tête au-dessus ; (5) viscosité/cohésion trop fortes → la convection s'arrête (pool chaud figé, rien ne monte) ; (6) le pool liquide s'étale naturellement en flaque au fond (hydrostatique, comme dans une vraie lampe) — ne pas chercher à en faire un dôme.
- **Rendu** : canvas à **`RENDER_SCALE=0.7` × taille CSS** (le fond est flouté 54 px : rendre à la résolution écran était du gaspillage), **champ de densité 768×480**, splat exprimé en **unités monde** (`SPLAT_WORLD×DENS_H` = 61,4 px pour 480), noyau `exp(-d²·4)` × 0.51 (densité normalisée anti-saturation) ; **2 passes splat** : densité additive (R/G) + température MAX (A) pour garder les points chauds visibles ; palette **charte graphique** (glacier → teal → pervenche → cramoisi → rose → blanc rosé) étalée pour voir les variations de température. Détails et mesures en §3.4.
- **Couleurs de la lave (2026)** : palette recalibrée pour ne plus jamais tomber dans le blanc (28.5 % → 4.1 % de surface laiteuse, 15.9 % → 0 % de surface très pâle) — détail et méthode en §3.4.
- **Performance (2026)** : ① pas de simulation **1,47 → 0,34 ms** grâce à la **grille spatiale** (liste plate de paires uniques : ~2 000-2 400 paires réelles au lieu des 191 900 du double balayage, chaque paire candidate testée une seule fois par parcours de paires de cellules) → ~82 ms de CPU par seconde simulée, soit **~6 % d'un cœur à 60 FPS** ; ② rendu mesuré en SwiftShader **33 → 11 ms** (DPR 1) et **87 → 11 ms** (DPR 2) ; ③ le canvas n'est plus réalloué au scroll. **Équivalences vérifiées** : liste de paires identique à la force brute sur le pool initial dense (2 200) et sur un état chaud (1 476) — 0 manquante, 0 en trop, 0 doublon ; trajectoire identique à **1,7e-6** près sur 0,5 s ; **régimes macroscopiques du même ordre sur 10 min simulées** (voir le contrôle de chaos : l'écart base↔optimisé est du même ordre que l'écart entre deux runs de la baseline perturbée à 1e-6) ; **diff visuel composite max 2/255** (0,000 % des pixels au-delà de 2/255, contrôle d'auto-diff = 0) à DPR 1 et DPR 2.
- **Pool PLEINE LARGEUR (2026)** : le pool occupe ~94-98 % de la largeur d'écran (N=620), épaisseur ~0.20 de hauteur. **4 brûleurs discrets** (BURNERS=4) espacés créent des colonnes localisées (Rayleigh-Taylor) pendant que le reste du pool reste froid et ancré → la matière reste au sol. **Préchauffe progressive** (WARMUP=35 s, courbe smoothstep) : la plaque monte de 0 → pleine puissance, visible en couleurs (glacier → cramoisi).
- Données physiques vérifiées en ligne (8 sources) : σ_RT = √(gk(ρ₂−ρ₁)/(ρ₁+ρ₂)), λ_PR ≈ 9R (≈ 4,5×diamètre), Stokes 2/9 Δρgr²/μ (v ∝ r²), Ra_c ≈ 1707,76 (Boussinesq, plaques rigides), pas de seuil de Weber universel pour la coalescence.

Prochaine direction suggérée (si l'utilisateur continue) :
- Valider le rendu et les FPS sur **matériel réel avec GPU** (toutes les mesures d'ici viennent de SwiftShader, sans GPU sur cette machine : les rapports sont fiables, les FPS absolus non).
- Si besoin de marge supplémentaire : `RENDER_SCALE=0.5` et/ou champ de densité 384×240 — mesurés **sans différence visible** (max 2/255) ; le reste du coût GPU est la double passe de splat (620 points × 61,4² px × 2), impossible à fusionner en une passe en WebGL2 (une seule équation de blend par draw, y compris en MRT).
- Coût tiers restant, non traité : Google Tag Manager (~50-100 ms de thread principal) + 2 familles Google Fonts ; Lighthouse/PageSpeed pour chiffrer.
- Peaufiner l'esthétique (contour des gouttes, lueur du brûleur).

