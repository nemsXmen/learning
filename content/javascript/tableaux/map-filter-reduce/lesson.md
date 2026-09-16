---
id: javascript-tableaux-transformer
title: "Transformer : map, filter et reduce"
slug: map-filter-reduce
technology: javascript
level: intermediate
module: tableaux
order: 4
estimatedMinutes: 35
difficulty: 3
xp: 90
prerequisites:
  - javascript-tableaux-chercher
skills:
  - arrays-transform
tags:
  - javascript
  - tableaux
---

## Objectifs

- Transformer chaque élément d'un tableau avec `map`.
- Garder les éléments qui respectent une condition avec `filter`.
- Réduire un tableau à une seule valeur avec `reduce`, et enchaîner les trois méthodes.

## Introduction

`map`, `filter` et `reduce` sont probablement les trois méthodes les plus utilisées du
JavaScript moderne. Elles remplacent la plupart des boucles qui construisent un nouveau
tableau ou calculent un total, avec un code qui dit **ce qu'on veut** plutôt que **comment
le faire**. Elles ne modifient jamais le tableau d'origine — une propriété précieuse dès
que des données sont partagées, et au cœur de bibliothèques comme React.

## Concept

| Méthode | Question | Résultat | Longueur du résultat |
| --- | --- | --- | --- |
| `map(fonction)` | que devient chaque élément ? | un nouveau tableau | identique à l'original |
| `filter(fonction)` | quels éléments garder ? | un nouveau tableau | inférieure ou égale |
| `reduce(fonction, initiale)` | quelle valeur unique en tirer ? | n'importe quelle valeur | — |

- `map` appelle la fonction pour chaque élément et range la **valeur renvoyée** dans le
  nouveau tableau.
- `filter` garde les éléments pour lesquels la fonction renvoie une valeur **truthy**.
- `reduce` parcourt le tableau en transportant un **accumulateur** : la fonction reçoit
  l'accumulateur et l'élément courant, et renvoie le nouvel accumulateur. La valeur
  initiale est le second argument de `reduce`.

Les trois renvoient un résultat neuf : on peut donc les enchaîner.

## Exemple

```js
const panier = [
  { nom: 'Clavier', prixHT: 50, quantite: 1, enStock: true },
  { nom: 'Souris', prixHT: 20, quantite: 2, enStock: false },
  { nom: 'Câble', prixHT: 5, quantite: 4, enStock: true },
];

const noms = panier.map((article) => article.nom);
console.log(noms); // ['Clavier', 'Souris', 'Câble']

const disponibles = panier.filter((article) => article.enStock);
console.log(disponibles.length); // 2

const total = panier
  .filter((article) => article.enStock)
  .map((article) => article.prixHT * article.quantite)
  .reduce((somme, montant) => somme + montant, 0);
console.log(total); // 70

console.log(panier.length); // 3 : l'original est intact
```

## Comment ça fonctionne

Chaque méthode appelle la fonction avec trois arguments : l'élément, son index et le
tableau. On n'utilise souvent que le premier.

Avec `map`, la fonction **doit renvoyer une valeur**. Une fonction fléchée avec accolades
exige un `return` explicite :

```js
[1, 2, 3].map((n) => n * 2); // [2, 4, 6]
[1, 2, 3].map((n) => { n * 2; }); // [undefined, undefined, undefined]
[1, 2, 3].map((n) => { return n * 2; }); // [2, 4, 6]
```

`reduce` sans valeur initiale prend le premier élément comme accumulateur de départ. Sur un
tableau vide, il n'a rien à prendre et lève une `TypeError`. On fournit donc presque
toujours la valeur initiale, qui fixe aussi le type du résultat : `0` pour une somme, `{}`
pour un regroupement, `[]` pour construire un tableau.

```js
const mots = ['js', 'css', 'js', 'html', 'js'];
const occurrences = mots.reduce((compte, mot) => {
  compte[mot] = (compte[mot] ?? 0) + 1;
  return compte;
}, {});
console.log(occurrences); // { js: 3, css: 1, html: 1 }
```

`forEach` parcourt aussi le tableau, mais renvoie `undefined` : il sert à exécuter une
action, pas à produire un résultat.

Attention : ces méthodes ne modifient pas le **tableau**, mais si la fonction modifie les
**objets** qu'il contient, ces objets sont bien modifiés. Pour transformer un objet sans
toucher à l'original, on en crée un nouveau : `panier.map((a) => ({ ...a, prixHT: a.prixHT * 0.9 }))`.

## Erreurs fréquentes

**Oublier le `return` dans une fonction à accolades.** `map` produit alors un tableau de
`undefined`.

**Appeler `reduce` sans valeur initiale.** Il échoue sur un tableau vide, et le type du
résultat devient ambigu. Donne toujours la valeur initiale.

**Utiliser `map` pour exécuter des actions.** Si le tableau renvoyé est ignoré, c'est
`forEach` ou une boucle `for...of` qu'il faut.

**Modifier les objets à l'intérieur de `map`.** L'original change aussi. Renvoie un nouvel
objet avec `{ ...objet, propriete: nouvelleValeur }`.

**Tout faire avec `reduce`.** Un `reduce` complexe est souvent moins lisible qu'un `filter`
suivi d'un `map`, ou qu'une simple boucle.

## À retenir

- `map` transforme chaque élément ; même longueur.
- `filter` garde les éléments dont la condition est truthy.
- `reduce` réduit à une valeur, avec un accumulateur et une valeur initiale.
- Aucun ne modifie le tableau ; ils s'enchaînent.
- Une fonction fléchée avec accolades a besoin d'un `return`.

## Exercices

1. À partir de `[{ nom: 'clavier', prix: 49 }, { nom: 'souris', prix: 19 }]`, obtiens le
   tableau des noms en majuscules.

   :::indice
   Chaque produit devient une chaîne : c'est une transformation élément par élément.
   :::

   :::solution
   ```js
   const produits = [
     { nom: 'clavier', prix: 49 },
     { nom: 'souris', prix: 19 },
   ];

   const noms = produits.map((produit) => produit.nom.toUpperCase());
   console.log(noms); // ['CLAVIER', 'SOURIS']
   ```
   :::

2. Calcule le total d'un panier en ne comptant que les articles en stock, chaque article
   ayant un `prix`, une `quantite` et un booléen `enStock`.

   :::indice
   Trois étapes : garder les articles en stock, calculer le montant de chacun, additionner.
   :::

   :::indice
   Pour l'addition, `reduce` avec `0` comme valeur initiale.
   :::

   :::solution
   ```js
   const panier = [
     { prix: 50, quantite: 1, enStock: true },
     { prix: 20, quantite: 2, enStock: false },
     { prix: 5, quantite: 4, enStock: true },
   ];

   const total = panier
     .filter((article) => article.enStock)
     .map((article) => article.prix * article.quantite)
     .reduce((somme, montant) => somme + montant, 0);

   console.log(total); // 70
   ```
   :::

3. Compte les occurrences de chaque mot de `['js', 'css', 'js', 'html', 'js']`, pour obtenir
   `{ js: 3, css: 1, html: 1 }`.

   :::indice
   Le résultat est un objet : c'est la valeur initiale de l'accumulateur.
   :::

   :::indice
   Pour chaque mot, lis son compte actuel — `0` s'il n'existe pas encore —, ajoute 1, et
   renvoie l'accumulateur.
   :::

   :::solution
   ```js
   const mots = ['js', 'css', 'js', 'html', 'js'];

   const occurrences = mots.reduce((compte, mot) => {
     compte[mot] = (compte[mot] ?? 0) + 1;
     return compte;
   }, {});

   console.log(occurrences); // { js: 3, css: 1, html: 1 }
   ```

   Oublier `return compte` ferait passer `undefined` comme accumulateur au tour suivant.
   :::

## Questions d'entretien

- Quelle différence entre `map` et `forEach` ?

  :::indice
  Que renvoie chacune des deux méthodes ?
  :::

  :::reponse
  `map` renvoie un nouveau tableau, de même longueur, rempli des valeurs renvoyées par la
  fonction : on l'utilise pour transformer des données. `forEach` renvoie `undefined` et sert
  uniquement à exécuter une action pour chaque élément, comme afficher ou envoyer quelque
  chose. Utiliser `map` en ignorant son résultat trompe le lecteur et crée un tableau inutile.
  Aucun des deux ne peut être interrompu avec `break` : pour cela, `for...of`, `some` ou
  `find`.
  :::

- Pourquoi donner une valeur initiale à `reduce` ?

  :::indice
  Que se passe-t-il avec un tableau vide, et quel est le type du résultat ?
  :::

  :::reponse
  Sans valeur initiale, `reduce` utilise le premier élément comme accumulateur de départ. Sur
  un tableau vide, il lève une `TypeError`. Le type du résultat dépend en plus du contenu du
  tableau, ce qui rend le code fragile : pour construire un objet ou additionner les prix
  d'objets, le premier élément n'est pas du bon type. La valeur initiale rend le résultat
  prévisible et le cas vide sûr.
  :::

- Quand préférer une boucle `for...of` à une chaîne `map` / `filter` / `reduce` ?

  :::indice
  Pense à la lisibilité, à l'arrêt anticipé et au nombre de parcours.
  :::

  :::reponse
  Quand il faut s'arrêter avant la fin (`break`), quand chaque tour contient une logique
  complexe ou des `await` successifs, ou quand un `reduce` devient illisible. Une chaîne
  parcourt aussi le tableau une fois par méthode : sur de très grands volumes dans du code
  critique, une seule boucle peut compter. Dans la plupart des cas, la chaîne reste plus
  lisible et c'est le bon choix.
  :::
