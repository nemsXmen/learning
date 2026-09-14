---
id: javascript-while
title: "while et do...while"
slug: while-et-do-while
technology: javascript
level: beginner
module: boucles
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-if-else
skills:
  - loops
tags:
  - javascript
  - boucles
---

## Objectifs

- Répéter un traitement tant qu'une condition est vraie, avec `while`.
- Utiliser `do...while` quand le corps doit s'exécuter au moins une fois.
- Écrire une condition de sortie fiable et reconnaître une boucle infinie.

## Introduction

Une condition choisit **si** un code s'exécute ; une boucle décide **combien de fois**.
`while` est la boucle la plus simple : elle répète tant qu'une condition reste vraie. Elle
convient quand on ne sait pas à l'avance combien de tours seront nécessaires — attendre
qu'un capital double, relancer un dé jusqu'à obtenir un 6, lire des lignes jusqu'à la
dernière. Sa contrepartie : si la condition ne devient jamais fausse, le programme ne
s'arrête plus.

## Concept

```js
while (condition) {
  // répété tant que la condition est vraie
}

do {
  // exécuté une première fois, puis répété tant que la condition est vraie
} while (condition);
```

| Boucle | Condition testée | Nombre minimal de tours | Usage typique |
| --- | --- | --- | --- |
| `while` | avant chaque tour | 0 | attendre qu'un état change |
| `do...while` | après chaque tour | 1 | demander une saisie, puis la vérifier |

Pour qu'une boucle se termine, **le corps doit modifier quelque chose dont dépend la
condition** : un compteur, une valeur calculée, une donnée lue.

## Exemple

```js
// Combien d'années pour doubler un capital placé à 5 % ?
let capital = 1000;
let annees = 0;

while (capital < 2000) {
  capital *= 1.05;
  annees++;
}

console.log(annees); // 15
console.log(capital.toFixed(2)); // '2078.93'
```

```js
// Lancer un dé jusqu'à obtenir un 6 : il faut au moins un lancer
let lancers = 0;
let valeur;

do {
  valeur = Math.floor(Math.random() * 6) + 1;
  lancers++;
} while (valeur !== 6);

console.log(`6 obtenu après ${lancers} lancer(s)`);
```

## Comment ça fonctionne

`while` évalue sa condition, la convertit en booléen, exécute le corps si elle est vraie,
puis recommence. Si la condition est fausse dès le départ, le corps ne s'exécute jamais.

`do...while` exécute d'abord le corps, puis évalue la condition. C'est la bonne forme
quand la condition dépend de ce que le corps produit : on ne peut pas tester un lancer de
dé avant de l'avoir fait.

Une boucle dont la condition reste toujours vraie tourne indéfiniment : le script ne
rend jamais la main. Dans un navigateur, l'onglet se fige ; dans Node.js, le processus
occupe un cœur à 100 %. Un piège fréquent vient des décimaux :

```js
let x = 0;
while (x !== 1) {
  x += 0.1; // x vaut 0.9999999999999999 après dix tours, puis 1.0999999999999999
}
// ne s'arrête jamais
```

`x` ne vaut jamais exactement `1`. On compare avec `<`, ou mieux, on compte avec un
entier.

## Erreurs fréquentes

**Oublier de mettre à jour la variable de la condition.** Le compteur ne bouge pas, la
condition reste vraie, la boucle ne s'arrête jamais.

**Tester l'égalité exacte d'un décimal.** `while (x !== 1)` avec des pas de `0.1` ne se
termine pas. Compte en entiers, ou compare avec `<`.

**Choisir `while` quand le corps doit s'exécuter au moins une fois.** On finit par
dupliquer le code avant la boucle. `do...while` exprime directement l'intention.

**Se tromper d'un tour.** `<` ou `<=` : vérifie mentalement le premier et le dernier tour,
avec les plus petites valeurs possibles.

## À retenir

- `while` teste avant chaque tour : il peut ne jamais s'exécuter.
- `do...while` teste après : il s'exécute toujours au moins une fois.
- Le corps doit faire évoluer ce que teste la condition.
- Ne teste jamais l'égalité exacte d'un décimal dans une condition de boucle.

## Exercices

1. Affiche un compte à rebours de 10 à 1, puis « Décollage ! », avec une boucle `while`.

   :::indice
   Pars de 10, décrémente à chaque tour, et continue tant que le compteur est supérieur à 0.
   :::

   :::solution
   ```js
   let compteur = 10;

   while (compteur > 0) {
     console.log(compteur);
     compteur--;
   }

   console.log('Décollage !');
   ```
   :::

2. Simule des lancers de dé jusqu'à obtenir un 6, puis affiche le nombre de lancers.

   :::indice
   `Math.floor(Math.random() * 6) + 1` donne un entier entre 1 et 6.
   :::

   :::indice
   On ne peut pas tester le résultat avant d'avoir lancé le dé : quelle boucle exécute son
   corps avant de tester ?
   :::

   :::solution
   ```js
   let lancers = 0;
   let valeur;

   do {
     valeur = Math.floor(Math.random() * 6) + 1;
     lancers++;
   } while (valeur !== 6);

   console.log(`Un 6 après ${lancers} lancer(s)`);
   ```

   Avec `while`, il aurait fallu initialiser `valeur` à une valeur arbitraire différente de 6
   pour entrer dans la boucle.
   :::

3. Cette boucle doit s'arrêter après dix pas de 0,1, mais elle ne s'arrête jamais.
   Explique pourquoi et corrige-la.

   ```js
   let x = 0;
   while (x !== 1) {
     x += 0.1;
   }
   ```

   :::indice
   Affiche `x` à chaque tour et regarde sa valeur au dixième.
   :::

   :::solution
   `0.1` n'a pas de représentation binaire exacte : après dix additions, `x` vaut
   `0.9999999999999999`, puis dépasse `1` sans jamais l'égaler. La condition `x !== 1` reste
   vraie.

   ```js
   let dixiemes = 0;
   while (dixiemes < 10) {
     dixiemes++;
   }
   const x = dixiemes / 10;
   console.log(x); // 1
   ```

   On compte avec un entier, exact, et on ne calcule le décimal qu'à la fin. Remplacer
   `!==` par `<` ne suffirait pas : `0.9999999999999999 < 1` est vrai, la boucle ferait un
   onzième tour.
   :::

## Questions d'entretien

- Quelle est la différence entre `while` et `do...while` ?

  :::indice
  À quel moment chacune évalue-t-elle sa condition ?
  :::

  :::reponse
  `while` évalue la condition avant chaque tour : si elle est fausse dès le départ, le
  corps ne s'exécute jamais. `do...while` exécute le corps puis évalue la condition : le
  corps s'exécute au moins une fois. On choisit `do...while` quand la condition dépend de ce
  que produit le corps, comme une saisie qu'on vérifie après l'avoir demandée.
  :::

- Comment éviter une boucle infinie ?

  :::indice
  Qu'est-ce qui doit changer à chaque tour pour que la condition finisse par être fausse ?
  :::

  :::reponse
  Le corps doit faire progresser la condition vers sa fin : incrémenter un compteur,
  consommer une donnée, recalculer une valeur. On évite les égalités exactes sur des
  décimaux, on préfère `<` et `>` à `!==` pour les bornes, et quand la fin dépend de
  l'extérieur — une réponse réseau, une saisie —, on ajoute une limite de sécurité, par
  exemple un nombre maximal de tentatives.
  :::

- Pourquoi `while (x !== 1)` avec des pas de `0.1` ne s'arrête-t-il jamais ?

  :::indice
  Quelle est la valeur réelle de `x` après dix additions de `0.1` ?
  :::

  :::reponse
  `0.1` est stocké de façon approchée en binaire. Les erreurs s'accumulent : après dix
  additions, `x` vaut `0.9999999999999999`, puis `1.0999999999999999` au tour suivant. Il ne
  vaut jamais exactement `1`, donc `x !== 1` reste vrai. La solution est de compter avec un
  entier et de n'en déduire le décimal qu'au moment de s'en servir.
  :::
