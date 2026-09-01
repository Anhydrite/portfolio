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
- Le modèle de l'agent ne lit pas les images : utiliser l'outil **image analysis (MiniMax)** sur les screenshots pour valider le rendu.
- Vérifier par mesure quantitative quand possible (positions/champs via le hook de debug `window.__lava`).

### 2.4 Ne pas sur-ajuster
- Les simulations physiques sont sensibles : **toujours changer une seule variable à la fois**, mesurer, puis ajuster.
- Éviter les extrêmes qui basculent le comportement (tout monte / rien ne monte).

### 2.5 Cache busting
- Toute modification de `script.js` doit incrémenter la **version du cache** dans `index.html` :
  `<script src="./script.js?v=N"></script>`
- On est actuellement à `v=70`.

### 2.6 Outils de validation
- Serveur local : `python3 -m http.server <port>`.
- Navigateur headless : `cdax open http://localhost:<port>/index.html`, puis `cdax eval ...`, `cdax screenshot ...`.
- Bonus invisible : `window.__lava` expose `{P, step(h), render()}` pour piloter la sim en avance rapide et mesurer.

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
  3. densités (noyau `(1-q)^2` / near `(1-q)^3`) + comptage de voisinage directionnel
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

Règles d'équilibre importantes :
- La poussée au-dessus du seuil doit **dépasser de peu** la gravité pour détacher des bulles sans tout soulever (boost doux).
- Le **brûleur doit être localisé** (spot gaussien étroit) et **HEAT_THICK faible** : si tout le pool chauffe uniformément, toute la masse devient flottante et s'envole en un blob unique (piège « toute la masse s'envole »). Le gradient vertical bas-chaud/haut-dense est ce qui maintient le pool ancré.
- **La fracture de Plateau-Rayleigh doit s'appliquer APRÈS la réconciliation PBD** : toute impulsion de vitesse dans la passe de forces est effacée par la relaxation de pression + PBD. La coupure de pression à travers le plan du cou + l'ouverture post-PBD sont les seules choses qui survivent.
- Un **gradient vertical net** doit se maintenir : plaque → fortement chaud au contact, refroidissement par RELAXATION proportionnel à T en altitude → la cire montée se densifie et redescend. Sans ce retour, tout le bloc monte et l'équilibre donne un **gros bloc figé**.
- Le refroidissement en altitude + le rappel plafond ferment le cycle (monte → refroidit → descend).

### 3.4 Rendu
- **Rendu métaballe 2 passes (2025)** :
  1. **Pass 1a** : les particules splattent leur **champ de densité** (gaussiennes `exp(-d²·4)` × 0.19, splat 41px) dans une **texture haute résolution 512×320** (FBO RGBA8, accumulation additive `ONE,ONE`) — R = densité, G = densité×température (somme pondérée), A = 0.
  2. **Pass 1b** : **température MAX** (blend `MAX`) dans le canal A — les points chauds des colonnes restent visibles même sous le pool dense (pas de moyenne grise).
  3. **Pass 2** : quad plein écran qui échantillonne le champ et applique une **iso-surface** (`smoothstep(0.35, 0.70, dens)`) → forme pleine à bords adoucis + palette thermique + fond/vignette. Température = moyenne pondérée (corps du pool) fusionnée avec le max (colonnes) selon la densité.
- **Normalisation cruciale** : la densité est mise à l'échelle (×0.19) pour que le pool dense atteigne R≈1.0 **sans saturer** — sinon R et G saturent à 1.0 et `G/R` donne 1.0 → blanc partout, couleurs perdues (piège découvert avec le pool pleine largeur à N=480).
- C'est ce qui donne la surface **continue et lisse** (pas de grain de particules) : le seuil de densité fusionne les particules en un volume visqueux.
- **Performance** : canvas en résolution `base=0.85` + texture de densité 512×320 ; 60 FPS mesurés.
- **Palette** (charte graphique glacier/cramoisi, étalée pour voir les variations) : bleu nuit → glacier `--blue` → teal `--cyan` → pervenche `--purple` → cramoisi `--crimson` → rose `--rose` → blanc rosé (pic).

### 3.5 Pièges connus (leçons apprises)
- **Le cycle s'effondre en un bloc figé** : si le refroidissement est une simple **soustraction constante** et trop faible, toute la masse se réchauffe à ~0.6-0.7, le gradient thermique s'aplatit et il ne reste qu'un gros bloc immobile au fond (plus de bulles après 2-3 min). **Solution : refroidissement par RELAXATION vers le froid** (`p.temp -= COOL_TOP*(y-Z)*p.temp*h`, proportionnel à T) + chauffe plaque forte (`HEAT_RATE~1`) + cohésion modérée (`COHESION~0.04`) + conduction réduite (`CONDUCT~0.15` pour garder le gradient).
- **Flicks / rollback** : un fluide posé garde une vitesse de chute que la relaxation de pression contrarie, d'où des remontées brusques en fin de cycle. **Solution retenue : réconciliation PBD** — recalculer la vitesse à partir du déplacement effectif (`vx=(x-px)/dt`) après la relaxation de pression. Élimine le flick à la source **sans couche d'amortissement au sol** (une telle couche étouffait l'éclaboussure + la convection + empêchait l'eau de descendre).
- **Toute la masse s'envole** : chauffe trop uniforme ou boost thermique trop fort → concentrer la chauffe au fond, équilibrer boost/gravité.
- **Aucune convection / l'eau reste plate en bas** : chauffe trop localisée (`HEAT_THICK` minuscule) + `CONDUCT` trop faible → la chaleur ne monte pas. Épaissir la plaque et augmenter la conduction.
- **Ça colle au plafond** : ajouter rappel gravitaire (`CEIL_RECALL`) + refroidissement en altitude.
- **Surface bosselée / "amas de billes"** : besoin de plus de particules et/ou de rendu lissé (métaballe continue, pas de point séparés).
- **FBO RG16F non supporté** sur certains GPU (Swiftshader) → préférer une approche portable.
- **Pool écrasé en crêpe** : `POOL_WEIGHT` trop élevé aplatit le dôme du pool contre la plaque. Réduire (0.9 sert à tenir la masse froide, pas à l'écraser).
- **Rien ne décolle** : si aucune particule n'atteint ~0.70 (seuil de montée), le pool reste un gros bloc figé — vérifier `HEAT_RATE`/`CONDUCT`/`T_CRITICAL` (dwell trop long) et que le toit du pool reçoit bien la chaleur.
- **Colonnes fusionnées en une seule** : `RT_FREQ` trop petit (λ trop grande) ou `RT_SEED` trop faible → toute l'interface décolle d'un bloc. Espacement des colonnes ≈ 2π/RT_FREQ.
- **Pulvérisation par le pincement** : `PR_STRENGTH` trop fort arrache les blobs au lieu de pincer le cou des colonnes. Le pincement ne doit s'appliquer qu'aux brins chauds (`temp > THERMAL_NOTEFF`) avec peu de voisins latéraux.
- **Aucune coalescence visible** : si `COHESION` (positionnelle) est trop faible, deux bulles en contact restent séparées (pression trop raide). La fusion est émergente : elle dépend de `COHESION` + `K_NEAR` + la traînée de Stokes (le gros rattrape le petit).
- **Pool PLEINE LARGEUR : le pool s'envole en bloc** : avec un pool large (~94 % de l'écran), la conduction isotrope réchauffe tout le pool uniformément → toute la masse passe au-dessus du seuil et décolle. **Solution : brûleurs discrets** (`BURNERS=4`) + conduction anisotrope (`CONDUCT_VBIAS`) + refroidissement ambiant modéré (`COOL_RATE~0.014`) + refroidissement au-dessus du pool (`COOL_TOP_Z~0.30`).
- **Pool large : équilibre figé (rien ne monte)** : si la force nette (flottabilité + boost) reste sous la gravité (`GRAVITY=0.40` → la base à temp=1.0 ne peut pas vaincre 0.40), rien ne perce jamais. **Solution : réduire `GRAVITY` (0.34) et augmenter `BUOYANCY` (0.85)** pour que la base chaude monte franchement, le dessus froid redescende.
- **Rendu blanc partout (RGBA8 saturé)** : avec N=480 et un pool dense, R et G saturent à 1.0 → `G/R` = 1.0 → blanc. **Solution : normaliser le splat** (`w*=0.19`) pour que le pool atteigne R≈1.0 sans saturer ; température MAX dans le canal A (passe séparée, blend `MAX`) pour garder les points chauds visibles.

---

## 4. État actuel & prochaines étapes

- La physique SPH fonctionne (**0 flick**, FPS 60 en temps réel) et simule le cycle complet d'une lampe à lave : **pool compact au fond → dwell de chauffe → colonnes (Rayleigh-Taylor) → pincement/fracture (Plateau-Rayleigh) → bulles qui montent → refroidissement → redescente → fusion au pool**.
- **Modèle validé quantitativement sur 10 min simulées** : pool stable (31-43 % des particules), température soutenue (0.72-0.74), **2-10 clusters, 1-4 blobs détachés** (bulles discrètes), `big` (plus gros cluster) 122-259 → le pool n'est pas la masse entière, des bulles se détachent réellement.
- **Mécanique clé (2025) — fracture de Plateau-Rayleigh** : une colonne qui s'étire forme un **cou** (tranche la plus étroite au-dessus du pool, avec pool dessous + tête dessus, verrouillée `PR_LATCH` pas) ; la **pression est coupée à travers le plan du cou** (les paires de part et d'autre n'interagissent plus) + **ouverture latérale après la réconciliation PBD** → le film casse, la goutte se détache. *Piège découvert* : toute impulsion de vitesse dans la passe de forces est effacée par la relaxation de pression + PBD (comme l'ancienne cohésion, code mort) — seules les coupes d'interaction et les forces post-PBD survivent.
- **Pièges corrigés au fil du dev** : (1) pool trop haut → hors de la zone de chauffe → jamais assez chaud ; (2) chauffage uniforme → toute la masse flotte en un blob (il faut un brûleur localisé + `HEAT_THICK` faible) ; (3) pincement local (brins fins) inopérant car la colonne est épaisse — seule la fracture macroscopique fonctionne ; (4) fausse détection de cou sur le sommet du dôme → exiger une tête au-dessus ; (5) viscosité/cohésion trop fortes → la convection s'arrête (pool chaud figé, rien ne monte) ; (6) le pool liquide s'étale naturellement en flaque au fond (hydrostatique, comme dans une vraie lampe) — ne pas chercher à en faire un dôme.
- **Rendu** : canvas en **résolution augmentée (base=0.85) + upscale CSS** → les splats gaussiens couvrent plus de pixels → surface continue (masque le grain SPH) ; splats 41px (texture 512×320), noyau `exp(-d²·4)` × 0.19 (densité normalisée anti-saturation) ; **2 passes splat** : densité additive (R/G) + température MAX (A) pour garder les points chauds visibles ; palette **charte graphique** (glacier → teal → pervenche → cramoisi → rose → blanc rosé) étalée pour voir les variations de température.
- **Pool PLEINE LARGEUR (2026)** : le pool occupe ~94-98 % de la largeur d'écran (N=480), épaisseur ~0.20 de hauteur. **4 brûleurs discrets** (BURNERS=4) espacés créent des colonnes localisées (Rayleigh-Taylor) pendant que le reste du pool reste froid et ancré → la matière reste au sol. **Préchauffe progressive** (WARMUP=35 s, courbe smoothstep) : la plaque monte de 0 → pleine puissance, visible en couleurs (glacier → cramoisi).
- Données physiques vérifiées en ligne (8 sources) : σ_RT = √(gk(ρ₂−ρ₁)/(ρ₁+ρ₂)), λ_PR ≈ 9R (≈ 4,5×diamètre), Stokes 2/9 Δρgr²/μ (v ∝ r²), Ra_c ≈ 1707,76 (Boussinesq, plaques rigides), pas de seuil de Weber universel pour la coalescence.

Prochaine direction suggérée (si l'utilisateur continue) :
- Valider le rendu sur **matériel réel** (le test headless tourne en rendu logiciel SwiftShader, FPS non représentatif — 60 fps mesurés ici).
- Peaufiner l'esthétique (contour des gouttes, lueur du brûleur).
