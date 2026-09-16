---
id: javascript-pieges-closures
title: "Pièges des closures"
slug: pieges-des-closures
technology: javascript
level: advanced
module: closures
order: 4
estimatedMinutes: 25
difficulty: 4
xp: 90
prerequisites:
  - javascript-closures
skills:
  - closure-pitfalls
tags:
  - javascript
  - closures
---

## Objectifs

- Expliquer le piège classique des closures dans une boucle `var`.
- Comprendre qu'une closure capture une **liaison**, pas une copie de valeur.
- Repérer les closures qui retiennent trop de mémoire.

## Introduction

`for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` affiche `3 3 3`. Ce résultat
est la question d'entretien la plus posée sur les closures, et il n'a rien d'un cas
artificiel : c'est la conséquence directe de ce qu'une closure capture. Le comprendre une
fois évite une famille entière de bugs.

## Concept

Une closure capture la **liaison** — l'emplacement de la variable — et non la valeur qu'elle
avait au moment de la création. Quand la fonction s'exécute plus tard, elle lit la valeur
**actuelle** de cette liaison.

| Situation | Conséquence |
| --- | --- |
| `var` dans une boucle | une seule liaison pour tous les tours |
| `let` dans une boucle | une nouvelle liaison à chaque tour |
| Capture d'un gros objet | l'objet reste en mémoire tant que la fonction vit |
| Écouteur d'événement non retiré | la closure et ce qu'elle retient survivent à la page |

## Exemple

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log('var', i)); // var 3, var 3, var 3
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log('let', j)); // let 0, let 1, let 2
}

// Correction historique, avant let : une fonction par tour.
for (var k = 0; k < 3; k++) {
  ((copie) => setTimeout(() => console.log('copie', copie)))(k); // 0, 1, 2
}

function creerFonctions() {
  const fonctions = [];
  for (var i = 0; i < 3; i++) {
    fonctions.push(() => i);
  }
  return fonctions;
}
console.log(creerFonctions().map((f) => f())); // [3, 3, 3]

function preparer() {
  const enorme = new Array(1_000_000).fill('x');
  const taille = enorme.length;
  return () => taille; // ne retient que le nombre
}
console.log(preparer()()); // 1000000
```

## Comment ça fonctionne

Une boucle `var` ne crée **qu'une seule liaison** `i`, partagée par tous les tours, puisque
`var` appartient à la fonction. Les trois fonctions passées à `setTimeout` capturent donc la
même liaison. Quand elles s'exécutent — après la fin de la boucle —, cette liaison vaut 3,
la valeur qui a fait sortir de la boucle. D'où `3 3 3`.

Une boucle `let` crée **une liaison par itération**, et le moteur y recopie la valeur de fin
de tour. Chaque fonction capture donc une liaison différente, et l'on obtient `0 1 2`. C'est
une règle spécifique aux boucles, introduite avec ES2015 précisément pour ce problème, et
c'est l'argument le plus concret en faveur de `let`.

Avant `let`, la solution consistait à créer une portée par tour avec une fonction appelée
immédiatement, qui recevait la valeur courante en argument — la variante avec `copie` dans
l'exemple. On rencontre encore ce motif dans du code ancien.

Le second piège est la **mémoire**. Une closure garde en vie tout l'environnement dont elle
dépend. Une fonction qui n'utilise qu'un nombre extrait d'un énorme tableau ne retient que ce
nombre si le tableau n'est plus référencé ; mais si elle mentionne le tableau, même dans une
branche jamais exécutée, il reste en mémoire. Le cas le plus courant en navigateur est
l'écouteur d'événement attaché à un élément supprimé : tant que l'écouteur n'est pas retiré,
la closure et les objets qu'elle référence survivent.

Dernier piège, plus discret : une closure lit la valeur **actuelle**, pas celle du moment de
sa création. Si l'on veut figer une valeur, il faut la copier explicitement dans une variable
locale.

## Erreurs fréquentes

**Utiliser `var` dans une boucle qui crée des fonctions.** Toutes voient la dernière valeur.

**Croire que la closure copie la valeur.** Elle lit la liaison au moment de l'exécution.

**Oublier de retirer un écouteur d'événement.** La closure retient l'élément et son
environnement.

**Capturer un gros objet pour en extraire une seule valeur.** Extrait la valeur avant, pour
que l'objet puisse être libéré.

## À retenir

- Une closure capture une liaison, pas une valeur figée.
- `var` dans une boucle : une seule liaison, donc la valeur finale partout.
- `let` dans une boucle : une liaison par itération, valeurs distinctes.
- Une closure maintient en vie tout ce qu'elle référence.
- Retire les écouteurs, et n'extrais que ce dont la fonction a réellement besoin.

## Exercices

1. Corrige ce code pour qu'il affiche `0 1 2`, de deux façons différentes.

   ```js
   for (var i = 0; i < 3; i++) {
     setTimeout(() => console.log(i));
   }
   ```

   :::indice
   Le problème est qu'une seule liaison `i` existe. Comment en obtenir une par tour ?
   :::

   :::solution
   ```js
   // 1. La déclaration de boucle crée une liaison par itération.
   for (let i = 0; i < 3; i++) {
     setTimeout(() => console.log(i)); // 0 1 2
   }

   // 2. Une fonction appelée immédiatement crée une portée par tour.
   for (var j = 0; j < 3; j++) {
     ((copie) => setTimeout(() => console.log(copie)))(j); // 0 1 2
   }
   ```

   La première est la bonne réponse en code moderne ; la seconde explique comment on faisait
   avant ES2015, et se rencontre encore.
   :::

2. Explique le résultat, puis corrige-le.

   ```js
   function creerBoutons(noms) {
     const actions = [];
     for (var i = 0; i < noms.length; i++) {
       actions.push(() => `clic sur ${noms[i]}`);
     }
     return actions;
   }
   console.log(creerBoutons(['a', 'b']).map((f) => f()));
   ```

   :::indice
   Que vaut `i` au moment où les fonctions sont enfin appelées ?
   :::

   :::solution
   Toutes les fonctions partagent la même liaison `i`, qui vaut 2 après la boucle :
   `noms[2]` est `undefined`, donc le résultat est
   `['clic sur undefined', 'clic sur undefined']`.

   ```js
   function creerBoutons(noms) {
     return noms.map((nom) => () => `clic sur ${nom}`);
   }
   console.log(creerBoutons(['a', 'b']).map((f) => f())); // ['clic sur a', 'clic sur b']
   ```

   `map` donne à chaque fonction son propre paramètre : le problème disparaît sans même parler
   de closures.
   :::

3. Montre qu'une closure peut retenir un objet volumineux, et corrige pour ne garder que ce
   qui est nécessaire.

   :::indice
   Extrais la valeur utile avant de créer la fonction, pour que l'objet ne soit plus
   référencé.
   :::

   :::solution
   ```js
   function mauvais() {
     const enorme = new Array(1_000_000).fill('x');
     return () => enorme.length; // retient tout le tableau
   }

   function bon() {
     const enorme = new Array(1_000_000).fill('x');
     const taille = enorme.length; // seule cette valeur est capturée
     return () => taille;
   }

   console.log(mauvais()(), bon()()); // 1000000 1000000
   ```

   Les deux donnent le même résultat, mais la première maintient le tableau en mémoire tant
   que la fonction renvoyée existe.
   :::

## Questions d'entretien

- Pourquoi `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i))` affiche-t-il
  `3 3 3` ?

  :::indice
  Combien de liaisons `i` la boucle crée-t-elle ?
  :::

  :::reponse
  Parce que `var` appartient à la fonction : la boucle ne crée qu'une seule liaison `i`,
  partagée par les trois fonctions. Les callbacks de `setTimeout` s'exécutent après la fin de
  la boucle, et lisent alors la valeur courante de cette liaison unique, soit 3. Avec `let`,
  le moteur crée une liaison par itération et le résultat devient `0 1 2`.
  :::

- Une closure capture-t-elle la valeur ou la variable ?

  :::indice
  Que se passe-t-il si la variable change après la création de la fonction ?
  :::

  :::reponse
  La variable — plus précisément la liaison. La fonction lit la valeur **au moment de son
  exécution**, pas de sa création : si la variable a changé entre-temps, la closure voit la
  nouvelle valeur. C'est ce qui permet à un compteur de fonctionner, et c'est aussi la cause
  du piège des boucles. Pour figer une valeur, il faut la copier dans une variable propre à
  la portée, ce que fait `let` à chaque tour.
  :::

- Comment une closure peut-elle provoquer une fuite mémoire ?

  :::indice
  Qu'arrive-t-il à l'environnement capturé tant que la fonction est référencée ?
  :::

  :::reponse
  Tant que la fonction vit, l'environnement qu'elle capture reste en mémoire, avec tout ce
  qu'il référence. Le cas typique est un écouteur d'événement jamais retiré : il retient
  l'élément du DOM et les objets voisins, même après le retrait de l'élément. Les remèdes sont
  de retirer l'écouteur — `removeEventListener`, un `AbortController` —, de n'extraire que la
  valeur utile plutôt que de capturer un gros objet, et de vérifier au profileur mémoire quand
  un doute subsiste.
  :::
