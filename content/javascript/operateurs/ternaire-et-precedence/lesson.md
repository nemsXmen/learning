---
id: javascript-ternaire-precedence
title: "Ternaire, précédence et expressions contre instructions"
slug: ternaire-et-precedence
technology: javascript
level: intermediate
module: operateurs
order: 5
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-operateurs-logiques
skills:
  - precedence-expressions
tags:
  - javascript
  - operateurs
---

## Objectifs

- Utiliser l'opérateur ternaire là où une valeur est attendue, et l'éviter ailleurs.
- Prévoir l'ordre d'évaluation d'une expression grâce à la précédence et à
  l'associativité.
- Ajouter des parenthèses là où la lecture n'est pas évidente.

## Introduction

`2 + 3 * 4` vaut `14`, pas `20` : tout le monde l'a appris à l'école. JavaScript applique
la même idée à tous ses opérateurs, y compris `&&`, `===`, `typeof` ou `=`, avec des
règles moins intuitives. L'opérateur ternaire, lui, est la version expression d'un
`if` : il produit une valeur. Bien utilisé, il rend le code plus direct ; imbriqué, il le
rend illisible.

## Concept

L'**opérateur ternaire** `condition ? siVrai : siFaux` est une **expression** : il
produit une valeur, là où `if` est une instruction qui n'en produit pas.

```js
const libelle = stock > 0 ? 'En stock' : 'Rupture';
```

La **précédence** décide quel opérateur s'applique en premier. Du plus prioritaire au
moins prioritaire, pour les plus courants :

| Priorité | Opérateurs |
| --- | --- |
| 1 | `( )` groupement, `.` et `[ ]` accès, `( )` appel |
| 2 | `++` `--` suffixes |
| 3 | `!` `typeof` `+` `-` unaires, `++` `--` préfixes |
| 4 | `**` |
| 5 | `*` `/` `%` |
| 6 | `+` `-` |
| 7 | `<` `>` `<=` `>=` `in` `instanceof` |
| 8 | `==` `!=` `===` `!==` |
| 9 | `&&` |
| 10 | `\|\|` `??` |
| 11 | `? :` ternaire |
| 12 | `=` `+=` et les autres affectations |

L'**associativité** décide de l'ordre entre opérateurs de même priorité. La plupart sont
évalués de gauche à droite (`10 - 4 - 3` vaut `3`). Deux exceptions à connaître : `**` et
l'affectation, évalués de droite à gauche.

## Exemple

```js
console.log(2 + 3 * 4); // 14
console.log((2 + 3) * 4); // 20
console.log(10 - 4 - 3); // 3 : (10 - 4) - 3
console.log(2 ** 3 ** 2); // 512 : 2 ** (3 ** 2)

let a;
let b;
a = b = 5; // a = (b = 5) : les deux valent 5

const valeur = 'Ada';
console.log(typeof valeur === 'string'); // true : typeof s'applique avant ===

const age = 20;
const tarif = age < 26 ? 'jeune' : 'plein';
console.log(`Tarif ${tarif}`); // Tarif jeune
```

## Comment ça fonctionne

Le moteur construit un arbre à partir de l'expression : l'opérateur le moins prioritaire
se retrouve à la racine, les plus prioritaires dans les feuilles. `2 + 3 * 4` devient une
addition dont l'opérande de droite est la multiplication.

Certaines combinaisons sont volontairement interdites pour éviter une ambiguïté :

```js
-2 ** 2; // SyntaxError : faut-il lire (-2) ** 2 ou -(2 ** 2) ?
(-2) ** 2; // 4
-(2 ** 2); // -4
```

La précédence explique aussi des bugs discrets :

```js
const estVide = !liste.length === 0; // (!liste.length) === 0 : toujours false
const estVideCorrige = liste.length === 0;
```

Le ternaire a une priorité très basse : dans `prix + estMembre ? 5 : 0`, c'est
`prix + estMembre` qui sert de condition. Il faut écrire `prix + (estMembre ? 5 : 0)`.

## Erreurs fréquentes

**Imbriquer des ternaires.** Au-delà d'un niveau, le code devient une devinette.
Préfère une suite de `if`, ou une table de correspondance.

**Utiliser un ternaire pour ses effets de bord.** `estValide ? envoyer() : afficherErreur()`
exécute des actions sans produire de valeur utile : c'est le rôle d'un `if`.

**Oublier la priorité basse du ternaire dans une addition ou une concaténation.**
Entoure le ternaire de parenthèses.

**Appliquer `!` au mauvais opérande.** `!a === b` compare `!a` à `b`. Écris `a !== b` ou
`!(a === b)`.

**Compter sur sa mémoire de la table de priorité.** Dès qu'un doute existe, des
parenthèses rendent l'intention évidente pour tout le monde.

## À retenir

- Le ternaire est une expression : il sert à produire une valeur, pas à exécuter des
  actions.
- `*` avant `+`, `===` avant `&&`, `&&` avant `||`, affectation en dernier.
- `**` et `=` s'évaluent de droite à gauche ; les autres de gauche à droite.
- `-2 ** 2` est une erreur de syntaxe.
- En cas de doute, des parenthèses.

## Exercices

1. Prévois la valeur de `2 + 3 * 4 ** 2`, `(2 + 3) * 4`, `10 - 4 - 3` et `2 ** 3 ** 2`.

   :::indice
   `**` passe avant `*`, qui passe avant `+`. Et `**` s'évalue de droite à gauche.
   :::

   :::solution
   - `2 + 3 * 4 ** 2` : `4 ** 2` vaut `16`, `3 * 16` vaut `48`, puis `50`.
   - `(2 + 3) * 4` : `20`, les parenthèses passent en premier.
   - `10 - 4 - 3` : `3`, soit `(10 - 4) - 3`.
   - `2 ** 3 ** 2` : `2 ** 9`, soit `512`.
   :::

2. Remplace ce `if` / `else`, qui ne sert qu'à choisir une valeur, par une expression
   ternaire.

   ```js
   let libelle;
   if (stock > 0) {
     libelle = 'En stock';
   } else {
     libelle = 'Rupture';
   }
   ```

   :::indice
   Le ternaire produit directement la valeur : la variable peut alors devenir une
   constante.
   :::

   :::solution
   ```js
   const libelle = stock > 0 ? 'En stock' : 'Rupture';
   ```

   On gagne en concision, et `libelle` devient une constante : elle ne pourra plus être
   réaffectée par erreur plus loin.
   :::

3. Ce ternaire imbriqué est difficile à lire. Réécris-le clairement.

   ```js
   const tarif = age < 12 ? 'enfant' : age < 26 ? 'jeune' : age >= 65 ? 'senior' : 'plein';
   ```

   :::indice
   Une suite de `if` / `else if` exprime la même logique, une condition par ligne.
   :::

   :::solution
   ```js
   let tarif;
   if (age < 12) {
     tarif = 'enfant';
   } else if (age < 26) {
     tarif = 'jeune';
   } else if (age >= 65) {
     tarif = 'senior';
   } else {
     tarif = 'plein';
   }
   ```

   Chaque cas se lit sur sa ligne, et l'ordre des conditions devient visible : c'est lui
   qui garantit qu'un enfant n'est pas classé « jeune ».
   :::

## Questions d'entretien

- Pourquoi `-2 ** 2` est-il une erreur de syntaxe en JavaScript ?

  :::indice
  Écris les deux façons possibles de lire cette expression, et calcule-les.
  :::

  :::reponse
  L'expression est ambiguë : `(-2) ** 2` vaut `4`, `-(2 ** 2)` vaut `-4`, et les
  mathématiques comme les autres langages ne s'accordent pas sur la lecture attendue. Plutôt
  que de choisir une règle que la moitié des développeurs lirait mal, la spécification
  interdit un opérateur unaire directement devant la base de `**`. Il faut écrire les
  parenthèses.
  :::

- Quand préférer un ternaire à un `if` ?

  :::indice
  Qu'est-ce qu'un ternaire produit, et qu'est-ce qu'un `if` ne produit pas ?
  :::

  :::reponse
  Quand il s'agit de choisir entre deux valeurs : initialiser une constante, passer un
  argument, construire une chaîne. Le ternaire est une expression, il s'utilise là où une
  valeur est attendue. On garde `if` pour exécuter des actions, pour plus de deux cas, ou
  dès que le ternaire deviendrait imbriqué.
  :::

- Que signifie l'associativité d'un opérateur ? Donne un exemple.

  :::indice
  Que se passe-t-il quand plusieurs opérateurs de même priorité se suivent ?
  :::

  :::reponse
  L'associativité décide de l'ordre d'évaluation entre des opérateurs de même priorité. La
  soustraction est associative à gauche : `10 - 4 - 3` se lit `(10 - 4) - 3` et vaut `3`.
  La puissance et l'affectation sont associatives à droite : `2 ** 3 ** 2` se lit
  `2 ** (3 ** 2)` et vaut `512`, et `a = b = 5` affecte d'abord `b`, puis `a`.
  :::
