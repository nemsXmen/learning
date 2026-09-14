---
id: javascript-operateurs-logiques
title: "Opérateurs logiques et évaluation en court-circuit"
slug: operateurs-logiques
technology: javascript
level: beginner
module: operateurs
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-comparaisons
skills:
  - logical-operators
tags:
  - javascript
  - operateurs
---

## Objectifs

- Utiliser `&&`, `||` et `!`, et savoir qu'ils renvoient un opérande, pas un booléen.
- Exploiter l'évaluation en court-circuit, et connaître son piège avec `0` et `''`.
- Simplifier une condition avec les lois de De Morgan.

## Introduction

Dans la plupart des langages, `a || b` vaut `true` ou `false`. En JavaScript, `a || b`
renvoie **l'une des deux valeurs**. Ce détail est à l'origine de raccourcis très utilisés
— `nom || 'invité'` — et d'un bug tout aussi répandu : une quantité de `0` remplacée par
une valeur par défaut. Comprendre ce que renvoient réellement ces opérateurs, et quand ils
s'arrêtent d'évaluer, rend ce code à la fois plus sûr et plus lisible.

## Concept

| Opérateur | Renvoie | Exemple | Résultat |
| --- | --- | --- | --- |
| `a && b` | `a` si `a` est falsy, sinon `b` | `'Ada' && 'Grace'` | `'Grace'` |
| `a \|\| b` | `a` si `a` est truthy, sinon `b` | `'' \|\| 'invité'` | `'invité'` |
| `!a` | le booléen inverse | `!'Ada'` | `false` |

Une valeur **falsy** est considérée comme fausse dans un contexte booléen. Il y en a huit :
`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined` et `NaN`. Toutes les autres sont
**truthy** — y compris `'0'`, `'false'` et `[]`. Le chapitre « Truthy et falsy » y revient
en détail.

L'**évaluation en court-circuit** : dès que le résultat est connu, l'opérande de droite
n'est pas évalué.

- `a && b` : si `a` est falsy, `b` n'est jamais évalué ;
- `a || b` : si `a` est truthy, `b` n'est jamais évalué.

`!!valeur` convertit n'importe quelle valeur en booléen, comme `Boolean(valeur)`.

## Exemple

```js
const utilisateur = { nom: 'Ada', role: '' };

// || : une valeur par défaut
const affichage = utilisateur.role || 'membre';
console.log(affichage); // 'membre'

// && : n'exécuter la suite que si la première valeur est truthy
const estConnecte = true;
estConnecte && console.log('Bienvenue'); // affiche 'Bienvenue'

// Le court-circuit évite une erreur
const client = null;
const ville = client && client.ville; // null, sans TypeError
console.log(ville); // null

// Conversion en booléen
console.log(!!'Ada', !!''); // true false
```

## Comment ça fonctionne

Les opérateurs sont évalués de gauche à droite, avec une priorité : `!` d'abord, puis
`&&`, puis `||`. Ainsi `a || b && c` se lit `a || (b && c)`.

`a && b || c` ressemble à un ternaire `a ? b : c`, mais ne l'est pas : si `b` est falsy, le
résultat est `c`, même quand `a` est vrai.

```js
const estAdmin = true;
const libelle = estAdmin && '' || 'Invité'; // 'Invité' : le '' falsy fait basculer
```

Les **lois de De Morgan** permettent de supprimer une négation autour d'un groupe :

```js
!(a && b) === (!a || !b); // toujours vrai
!(a || b) === (!a && !b); // toujours vrai
```

Enfin, `||` pour une valeur par défaut remplace **toute** valeur falsy, y compris `0`,
`''` et `false`, qui sont souvent des valeurs légitimes. Pour ne remplacer que `null` et
`undefined`, on utilise `??`, présenté au chapitre suivant.

## Erreurs fréquentes

**Utiliser `||` pour une valeur par défaut numérique.** `quantite || 1` transforme une
quantité de `0` en `1`. Utilise `quantite ?? 1`.

**Supposer que `&&` et `||` renvoient un booléen.** `'Ada' || 'Grace'` vaut `'Ada'`. Si
un vrai booléen est nécessaire, écris `Boolean(a || b)`.

**Remplacer un ternaire par `a && b || c`.** Le résultat est faux dès que `b` est falsy.
Écris `a ? b : c`.

**Empiler des négations.** `!(!estActif || !estVerifie)` se lit mal. Applique De Morgan :
`estActif && estVerifie`.

## À retenir

- `&&` et `||` renvoient l'un de leurs opérandes, pas nécessairement un booléen.
- Le court-circuit n'évalue pas l'opérande de droite quand le résultat est déjà connu.
- Huit valeurs falsy : `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, `NaN`.
- `||` remplace toute valeur falsy ; pour `0` ou `''` légitimes, utilise `??`.
- `!(a && b)` équivaut à `!a || !b`.

## Exercices

1. Prévois la valeur de chaque expression : `'' || 'invité'`, `0 || 10`,
   `'Ada' && 'Grace'`, `null && 'x'`, `!!'false'`.

   :::indice
   `||` renvoie la première valeur truthy, ou la dernière valeur. `&&` renvoie la première
   valeur falsy, ou la dernière valeur.
   :::

   :::solution
   - `'' || 'invité'` : `'invité'`, car `''` est falsy.
   - `0 || 10` : `10`, car `0` est falsy.
   - `'Ada' && 'Grace'` : `'Grace'`, car `'Ada'` est truthy.
   - `null && 'x'` : `null`, le court-circuit s'arrête sur la valeur falsy.
   - `!!'false'` : `true`, une chaîne non vide est truthy, quel que soit son contenu.
   :::

2. Ce code doit utiliser `1` quand l'utilisateur ne saisit rien, mais il remplace aussi une
   quantité de `0` voulue. Explique le problème et corrige-le.

   ```js
   const quantite = quantiteSaisie || 1;
   ```

   :::indice
   Pour `||`, `0` est une valeur falsy comme `undefined`. Il faut un opérateur qui ne
   réagit qu'à `null` et `undefined`.
   :::

   :::solution
   `0` est falsy : `0 || 1` vaut `1`, et la quantité voulue est perdue.

   ```js
   const quantite = quantiteSaisie ?? 1;
   ```

   `??` ne remplace que `null` et `undefined` : `0 ?? 1` vaut `0`.
   :::

3. Réécris `if (!(estAdmin && estConnecte))` sans parenthèses autour du `&&`.

   :::indice
   La négation d'un « et » est un « ou » des négations.
   :::

   :::solution
   ```js
   if (!estAdmin || !estConnecte) {
     console.log('Accès refusé');
   }
   ```

   D'après la loi de De Morgan, `!(a && b)` équivaut à `!a || !b` : on refuse l'accès dès
   qu'une des deux conditions manque.
   :::

## Questions d'entretien

- Que renvoie exactement `a || b` en JavaScript ?

  :::indice
  Est-ce forcément `true` ou `false` ?
  :::

  :::reponse
  `a || b` renvoie `a` si `a` est truthy, sinon `b`, sans conversion en booléen. De même,
  `a && b` renvoie `a` si `a` est falsy, sinon `b`. C'est ce qui permet d'écrire
  `nom || 'invité'`. Pour obtenir un vrai booléen, on écrit `Boolean(a || b)` ou
  `!!(a || b)`.
  :::

- Qu'est-ce que l'évaluation en court-circuit, et à quoi sert-elle ?

  :::indice
  Pense à `client && client.ville` quand `client` vaut `null`.
  :::

  :::reponse
  L'évaluation s'arrête dès que le résultat est connu : avec `&&`, si le premier opérande
  est falsy, le second n'est pas évalué ; avec `||`, si le premier est truthy non plus. On
  s'en sert pour éviter une erreur (`client && client.ville`), pour exécuter du code sous
  condition (`estPret && lancer()`) ou pour fournir une valeur par défaut. Les appels de
  fonction placés à droite n'ont alors pas lieu, ce qui compte s'ils ont des effets de bord.
  :::

- Pourquoi `valeur || défaut` est-il dangereux pour des nombres ou des chaînes ?

  :::indice
  Quelles valeurs légitimes sont aussi falsy ?
  :::

  :::reponse
  `||` remplace toute valeur falsy. Or `0`, `''` et `false` sont souvent des valeurs
  valides : un volume à 0, un commentaire vide, une option désactivée. `volume || 50`
  transforme un volume de 0 en 50. L'opérateur `??` ne remplace que `null` et `undefined`,
  ce qui correspond presque toujours à l'intention réelle d'une valeur par défaut.
  :::
