---
id: javascript-truthy-falsy
title: "Truthy et falsy : ce que JavaScript considère comme vrai"
slug: truthy-et-falsy
technology: javascript
level: beginner
module: conditions
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-if-else
skills:
  - truthiness
tags:
  - javascript
  - conditions
---

## Objectifs

- Connaître par cœur les valeurs falsy.
- Savoir que `'0'`, `'false'`, `[]` et `{}` sont truthy.
- Écrire des conditions explicites quand `0`, `''` ou un tableau vide sont des cas
  légitimes.

## Introduction

`if (panier.length)`, `if (!nom)`, `while (element)` : le code JavaScript utilise sans
cesse des valeurs qui ne sont pas des booléens comme conditions. Le langage les convertit
selon une règle simple, qui tient en huit valeurs. Cette règle rend le code concis, mais
elle fait aussi disparaître des cas légitimes — un âge de 0, un commentaire vide, une
remise de 0 € — quand on l'applique sans y penser.

## Concept

Une valeur est **falsy** si elle devient `false` lorsqu'on la convertit en booléen. Il y en
a exactement huit :

| Valeur falsy | Type |
| --- | --- |
| `false` | boolean |
| `0` et `-0` | number |
| `0n` | bigint |
| `''` | string |
| `null` | null |
| `undefined` | undefined |
| `NaN` | number |

**Toutes les autres valeurs sont truthy**, y compris celles qui « ont l'air fausses » :

| Valeur truthy surprenante | Pourquoi |
| --- | --- |
| `'0'`, `'false'` | une chaîne non vide est truthy, quel que soit son contenu |
| `' '` | un espace, c'est une chaîne non vide |
| `[]`, `{}` | tout objet est truthy, même vide |
| `new Boolean(false)` | c'est un objet, donc truthy |

On obtient explicitement la valeur booléenne avec `Boolean(valeur)` ou `!!valeur`.

## Exemple

```js
const panier = [];
const commentaire = '   ';
const quantite = 0;

if (panier) console.log('Toujours affiché : un tableau vide est truthy');
if (panier.length > 0) console.log('Jamais affiché : le panier est vide');

if (commentaire) console.log('Affiché : des espaces, c’est une chaîne non vide');
if (commentaire.trim()) console.log('Jamais affiché : trim() renvoie une chaîne vide');

if (!quantite) console.log('Affiché : 0 est falsy, même s’il est légitime');

console.log(Boolean('false'), Boolean(0), !!NaN); // true false false
```

## Comment ça fonctionne

Les instructions et opérateurs qui attendent une condition appliquent l'opération
abstraite **ToBoolean** : `if`, `while`, `for`, le ternaire `? :`, `!`, `&&` et `||`.
Cette conversion ne regarde que la liste des huit valeurs falsy ; elle ne regarde jamais
le contenu d'un objet.

Il ne faut pas confondre cette conversion avec celle de `==`, qui transforme en nombre :

```js
console.log(Boolean([])); // true : tout objet est truthy
console.log([] == false); // true : [] devient '', puis 0 ; false devient 0
```

Un tableau vide est donc truthy dans un `if`, tout en étant « égal » à `false` avec `==`.
Encore une raison de préférer `===`.

La vérité implicite est un raccourci pour « cette valeur existe et n'est pas vide ». Elle
est parfaite quand **toutes** les valeurs falsy doivent être traitées de la même façon, et
dangereuse dès que l'une d'elles est un cas normal.

## Erreurs fréquentes

**Tester l'existence d'un nombre avec `if (!valeur)`.** Un âge de 0, un stock de 0 ou une
remise de 0 sont traités comme absents. Teste `valeur === undefined`, ou `valeur == null`.

**Tester un tableau avec `if (tableau)`.** Un tableau vide est truthy. Teste
`tableau.length > 0`.

**Tester le texte d'un formulaire avec `if (texte)`.** Une saisie faite uniquement
d'espaces passe. Teste `texte.trim() !== ''`.

**Comparer à la chaîne `'false'`.** Une valeur venue d'un formulaire ou d'une URL est
une chaîne : `'false'` est truthy. Compare explicitement `valeur === 'true'`.

## À retenir

- Huit valeurs falsy : `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`.
- Tout le reste est truthy : `'0'`, `'false'`, `[]`, `{}`.
- `if (tableau)` est toujours vrai : teste `tableau.length`.
- Quand `0` ou `''` sont des valeurs légitimes, écris une condition explicite.

## Exercices

1. Classe ces valeurs en truthy et falsy : `0`, `'0'`, `''`, `' '`, `[]`, `{}`, `null`,
   `NaN`, `'false'`.

   :::indice
   Seules les huit valeurs de la liste sont falsy. Une chaîne est falsy uniquement si elle
   est vide.
   :::

   :::solution
   - Falsy : `0`, `''`, `null`, `NaN`.
   - Truthy : `'0'`, `' '`, `[]`, `{}`, `'false'`.

   Vérification rapide dans la console :
   `[0, '0', '', ' ', [], {}, null, NaN, 'false'].map(Boolean)`.
   :::

2. Ce code refuse d'inscrire un bébé dont l'âge vaut 0. Corrige la condition pour ne
   refuser qu'un âge absent.

   ```js
   if (!inscription.age) {
     console.log('Âge manquant');
   }
   ```

   :::indice
   `0` est falsy. Quelles valeurs représentent réellement « pas d'âge » ?
   :::

   :::solution
   ```js
   if (inscription.age === undefined || inscription.age === null) {
     console.log('Âge manquant');
   }
   ```

   `inscription.age == null` teste aussi `null` et `undefined` en une fois ; c'est l'un
   des rares usages acceptés de `==`.
   :::

3. Affiche « Panier vide » quand le tableau `panier` ne contient aucun article.

   :::indice
   Un tableau vide est un objet, donc truthy. Quelle propriété décrit son contenu ?
   :::

   :::solution
   ```js
   const panier = [];

   if (panier.length === 0) {
     console.log('Panier vide');
   }
   ```

   `if (!panier)` ne s'exécuterait jamais pour un tableau vide : il ne détecte que
   l'absence du tableau lui-même.
   :::

## Questions d'entretien

- Quelles sont les valeurs falsy en JavaScript ?

  :::indice
  Il y en a huit, réparties entre booléen, nombres, bigint, chaîne, `null` et `undefined`.
  :::

  :::reponse
  `false`, `0`, `-0`, `0n`, la chaîne vide `''`, `null`, `undefined` et `NaN`. Toutes les
  autres valeurs sont truthy, y compris `'0'`, `'false'`, les tableaux et objets vides.
  C'est l'opération ToBoolean, appliquée par `if`, `while`, le ternaire et les opérateurs
  logiques.
  :::

- Pourquoi `if ([])` exécute-t-il son bloc, alors que `[] == false` est vrai ?

  :::indice
  `if` et `==` n'appliquent pas la même conversion.
  :::

  :::reponse
  `if` convertit la valeur en booléen, et tout objet — même un tableau vide — est truthy.
  `==` suit une autre règle : il convertit les deux côtés en nombre. `false` devient `0`, et
  `[]` devient d'abord la chaîne vide, puis `0`. Les deux mécanismes donnent donc des
  résultats opposés, ce qui est l'une des raisons d'éviter `==`.
  :::

- Quand ne faut-il pas se reposer sur la vérité implicite d'une valeur ?

  :::indice
  Pense aux valeurs falsy qui peuvent être parfaitement légitimes.
  :::

  :::reponse
  Dès qu'une valeur falsy est un cas normal : un nombre qui peut valoir 0, une chaîne qui
  peut être vide, un booléen qui peut valoir `false`, ou un tableau qu'on veut savoir vide.
  `if (!stock)` traite alors un stock nul comme une donnée absente. On écrit une condition
  explicite : `stock === undefined`, `texte.trim() === ''`, `tableau.length === 0`.
  :::
