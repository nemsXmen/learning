---
id: javascript-code-splitting-et-lazy-loading
title: "Code splitting et lazy loading"
slug: code-splitting-et-lazy-loading
technology: javascript
level: advanced
module: performance-navigateur
order: 3
estimatedMinutes: 40
difficulty: 4
xp: 100
prerequisites:
  - javascript-reexport
  - javascript-evenements-et-grandes-listes
skills:
  - code-splitting
tags:
  - javascript
  - performance
  - navigateur
  - modules
---

## Objectifs

- Expliquer ce que coûte le JavaScript d'une page : téléchargement, analyse, compilation, exécution.
- Découper une application en morceaux chargés à la demande avec `import()` : par route, par fonctionnalité.
- Précharger au bon moment pour masquer l'attente, et gérer l'échec d'un chargement.
- Différer les images et les iframes hors écran, sans retarder l'image principale de la page.

## Introduction

Une application qui grandit accumule du code : un éditeur de texte riche, une bibliothèque de graphiques, un module
d'export PDF, des pages d'administration. Si tout part dans un seul fichier, chaque visiteur télécharge et exécute
tout cela avant de voir la première page, même s'il ne va jamais dans l'administration.

Le **code splitting** découpe le code en morceaux, les *chunks*, et le **lazy loading** ne charge chaque morceau, ou
chaque image, qu'au moment où il devient utile. Le principe est celui de l'évaluation paresseuse, appliqué au réseau :
ne pas payer pour ce qu'on n'utilise pas encore.

## Concept

| Technique | Ce qu'on charge plus tard | Outil |
| --- | --- | --- |
| découpage par route | le code d'une page, quand on y navigue | `import()` dans la table des routes |
| découpage par fonctionnalité | un composant lourd, à la première utilisation | `import()` au clic ou quand il devient visible |
| préchargement | un morceau probable, avant qu'on le demande | `import()` au survol ou au focus, `<link rel="modulepreload">` |
| images et iframes différées | les médias hors écran | `loading="lazy"` |
| image principale prioritaire | l'inverse : l'image visible au chargement plus tôt | `fetchpriority="high"`, jamais `loading="lazy"` |

Le JavaScript est la ressource la plus chère octet pour octet : une image de 200 Ko est décodée puis affichée, un
script de 200 Ko doit être téléchargé, analysé, compilé puis exécuté, et tout sauf le téléchargement occupe le
fil principal. Sur un téléphone d'entrée de gamme, c'est plusieurs fois plus lent que sur un poste de développement.

## Exemple

Un tableau de bord propose un bouton « Afficher les graphiques ». La bibliothèque de graphiques est lourde, et la
plupart des visiteurs ne cliquent jamais. On la charge à la demande, en commençant dès que le pointeur survole le
bouton ou qu'il reçoit le focus :

```js
let chargement = null;
const chargerGraphiques = () => (chargement ??= import('./graphiques.js'));

// Précharger dès que l'intention se manifeste : le module arrive souvent avant le clic.
for (const type of ['pointerenter', 'focus']) {
  bouton.addEventListener(type, () => chargerGraphiques().catch(() => {}), { once: true });
}

bouton.addEventListener('click', async () => {
  bouton.disabled = true;
  try {
    const { dessiner } = await chargerGraphiques();
    dessiner(zone, donnees);
  } catch {
    afficherErreur("Les graphiques n'ont pas pu être chargés. Rechargez la page pour réessayer.");
  } finally {
    bouton.disabled = false;
  }
});
```

Avec un outil de build comme Vite, Rollup ou webpack, chaque `import()` devient un fichier séparé : le module
`graphiques.js` et ses dépendances sortent du bundle principal et ne sont téléchargés qu'au premier appel. La
promesse est gardée dans `chargement`, comme une mémoïsation : survol, focus et clic partagent un seul
téléchargement.

## Comment ça fonctionne

**Ce qu'`import()` change.** Un `import` statique, en haut d'un fichier, est résolu avant l'exécution du module : le
code importé fait partie du graphe chargé au démarrage. `import()` est une expression, évaluée quand on l'exécute,
qui renvoie une promesse du module. Les outils de build y voient une frontière : tout ce qui n'est accessible que
derrière elle part dans un chunk à part. Un module importé à la fois statiquement ailleurs et dynamiquement ici reste
dans le bundle principal : il faut que **tous** les chemins vers le code lourd soient dynamiques.

**Par route.** Le découpage le plus rentable suit la navigation : chaque page est un chunk, chargé quand on y va.

```js
const pages = {
  '/': () => import('./pages/accueil.js'),
  '/factures': () => import('./pages/factures.js'),
  '/admin': () => import('./pages/admin.js'),
};

async function naviguer(chemin) {
  const charger = pages[chemin] ?? pages['/'];
  const { afficher } = await charger();
  afficher(document.querySelector('main'));
}
```

Les frameworks font la même chose avec `React.lazy`, les routes paresseuses de Vue Router ou le découpage
automatique par page de Next.js. Le code partagé par plusieurs pages part dans des chunks communs, que le navigateur
met en cache une fois.

**Précharger pour masquer l'attente.** Charger à la demande déplace le coût au moment de l'interaction : sans
précaution, le clic attend le réseau. On anticipe dès que l'intention se manifeste : survol, focus, apparition
à l'écran, ou temps libre après le chargement de la page. `<link rel="modulepreload" href="…">` fait télécharger
et analyser un module sans l'exécuter ; les outils de build l'ajoutent pour les dépendances d'un chunk.

**Quand le chargement échoue.** Un réseau instable, ou un déploiement qui remplace les anciens chunks pendant qu'un
utilisateur a encore l'ancienne page ouverte : `import()` rejette sa promesse. Dans Chromium, un échec est retenu
pour la page : un nouvel `import()` de la même URL échoue aussitôt, sans nouvelle requête. La réponse la plus sûre
est donc d'afficher un message et de proposer de recharger la page, qui récupérera la nouvelle version. Vite émet
l'événement `vite:preloadError` sur `window` pour centraliser ce cas.

**Les images et les iframes.** `loading="lazy"` demande au navigateur de ne télécharger une image, ou une iframe,
que lorsqu'elle approche de l'écran. On indique toujours `width` et `height` : le navigateur réserve la place, et la
page ne saute pas quand l'image arrive. Ce saut est mesuré par le **CLS**, *Cumulative Layout Shift*, un autre Core
Web Vital. Mais l'image principale, visible dès l'ouverture, ne doit **jamais** être différée : elle détermine
souvent le **LCP**, *Largest Contentful Paint*, le moment où le plus grand élément s'affiche. On la signale au
contraire comme prioritaire.

```html
<img src="/hero.avif" alt="Atelier de reliure" width="1200" height="600" fetchpriority="high" />

<img src="/galerie/1.avif" alt="Carnet cousu main" width="400" height="300" loading="lazy" />
<iframe src="https://www.youtube-nocookie.com/embed/…" title="Démonstration" loading="lazy"></iframe>
```

**Mesurer ce qui est inutile.** L'onglet Coverage des DevTools montre, pour chaque script, la part du code
exécutée depuis le chargement : une grande part rouge signale du code à différer. Un analyseur de bundle, comme
`rollup-plugin-visualizer` avec Vite, montre ce que contient chaque chunk. On y découvre souvent une bibliothèque
entière importée pour une seule fonction, ou un fichier baril qui réexporte tout, comme on l'a vu avec les modules.

**Ne pas trop découper.** Chaque chunk est une requête, et une chaîne de chunks qui s'importent les uns les autres
crée une cascade d'allers-retours. On découpe aux frontières naturelles, routes et fonctionnalités lourdes, pas
chaque petit module.

## Erreurs fréquentes

**Garder un `import` statique du module qu'on veut différer.** Il reste dans le bundle principal : tous les chemins
doivent être dynamiques.

**Charger au clic sans précharger.** L'utilisateur attend le réseau à chaque première utilisation ; précharge au
survol, au focus ou à l'apparition.

**Ignorer l'échec d'un `import()`.** Après un déploiement, les anciens chunks peuvent disparaître : affiche un
message et propose de recharger.

**Mettre `loading="lazy"` sur l'image principale.** Elle arrive plus tard et dégrade le LCP ; utilise
`fetchpriority="high"`.

**Oublier `width` et `height` sur les images.** La page saute à leur arrivée.

**Découper en dizaines de petits chunks.** Les requêtes en cascade coûtent plus cher que ce qu'elles économisent.

## À retenir

- Le JavaScript coûte en téléchargement, analyse, compilation et exécution, surtout sur mobile.
- `import()` crée une frontière de chunk ; on découpe par route et par fonctionnalité lourde.
- On garde la promesse d'import, et on précharge dès que l'intention se manifeste.
- Un `import()` peut échouer, notamment après un déploiement : message et rechargement.
- `loading="lazy"` avec `width` et `height` pour les médias hors écran ; `fetchpriority="high"` pour l'image
  principale.
- L'onglet Coverage et un analyseur de bundle montrent ce qui doit être différé.

## Exercices

1. Cette application importe toutes ses pages au démarrage. Réécris-la pour que chaque page soit chargée à la
   demande, qu'une page déjà chargée ne soit pas redemandée, et que la page suivante probable soit préchargée au
   survol de son lien.

   ```js
   import * as accueil from './pages/accueil.js';
   import * as factures from './pages/factures.js';
   import * as admin from './pages/admin.js';

   const pages = { '/': accueil, '/factures': factures, '/admin': admin };

   function naviguer(chemin) {
     (pages[chemin] ?? accueil).afficher(document.querySelector('main'));
   }
   ```

   :::indice
   Une table de fonctions `() => import(...)`, et une `Map` qui garde la promesse de chaque page. Les liens peuvent
   porter le chemin dans leur `href`.
   :::

   :::solution
   ```js
   const chargeurs = {
     '/': () => import('./pages/accueil.js'),
     '/factures': () => import('./pages/factures.js'),
     '/admin': () => import('./pages/admin.js'),
   };
   const chargees = new Map();

   function chargerPage(chemin) {
     const cle = chemin in chargeurs ? chemin : '/';
     if (!chargees.has(cle)) chargees.set(cle, chargeurs[cle]());
     return chargees.get(cle);
   }

   async function naviguer(chemin) {
     const page = await chargerPage(chemin);
     page.afficher(document.querySelector('main'));
   }

   document.addEventListener('pointerover', (evenement) => {
     const lien = evenement.target.closest('a[data-page]');
     if (lien) chargerPage(new URL(lien.href).pathname).catch(() => {});
   });
   ```

   La délégation sur `document` précharge au survol de n'importe quel lien marqué `data-page`, y compris ceux
   ajoutés plus tard. Le `catch` vide évite une promesse rejetée non gérée pendant le préchargement : c'est
   `naviguer` qui affichera l'erreur si la page est vraiment demandée.
   :::

2. Corrige ce HTML d'une page produit : l'image principale apparaît tard, et la page saute quand les images de la
   galerie, en bas de page, arrivent.

   ```html
   <img src="/produit.avif" alt="Sac en cuir cognac" loading="lazy" />
   <h1>Sac en cuir cognac</h1>
   <section class="galerie">
     <img src="/galerie/dos.avif" alt="Vue de dos" />
     <img src="/galerie/interieur.avif" alt="Vue de l'intérieur" />
   </section>
   ```

   :::indice
   Deux problèmes pour l'image principale, un pour chaque image de la galerie, et un de plus qui les concerne toutes.
   :::

   :::solution
   ```html
   <img src="/produit.avif" alt="Sac en cuir cognac" width="1200" height="900" fetchpriority="high" />
   <h1>Sac en cuir cognac</h1>
   <section class="galerie">
     <img src="/galerie/dos.avif" alt="Vue de dos" width="600" height="450" loading="lazy" />
     <img src="/galerie/interieur.avif" alt="Vue de l'intérieur" width="600" height="450" loading="lazy" />
   </section>
   ```

   L'image principale, visible à l'ouverture, ne doit pas être différée : on retire `loading="lazy"` et on la
   marque prioritaire, ce qui améliore le LCP. Les images de la galerie, hors écran, sont différées. Toutes reçoivent
   `width` et `height`, dans leurs proportions réelles : le navigateur réserve la place, et la page ne saute plus.
   Le CSS peut toujours les redimensionner avec `max-width: 100%; height: auto`.
   :::

3. Une carte interactive, très lourde, se trouve en bas d'une page de contact. Écris `chargerQuandVisible(element,
   charger)`, qui appelle `charger()` une seule fois quand l'élément approche à moins de 200 px de l'écran, et
   utilise-la pour importer `./carte.js` et appeler son `afficherCarte(element)`.

   :::indice
   Un `IntersectionObserver` avec une `rootMargin`, qui se déconnecte dès le premier déclenchement.
   :::

   :::solution
   ```js
   function chargerQuandVisible(element, charger) {
     const observateur = new IntersectionObserver(
       ([entree]) => {
         if (!entree.isIntersecting) return;
         observateur.disconnect();
         charger();
       },
       { rootMargin: '200px' },
     );
     observateur.observe(element);
     return () => observateur.disconnect();
   }

   const zoneCarte = document.querySelector('#carte');
   chargerQuandVisible(zoneCarte, async () => {
     zoneCarte.setAttribute('aria-busy', 'true');
     try {
       const { afficherCarte } = await import('./carte.js');
       afficherCarte(zoneCarte);
     } catch {
       zoneCarte.textContent = "La carte n'a pas pu être chargée. Rechargez la page pour réessayer.";
     } finally {
       zoneCarte.removeAttribute('aria-busy');
     }
   });
   ```

   Le visiteur qui ne descend jamais en bas de page ne télécharge pas la carte. Celui qui descend la reçoit juste
   avant qu'elle n'apparaisse, grâce à la marge de 200 px. La zone doit avoir une hauteur réservée en CSS, pour que
   l'arrivée de la carte ne fasse pas sauter la page.
   :::

## Questions d'entretien

- Qu'est-ce que le code splitting, et comment le mettre en place ?

  :::indice
  Pense à `import()` et à ce qu'en fait un outil de build.
  :::

  :::reponse
  C'est découper le JavaScript d'une application en plusieurs fichiers chargés à la demande, au lieu d'un seul
  bundle téléchargé et exécuté en entier au démarrage. On le met en place avec `import()` : les outils de build
  comme Vite, Rollup ou webpack créent un chunk pour chaque import dynamique. On découpe d'abord par route, puis les
  fonctionnalités lourdes et rarement utilisées : éditeur, graphiques, export. On veille à ce qu'aucun import
  statique ne ramène le code dans le bundle principal, on précharge au survol ou à l'apparition, et on gère l'échec du
  chargement.
  :::

- Pourquoi ne faut-il pas mettre `loading="lazy"` sur toutes les images ?

  :::indice
  Pense à l'image visible dès l'ouverture, et à la métrique qui la mesure.
  :::

  :::reponse
  `loading="lazy"` retarde le téléchargement jusqu'à ce que le navigateur sache que l'image approche de l'écran, ce
  qui demande la mise en page. Pour l'image principale, visible dès l'ouverture, c'est un retard pur : elle arrive plus
  tard, et le LCP, qui mesure souvent justement cette image, se dégrade. On réserve le chargement différé aux images
  hors écran, et on marque l'image principale avec `fetchpriority="high"`. Dans tous les cas, `width` et `height`
  évitent les sauts de mise en page, mesurés par le CLS.
  :::

- Après un déploiement, des utilisateurs voient des erreurs « Failed to fetch dynamically imported module ».
  Pourquoi, et que faire ?

  :::indice
  Que contient encore la page qu'ils ont ouverte avant le déploiement ?
  :::

  :::reponse
  Leur page, chargée avant le déploiement, référence les anciens chunks, dont les noms contiennent un hachage du
  contenu. Si le serveur ne les sert plus, le premier `import()` d'un chunk encore jamais chargé échoue. Côté
  application, on intercepte l'échec, par exemple avec l'événement `vite:preloadError`, et on propose de recharger la
  page, ou on la recharge automatiquement une seule fois. Côté déploiement, on conserve les anciens chunks pendant une
  période de transition, pour que les sessions ouvertes continuent de fonctionner.
  :::
