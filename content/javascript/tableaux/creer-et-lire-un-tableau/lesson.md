---
id: javascript-tableaux-creer
title: "Créer, lire et modifier un tableau"
slug: creer-et-lire-un-tableau
technology: javascript
level: beginner
module: tableaux
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-primitives-references
skills:
  - arrays-basics
tags:
  - javascript
  - tableaux
---

## Objectifs

- Créer un tableau avec un littéral, `Array.from` ou `Array.of`.
- Lire et modifier un élément par son index, et utiliser `length` et `at`.
- Reconnaître un tableau avec `Array.isArray`, et éviter les tableaux à trous.

## Introduction

Une liste de produits, les notes d'un élève, les lignes d'un fichier : dès qu'on manipule
plusieurs valeurs du même genre, on utilise un **tableau**. C'est la structure de données
la plus utilisée en JavaScript, et la base de tout le reste de cette partie. Avant les
méthodes puissantes comme `map` ou `filter`, il faut maîtriser l'essentiel : créer, lire,
modifier — et comprendre ce qu'est vraiment un tableau pour le moteur.

## Concept

Un tableau est une liste **ordonnée** de valeurs, repérées par un **index** qui commence
à 0.

| Opération | Syntaxe | Exemple |
| --- | --- | --- |
| Créer | `[a, b, c]` | `const notes = [12, 15, 9]` |
| Lire un élément | `tableau[index]` | `notes[0]` vaut `12` |
| Lire depuis la fin | `tableau.at(-1)` | `notes.at(-1)` vaut `9` |
| Modifier un élément | `tableau[index] = valeur` | `notes[1] = 16` |
| Longueur | `tableau.length` | `notes.length` vaut `3` |
| Tester | `Array.isArray(valeur)` | `Array.isArray(notes)` vaut `true` |

Pour créer un tableau à partir d'autre chose :

| Écriture | Résultat |
| --- | --- |
| `Array.from('abc')` | `['a', 'b', 'c']` |
| `Array.from({ length: 3 }, () => 0)` | `[0, 0, 0]` |
| `Array.from({ length: 4 }, (_, i) => i * 2)` | `[0, 2, 4, 6]` |
| `Array.of(7)` | `[7]` |

Un tableau peut contenir des valeurs de types différents, et d'autres tableaux :
`[[1, 2], [3, 4]]` représente une grille.

## Exemple

```js
const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

console.log(jours[0]); // 'lundi'
console.log(jours.at(-1)); // 'vendredi'
console.log(jours.length); // 5
console.log(jours[10]); // undefined : index hors du tableau

jours[4] = 'VENDREDI';
console.log(jours); // ['lundi', 'mardi', 'mercredi', 'jeudi', 'VENDREDI']

const grille = [
  [1, 2, 3],
  [4, 5, 6],
];
console.log(grille[1][2]); // 6 : ligne 1, colonne 2

const carres = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2);
console.log(carres); // [1, 4, 9, 16, 25]

console.log(typeof jours); // 'object'
console.log(Array.isArray(jours)); // true
```

## Comment ça fonctionne

Un tableau est un **objet** dont les clés sont des index, plus une propriété `length`
tenue à jour automatiquement : elle vaut toujours le plus grand index plus un. D'où
`typeof [] === 'object'`, et la nécessité de `Array.isArray` pour reconnaître un tableau.

Écrire à un index éloigné crée des **trous** :

```js
const t = [];
t[4] = 'x';
console.log(t.length); // 5
console.log(t); // [ <4 empty items>, 'x' ]
```

Modifier `length` agit aussi sur le contenu : `t.length = 0` vide le tableau, et une
longueur plus petite supprime les éléments en trop.

Le constructeur `new Array` a un comportement piégeux : avec **un seul** nombre, il crée un
tableau de cette longueur rempli de trous ; avec plusieurs arguments, il crée un tableau
contenant ces valeurs. `new Array(3)` et `new Array(3, 4)` n'ont donc rien à voir. Les
méthodes comme `map` ignorent les trous, ce qui rend `new Array(3).map(...)` inutile.
`Array.from` et `Array.of` n'ont pas cette ambiguïté.

Déclarer un tableau avec `const` n'empêche pas de le modifier : seule la liaison est
figée.

## Erreurs fréquentes

**Oublier que les index commencent à 0.** Le dernier élément est à `length - 1`, et
`tableau[tableau.length]` vaut `undefined`.

**Tester un tableau avec `typeof`.** `typeof []` vaut `'object'`. Utilise
`Array.isArray`.

**Créer un tableau prérempli avec `new Array(n)`.** On obtient des trous que `map` ignore.
Écris `Array.from({ length: n }, () => valeur)`.

**Écrire à un index au-delà de la fin.** Le tableau se remplit de trous. Pour ajouter à la
fin, utilise `push`, vu au chapitre suivant.

## À retenir

- Index de `0` à `length - 1` ; `at(-1)` pour le dernier élément.
- Un tableau est un objet : `Array.isArray` pour le reconnaître.
- `Array.from({ length: n }, fonction)` crée un tableau prérempli, sans trous.
- `new Array(3)` crée trois trous, pas `[3]`.
- `const` n'empêche pas de modifier le contenu du tableau.

## Exercices

1. Crée un tableau des cinq jours ouvrés, puis affiche le premier et le dernier sans écrire
   la longueur en dur.

   :::indice
   Le premier élément est à l'index 0. Pour le dernier, une méthode accepte un index
   négatif.
   :::

   :::solution
   ```js
   const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];

   console.log(jours[0]); // 'lundi'
   console.log(jours.at(-1)); // 'vendredi'
   console.log(jours[jours.length - 1]); // 'vendredi', écriture équivalente
   ```
   :::

2. Crée un tableau de dix zéros, puis le tableau des carrés de 1 à 5.

   :::indice
   `Array.from` accepte un objet `{ length: n }` et une fonction qui reçoit l'index en second
   argument.
   :::

   :::solution
   ```js
   const zeros = Array.from({ length: 10 }, () => 0);
   console.log(zeros); // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

   const carres = Array.from({ length: 5 }, (_, index) => (index + 1) ** 2);
   console.log(carres); // [1, 4, 9, 16, 25]
   ```

   Le `_` est une convention pour un paramètre qu'on n'utilise pas : ici, la valeur de
   l'élément, qui n'existe pas encore.
   :::

3. Explique pourquoi `new Array(3).map((_, i) => i)` ne produit pas `[0, 1, 2]`, puis écris
   une version qui fonctionne.

   :::indice
   Qu'y a-t-il réellement dans les trois emplacements créés par `new Array(3)` ? Et que fait
   `map` des emplacements vides ?
   :::

   :::solution
   `new Array(3)` crée un tableau de longueur 3 dont les emplacements sont vides. `map` ignore
   les emplacements vides : le résultat reste un tableau de trois trous.

   ```js
   console.log(new Array(3).map((_, i) => i)); // [ <3 empty items> ]

   const index = Array.from({ length: 3 }, (_, i) => i);
   console.log(index); // [0, 1, 2]
   ```
   :::

## Questions d'entretien

- Pourquoi `typeof []` vaut-il `'object'`, et comment tester qu'une valeur est un tableau ?

  :::indice
  Qu'est-ce qu'un tableau pour le moteur ?
  :::

  :::reponse
  Un tableau est un objet spécialisé : ses clés sont des index et sa propriété `length` est
  gérée automatiquement. `typeof` ne distingue pas les sortes d'objets et renvoie donc
  `'object'`. On utilise `Array.isArray(valeur)`, qui fonctionne aussi pour un tableau venu
  d'une autre fenêtre ou d'une iframe, là où `valeur instanceof Array` échouerait.
  :::

- Qu'est-ce qu'un tableau à trous, et pourquoi faut-il l'éviter ?

  :::indice
  Écris à l'index 10 d'un tableau vide, puis regarde sa longueur et son contenu.
  :::

  :::reponse
  Un tableau à trous (*sparse array*) a des index sans valeur : on l'obtient avec
  `new Array(n)`, en écrivant loin après la fin, ou avec `delete tableau[i]`. Les méthodes
  ne traitent pas les trous de façon homogène — `map` et `forEach` les ignorent, `for...of`
  les lit comme `undefined` — et les moteurs optimisent moins bien ces tableaux. On crée
  donc des tableaux denses, avec `Array.from` ou `fill`.
  :::

- Que se passe-t-il quand on modifie la propriété `length` d'un tableau ?

  :::indice
  Essaie avec une valeur plus petite, puis plus grande, que la longueur actuelle.
  :::

  :::reponse
  Réduire `length` supprime les éléments situés au-delà : `tableau.length = 0` vide le
  tableau, y compris pour toutes les variables qui le référencent. Augmenter `length` ajoute
  des emplacements vides, c'est-à-dire des trous. C'est un moyen rapide de vider un tableau
  partagé, mais il vaut mieux affecter un nouveau tableau quand les autres références ne
  doivent pas être touchées.
  :::
