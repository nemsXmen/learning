---
id: javascript-hoisting
title: "Hoisting et zone morte temporelle"
slug: hoisting-et-tdz
technology: javascript
level: intermediate
module: portee
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-portees
skills:
  - hoisting-tdz
tags:
  - javascript
  - portee
---

## Objectifs

- Expliquer ce que le moteur fait avant d'exécuter la première ligne d'une portée.
- Distinguer le comportement de `var`, de `let`, de `const` et des déclarations de fonction.
- Reconnaître une erreur de zone morte temporelle et savoir quoi corriger.

## Introduction

`console.log(x)` avant `var x = 1` affiche `undefined`. La même chose avec `let x = 1` lève
une erreur. Et une fonction déclarée en bas de fichier s'appelle depuis le haut sans
problème. Ces trois comportements viennent du même mécanisme : le moteur **prépare** chaque
portée avant de l'exécuter. Ce chapitre décrit cette préparation, appelée hoisting.

## Concept

L'exécution d'une portée se fait en deux temps :

1. **Création** : le moteur enregistre toutes les déclarations qu'elle contient.
2. **Exécution** : il déroule les instructions ligne à ligne.

Ce que vaut chaque déclaration pendant la phase de création :

| Déclaration | Enregistrée | Utilisable avant sa ligne |
| --- | --- | --- |
| `function nom() {}` | avec son corps | oui |
| `var x` | avec la valeur `undefined` | oui, mais vaut `undefined` |
| `let x` / `const x` | sans valeur, en zone morte | non : `ReferenceError` |
| `class X {}` | sans valeur, en zone morte | non : `ReferenceError` |
| `const f = function () {}` | selon la variable, donc en zone morte | non |

La **zone morte temporelle** est l'intervalle entre le début de la portée et la ligne de
déclaration, pendant lequel toute lecture du nom échoue.

## Exemple

```js
console.log(compteur); // undefined : déclaré, pas encore affecté
var compteur = 1;
console.log(compteur); // 1

// console.log(total); // ReferenceError: Cannot access 'total' before initialization
let total = 10;
console.log(total); // 10

console.log(saluer()); // 'Bonjour' : la déclaration est hoistée avec son corps
function saluer() {
  return 'Bonjour';
}

// console.log(direAurevoir()); // ReferenceError
const direAurevoir = () => 'Au revoir';

console.log(typeof jamaisDeclare); // 'undefined' : aucune erreur
// console.log(typeof enZoneMorte); // ReferenceError, malgré le typeof
let enZoneMorte = 1;
```

## Comment ça fonctionne

Le terme « hoisting » — hissage — décrit une illusion utile : tout se passe comme si les
déclarations étaient remontées en haut de leur portée. En réalité, rien ne bouge : le moteur
parcourt la portée avant de l'exécuter et enregistre les noms qu'elle déclare. Seules les
**déclarations** sont traitées à ce moment, jamais les **affectations**.

D'où le comportement de `var` : le nom existe dès le début de la fonction avec la valeur
`undefined`, et ne reçoit sa vraie valeur qu'à sa ligne. Le code semble fonctionner mais
manipule `undefined`, ce qui produit des bugs silencieux.

`let` et `const` sont aussi enregistrés pendant la phase de création, mais **sans valeur** :
toute lecture avant leur ligne lève `ReferenceError: Cannot access 'x' before
initialization`. C'est un choix délibéré : transformer une erreur silencieuse en erreur
bruyante, au plus près de la cause. Les classes suivent la même règle.

Un détail qui tombe souvent en entretien : `typeof` protège d'une variable **jamais
déclarée**, et renvoie `'undefined'` sans erreur ; mais il ne protège pas d'une variable en
zone morte, qui lève quand même. La zone morte n'est donc pas un simple « pas encore
défini », c'est un état d'erreur.

Les déclarations de fonction, elles, sont hoistées **avec leur corps**, ce qui permet
d'appeler une fonction définie plus bas — pratique pour placer les détails après l'essentiel.
Une expression de fonction, `const f = () => {}`, suit la règle de sa variable et n'offre pas
cette liberté.

En mode strict, une déclaration de fonction à l'intérieur d'un bloc reste limitée à ce bloc.
Dans l'ancien mode non strict, son comportement variait selon les moteurs : c'est une
construction à éviter.

## Erreurs fréquentes

**Compter sur le hoisting pour lire une variable avant sa ligne.** Avec `var`, elle vaut
`undefined` ; avec `let`, c'est une erreur.

**Croire que `typeof` protège toujours.** Il ne protège pas de la zone morte.

**Redéclarer avec `var`.** `var x` deux fois passe silencieusement ; `let x` deux fois est
une erreur de syntaxe, ce qui est préférable.

**Déclarer une fonction dans un `if`.** Préfère une expression affectée à une `const`.

## À retenir

- Deux phases : création, où les déclarations sont enregistrées, puis exécution.
- `var` : hoistée à `undefined`. `let` / `const` / `class` : en zone morte.
- Les déclarations de fonction sont hoistées avec leur corps, pas les expressions.
- `typeof` ne protège pas d'une variable en zone morte.
- Déclare avant d'utiliser : le hoisting explique le passé, il ne s'exploite pas.

## Exercices

1. Prédis l'affichage, puis explique chaque ligne.

   ```js
   console.log(a);
   var a = 1;
   console.log(b);
   let b = 2;
   ```

   :::indice
   Les deux déclarations sont enregistrées avant l'exécution, mais pas dans le même état.
   :::

   :::solution
   La première ligne affiche `undefined` : `var a` est enregistrée avec cette valeur dès la
   phase de création, et ne reçoit `1` qu'à sa ligne. La troisième lève
   `ReferenceError: Cannot access 'b' before initialization` : `let b` est enregistrée sans
   valeur et reste en zone morte jusqu'à sa déclaration. L'exécution s'arrête donc là.

   ```js
   var a = 1;
   let b = 2;
   console.log(a, b); // 1 2 : déclarer avant d'utiliser évite la question
   ```
   :::

2. Explique pourquoi le premier appel fonctionne et pas le second.

   ```js
   console.log(carreDeclare(3));
   console.log(carreExpression(3));
   function carreDeclare(n) { return n * n; }
   const carreExpression = (n) => n * n;
   ```

   :::indice
   Qu'est-ce qui est hoisté avec son corps, et qu'est-ce qui suit sa variable ?
   :::

   :::solution
   `carreDeclare` est une déclaration de fonction : elle est enregistrée avec son corps dès la
   phase de création, donc appelable avant sa ligne. `carreExpression` est une `const` qui
   reçoit une fonction : elle reste en zone morte jusqu'à sa ligne, et l'appel lève
   `ReferenceError: Cannot access 'carreExpression' before initialization`.
   :::

3. Montre que `typeof` ne protège pas d'une variable en zone morte.

   :::indice
   Compare une variable jamais déclarée et une variable déclarée plus bas avec `let`.
   :::

   :::solution
   ```js
   console.log(typeof jamaisDeclare); // 'undefined' : aucune erreur

   function test() {
     console.log(typeof enZoneMorte); // ReferenceError
     let enZoneMorte = 1;
   }
   ```

   `typeof` ne fait exception que pour les noms totalement inconnus. Dès qu'un nom est déclaré
   dans la portée, la zone morte s'applique, `typeof` compris.
   :::

## Questions d'entretien

- Qu'est-ce que le hoisting, exactement ?

  :::indice
  Qu'est-ce qui est traité avant l'exécution : les déclarations, les affectations, ou les
  deux ?
  :::

  :::reponse
  C'est le fait que le moteur enregistre toutes les **déclarations** d'une portée avant de
  l'exécuter. Rien n'est déplacé dans le code : la phase de création crée les liaisons, la
  phase d'exécution déroule les instructions. Les affectations ne sont jamais hoistées, ce qui
  explique qu'une `var` lue trop tôt vaille `undefined`, et qu'une fonction déclarée en bas de
  fichier soit appelable en haut.
  :::

- Qu'est-ce que la zone morte temporelle, et à quoi sert-elle ?

  :::indice
  Que se passe-t-il entre le début de la portée et la ligne du `let` ?
  :::

  :::reponse
  C'est l'intervalle entre l'entrée dans la portée et la ligne de déclaration d'un `let`,
  d'un `const` ou d'une classe : la liaison existe mais n'a pas de valeur, et toute lecture
  lève une `ReferenceError`. Son but est de rendre bruyante une erreur qui, avec `var`, serait
  silencieuse : au lieu d'obtenir `undefined` et de le découvrir trois fonctions plus loin, on
  échoue précisément à la ligne fautive.
  :::

- Les déclarations de fonction et les expressions se comportent-elles pareil ?

  :::indice
  Essaie d'appeler chacune avant sa ligne.
  :::

  :::reponse
  Non. Une déclaration est hoistée avec son corps : elle est utilisable partout dans sa
  portée, y compris avant sa ligne. Une expression — fonction anonyme ou fléchée affectée à
  une variable — suit les règles de cette variable : avec `const` ou `let`, elle est en zone
  morte jusqu'à sa ligne. C'est pourquoi un fichier écrit avec des `const` impose de déclarer
  avant d'utiliser, ce qui se lit mieux.
  :::
