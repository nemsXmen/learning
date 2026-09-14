---
id: javascript-operateurs-arithmetiques
title: "Opérateurs arithmétiques et d'affectation"
slug: operateurs-arithmetiques
technology: javascript
level: beginner
module: operateurs
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-types-primitifs
skills:
  - arithmetic-assignment
tags:
  - javascript
  - operateurs
---

## Objectifs

- Utiliser `+`, `-`, `*`, `/`, `%` et `**`, et les affectations composées.
- Distinguer `n++` et `++n` quand ils apparaissent dans une expression.
- Prévoir quand `+` additionne et quand il concatène.

## Introduction

Calculer un total, répartir des minutes en heures, faire tourner un index : les
opérateurs arithmétiques sont partout. Ils sont simples, à une exception près qui
cause des bugs dans toutes les bases de code — l'opérateur `+`, qui additionne des
nombres mais **concatène** dès qu'une chaîne est impliquée.

## Concept

| Opérateur | Rôle | Exemple | Résultat |
| --- | --- | --- | --- |
| `+` | addition ou concaténation | `7 + 2` | `9` |
| `-` | soustraction | `7 - 2` | `5` |
| `*` | multiplication | `7 * 2` | `14` |
| `/` | division | `7 / 2` | `3.5` |
| `%` | reste de la division | `7 % 2` | `1` |
| `**` | puissance | `7 ** 2` | `49` |

Les **affectations composées** combinent calcul et affectation : `total += 5` équivaut à
`total = total + 5`. Il en existe pour chaque opérateur : `-=`, `*=`, `/=`, `%=`, `**=`.

L'**incrémentation** `++` ajoute 1, la **décrémentation** `--` retire 1. Leur position
compte quand on utilise leur valeur :

| Écriture | Valeur de l'expression | Valeur de `n` ensuite |
| --- | --- | --- |
| `n++` (suffixe) | l'ancienne valeur | ancienne + 1 |
| `++n` (préfixe) | la nouvelle valeur | ancienne + 1 |

## Exemple

```js
const prixUnitaire = 12;
const quantite = 3;
let total = prixUnitaire * quantite; // 36
total -= 6; // remise : 30
total *= 1.2; // TVA : 36

const minutes = 135;
const heures = Math.floor(minutes / 60); // 2
const reste = minutes % 60; // 15
console.log(`${heures} h ${reste} min`); // 2 h 15 min

console.log(10 % 2 === 0); // true : 10 est pair
console.log(2 ** 10); // 1024

let n = 5;
const avant = n++; // avant vaut 5, n vaut 6
const apres = ++n; // apres vaut 7, n vaut 7
```

## Comment ça fonctionne

`+` est le seul opérateur arithmétique qui a deux rôles. Si **l'un des deux** opérandes
est une chaîne, il convertit l'autre en chaîne et concatène. Les autres opérateurs
convertissent toujours leurs opérandes en nombres :

```js
console.log('5' + 1); // '51'
console.log('5' - 1); // 4
console.log('6' * '7'); // 42
console.log('abc' * 2); // NaN
console.log(+'42'); // 42 : le + unaire convertit en nombre
```

L'évaluation se fait de gauche à droite, ce qui change le résultat dès qu'une chaîne
apparaît au milieu :

```js
console.log(1 + 2 + '3'); // '33' : 1 + 2 = 3, puis 3 + '3'
console.log('1' + 2 + 3); // '123' : '1' + 2 = '12', puis '12' + 3
```

Le reste `%` prend **le signe du dividende** : `-7 % 3` vaut `-1`, pas `2`. Ce n'est pas le
modulo des mathématiques. La division par zéro ne lève pas d'erreur : `1 / 0` vaut
`Infinity`, et `0 / 0` vaut `NaN`.

## Erreurs fréquentes

**Additionner une valeur venue d'un formulaire.** Les champs renvoient des chaînes :
`champ.value + 1` concatène. Convertis avec `Number(...)` avant de calculer.

**Utiliser `n++` dans une expression sans en connaître la valeur.** `const x = n++`
affecte l'**ancienne** valeur. Pour éviter l'ambiguïté, incrémente sur une ligne à part.

**Compter sur `%` pour un modulo positif.** `-1 % 7` vaut `-1`. Pour faire tourner un index
dans les deux sens, écris `((index % taille) + taille) % taille`.

**Calculer de l'argent en décimaux.** `0.1 * 3` vaut `0.30000000000000004`. Calcule en
centimes.

## À retenir

- `+` concatène dès qu'une chaîne est présente ; `-`, `*`, `/`, `%` convertissent en
  nombre.
- L'évaluation va de gauche à droite : `1 + 2 + '3'` vaut `'33'`.
- `n++` vaut l'ancienne valeur, `++n` la nouvelle.
- `%` prend le signe du dividende ; `1 / 0` vaut `Infinity`.

## Exercices

1. Convertis 3725 secondes en heures, minutes et secondes, et affiche `1 h 2 min 5 s`.

   :::indice
   Une heure compte 3600 secondes. `Math.floor` donne le nombre d'heures entières, `%` ce
   qui reste.
   :::

   :::indice
   Applique le même raisonnement au reste, avec 60 secondes par minute.
   :::

   :::solution
   ```js
   const total = 3725;
   const heures = Math.floor(total / 3600); // 1
   const resteApresHeures = total % 3600; // 125
   const minutes = Math.floor(resteApresHeures / 60); // 2
   const secondes = resteApresHeures % 60; // 5

   console.log(`${heures} h ${minutes} min ${secondes} s`); // 1 h 2 min 5 s
   ```
   :::

2. Sans l'exécuter, prévois les valeurs de `a` et `b` après ce code.

   ```js
   let a = 3;
   const b = a++ + ++a;
   ```

   :::indice
   `a++` produit la valeur **avant** incrémentation, `++a` la valeur **après**. Évalue de
   gauche à droite.
   :::

   :::solution
   `a++` vaut `3` et fait passer `a` à `4`. Puis `++a` fait passer `a` à `5` et vaut `5`.
   Donc `b` vaut `3 + 5 = 8`, et `a` vaut `5`.

   Ce code est correct, mais illisible : dans un vrai projet, on incrémente sur des lignes
   séparées.
   :::

3. Un tableau contient les 7 jours de la semaine. Écris le calcul qui transforme n'importe
   quel index, même négatif ou supérieur à 6, en un index valide entre 0 et 6.

   :::indice
   `%` garde le signe du dividende : `-1 % 7` vaut `-1`. Ajoute la taille avant un second
   `%`.
   :::

   :::solution
   ```js
   const TAILLE = 7;

   const indexValide = (index) => ((index % TAILLE) + TAILLE) % TAILLE;

   console.log(indexValide(9)); // 2
   console.log(indexValide(-1)); // 6
   console.log(indexValide(-8)); // 6
   ```

   Le premier `%` ramène l'index entre `-6` et `6`, l'addition le rend positif, le second
   `%` le ramène entre `0` et `6`.
   :::

## Questions d'entretien

- Pourquoi `'5' + 1` vaut-il `'51'`, alors que `'5' - 1` vaut `4` ?

  :::indice
  Parmi les opérateurs arithmétiques, lequel sert aussi à autre chose qu'aux nombres ?
  :::

  :::reponse
  `+` sert à la fois à additionner et à concaténer. Dès qu'un opérande est une chaîne,
  l'autre est converti en chaîne et les deux sont concaténés. `-`, `*`, `/` et `%` n'ont
  qu'un sens numérique : ils convertissent leurs opérandes en nombres, d'où `'5' - 1` égal
  à `4`. Pour additionner des valeurs venues de l'extérieur, on les convertit explicitement
  avec `Number`.
  :::

- Quelle est la différence entre `i++` et `++i` ?

  :::indice
  Les deux modifient `i` de la même façon. Ce qui change, c'est la valeur que produit
  l'expression.
  :::

  :::reponse
  Les deux ajoutent 1 à `i`. `i++`, en position suffixe, renvoie la valeur avant
  incrémentation ; `++i`, en position préfixe, renvoie la valeur après. La différence ne
  compte que si l'on utilise le résultat, comme dans `const x = i++`. Seule sur sa ligne,
  par exemple dans une boucle `for`, l'une ou l'autre écriture a exactement le même effet.
  :::

- Que vaut `-7 % 3` en JavaScript, et pourquoi ?

  :::indice
  Le résultat de `%` suit le signe de l'un des deux opérandes. Lequel ?
  :::

  :::reponse
  `-7 % 3` vaut `-1`. L'opérateur `%` calcule le reste de la division tronquée, et ce reste
  prend le signe du dividende, ici `-7`. Ce n'est donc pas le modulo mathématique, qui
  donnerait `2`. Pour obtenir un résultat toujours positif, on écrit
  `((n % m) + m) % m`.
  :::
