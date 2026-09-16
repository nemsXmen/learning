---
id: javascript-sync-async
title: "Synchrone et asynchrone : un seul fil, beaucoup d'attentes"
slug: synchrone-et-asynchrone
technology: javascript
level: intermediate
module: asynchronisme
order: 1
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-callbacks
  - javascript-contexte-execution
skills:
  - async-model
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Expliquer pourquoi un programme JavaScript n'exécute qu'une chose à la fois.
- Décrire le trajet d'un callback asynchrone : API de l'environnement, file d'attente, pile
  d'appels.
- Reconnaître le code qui bloque, et ses conséquences sur une page ou un serveur.

## Introduction

Une page web attend des clics, des réponses réseau et des minuteurs ; un serveur Node.js
attend des milliers de requêtes. Pourtant, le code JavaScript s'exécute sur **un seul fil**.
Il ne fait jamais deux calculs en même temps, et il ne reste jamais planté à attendre. La
réconciliation de ces deux faits s'appelle le modèle asynchrone, et c'est lui qui explique
pourquoi `setTimeout(f, 0)` ne s'exécute pas immédiatement.

## Concept

| Élément | Rôle |
| --- | --- |
| Pile d'appels | le code JavaScript en cours d'exécution, une fonction à la fois |
| API de l'environnement | minuteurs, réseau, disque, événements : gérés **hors** du fil JavaScript |
| File d'attente | les callbacks prêts, en attente que la pile soit vide |
| Boucle d'événements | dès que la pile est vide, prend le prochain callback et l'exécute |

Le trajet d'un callback asynchrone :

1. le code demande une opération à l'environnement, en lui confiant un callback ;
2. l'appel rend la main **immédiatement**, et le code continue ;
3. quand l'opération est terminée, l'environnement place le callback dans une file ;
4. quand la pile est **vide**, la boucle d'événements l'exécute.

**Synchrone** : l'instruction suivante attend la fin de la précédente. **Asynchrone** : le
résultat arrive plus tard, dans un callback, pendant que le reste du code continue.

## Exemple

```js
console.log('A');
setTimeout(() => console.log('C : minuteur de 0 ms'), 0);
console.log('B');
// Affiche A, B, puis C : le callback attend que la pile soit vide.

const debut = Date.now();
setTimeout(() => {
  console.log(`minuteur de 10 ms exécuté après ${Date.now() - debut} ms`);
}, 10);

// Une boucle qui occupe le fil pendant 200 ms.
const fin = Date.now() + 200;
while (Date.now() < fin) {}
console.log('fin du calcul bloquant');
// Le minuteur de 10 ms ne peut s'exécuter qu'après : il affiche environ 200 ms.
```

## Comment ça fonctionne

JavaScript ne dispose que d'**une pile d'appels** : à tout instant, une seule fonction
s'exécute. Ce qui ressemble à du parallélisme vient de l'**environnement** — le navigateur ou
Node.js — qui, lui, sait gérer plusieurs attentes à la fois. Quand le code appelle
`setTimeout`, lance une requête réseau ou pose un écouteur d'événement, il confie le travail et
un callback à l'environnement, puis continue immédiatement. Le minuteur s'écoule, la réponse
arrive, l'utilisateur clique : l'environnement dépose alors le callback dans une file.

La **boucle d'événements** relie les deux mondes. Elle ne fait qu'une chose : quand la pile est
vide, elle prend le prochain callback prêt et l'exécute jusqu'au bout. C'est pourquoi
`setTimeout(f, 0)` ne s'exécute pas tout de suite : le délai est écoulé presque aussitôt, mais
`f` attend que le code en cours — y compris le `console.log('B')` qui suit — soit terminé.

La conséquence directe est que **le code synchrone bloque tout**. Pendant la boucle de 200 ms
de l'exemple, aucun callback ne peut s'exécuter : le minuteur de 10 ms attend, et dans un
navigateur la page ne répond plus aux clics et ne se redessine plus. Sur un serveur Node.js,
c'est pire : un calcul de deux secondes dans une requête bloque **toutes** les autres requêtes
pendant deux secondes. Le délai d'un minuteur est donc un **minimum**, jamais une garantie.

Ce modèle a un avantage majeur : un callback n'est jamais interrompu au milieu par un autre. Il
n'y a pas de verrou à poser sur une variable partagée, contrairement aux langages où plusieurs
fils modifient la même mémoire en même temps. Le prix est la discipline : tout ce qui attend
doit être asynchrone, et tout ce qui calcule longtemps doit être découpé ou déplacé dans un
*worker*.

Le chapitre suivant affine ce schéma : il n'existe pas une file unique, mais deux catégories de
tâches, dont l'ordre explique les comportements des promesses.

## Erreurs fréquentes

**Lire un résultat asynchrone sur la ligne suivante.** Il n'existe pas encore : utilise-le dans
le callback.

**Croire que `setTimeout(f, 0)` est immédiat.** `f` attend la fin du code en cours.

**Lancer un calcul long sur le fil principal.** La page gèle, le serveur ne répond plus :
découpe le travail ou utilise un worker.

**Compter sur la précision d'un délai.** Le délai est un minimum, retardé par tout code bloquant.

## À retenir

- Une seule pile d'appels : une seule fonction JavaScript s'exécute à la fois.
- L'environnement gère les attentes et place les callbacks prêts dans une file.
- La boucle d'événements exécute un callback seulement quand la pile est vide.
- Le code synchrone long bloque tout : page gelée, serveur figé.
- Un délai de minuteur est un minimum, pas une promesse d'exactitude.

## Exercices

1. Donne l'ordre des affichages, et explique la place du deuxième message.

   ```js
   console.log('début');
   setTimeout(() => console.log('minuteur'), 0);
   console.log('fin');
   ```

   :::indice
   Le callback du minuteur peut-il s'exécuter tant que le script principal n'est pas terminé ?
   :::

   :::solution
   L'ordre est `début`, `fin`, `minuteur`. Le délai de 0 ms est écoulé presque tout de suite,
   mais le callback attend dans la file que la pile soit vide, c'est-à-dire que le script ait
   fini, `console.log('fin')` compris.
   :::

2. Ce code affiche `undefined`. Explique pourquoi et corrige-le pour afficher `42`.

   ```js
   let reponse;
   setTimeout(() => {
     reponse = 42;
   }, 100);
   console.log(reponse);
   ```

   :::indice
   À quel moment l'affectation a-t-elle lieu par rapport au `console.log` ?
   :::

   :::solution
   `setTimeout` rend la main immédiatement : le `console.log` s'exécute avant que le callback,
   100 ms plus tard, n'affecte la valeur. Le résultat doit être utilisé **là où il arrive**.

   ```js
   function obtenirReponse(quandPrete) {
     setTimeout(() => quandPrete(42), 100);
   }

   obtenirReponse((reponse) => console.log(reponse)); // 42, après 100 ms
   ```
   :::

3. Traiter 100 000 éléments d'un coup gèle la page. Réécris `toutTraiter` pour traiter les
   éléments par tranches de 1 000, en rendant la main entre deux tranches, puis appeler `quandFini`.

   ```js
   function toutTraiter(elements, traiter) {
     for (const element of elements) traiter(element);
   }
   ```

   :::indice
   Traite une tranche, puis programme la suivante avec `setTimeout(…, 0)` : entre deux
   tranches, la boucle d'événements peut exécuter d'autres callbacks.
   :::

   :::solution
   ```js
   function toutTraiter(elements, traiter, quandFini, taille = 1000) {
     let index = 0;

     function tranche() {
       const limite = Math.min(index + taille, elements.length);
       for (; index < limite; index++) {
         traiter(elements[index]);
       }
       if (index < elements.length) {
         setTimeout(tranche, 0);
       } else {
         quandFini();
       }
     }

     tranche();
   }

   let somme = 0;
   const nombres = Array.from({ length: 100_000 }, (_, i) => i);
   toutTraiter(nombres, (n) => { somme += n; }, () => console.log(somme)); // 4999950000
   ```

   Le travail total est le même, mais la page reste réactive : clics et affichage s'intercalent
   entre les tranches. Pour un calcul réellement lourd, un Web Worker l'exécute hors du fil
   principal.
   :::

## Questions d'entretien

- JavaScript est mono-thread : comment gère-t-il plusieurs opérations en même temps ?

  :::indice
  Qui attend réellement le réseau et les minuteurs ?
  :::

  :::reponse
  Le code JavaScript s'exécute sur un seul fil, mais les attentes — minuteurs, réseau, disque,
  événements — sont gérées par l'environnement, navigateur ou Node.js. Quand une opération se
  termine, son callback est placé dans une file, et la boucle d'événements l'exécute dès que la
  pile d'appels est vide. On obtient de la concurrence sans parallélisme : beaucoup d'attentes
  simultanées, mais une seule exécution de code à la fois.
  :::

- Que signifie « bloquer la boucle d'événements », et quelles en sont les conséquences ?

  :::indice
  Que devient la file des callbacks pendant un calcul synchrone de plusieurs secondes ?
  :::

  :::reponse
  C'est occuper la pile avec un calcul synchrone long. Tant qu'il dure, aucun callback ne peut
  s'exécuter : dans un navigateur, la page ne répond plus et ne se redessine plus ; dans Node.js,
  toutes les autres requêtes attendent. On l'évite en gardant les callbacks courts, en découpant
  les gros traitements en tranches, ou en déplaçant le calcul dans un worker.
  :::

- `setTimeout(f, 0)` exécute-t-il `f` immédiatement ?

  :::indice
  Que signifie réellement le délai passé à `setTimeout` ?
  :::

  :::reponse
  Non. Le délai est une durée **minimale** avant que `f` soit placé dans la file des tâches ;
  `f` s'exécute ensuite quand la pile est vide et que les tâches précédentes sont passées. Avec
  0, `f` s'exécute donc après tout le code synchrone en cours, et après les microtâches comme
  les suites de promesses. Les navigateurs imposent en plus un délai minimal d'environ 4 ms aux
  minuteurs profondément imbriqués.
  :::
