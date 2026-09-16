---
id: javascript-event-loop
title: "L'event loop : microtâches et macrotâches"
slug: event-loop
technology: javascript
level: advanced
module: asynchronisme
order: 2
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-sync-async
skills:
  - event-loop
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Distinguer les macrotâches des microtâches, et savoir d'où vient chacune.
- Prédire l'ordre exact d'exécution d'un code qui mélange synchrone, promesses et minuteurs.
- Comprendre pourquoi une chaîne infinie de microtâches peut geler une page.

## Introduction

`setTimeout(f, 0)` et `Promise.resolve().then(g)` semblent tous deux « exécuter plus tard ».
Pourtant `g` passe toujours avant `f`, quel que soit l'ordre dans lequel on les écrit. Ce n'est
pas un détail d'implémentation : c'est la règle centrale de la boucle d'événements, et c'est
elle que testent la plupart des questions d'entretien sur l'asynchrone.

## Concept

La boucle d'événements gère deux files :

| File | Contenu | Exemples |
| --- | --- | --- |
| Macrotâches (tâches) | les callbacks déclenchés par l'environnement | `setTimeout`, `setInterval`, événements, réponses d'entrées-sorties |
| Microtâches | les suites de promesses et les micro-callbacks | `then`, `catch`, `finally`, `await`, `queueMicrotask` |

L'algorithme, répété indéfiniment :

1. exécuter **une** macrotâche — au démarrage, le script principal lui-même ;
2. exécuter **toutes** les microtâches en attente, y compris celles ajoutées pendant ce
   vidage ;
3. dans un navigateur, mettre à jour l'affichage si nécessaire ;
4. recommencer avec la macrotâche suivante.

Conséquence : entre deux macrotâches, la file des microtâches est **toujours vidée entièrement**.

## Exemple

```js
console.log('1 synchrone');

setTimeout(() => console.log('5 macrotâche'), 0);

Promise.resolve().then(() => console.log('3 microtâche (then)'));
queueMicrotask(() => console.log('4 microtâche (queueMicrotask)'));

console.log('2 synchrone');
// 1, 2, 3, 4, 5

setTimeout(() => {
  console.log('T1');
  Promise.resolve().then(() => console.log('T1 → sa microtâche'));
}, 10);
setTimeout(() => console.log('T2'), 10);
// T1, T1 → sa microtâche, T2 : la microtâche passe avant la macrotâche suivante

Promise.resolve().then(() => {
  console.log('M1');
  queueMicrotask(() => console.log('M1 → M2'));
});
// M1 puis M1 → M2, avant tout minuteur : la file est vidée même si elle se remplit
```

## Comment ça fonctionne

Le script principal est lui-même une macrotâche. Pendant son exécution, `setTimeout` programme
une **macrotâche** pour plus tard, tandis que `Promise.resolve().then(...)` et
`queueMicrotask(...)` ajoutent des **microtâches**. Quand le script se termine, la boucle ne
passe pas directement au minuteur : elle vide d'abord toute la file des microtâches. D'où
l'ordre 1, 2, 3, 4, puis 5.

Le vidage est **complet** : une microtâche qui en ajoute une autre la fait exécuter dans le même
vidage. C'est ce que montre `M1 → M2`, exécutée avant tout minuteur, même programmé bien avant.
Le même principe s'applique à chaque macrotâche : après `T1`, sa microtâche passe avant `T2`,
bien que les deux minuteurs soient prêts au même moment.

Ce vidage complet a un revers : une microtâche qui se reprogramme indéfiniment **affame** la
boucle. Aucune macrotâche ne passe plus, aucun clic n'est traité, et dans un navigateur l'écran
ne se redessine jamais, puisque le rendu n'a lieu qu'entre deux macrotâches. Une boucle infinie
de `then` gèle une page aussi sûrement qu'un `while (true)`.

Pourquoi deux files ? Les microtâches servent à terminer un travail **le plus tôt possible**, sans
laisser d'autres événements s'intercaler : la suite d'une promesse s'exécute dès que le code
courant rend la main, dans un état cohérent. Les macrotâches, elles, représentent des événements
indépendants, entre lesquels l'environnement peut respirer — dessiner, traiter une entrée.

Deux précisions pour l'environnement. Dans un navigateur, l'étape de rendu s'intercale entre les
macrotâches, environ 60 fois par seconde, et `requestAnimationFrame` s'exécute juste avant elle.
Dans Node.js, la boucle est découpée en phases — minuteurs, entrées-sorties, `setImmediate` —
et `process.nextTick` a sa propre file, prioritaire sur les promesses. La règle essentielle reste
la même partout : **toutes les microtâches passent avant la macrotâche suivante**. La partie
Expert revient en détail sur la boucle de Node.js.

## Erreurs fréquentes

**Croire que l'ordre d'écriture décide.** Un `then` écrit après un `setTimeout(f, 0)` s'exécute
avant lui.

**Supposer qu'un minuteur passe entre deux suites de promesses.** Toutes les microtâches
d'abord.

**Programmer des microtâches en boucle.** La page gèle ; pour céder la main, utilise une
macrotâche comme `setTimeout`.

**Utiliser `queueMicrotask` pour « laisser respirer » l'interface.** Il ne laisse passer ni
rendu ni événement.

## À retenir

- Macrotâches : minuteurs, événements, entrées-sorties. Microtâches : promesses,
  `queueMicrotask`.
- Après chaque macrotâche, toutes les microtâches sont exécutées, même celles ajoutées en route.
- `then` passe avant `setTimeout(f, 0)`, quel que soit l'ordre d'écriture.
- Une chaîne infinie de microtâches bloque le rendu et les événements.
- Pour rendre la main à l'environnement, il faut une macrotâche.

## Exercices

1. Donne l'ordre des affichages sous la forme `A B C D`.

   ```js
   console.log('A');
   setTimeout(() => console.log('B'), 0);
   Promise.resolve().then(() => console.log('C'));
   console.log('D');
   ```

   :::indice
   D'abord tout le synchrone, puis toutes les microtâches, puis la première macrotâche.
   :::

   :::solution
   L'ordre est `A D C B`. `A` et `D` sont synchrones. Quand le script se termine, la file des
   microtâches est vidée : `C`. Vient ensuite la macrotâche du minuteur : `B`.
   :::

2. Donne l'ordre des affichages, puis justifie la place de `3`.

   ```js
   setTimeout(() => console.log('1'), 0);
   Promise.resolve()
     .then(() => {
       console.log('2');
       setTimeout(() => console.log('3'), 0);
     })
     .then(() => console.log('4'));
   console.log('5');
   ```

   :::indice
   Le second `then` est une microtâche ajoutée pendant le vidage : passe-t-elle avant le premier
   minuteur ? Et le minuteur programmé dans le premier `then`, où se place-t-il dans la file ?
   :::

   :::solution
   L'ordre est `5 2 4 1 3`. `5` est synchrone. Le vidage des microtâches exécute le premier
   `then` (`2`), qui programme un minuteur et déclenche le second `then`, exécuté dans le même
   vidage (`4`). Viennent ensuite les macrotâches dans l'ordre où elles ont été programmées : le
   minuteur `1`, programmé au début, puis `3`, programmé pendant le premier `then`.
   :::

3. Cette fonction est censée faire un travail par étapes sans bloquer la page. Explique pourquoi
   un minuteur programmé avant elle ne s'exécute qu'à la toute fin, puis corrige.

   ```js
   function etape() {
     faireUnPeuDeTravail();
     if (resteDuTravail()) {
       Promise.resolve().then(etape);
     }
   }
   ```

   :::indice
   Entre deux étapes, la boucle passe-t-elle à la macrotâche suivante ?
   :::

   :::solution
   Chaque étape programme la suivante comme **microtâche**, et la file des microtâches est vidée
   entièrement avant la macrotâche suivante : tant qu'il reste du travail, aucun minuteur, aucun
   événement et aucun rendu ne peuvent passer. Pour rendre la main, chaque étape doit être une
   macrotâche.

   ```js
   function etape() {
     faireUnPeuDeTravail();
     if (resteDuTravail()) {
       setTimeout(etape, 0);
     }
   }
   ```

   Avec trois étapes et un minuteur programmé avant, la version à microtâches s'exécute dans
   l'ordre `m1 m2 m3 minuteur` ; la version à `setTimeout`, dans l'ordre `t1 minuteur t2 t3`.
   :::

## Questions d'entretien

- Quelle différence entre microtâche et macrotâche ?

  :::indice
  Donne un exemple de chaque, puis la règle qui les ordonne.
  :::

  :::reponse
  Les macrotâches sont les callbacks déclenchés par l'environnement : minuteurs, événements,
  entrées-sorties ; le script principal en est une. Les microtâches sont les suites de promesses
  — `then`, `catch`, `finally`, la reprise après `await` — et les callbacks de
  `queueMicrotask`. La boucle exécute une macrotâche, puis vide **toute** la file des
  microtâches, y compris celles ajoutées pendant ce vidage, avant de passer à la macrotâche
  suivante.
  :::

- Pourquoi `Promise.resolve().then(f)` s'exécute-t-il avant `setTimeout(g, 0)` ?

  :::indice
  Dans quelle file chacun des deux callbacks est-il placé ?
  :::

  :::reponse
  Parce que `f` est une microtâche et `g` une macrotâche. À la fin du code synchrone en cours,
  la boucle vide la file des microtâches avant de prendre la macrotâche suivante : `f` passe donc
  toujours en premier, quel que soit l'ordre d'écriture et même si le délai du minuteur est déjà
  écoulé.
  :::

- Comment une boucle de promesses peut-elle geler une page ?

  :::indice
  À quel moment le navigateur redessine-t-il la page ?
  :::

  :::reponse
  Le rendu et le traitement des événements n'ont lieu qu'entre deux macrotâches. Si chaque
  microtâche en programme une nouvelle, la file des microtâches ne se vide jamais : la boucle ne
  passe jamais à la macrotâche suivante, et la page ne se redessine plus ni ne répond aux clics.
  Pour céder réellement la main, un travail découpé doit se reprogrammer avec une macrotâche,
  comme `setTimeout`, ou s'exécuter dans un worker.
  :::
