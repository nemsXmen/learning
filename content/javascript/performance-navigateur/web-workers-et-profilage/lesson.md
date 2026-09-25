---
id: javascript-web-workers-et-profilage
title: "Web Workers et profilage des performances"
slug: web-workers-et-profilage
technology: javascript
level: advanced
module: performance-navigateur
order: 4
estimatedMinutes: 50
difficulty: 5
xp: 120
prerequisites:
  - javascript-pipeline-de-rendu
  - javascript-debug-reseau
  - javascript-evenements-et-grandes-listes
skills:
  - web-workers-profiling
tags:
  - javascript
  - performance
  - navigateur
  - workers
---

## Objectifs

- Repérer les tâches longues, qui bloquent le fil principal plus de 50 ms.
- Découper un long traitement en morceaux qui cèdent la main au navigateur.
- Déplacer un calcul lourd dans un Web Worker : messages, clonage, transfert, erreurs.
- Mener un profilage méthodique : reproduire, enregistrer, lire, corriger, mesurer de nouveau.
- Distinguer mesures de laboratoire et mesures de terrain, et surveiller les Core Web Vitals.

## Introduction

Le JavaScript d'une page s'exécute sur un seul fil, le **fil principal**, qui gère aussi les événements, la mise en
page et la peinture. Tant qu'une fonction s'exécute, rien d'autre ne se passe : un clic attend, une animation se fige.
Les chapitres précédents ont réduit le travail. Il reste le travail qui est vraiment nécessaire, mais trop long :
trier des centaines de milliers de lignes, analyser un gros fichier, calculer des statistiques.

Deux réponses existent : **découper** ce travail pour laisser le navigateur respirer entre deux morceaux, ou le
**déplacer** sur un autre fil avec un Web Worker. Et pour savoir où agir, une seule méthode fiable : **profiler**.

## Concept

**Tâche longue.** Toute tâche qui occupe le fil principal plus de **50 ms**. Pendant ce temps, la page ne peut
répondre à aucune interaction.

| Travail long | Réponse |
| --- | --- |
| une boucle sur beaucoup d'éléments, qui touche au DOM | la découper en morceaux et céder la main entre eux |
| un calcul pur sur beaucoup de données : tri, analyse, compression, statistiques | un Web Worker |
| un travail lié au réseau | rien : `fetch` ne bloque pas le fil principal ; c'est le traitement de la réponse qui peut le faire |

| Web Worker | |
| --- | --- |
| création | `new Worker(new URL('./calcul.worker.js', import.meta.url), { type: 'module' })` |
| communication | `postMessage(donnees)` dans un sens, événement `message` dans l'autre |
| données envoyées | copiées par *structured clone* : objets, tableaux, `Map`, `Date`, tableaux typés… mais ni fonctions ni nœuds du DOM |
| transfert | `postMessage(donnees, [buffer])` : l'`ArrayBuffer` change de propriétaire sans copie |
| accès | pas de DOM, pas de `window` ; `fetch`, minuteurs, IndexedDB et `import` disponibles |
| arrêt | `worker.terminate()` depuis la page |

## Exemple

On calcule la moyenne, la médiane et le 95ᵉ centile de trois millions de temps de réponse. Le worker vit dans son
propre fichier :

```js
// statistiques.worker.js : s'exécute dans un fil séparé, sans accès au DOM.
function statistiques(valeurs) {
  const triees = valeurs.toSorted(); // un Float64Array se trie numériquement
  const rang = (p) => triees[Math.min(triees.length - 1, Math.floor(p * triees.length))];
  let somme = 0;
  for (const v of triees) somme += v;
  return { moyenne: somme / triees.length, mediane: rang(0.5), p95: rang(0.95) };
}

self.addEventListener('message', ({ data: { id, valeurs } }) => {
  try {
    self.postMessage({ id, resultat: statistiques(valeurs) });
  } catch (erreur) {
    self.postMessage({ id, erreur: erreur.message });
  }
});
```

Côté page, on enveloppe les messages dans des promesses, en associant chaque réponse à sa demande par un identifiant :

```js
function creerClientWorker(url) {
  const worker = new Worker(url, { type: 'module' });
  const enAttente = new Map();
  let prochainId = 0;

  worker.addEventListener('message', ({ data: { id, resultat, erreur } }) => {
    const { resoudre, rejeter } = enAttente.get(id);
    enAttente.delete(id);
    if (erreur === undefined) resoudre(resultat);
    else rejeter(new Error(erreur));
  });

  return {
    appeler(message, transfert = []) {
      const id = prochainId++;
      return new Promise((resoudre, rejeter) => {
        enAttente.set(id, { resoudre, rejeter });
        try {
          worker.postMessage({ id, ...message }, transfert);
        } catch (erreur) {
          enAttente.delete(id); // message impossible à cloner : DataCloneError
          rejeter(erreur);
        }
      });
    },
    terminer: () => worker.terminate(),
  };
}

const statistiques = creerClientWorker(new URL('./statistiques.worker.js', import.meta.url));

const valeurs = new Float64Array(3_000_000);
for (let i = 0; i < valeurs.length; i++) valeurs[i] = Math.random() * 1000;

const { mediane, p95 } = await statistiques.appeler({ valeurs }, [valeurs.buffer]);
console.log(mediane.toFixed(0), p95.toFixed(0)); // environ 500 et 950
console.log(valeurs.length); // 0 : le tampon a été transféré au worker
```

Mesuré dans Chromium : sur le fil principal, ce calcul prend environ 1,3 seconde, pendant laquelle **aucune** image
n'est affichée. Dans le worker, il prend un peu plus longtemps, démarrage du worker compris, mais la page continue
d'afficher ses images et de répondre : plus de 70 images pendant le calcul.

## Comment ça fonctionne

**Un worker ne rend pas le calcul plus rapide.** Il le fait ailleurs. Le coût total augmente même un peu : démarrer
le worker, charger son module, copier ou transférer les données. Ce qu'on gagne, c'est un fil principal libre. Un
worker se justifie donc pour un calcul de plusieurs dizaines de millisecondes au moins, pas pour quelques
opérations.

**Clonage et transfert.** `postMessage` copie les données avec l'algorithme de *structured clone* : les objets, les
tableaux, les `Map`, les `Set`, les dates et les tableaux typés passent, mais les fonctions, les nœuds du DOM et
les instances perdent ce qui ne se clone pas. Une fonction ou un nœud déclenche une `DataCloneError`, que notre
client transforme en promesse rejetée. Copier un grand tableau coûte du temps et de la mémoire : pour les données
binaires, on **transfère** l'`ArrayBuffer` en le citant dans le second argument. Le transfert est quasi instantané,
mais l'objet devient inutilisable côté expéditeur : sa taille tombe à zéro. On renvoie le résultat de la même façon,
dans l'autre sens.

**Les erreurs.** Une exception dans le gestionnaire de messages du worker ne remonte pas toute seule jusqu'à la
promesse de la page : elle déclenche l'événement `error` du worker. D'où le `try...catch` du worker, qui renvoie un
message d'erreur associé au bon identifiant. En production, on écoute aussi `error` et `messageerror` côté page, et
une bibliothèque comme Comlink peut cacher tout ce protocole derrière de simples appels de fonctions.

**Découper au lieu de déplacer.** Un traitement qui doit toucher au DOM ne peut pas aller dans un worker. On le
découpe : on traite des éléments tant qu'un budget de quelques millisecondes n'est pas dépassé, puis on cède la main.

```js
function cederLaMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resoudre) => setTimeout(resoudre, 0));
}

async function traiterParMorceaux(elements, traiter, budget = 10) {
  let debut = performance.now();
  for (const element of elements) {
    traiter(element);
    if (performance.now() - debut > budget) {
      await cederLaMain(); // le navigateur traite les interactions en attente
      debut = performance.now();
    }
  }
}
```

Le travail total dure un peu plus longtemps, mais plus aucune tâche ne dépasse 50 ms : mesuré dans Chromium sur trois
millions d'éléments, le traitement d'un bloc produisait une tâche de près d'une demi-seconde ; découpé, aucune tâche
longue n'est plus signalée. `scheduler.yield()`, disponible dans Chromium, reprend la suite en priorité après avoir
cédé la main, là où `setTimeout` la remet en fin de file.

**Profiler avec méthode.** On ne devine pas une cause de lenteur, on la mesure.

1. **Reproduire** le problème sur un scénario précis, par exemple « filtrer la liste des factures ».
2. **Enregistrer** avec l'onglet Performance des DevTools, en activant le ralentissement du processeur, 4× ou 6×,
   pour se rapprocher d'un téléphone moyen.
3. **Lire** l'enregistrement : les tâches longues sont marquées d'un triangle rouge ; le *flame chart* montre quelles
   fonctions s'appellent et combien de temps chacune prend ; la vue *Bottom-Up*, triée par *Self time*, désigne les
   fonctions qui consomment le plus par elles-mêmes. Les blocs violets sont de la mise en page, les verts de la
   peinture.
4. **Corriger** la cause la plus coûteuse, une seule à la fois.
5. **Mesurer de nouveau**, dans les mêmes conditions, pour vérifier le gain.

**Mesurer dans le code.** `performance.mark` et `performance.measure`, vus dans la partie sur le débogage, balisent
un scénario et apparaissent dans l'onglet Performance. Un `PerformanceObserver` signale les tâches longues pendant
que l'application tourne :

```js
new PerformanceObserver((liste) => {
  for (const tache of liste.getEntries()) {
    console.warn(`Tâche longue : ${Math.round(tache.duration)} ms`);
  }
}).observe({ type: 'longtask', buffered: true });
```

Chromium propose aussi `long-animation-frame`, plus précis, qui indique les scripts responsables d'une image en
retard.

**Laboratoire et terrain.** Une mesure sur votre poste, ou un audit Lighthouse, est une mesure de **laboratoire** :
reproductible, mais sur une seule machine et un seul réseau. Les utilisateurs réels ont des téléphones lents, des
réseaux instables et des données plus volumineuses. Les mesures de **terrain** les capturent : la bibliothèque
`web-vitals` mesure le LCP, l'INP et le CLS dans le navigateur de chaque visiteur, et on les envoie à un service de
suivi. On s'intéresse au 75ᵉ centile, pas à la moyenne : c'est l'expérience des utilisateurs les moins bien lotis
qui fait la réputation d'une application.

## Erreurs fréquentes

**Déplacer un petit calcul dans un worker.** Démarrage et copie coûtent plus cher que le gain ; réserve les workers
aux calculs de plusieurs dizaines de millisecondes.

**Envoyer une fonction ou un nœud du DOM au worker.** Ils ne se clonent pas : `DataCloneError`.

**Copier un gros tableau binaire au lieu de le transférer.** Cite son `ArrayBuffer` dans la liste de transfert, et ne
le réutilise plus ensuite.

**Laisser une erreur du worker sans réponse.** La promesse de la page reste en attente pour toujours ; renvoie une
erreur associée à l'identifiant.

**Profiler sans ralentir le processeur.** Un poste de développement cache les problèmes que vivent les téléphones.

**Optimiser au jugé.** Enregistre, lis le *Bottom-Up*, corrige une cause, mesure de nouveau.

## À retenir

- Une tâche longue dépasse 50 ms et bloque toutes les interactions.
- Découper et céder la main pour le travail qui touche au DOM ; un worker pour les calculs purs et lourds.
- Un worker libère le fil principal, il ne rend pas le calcul plus rapide.
- `postMessage` clone les données ; on transfère les `ArrayBuffer` volumineux ; fonctions et DOM ne passent pas.
- Profiler : reproduire, enregistrer avec ralentissement, lire le *Bottom-Up*, corriger, mesurer de nouveau.
- Laboratoire pour diagnostiquer, terrain (`web-vitals`, 75ᵉ centile) pour savoir ce que vivent les utilisateurs.

## Exercices

1. Écris un worker `recherche.worker.js` qui reçoit une fois une liste de produits, puis répond à des recherches
   textuelles, insensibles à la casse et aux accents, en renvoyant les 20 premiers résultats. Le protocole :
   `{ type: 'charger', produits }`, puis `{ type: 'chercher', id, texte }`, avec une réponse `{ id, resultats }`.

   :::indice
   Normalise une fois les noms au chargement avec `normalize('NFD')` et une expression qui retire les diacritiques.
   Garde l'index dans une variable du module du worker.
   :::

   :::solution
   ```js
   // recherche.worker.js
   const normaliser = (texte) =>
     texte
       .normalize('NFD')
       .replace(/\p{Diacritic}/gu, '')
       .toLowerCase();

   let index = [];

   self.addEventListener('message', ({ data }) => {
     if (data.type === 'charger') {
       index = data.produits.map((produit) => ({ produit, cle: normaliser(produit.nom) }));
       return;
     }
     if (data.type === 'chercher') {
       const recherche = normaliser(data.texte);
       const resultats = [];
       for (const { produit, cle } of index) {
         if (cle.includes(recherche)) resultats.push(produit);
         if (resultats.length === 20) break;
       }
       self.postMessage({ id: data.id, resultats });
     }
   });
   ```

   ```js
   // dans la page
   const worker = new Worker(new URL('./recherche.worker.js', import.meta.url), { type: 'module' });
   worker.postMessage({
     type: 'charger',
     produits: [{ nom: 'Crème brûlée' }, { nom: 'Café glacé' }, { nom: 'Thé vert' }],
   });
   worker.addEventListener('message', ({ data }) => {
     console.log(data.id, data.resultats.map((p) => p.nom)); // 1 [ 'Crème brûlée' ]
   });
   worker.postMessage({ type: 'chercher', id: 1, texte: 'CREME' });
   ```

   La liste est envoyée une seule fois ; chaque recherche n'échange ensuite que quelques octets. Le worker traite les
   messages dans l'ordre : la recherche arrive après le chargement. Et la page reste fluide pendant la frappe, même
   sur des centaines de milliers de produits.
   :::

2. Ce code colore les lignes d'un tableau de 20 000 lignes selon leur montant, et bloque la page près d'une seconde
   sur mobile. Il touche au DOM, donc un worker ne peut pas s'en charger. Réécris-le pour qu'aucune tâche ne dépasse
   50 ms, et qu'une fonction `onTermine` soit appelée à la fin.

   ```js
   function colorerLignes(lignes) {
     for (const ligne of lignes) {
       const montant = Number(ligne.dataset.montant);
       ligne.classList.toggle('eleve', montant > 1000);
       ligne.classList.toggle('negatif', montant < 0);
     }
   }
   ```

   :::indice
   Réutilise `traiterParMorceaux` et `cederLaMain`, avec un budget de 10 ms.
   :::

   :::solution
   ```js
   function cederLaMain() {
     if (globalThis.scheduler?.yield) return scheduler.yield();
     return new Promise((resoudre) => setTimeout(resoudre, 0));
   }

   async function traiterParMorceaux(elements, traiter, budget = 10) {
     let debut = performance.now();
     for (const element of elements) {
       traiter(element);
       if (performance.now() - debut > budget) {
         await cederLaMain();
         debut = performance.now();
       }
     }
   }

   async function colorerLignes(lignes, onTermine) {
     await traiterParMorceaux(lignes, (ligne) => {
       const montant = Number(ligne.dataset.montant);
       ligne.classList.toggle('eleve', montant > 1000);
       ligne.classList.toggle('negatif', montant < 0);
     });
     onTermine();
   }
   ```

   La boucle ne fait que des écritures, sans lecture de géométrie : pas de layout thrashing, une seule mise en page
   à la fin de chaque morceau. Si une nouvelle coloration peut commencer avant la fin de la précédente, on ajoute un
   `AbortSignal` vérifié à chaque morceau, pour abandonner le travail devenu inutile.
   :::

3. Un utilisateur signale que « la page des commandes rame quand on tape dans le filtre ». Décris, étape par étape,
   comment tu profiles ce problème et comment tu vérifies ta correction.

   :::indice
   Suis les cinq étapes de la méthode, et pense au ralentissement du processeur et à l'INP.
   :::

   :::solution
   1. Reproduire : ouvrir la page des commandes avec un volume réaliste de données, et taper un mot dans le filtre.
   2. Enregistrer : onglet Performance, ralentissement du processeur 4× ou 6×, démarrer l'enregistrement, taper, arrêter.
   3. Lire : chercher les tâches longues marquées en rouge pendant la frappe, et l'INP des interactions dans la piste
      *Interactions*. Ouvrir la tâche la plus longue : le *flame chart* montre par exemple un gestionnaire `input` qui
      filtre et reconstruit tout le tableau à chaque touche ; le *Bottom-Up* désigne les fonctions les plus coûteuses,
      et des blocs violets signalent une mise en page lourde, voire forcée.
   4. Corriger une cause à la fois : debounce du filtre ; filtre sur un index précalculé ; affichage limité ou
      virtualisé ; mise à jour groupée du DOM.
   5. Mesurer de nouveau, dans les mêmes conditions : plus de tâche longue pendant la frappe, INP sous 200 ms. Puis
      suivre l'INP de terrain avec `web-vitals` après le déploiement, pour confirmer le gain chez les vrais
      utilisateurs.
   :::

## Questions d'entretien

- Quand utiliser un Web Worker, et quelles sont ses limites ?

  :::indice
  Pense à ce qu'un worker peut faire, à ce qu'il ne peut pas toucher, et à ce qu'il coûte.
  :::

  :::reponse
  Pour un calcul pur et long, qui bloquerait le fil principal plus de quelques dizaines de millisecondes : analyse
  d'un gros fichier, tri ou recherche sur beaucoup de données, compression, traitement d'image. Ses limites : pas
  d'accès au DOM ni à `window` ; une communication par messages, dont les données sont clonées, sans fonctions ni
  nœuds ; un coût de démarrage et de copie qui le rend inutile pour de petits calculs. Pour les gros tableaux
  binaires, je transfère l'`ArrayBuffer` au lieu de le copier. Il ne rend pas le calcul plus rapide : il garde
  l'interface réactive.
  :::

- Qu'est-ce qu'une tâche longue, et comment la réduire ?

  :::indice
  50 ms, et deux stratégies.
  :::

  :::reponse
  C'est une tâche qui occupe le fil principal plus de 50 ms ; pendant ce temps, la page ne peut traiter aucune
  interaction, ce qui dégrade l'INP. On la repère dans l'onglet Performance, ou avec un `PerformanceObserver` sur
  `longtask`. Pour la réduire : d'abord faire moins de travail, avec un meilleur algorithme, un cache, moins de DOM ;
  ensuite découper le travail restant en morceaux qui cèdent la main, avec `scheduler.yield()` ou `setTimeout` ;
  enfin déplacer les calculs purs dans un Web Worker.
  :::

- Quelle différence entre mesures de laboratoire et mesures de terrain ?

  :::indice
  Lighthouse d'un côté, les utilisateurs réels de l'autre.
  :::

  :::reponse
  Les mesures de laboratoire, comme un enregistrement dans les DevTools ou un audit Lighthouse, sont faites sur une
  machine et un réseau contrôlés : reproductibles, idéales pour diagnostiquer et comparer avant et après une
  correction. Les mesures de terrain viennent des navigateurs des vrais utilisateurs, avec leurs appareils, leurs
  réseaux et leurs données : on les collecte avec `web-vitals` ou on les lit dans le rapport CrUX de Chrome. Elles
  disent ce que vivent réellement les utilisateurs, et on les suit au 75ᵉ centile. Les deux sont complémentaires :
  le terrain dit où est le problème, le laboratoire aide à le comprendre et à le corriger.
  :::
