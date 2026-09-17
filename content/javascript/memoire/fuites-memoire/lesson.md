---
id: javascript-fuites-memoire
title: "Fuites mémoire : les reconnaître, les corriger, les mesurer"
slug: fuites-memoire
technology: javascript
level: advanced
module: memoire
order: 2
estimatedMinutes: 35
difficulty: 4
xp: 100
prerequisites:
  - javascript-memoire-gc
  - javascript-pieges-closures
skills:
  - memory-leaks
tags:
  - javascript
  - memoire
---

## Objectifs

- Définir une fuite mémoire en JavaScript : un objet inutile qui reste accessible.
- Reconnaître les sources classiques : abonnements, minuteurs, caches, closures et nœuds DOM détachés.
- Corriger chaque cas avec une fonction de nettoyage, un `AbortController` ou une collection faible.
- Mesurer une fuite par comparaison d'instantanés du tas et avec `process.memoryUsage`.

## Introduction

Avec un ramasse-miettes, une fuite mémoire ne vient jamais d'un oubli de libération : elle vient d'une **référence
oubliée**. Un écouteur jamais retiré, un minuteur jamais arrêté, un cache qui ne vide jamais rien : chacun garde
accessible un objet dont plus personne n'a besoin, et avec lui tout ce qu'il référence. Sur une page consultée cinq
minutes, cela passe inaperçu ; sur une application ouverte toute la journée ou un serveur qui tourne des semaines, la
mémoire grimpe jusqu'au ralentissement, puis au plantage.

## Concept

| Source | Ce qui retient l'objet | Correction |
| --- | --- | --- |
| Abonnement | la liste d'abonnés de l'émetteur | se désabonner à la fermeture |
| Minuteur | la file des minuteurs, jusqu'à `clearInterval` | arrêter le minuteur, par exemple via un `AbortSignal` |
| Cache | une `Map` ou un objet global qui grandit | limite de taille, expiration, ou `WeakMap` |
| Closure | l'environnement capturé par une fonction encore vivante | ne capturer que le nécessaire |
| DOM détaché | une variable JavaScript vers un nœud retiré de la page | oublier la référence avec le nœud |
| Variable globale | l'objet global, pour toute la durée du programme | portée de module, `const`, mode strict |

## Exemple

```js
class Emetteur {
  #abonnes = new Set();
  abonner(fonction) {
    this.#abonnes.add(fonction);
    return () => this.#abonnes.delete(fonction);
  }
  get nombreAbonnes() {
    return this.#abonnes.size;
  }
}

// Fuite : chaque vue s'abonne et ne se désabonne jamais.
const busFuyant = new Emetteur();
function ouvrirVueFuyante() {
  const lignes = new Array(10_000).fill('ligne'); // capturé par l'écouteur
  busFuyant.abonner(() => lignes.length);
}
for (let i = 0; i < 5; i += 1) ouvrirVueFuyante();
console.log(busFuyant.nombreAbonnes); // 5 : cinq tableaux toujours accessibles

// Correction : la vue rend une fonction de fermeture qui retire ses références.
const bus = new Emetteur();
function ouvrirVue() {
  const lignes = new Array(10_000).fill('ligne');
  const desabonner = bus.abonner(() => lignes.length);
  const controleur = new AbortController();
  const minuteur = setInterval(() => lignes.length, 1000);
  controleur.signal.addEventListener('abort', () => clearInterval(minuteur), { once: true });
  return () => {
    desabonner();
    controleur.abort();
  };
}
const fermetures = Array.from({ length: 5 }, ouvrirVue);
fermetures.forEach((fermer) => fermer());
console.log(bus.nombreAbonnes); // 0

// Cache : une WeakMap ne retient pas ses clés.
const metadonnees = new WeakMap();
let noeud = { id: 'carte-1' };
metadonnees.set(noeud, { ouvertLe: '2026-09-17' });
console.log(metadonnees.has(noeud)); // true
noeud = null; // la clé et sa valeur deviennent collectables
```

## Comment ça fonctionne

Une fuite est un objet **inutile mais accessible**. Le ramasse-miettes ne peut pas deviner l'intention du programme :
tant qu'un chemin existe depuis une racine, l'objet est gardé, avec tout ce qu'il référence. Une petite référence
oubliée retient donc souvent beaucoup : l'écouteur de `ouvrirVueFuyante` n'est qu'une fonction, mais son environnement
contient `lignes`, et le `Set` de l'émetteur, lui-même accessible, garde le tout.

Les **abonnements** et les **minuteurs** sont les causes les plus fréquentes, car ils inscrivent une fonction dans une
structure qui survit au composant : l'émetteur, la liste d'écouteurs d'un élément ou de `window`, la file des
minuteurs. La règle est de toujours associer une création à sa destruction : `abonner` renvoie `desabonner`,
`setInterval` appelle `clearInterval`, `addEventListener` appelle `removeEventListener`. Un `AbortController`
simplifie ce travail : on passe `{ signal }` à `addEventListener` ou à `fetch`, et un seul `abort()` défait tout.

Les **caches** fuient par construction : une `Map` qui ne supprime jamais rien grandit avec chaque clé nouvelle. On
les borne par une taille maximale (en supprimant les entrées les plus anciennes, puisqu'une `Map` garde l'ordre
d'insertion), par une durée d'expiration, ou, quand la clé est un objet, par une `WeakMap` : l'entrée disparaît avec
la clé. Une `WeakMap` ne s'énumère pas et n'a pas de taille, justement parce que son contenu dépend de la collecte.

Une **closure** retient les variables qu'elle utilise. Dans V8, les fonctions créées dans une même portée partagent
un environnement : une variable utilisée par l'une reste accessible tant que n'importe laquelle vit. Extraire la seule
valeur utile avant de créer la fonction évite de retenir un gros objet.

Un **nœud DOM détaché** a été retiré de la page mais reste référencé par du JavaScript : un tableau d'éléments
sélectionnés, un cache, un écouteur qui le mentionne. Il garde alors en mémoire tout son sous-arbre. Les outils le
signalent explicitement comme « Detached ».

Pour **mesurer**, on compare. Dans le navigateur, l'onglet Memory prend un instantané du tas ; on répète l'action
suspecte plusieurs fois, on reprend un instantané, et la vue comparative montre les objets créés et encore présents.
Côté Node.js, `process.memoryUsage().heapUsed` suit le tas, `node --inspect` ouvre les mêmes outils, et
`node --expose-gc` permet d'appeler `global.gc()` avant chaque mesure pour ne compter que ce qui est réellement retenu.
Une seule mesure ne prouve rien : c'est une croissance **répétée**, qui ne redescend pas après collecte, qui signe une
fuite.

## Erreurs fréquentes

**S'abonner dans un composant sans jamais se désabonner.** Chaque ouverture ajoute une copie retenue.

**Oublier `clearInterval`.** Le minuteur et tout ce qu'il capture restent actifs pour toujours.

**Utiliser une `Map` comme cache sans limite.** Borne-la, ou utilise une `WeakMap` si la clé est un objet.

**Garder des références vers des éléments retirés du DOM.** Retire-les de tes structures en même temps que de la page.

**Conclure sur une seule mesure.** Compare après répétitions et après collecte.

## À retenir

- Une fuite est un objet inutile encore accessible.
- Chaque abonnement, écouteur ou minuteur a sa fonction de nettoyage ; `AbortController` les regroupe.
- Un cache doit être borné ; une `WeakMap` ne retient pas ses clés.
- Une closure retient son environnement : ne capture que le nécessaire.
- On détecte une fuite par comparaison d'instantanés, après répétition de l'action.

## Exercices

1. `const cache = new Map()` mémorise les profils chargés par identifiant et ne supprime jamais rien. Écris
   `creerCacheBorne(taille)` avec `get` et `set`, qui supprime l'entrée la moins récemment utilisée quand la limite est
   atteinte.

   :::indice
   Une `Map` garde l'ordre d'insertion : `map.keys().next().value` est la plus ancienne clé.
   :::

   :::indice
   Pour marquer une entrée comme récemment utilisée, supprime-la puis réinsère-la.
   :::

   :::solution
   ```js
   function creerCacheBorne(taille) {
     const entrees = new Map();
     return {
       get(cle) {
         if (!entrees.has(cle)) return undefined;
         const valeur = entrees.get(cle);
         entrees.delete(cle);
         entrees.set(cle, valeur);
         return valeur;
       },
       set(cle, valeur) {
         entrees.delete(cle);
         entrees.set(cle, valeur);
         if (entrees.size > taille) entrees.delete(entrees.keys().next().value);
       },
       get taille() {
         return entrees.size;
       },
     };
   }

   const cache = creerCacheBorne(2);
   cache.set('ada', { nom: 'Ada' });
   cache.set('alan', { nom: 'Alan' });
   cache.get('ada'); // ada devient la plus récente
   cache.set('grace', { nom: 'Grace' }); // alan est évincé
   console.log(cache.taille, cache.get('alan'), cache.get('ada').nom); // 2 undefined 'Ada'
   ```
   :::

2. Ce code garde des nœuds DOM détachés. Explique pourquoi, puis corrige-le.

   ```js
   const liste = document.querySelector('#liste');
   const selection = new Set();
   liste.addEventListener('click', (evenement) => {
     const element = evenement.target.closest('li');
     if (element) selection.add(element);
   });
   function supprimerSelection() {
     for (const element of selection) element.remove();
   }
   ```

   :::indice
   Après `supprimerSelection`, que contient encore `selection` ? Et `selection` est-il accessible ?
   :::

   :::solution
   `element.remove()` retire les nœuds de la page, mais `selection`, accessible depuis le module et depuis l'écouteur,
   les référence toujours : chaque suppression accumule des éléments détachés, avec leurs sous-arbres. On vide la
   sélection en même temps qu'on retire les nœuds.

   ```js
   document.body.innerHTML = '<ul id="liste"><li>A</li><li>B</li><li>C</li></ul>';
   const liste = document.querySelector('#liste');
   const selection = new Set();
   liste.addEventListener('click', (evenement) => {
     const element = evenement.target.closest('li');
     if (element) selection.add(element);
   });
   function supprimerSelection() {
     for (const element of selection) element.remove();
     selection.clear();
   }

   for (const element of liste.querySelectorAll('li')) element.click();
   supprimerSelection();
   console.log(liste.children.length, selection.size); // 0 0
   ```

   Une `WeakSet` éviterait aussi la rétention, mais elle ne s'itère pas : impossible alors d'écrire
   `supprimerSelection`. Le `Set` vidé explicitement reste la bonne structure ici.
   :::

3. Écris un script Node.js qui mesure la croissance du tas après 50 appels d'une fonction, puis compare une version qui
   retient ses tampons dans un tableau global et une version qui ne retient rien.

   :::indice
   Lance le script avec `node --expose-gc` et appelle `global.gc()` avant chaque lecture de
   `process.memoryUsage().heapUsed`.
   :::

   :::solution
   ```js
   // node --expose-gc mesure.mjs
   function tasEnMo() {
     global.gc();
     return process.memoryUsage().heapUsed / 1024 / 1024;
   }

   function mesurer(action, repetitions) {
     const avant = tasEnMo();
     for (let i = 0; i < repetitions; i += 1) action();
     return tasEnMo() - avant;
   }

   const retenus = [];
   const creerTampon = () => Array.from({ length: 100_000 }, (_, i) => i);

   const avecFuite = mesurer(() => retenus.push(creerTampon()), 50);
   retenus.length = 0;
   const sansFuite = mesurer(() => creerTampon().length, 50);

   console.log(avecFuite > 20, sansFuite < 5); // true true
   ```

   La version fuyante garde environ 40 Mo après collecte ; l'autre revient à son point de départ. Les valeurs exactes
   varient selon la version de Node.js, d'où la comparaison par seuils plutôt que par nombres précis.
   :::

## Questions d'entretien

- Comment peut-il y avoir des fuites mémoire dans un langage avec ramasse-miettes ?

  :::indice
  Le ramasse-miettes connaît l'accessibilité, pas l'utilité.
  :::

  :::reponse
  Le ramasse-miettes libère ce qui est inaccessible, pas ce qui est inutile. Une fuite est un objet dont le programme
  n'a plus besoin mais qui reste atteignable depuis une racine : écouteur jamais retiré, minuteur jamais arrêté, cache
  sans limite, variable globale, nœud DOM retiré mais encore référencé. Chacune de ces références retient aussi tout ce
  que l'objet référence, closures comprises.
  :::

- Quand utiliser une `WeakMap` plutôt qu'une `Map` ?

  :::indice
  Pense à la durée de vie de la clé, et à ce que la `WeakMap` ne permet pas.
  :::

  :::reponse
  Quand on associe des données à un objet dont on ne contrôle pas la durée de vie — un nœud DOM, une instance fournie
  par un autre module — et que ces données doivent disparaître avec lui. Une `WeakMap` ne retient pas ses clés, qui
  doivent être des objets. En contrepartie, elle ne s'énumère pas et n'a pas de taille. Pour un cache à clés
  primitives, on préfère une `Map` bornée par taille ou par expiration.
  :::

- Comment diagnostiquerais-tu une fuite mémoire signalée en production ?

  :::indice
  Reproduire, répéter, comparer.
  :::

  :::reponse
  D'abord confirmer la tendance : une mémoire qui croît avec l'usage et ne redescend pas après collecte. Ensuite
  reproduire en local l'action suspecte, prendre un instantané du tas, répéter l'action plusieurs fois, reprendre un
  instantané et comparer : les objets créés et toujours présents, et leur chaîne de rétention, montrent qui les garde.
  Côté Node.js, `--inspect` donne les mêmes outils, et `process.memoryUsage` permet de suivre la croissance. On corrige
  en retirant la référence, puis on refait la mesure pour vérifier.
  :::
