# AGENT.md — Portfolio Robin ZMUDA

Ce fichier décrit les **guidelines de travail** que tout agent doit suivre pour toucher à ce projet, et surtout la **vision technique et artistique** de l'animation de fond (la "lampe à lave").

---

## 1. Vue d'ensemble du projet

- Portfolio statique : `index.html` + `style.css` + `script.js`, quelques fichiers annexes (`*.php`, `projects/`).
- Design : esthétique **hacker/terminal**, thème "glacier + cramoisi" (bleu glacier `--blue`, teal `--cyan`, rouge cramoisi `--crimson`), fond noir.
- L'essentiel du travail récent porte sur **l'animation de fond** : un fluide qui tombe, éclabousse, chauffe et s'organise en convection.
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
- On est actuellement à `v=37`.

### 2.6 Outils de validation
- Serveur local : `python3 -m http.server <port>`.
- Navigateur headless : `cdax open http://localhost:<port>/index.html`, puis `cdax eval ...`, `cdax screenshot ...`.
- Bonus invisible : `window.__lava` expose `{P, step(h), render()}` pour piloter la sim en avance rapide et mesurer.

---

## 3. L'animation de fond (la "lampe à lave" physique)

### 3.1 Ce qui est désiré (vision)
Une **vraie mécanique des fluides**, pas une animation pré-calculée :
1. **Chute** : une boule de liquide tombe depuis le haut sous gravité réelle.
2. **Splash** : à l'impact avec le sol, l'eau s'éclabousse (effet du choc), puis se **stabilise** en une flaque au repos quand la chaleur est nulle.
3. **Chauffage concentré au fond** : l'eau a une **épaisseur** — seule la couche **en contact avec le fond (le brûleur)** chauffe fort, le reste chauffe par **conduction**.
4. **Convection** : l'eau profonde surchauffe, atteint un **seuil critique**, devient **moins dense** (expansion thermique), remonte à la surface, **se détache en bulles** individuelles, refroidit en altitude puis redescend — en continu, sans seuil d'animation arbitraire.

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
  1. forces (gravité + poussée d'Archimède + rappel plafond) + intégration + dissipation
  2. cohésion (tension de surface)
  3. densités (noyau `(1-q)^2` / near `(1-q)^3`)
  4. pression (densité de repos **effective** = f(temp) → expansion thermique)
  5. déplacements de pression (clampés, 2 passes)
  6. viscosité XSPH
  7. collisions (sol/murs absorbants + friction au sol)
  8. thermique (chauffe au fond, refroidissement ambiant + altitude, conduction)

### 3.3 Paramètres clés (constants tunables dans `script.js`)
Ce sont des constantes `const` en haut de la section `initLava`. Ajuster **prudemment** :

| Paramètre | Rôle |
|---|---|
| `FIXED` | pas de temps (1/240) — stabilité |
| `H_SMOOTH` | rayon d'interaction SPH |
| `REST_DENSITY` / `K_PRESSURE` | incompressibilité |
| `K_NEAR` | pression proche (tension) — sur-élevé → pics |
| `VISCOSITY` | lissage des vitesses (surface plane) |
| `COHESION` / `COH_RANGE` | formation de gouttes / blobs |
| `GRAVITY` | gravité (chute + étalement) |
| `BUOYANCY` / `T_CRITICAL` / `THERMAL_BOOST` | convection + seuil critique → blobs qui volent |
| `HEAT_RATE` / `COOL_RATE` / `COOL_TOP` / `CONDUCT` | cycle thermique (chauffe au fond, refroidissement) |
| `CEIL_RECALL` / `CEIL_Z` | rappel gravitaire (évite l'accumulation au plafond) |
| `DAMPING` | dissipation globale → état stable à chaleur nulle |
| `RESTITUTION` / `GROUND_FRICTION` | rebond + friction (splash à l'impact) |

Règles d'équilibre importantes :
- La poussée au-dessus du seuil doit **dépasser de peu** la gravité pour détacher des bulles sans tout soulever.
- La chauffe doit **pénétrer dans la masse** (`HEAT_THICK` assez épais + `CONDUCT` fort) sinon seules les particules du fond chauffent → pas de convection, pas de bulles.
- Le refroidissement en altitude + le rappel plafond ferment le cycle (monte → refroidit → descend).

### 3.4 Rendu
- Passage actuel : **rendu 2D par splat de points** WebGL (en cours d'optimisation pour les performances), avec un fond dégradé profond + dégradé thermique (froid = bleu → violet → rouge → orange = chaud).
- **Performance** : le rendu doit rester léger (coût indépendant du nombre de particules si possible). Objectif : fluide en 2D, surface lisse, à coût GPU faible.
- Le canvas (`#lava-canvas`) est étiré par CSS `width:100%`.

### 3.5 Pièges connus (leçons apprises)
- **Flicks / rollback** : un fluide posé garde une vitesse de chute que la relaxation de pression contrarie, d'où des remontées brusques en fin de cycle. **Solution retenue : réconciliation PBD** — recalculer la vitesse à partir du déplacement effectif (`vx=(x-px)/dt`) après la relaxation de pression. Élimine le flick à la source **sans couche d'amortissement au sol** (une telle couche étouffait l'éclaboussure + la convection + empêchait l'eau de descendre).
- **Toute la masse s'envole** : chauffe trop uniforme ou boost thermique trop fort → concentrer la chauffe au fond, équilibrer boost/gravité.
- **Aucune convection / l'eau reste plate en bas** : chauffe trop localisée (`HEAT_THICK` minuscule) + `CONDUCT` trop faible → la chaleur ne monte pas. Épaissir la plaque et augmenter la conduction.
- **Ça colle au plafond** : ajouter rappel gravitaire (`CEIL_RECALL`) + refroidissement en altitude.
- **Surface bosselée / "amas de billes"** : besoin de plus de particules et/ou de rendu lissé (métaballe continue, pas de point séparés).
- **FBO RG16F non supporté** sur certains GPU (Swiftshader) → préférer une approche portable.

---

## 4. État actuel & prochaines étapes

- La physique SPH (chute → splash → chauffe au fond → convection → blobs) fonctionne et a été validée visuellement et quantitativement. **0 flick** mesuré.
- Actuellement en train de **repasser le rendu en 2D** pour la performance. Le rendu par splat de points est opérationnel mais encore à finaliser pour une **surface lisse et unie** (le look "voxel/blocs" reste à corriger).

Prochaine direction suggérée (si l'utilisateur continue) :
- Rendre le fluide **lisse et continu** en 2D (métaballe via agrégats ou splat à gaussiennes larges + seuil).
- Réduire la résolution canvas + upscale CSS pour masquer les grains.
- Valider le FPS réel sur matériel (le test headless tourne en rendu logiciel lent, FPS bas non représentatif).
