---
id: javascript-closures
title: Comprendre les closures
slug: closures
technology: javascript
level: intermediate
module: scope
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
2. Corrige la boucle `var` sans utiliser `let`, en créant un environnement par
   itération.
3. Implémente un compteur avec `incrementer`, `decrementer` et `valeur`, sans exposer
   la variable interne.

## Questions d'entretien

- Qu'est-ce qu'une closure, et pourquoi dire « elle capture la valeur » est-il faux ?
- Pourquoi une boucle `var` avec `setTimeout` affiche-t-elle trois fois la même
  valeur, et que change `let` exactement ?
- Comment une closure peut-elle provoquer une fuite mémoire, et comment l'éviter ?
