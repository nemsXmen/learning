---
id: javascript-tableaux-trier
title: "Trier, inverser, aplatir et convertir"
slug: trier-et-aplatir
technology: javascript
level: intermediate
module: tableaux
order: 5
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-tableaux-transformer
skills:
  - arrays-sort-flatten
tags:
  - javascript
  - tableaux
---

## Objectifs

- Trier correctement des nombres, des chaînes et des objets avec une fonction de
  comparaison.
- Inverser, extraire et concaténer des tableaux, en sachant lesquelles de ces opérations
  modifient l'original.
- Aplatir des tableaux imbriqués avec `flat` et `flatMap`, et convertir d'autres
  collections avec `Array.from`.

## Introduction

`[10, 9, 1].sort()` renvoie `[1, 10, 9]`. Ce résultat, qui a fait douter plus d'un
développeur de sa santé mentale, résume le piège de ce chapitre : le tri par défaut ne
trie pas des nombres comme des nombres. Trier, inverser ou aplatir des données est
pourtant indispensable pour afficher un classement, une liste alphabétique ou tous les
tags d'une collection d'articles.

## Concept

| Méthode | Effet | Modifie l'original ? |
| --- | --- | --- |
| `sort(comparer)` | trie | oui |
| `toSorted(comparer)` | renvoie une copie triée | non |
| `reverse()` | inverse l'ordre | oui |
| `toReversed()` | renvoie une copie inversée | non |
| `slice(debut, fin)` | extrait une portion | non |
| `concat(...tableaux)` | assemble des tableaux | non |
| `flat(profondeur)` | aplatit les sous-tableaux | non |
| `flatMap(fonction)` | `map`, puis `flat` d'un niveau | non |
| `Array.from(iterable)` | crée un tableau à partir d'une chaîne, d'un `Set`, d'une `NodeList`… | — |

Une **fonction de comparaison** reçoit deux éléments `a` et `b` et renvoie :

- un nombre **négatif** pour placer `a` avant `b` ;
- un nombre **positif** pour placer `b` avant `a` ;
- `0` pour garder leur ordre relatif.

Pour des nombres, `(a, b) => a - b` trie par ordre croissant, `(a, b) => b - a` par ordre
décroissant.

## Exemple

```js
const scores = [10, 9, 1, 100];
console.log([...scores].sort()); // [1, 10, 100, 9] : ordre des chaînes
console.log(scores.toSorted((a, b) => a - b)); // [1, 9, 10, 100]
console.log(scores); // [10, 9, 1, 100] : intact

const produits = [
  { nom: 'Souris', prix: 19 },
  { nom: 'Clavier', prix: 49 },
  { nom: 'Écran', prix: 199 },
  { nom: 'Câble', prix: 19 },
];
const parPrix = produits.toSorted((a, b) => b.prix - a.prix || a.nom.localeCompare(b.nom, 'fr'));
console.log(parPrix.map((p) => p.nom)); // ['Écran', 'Clavier', 'Câble', 'Souris']

const articles = [{ tags: ['js', 'css'] }, { tags: ['js', 'node'] }];
const tousLesTags = articles.flatMap((article) => article.tags);
console.log(tousLesTags); // ['js', 'css', 'js', 'node']

console.log([1, [2, [3, [4]]]].flat(Infinity)); // [1, 2, 3, 4]
console.log(Array.from(new Set(tousLesTags))); // ['js', 'css', 'node']
```

## Comment ça fonctionne

Sans fonction de comparaison, `sort` **convertit chaque élément en chaîne** et compare les
chaînes par codes de caractères. `'10'` passe avant `'9'`, car `'1'` est avant `'9'`. Pour
des nombres, la fonction de comparaison est donc obligatoire.

La comparaison `a - b` fonctionne parce que son signe dit exactement lequel est le plus
petit. Une comparaison qui renvoie un booléen, comme `(a, b) => a > b`, ne renvoie jamais
de nombre négatif : le tri obtenu dépend du moteur et peut être faux.

Depuis ES2019, `sort` est **stable** : deux éléments considérés égaux gardent leur ordre
d'origine. On peut donc trier d'abord par nom, puis par prix, sans perdre l'ordre des noms
à prix égal — ou combiner les deux critères avec `||`, comme dans l'exemple.

`sort` et `reverse` **modifient le tableau et le renvoient**. `const tri = liste.sort()`
donne l'impression d'obtenir une copie, mais `tri` et `liste` sont le même tableau. Les
méthodes `toSorted` et `toReversed`, arrivées avec ES2023, renvoient une copie ; avant elles,
on écrivait `[...liste].sort(...)`.

`flat()` n'aplatit qu'un niveau par défaut ; `flat(Infinity)` aplatit tout. `flatMap` est
équivalent à `map(...).flat(1)`, en un seul parcours.

## Erreurs fréquentes

**Trier des nombres sans fonction de comparaison.** L'ordre obtenu est celui des chaînes.

**Écrire une comparaison qui renvoie un booléen.** Renvoie un nombre : `a - b`, ou
`a.localeCompare(b)` pour des chaînes.

**Trier un tableau partagé avec `sort`.** L'original est modifié, par exemple dans l'état
d'une interface. Utilise `toSorted`, ou trie une copie.

**Trier des mots accentués avec `<` ou le tri par défaut.** `'Écran'` passe après `'Souris'`.
Utilise `localeCompare(b, 'fr')`.

**Attendre de `flatMap` qu'il aplatisse plusieurs niveaux.** Il n'en aplatit qu'un.

## À retenir

- Sans comparateur, `sort` compare des chaînes : `[10, 9, 1]` devient `[1, 10, 9]`.
- Comparateur : négatif, `a` avant ; positif, `b` avant. Nombres : `a - b`.
- `sort` et `reverse` modifient ; `toSorted` et `toReversed` renvoient une copie.
- `localeCompare` pour trier du texte ; `||` pour enchaîner plusieurs critères.
- `flat(profondeur)`, `flatMap` pour un niveau, `Array.from` pour convertir.

## Exercices

1. Trie `[10, 9, 1, 100]` par ordre croissant sans modifier le tableau d'origine.

   :::indice
   Il faut une fonction de comparaison numérique, et une méthode qui renvoie une copie.
   :::

   :::solution
   ```js
   const nombres = [10, 9, 1, 100];

   const tries = nombres.toSorted((a, b) => a - b);
   console.log(tries); // [1, 9, 10, 100]
   console.log(nombres); // [10, 9, 1, 100]

   const triesAvantEs2023 = [...nombres].sort((a, b) => a - b);
   ```
   :::

2. Trie des produits `{ nom, prix }` du plus cher au moins cher, et par ordre alphabétique
   quand deux produits ont le même prix.

   :::indice
   Le premier critère est le prix, en ordre décroissant : `b.prix - a.prix`.
   :::

   :::indice
   Quand la différence de prix vaut `0`, `||` passe au second critère.
   :::

   :::solution
   ```js
   const produits = [
     { nom: 'Souris', prix: 19 },
     { nom: 'Clavier', prix: 49 },
     { nom: 'Câble', prix: 19 },
   ];

   const tries = produits.toSorted(
     (a, b) => b.prix - a.prix || a.nom.localeCompare(b.nom, 'fr'),
   );

   console.log(tries.map((produit) => produit.nom)); // ['Clavier', 'Câble', 'Souris']
   ```
   :::

3. À partir de `[{ tags: ['js', 'css'] }, { tags: ['js', 'node'] }]`, obtiens la liste des
   tags sans doublons : `['js', 'css', 'node']`.

   :::indice
   Chaque article fournit un tableau de tags : une méthode transforme et aplatit en même
   temps.
   :::

   :::indice
   Pour retirer les doublons, un `Set` ne garde que des valeurs uniques.
   :::

   :::solution
   ```js
   const articles = [{ tags: ['js', 'css'] }, { tags: ['js', 'node'] }];

   const tags = Array.from(new Set(articles.flatMap((article) => article.tags)));
   console.log(tags); // ['js', 'css', 'node']
   ```

   Le `Set` conserve l'ordre de première apparition, et `Array.from` le reconvertit en
   tableau.
   :::

## Questions d'entretien

- Pourquoi `[10, 9, 1].sort()` donne-t-il `[1, 10, 9]` ?

  :::indice
  Sans fonction de comparaison, comment `sort` compare-t-il deux éléments ?
  :::

  :::reponse
  Sans fonction de comparaison, `sort` convertit les éléments en chaînes et les compare par
  codes UTF-16. `'10'` est placé avant `'9'`, car le premier caractère `'1'` est avant `'9'`.
  Pour trier des nombres, on passe `(a, b) => a - b`. Le comportement par défaut vient de ce
  que `sort` doit fonctionner sur des tableaux de n'importe quel type.
  :::

- Quelle différence entre `sort` et `toSorted` ?

  :::indice
  Que devient le tableau d'origine dans chaque cas ?
  :::

  :::reponse
  `sort` trie le tableau sur place et renvoie ce même tableau : toutes les références voient
  l'ordre changer. `toSorted`, ajouté avec ES2023, renvoie un nouveau tableau trié et laisse
  l'original intact. C'est important dès que le tableau est partagé, par exemple dans l'état
  d'une application React. Avant ES2023, on triait une copie : `[...tableau].sort()`.
  :::

- Que fait `flatMap`, et quand l'utiliser ?

  :::indice
  Compare-le à l'enchaînement de deux autres méthodes.
  :::

  :::reponse
  `flatMap` applique une fonction à chaque élément, comme `map`, puis aplatit le résultat
  d'un niveau, comme `flat(1)`, en un seul parcours. On l'utilise quand chaque élément produit
  plusieurs valeurs — les tags de chaque article, les mots de chaque phrase — ou zéro : une
  fonction qui renvoie `[]` retire l'élément, ce qui combine filtre et transformation.
  :::
