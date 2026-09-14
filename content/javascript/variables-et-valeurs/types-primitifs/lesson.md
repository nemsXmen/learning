---
id: javascript-types-primitifs
title: "Les types primitifs : string, number, boolean, undefined et null"
slug: types-primitifs
technology: javascript
level: beginner
module: variables-et-valeurs
order: 2
estimatedMinutes: 30
difficulty: 2
xp: 70
prerequisites: []
skills:
  - js-primitive-types
tags:
  - javascript
  - types
---

## Objectifs

- Connaître les types primitifs `string`, `number`, `boolean`, `undefined` et `null`.
- Comprendre pourquoi `0.1 + 0.2` ne vaut pas exactement `0.3`, et comment calculer
  juste.
- Choisir entre `undefined` et `null` pour représenter une absence de valeur.

## Introduction

Toutes les valeurs de JavaScript sont soit des **primitives**, soit des **objets**. Les
primitives sont les briques de base : un texte, un nombre, un vrai ou faux, une absence.
Il y en a sept ; ce chapitre couvre les cinq que tu manipuleras tous les jours, le
suivant présente `symbol` et `bigint`. Bien les connaître évite des bugs qui paraissent
absurdes — un total de `0.30000000000000004`, un `NaN` qui ne s'égale pas lui-même.

## Concept

| Type | Représente | Exemples |
| --- | --- | --- |
| `string` | du texte | `'Ada'`, `"bonjour"`, `` `Total : ${prix}` `` |
| `number` | un nombre, entier ou décimal | `42`, `3.14`, `-0`, `NaN`, `Infinity` |
| `boolean` | vrai ou faux | `true`, `false` |
| `undefined` | valeur jamais définie | variable déclarée sans valeur, propriété absente |
| `null` | absence volontaire | `utilisateur.telephone = null` |

Tout ce qui n'est pas primitif est un objet : les tableaux, les fonctions, les dates.

**`number`** est un unique type pour tous les nombres, stockés en virgule flottante sur
64 bits (norme IEEE 754). Il contient trois valeurs spéciales : `NaN` (résultat d'un
calcul impossible, comme `Number('abc')`), `Infinity` (`1 / 0`) et `-Infinity`.

**`undefined` et `null`** représentent tous deux une absence, avec une nuance de sens :

- `undefined` : **personne n'a encore donné de valeur** — c'est le moteur qui le
  produit ;
- `null` : **quelqu'un a décidé qu'il n'y a pas de valeur** — c'est le développeur qui
  l'écrit.

## Exemple

```js
const nom = 'Ada';
const age = 36;
const estAdmin = false;
let ville; // undefined : déclarée, jamais affectée
const utilisateur = { nom, telephone: null }; // null : pas de téléphone, et on le sait

console.log(utilisateur.email); // undefined : la propriété n'existe pas
console.log(utilisateur.telephone); // null

console.log(0.1 + 0.2); // 0.30000000000000004
console.log(1 / 0); // Infinity
console.log(Number('quarante')); // NaN
console.log(Number.isNaN(Number('quarante'))); // true
```

## Comment ça fonctionne

Un `number` occupe 64 bits : c'est rapide et compact, mais la plupart des décimaux
n'ont pas de représentation exacte en binaire. `0.1` est en réalité stocké comme une
valeur très proche de `0.1`, et les petites erreurs s'additionnent :

```js
console.log(0.1 + 0.2 === 0.3); // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true
```

Pour de l'argent, on évite le problème en **calculant en centimes**, avec des entiers,
et en ne divisant par 100 qu'à l'affichage.

Les entiers sont exacts jusqu'à `Number.MAX_SAFE_INTEGER`, soit `2 ** 53 - 1`
(9 007 199 254 740 991). Au-delà, certains entiers ne sont plus représentables :

```js
console.log(Number.MAX_SAFE_INTEGER + 2); // 9007199254740992, et non ...993
console.log(Number.isSafeInteger(2 ** 53)); // false
```

`NaN` a une propriété unique : il n'est égal à rien, **pas même à lui-même**.
`valeur === NaN` est donc toujours faux. On le détecte avec `Number.isNaN(valeur)`.

Les chaînes sont **immuables** : aucune opération ne modifie une chaîne existante. Une
méthode comme `toUpperCase()` en renvoie une nouvelle.

## Erreurs fréquentes

**Comparer un décimal avec `===`.** `0.1 + 0.2 === 0.3` est faux. Compare avec une
tolérance, ou travaille en entiers.

**Tester `NaN` avec `===`.** `x === NaN` est toujours faux. Utilise `Number.isNaN(x)`.

**Confondre `isNaN` et `Number.isNaN`.** L'ancienne fonction globale `isNaN` convertit
d'abord son argument : `isNaN('abc')` vaut `true` alors que `'abc'` n'est pas la valeur
`NaN`. `Number.isNaN('abc')` vaut `false`.

**Écrire `undefined` soi-même.** Réserve `undefined` à ce que produit le moteur, et
utilise `null` pour dire « volontairement vide » : l'intention reste lisible.

## À retenir

- Cinq primitives du quotidien : `string`, `number`, `boolean`, `undefined`, `null`.
- Un seul type `number`, en virgule flottante : `0.1 + 0.2` n'est pas exactement `0.3`.
- Calcule l'argent en centimes, compare les décimaux avec une tolérance.
- `NaN` ne s'égale pas lui-même : utilise `Number.isNaN`.
- `undefined` : jamais défini ; `null` : vide par choix.

## Exercices

1. Calcule le total de trois articles à 0,10 € chacun et affiche `0.30` sans erreur
   d'arrondi.

   :::indice
   Les entiers sont exacts. Combien de centimes coûte un article ?
   :::

   :::solution
   ```js
   console.log(0.1 * 3); // 0.30000000000000004

   const prixEnCentimes = 10;
   const totalEnCentimes = prixEnCentimes * 3; // 30, exact
   console.log((totalEnCentimes / 100).toFixed(2)); // '0.30'
   ```

   On calcule en entiers et on ne convertit en euros qu'au dernier moment, pour
   l'affichage.
   :::

2. L'objet `utilisateur` peut ne pas avoir de propriété `telephone`, ou l'avoir à
   `null`. Affiche un message différent pour « jamais renseigné » et pour « pas de
   téléphone ».

   :::indice
   Une propriété absente vaut `undefined` ; une propriété vidée volontairement vaut
   `null`. Compare avec `===`.
   :::

   :::solution
   ```js
   const utilisateur = { nom: 'Ada', telephone: null };

   if (utilisateur.telephone === undefined) {
     console.log('Téléphone jamais renseigné');
   } else if (utilisateur.telephone === null) {
     console.log('Pas de téléphone');
   } else {
     console.log(`Téléphone : ${utilisateur.telephone}`);
   }
   // Pas de téléphone
   ```
   :::

3. Montre qu'au-delà de `Number.MAX_SAFE_INTEGER` un calcul sur des entiers devient faux.

   :::indice
   Ajoute 1, puis 2, à `Number.MAX_SAFE_INTEGER` et compare les deux résultats.
   :::

   :::solution
   ```js
   const max = Number.MAX_SAFE_INTEGER; // 9007199254740991

   console.log(max + 1); // 9007199254740992
   console.log(max + 2); // 9007199254740992 : le même résultat !
   console.log(max + 1 === max + 2); // true
   console.log(Number.isSafeInteger(max + 1)); // false
   ```

   Au-delà de `2 ** 53 - 1`, tous les entiers ne sont plus représentables en `number`. Le
   type `bigint`, vu au chapitre suivant, calcule exactement sur de grands entiers.
   :::

## Questions d'entretien

- Pourquoi `0.1 + 0.2 !== 0.3` en JavaScript ?

  :::indice
  Comment `0.1` est-il stocké en mémoire ?
  :::

  :::reponse
  Les nombres sont stockés en virgule flottante binaire sur 64 bits (IEEE 754). La
  plupart des décimaux, dont `0.1` et `0.2`, n'ont pas de représentation binaire exacte :
  on stocke une valeur très proche, et les écarts s'additionnent pour donner
  `0.30000000000000004`. Ce n'est pas propre à JavaScript, c'est le cas de tous les
  langages qui utilisent cette norme. On compare donc avec une tolérance
  (`Number.EPSILON`), ou on calcule en entiers, par exemple en centimes.
  :::

- Quelle est la différence entre `null` et `undefined` ?

  :::indice
  Qui produit l'un, et qui écrit l'autre ?
  :::

  :::reponse
  `undefined` signifie qu'aucune valeur n'a été donnée : variable déclarée sans valeur,
  propriété absente, fonction sans `return`. C'est le moteur qui le produit. `null`
  signifie une absence volontaire : c'est le développeur qui l'écrit pour dire « il n'y a
  pas de valeur ». Les deux sont égaux avec `==` mais pas avec `===`, et `typeof null`
  vaut `'object'` par une erreur historique du langage.
  :::

- Comment tester qu'une valeur est `NaN`, et pourquoi `valeur === NaN` ne fonctionne-t-il
  pas ?

  :::indice
  À quoi `NaN` est-il égal ?
  :::

  :::reponse
  `NaN` n'est égal à aucune valeur, pas même à lui-même : `NaN === NaN` vaut `false`. On
  utilise donc `Number.isNaN(valeur)`, qui renvoie `true` seulement pour la valeur `NaN`.
  La fonction globale `isNaN` est à éviter : elle convertit d'abord son argument en
  nombre, si bien que `isNaN('abc')` vaut `true`.
  :::
