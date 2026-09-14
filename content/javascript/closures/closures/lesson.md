---
id: javascript-closures
title: Comprendre les closures
slug: closures
technology: javascript
level: intermediate
module: closures
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 100
prerequisites:
  - javascript-functions
skills:
  - closures
  - lexical-environment
  - scope
tags:
  - javascript
  - scope
---

## Objectifs

- Expliquer ce qu'est une closure sans réciter une définition.
- Identifier une closure dans du code existant.
- Utiliser une closure sans provoquer de fuite mémoire.

## Introduction

Les closures ont mauvaise réputation : on les présente comme un mécanisme avancé
alors qu'elles sont une **conséquence** de la portée lexicale, pas une fonctionnalité
qu'on active. Si tu as déjà écrit un callback qui lit une variable extérieure, tu as
écrit une closure sans le savoir.

## Concept

> Une closure se forme quand une fonction conserve l'accès à l'environnement lexical
> dans lequel elle a été créée, même après que cet environnement a fini de s'exécuter.

Le point qui change tout : une closure ne capture pas des **valeurs**, elle garde une
référence vers des **variables**. Si la variable change plus tard, la closure voit la
nouvelle valeur. C'est cette nuance qui explique la quasi-totalité des surprises.

## Exemple

```js
function creerCompteur() {
  let total = 0; // vit dans l'environnement de creerCompteur

  return () => {
    total += 1;
    return total;
  };
}

const a = creerCompteur();
const b = creerCompteur();

a(); // 1
a(); // 2
b(); // 1  ← environnement distinct
```

`creerCompteur` a rendu la main depuis longtemps, et pourtant `total` existe encore :
la fonction renvoyée en garde une référence. Chaque appel à `creerCompteur` crée un
environnement neuf, d'où deux compteurs indépendants.

## Comment ça fonctionne

À chaque appel de fonction, le moteur crée un *environnement lexical* : une table des
liaisons déclarées, plus un lien vers l'environnement parent. Cette chaîne est fixée à
l'écriture du code, pas à l'appel — d'où le mot *lexical*.

```text
closure interne
      │ [[Environment]]
      ▼
environnement de creerCompteur   { total: 2 }
      │
      ▼
environnement global
```

Normalement l'environnement d'un appel devient inaccessible dès le retour, et le
ramasse-miettes le libère. Mais si une fonction survivante pointe vers lui, il reste
joignable, donc vivant. Une closure n'est rien d'autre que ça : une fonction plus la
référence vers son environnement de naissance.

C'est aussi pourquoi les closures servent à créer de l'état privé : `total` n'est
accessible par aucun autre chemin que la fonction renvoyée.

## Erreurs fréquentes

**Croire que la closure fige la valeur.** Elle référence la variable :

```js
let message = 'avant';
const afficher = () => console.log(message);
message = 'après';
afficher(); // 'après', pas 'avant'
```

**La boucle `var` partagée.** Les trois callbacks référencent la même liaison, qui
vaut `3` à l'exécution :

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3, 3, 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0, 1, 2
```

**Retenir plus que nécessaire.** Une closure maintient en vie tout son environnement.
Un callback qui ne lit qu'un identifiant mais se trouve déclaré à côté d'un gros
tableau empêche ce tableau d'être libéré. Extrais la donnée utile avant de fermer.

## À retenir

- Une closure est une conséquence de la portée lexicale, pas une option.
- Elle capture des variables, jamais des instantanés de valeurs.
- Chaque appel de la fonction externe crée un environnement distinct.
- Ce qu'une closure retient ne peut pas être libéré : garde-la étroite.

## Exercices

1. Écris `once(fn)` : une fonction qui n'exécute `fn` qu'au premier appel et renvoie
   ensuite toujours le premier résultat.

   :::indice
   Il te faut deux variables qui survivent entre les appels : « déjà appelée ? » et
   « le résultat ».
   :::

   :::indice
   Garde-les dans la portée de `once`, et renvoie une fonction qui les lit et les met à
   jour.
   :::

   :::solution
   ```js
   function once(fn) {
     let appelee = false;
     let resultat;

     return function (...args) {
       if (!appelee) {
         appelee = true;
         resultat = fn.apply(this, args);
       }
       return resultat;
     };
   }

   const init = once(() => Math.random());
   init() === init(); // true
   ```
   :::

2. Corrige la boucle `var` sans utiliser `let`, en créant un environnement par
   itération.

   :::indice
   Chaque appel de fonction crée un nouvel environnement. Combien d'appels te faut-il ?
   :::

   :::solution
   ```js
   for (var i = 0; i < 3; i++) {
     (function (copie) {
       setTimeout(function () {
         console.log(copie);
       }, 0);
     })(i);
   }
   // 0, 1, 2
   ```

   La fonction appelée à chaque tour crée un environnement où `copie` garde la valeur
   de ce tour-là.
   :::

3. Implémente un compteur avec `incrementer`, `decrementer` et `valeur`, sans exposer
   la variable interne.

   :::indice
   La variable doit vivre dans une fonction ; seules les fonctions renvoyées doivent
   pouvoir la toucher.
   :::

   :::solution
   ```js
   function creerCompteur() {
     let compte = 0;

     return {
       incrementer: () => ++compte,
       decrementer: () => --compte,
       valeur: () => compte,
     };
   }

   const compteur = creerCompteur();
   compteur.incrementer();
   compteur.valeur(); // 1
   compteur.compte; // undefined : la variable n'est pas exposée
   ```
   :::

## Questions d'entretien

- Qu'est-ce qu'une closure, et pourquoi dire « elle capture la valeur » est-il faux ?

  :::indice
  Modifie la variable après avoir créé la fonction, puis appelle la fonction.
  :::

  :::reponse
  Une closure est une fonction accompagnée de l'environnement lexical où elle a été
  créée. Elle capture la liaison, pas la valeur : si la variable change après la
  création de la fonction, la fonction voit la nouvelle valeur. C'est exactement ce qui
  piège la boucle `var` avec `setTimeout`.
  :::

- Pourquoi une boucle `var` avec `setTimeout` affiche-t-elle trois fois la même
  valeur, et que change `let` exactement ?

  :::indice
  Combien de variables `i` existe-t-il pendant toute la boucle `var` ?
  :::

  :::reponse
  Avec `var`, il n'existe qu'une liaison `i` pour toute la boucle. Les rappels
  s'exécutent après la fin de la boucle et lisent tous cette même liaison, qui vaut
  alors 3. Avec `let`, la boucle `for` crée une nouvelle liaison à chaque itération :
  chaque rappel capture la sienne, d'où 0, 1, 2.
  :::

- Comment une closure peut-elle provoquer une fuite mémoire, et comment l'éviter ?

  :::indice
  Tant qu'une fonction reste joignable, son environnement l'est aussi. Qu'est-ce qui
  garde une fonction joignable longtemps ?
  :::

  :::reponse
  Une closure garde vivant tout ce qu'elle référence. Si elle est conservée longtemps —
  écouteur d'événement jamais retiré, minuterie jamais arrêtée, cache global — les
  objets qu'elle capture ne sont jamais libérés. Pour l'éviter : retirer les écouteurs
  (`removeEventListener`, `AbortController`), arrêter les minuteries, ne capturer que ce
  qui sert plutôt qu'un gros objet entier, et associer des données à des objets avec
  une `WeakMap`.
  :::
