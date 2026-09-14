---
id: javascript-for-of-for-in
title: "for...of et for...in"
slug: for-of-et-for-in
technology: javascript
level: intermediate
module: boucles
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-boucle-for
skills:
  - iteration-for-of-in
tags:
  - javascript
  - boucles
---

## Objectifs

- Parcourir les valeurs d'un tableau, d'une chaîne, d'une `Map` ou d'un `Set` avec
  `for...of`.
- Parcourir les propriétés d'un objet, et savoir pourquoi `for...in` est rarement le bon
  choix.
- Obtenir à la fois l'index et la valeur, ou la clé et la valeur.

## Introduction

`for (let i = 0; i < panier.length; i++)` fonctionne, mais l'index n'est souvent qu'un
intermédiaire : ce qu'on veut, ce sont les articles. `for...of` parcourt directement les
**valeurs**. Son cousin au nom presque identique, `for...in`, parcourt tout autre chose :
les **noms des propriétés** d'un objet. Les confondre donne des bugs discrets — des index
qui sont des chaînes, des propriétés inattendues qui apparaissent dans la boucle.

## Concept

| | `for...of` | `for...in` |
| --- | --- | --- |
| Parcourt | les **valeurs** | les **noms de propriétés** (chaînes) |
| Fonctionne sur | les itérables : tableaux, chaînes, `Map`, `Set` | tout objet |
| Sur un objet littéral | `TypeError` : non itérable | ses clés, et celles héritées |
| Sur un tableau | ses éléments | ses index sous forme de chaînes, plus toute propriété ajoutée |
| Usage recommandé | parcourir des valeurs | presque jamais ; préfère `Object.entries` |

Pour parcourir un objet, la forme recommandée combine `for...of` et `Object.entries`, qui
renvoie les paires `[clé, valeur]` des propriétés propres de l'objet :

```js
for (const [cle, valeur] of Object.entries(objet)) { /* ... */ }
```

Pour obtenir l'index en même temps que la valeur d'un tableau, on utilise
`tableau.entries()`.

## Exemple

```js
const panier = [
  { nom: 'Clavier', prix: 49, quantite: 1 },
  { nom: 'Câble', prix: 9, quantite: 3 },
];

let total = 0;
for (const article of panier) {
  total += article.prix * article.quantite;
}
console.log(total); // 76

for (const [index, article] of panier.entries()) {
  console.log(`${index + 1}. ${article.nom}`); // 1. Clavier, 2. Câble
}

for (const lettre of 'été') {
  console.log(lettre); // 'é', 't', 'é'
}

const stock = { pommes: 12, poires: 0 };
for (const [fruit, quantite] of Object.entries(stock)) {
  console.log(`${fruit} : ${quantite}`);
}
```

## Comment ça fonctionne

`for...of` s'appuie sur le **protocole d'itération** : un objet est itérable s'il possède
une méthode `Symbol.iterator`, qui fournit les valeurs une à une. Les tableaux, les
chaînes, les `Map` et les `Set` en ont une ; un objet littéral n'en a pas, d'où l'erreur :

```js
for (const valeur of { a: 1 }) {} // TypeError: {(intermediate value)} is not iterable
```

Sur une chaîne, `for...of` parcourt les caractères Unicode complets : un emoji n'est pas
découpé en deux morceaux, contrairement à un parcours par index.

`for...in` énumère les propriétés **énumérables** dont la clé est une chaîne, **y compris
celles héritées** du prototype. Sur un tableau, il en résulte trois surprises :

```js
const notes = [12, 17];
notes.moyenne = 14.5;

for (const cle in notes) {
  console.log(cle, typeof cle);
}
// '0' 'string'
// '1' 'string'
// 'moyenne' 'string'
```

Les index sont des chaînes, une propriété ajoutée apparaît dans la boucle, et une
bibliothèque qui ajouterait une méthode énumérable au prototype l'y ferait apparaître aussi.

## Erreurs fréquentes

**Utiliser `for...in` sur un tableau.** Les index sont des chaînes (`'0' + 1` vaut `'01'`),
et des propriétés étrangères peuvent apparaître. Utilise `for...of` ou `entries()`.

**Utiliser `for...of` sur un objet littéral.** Il n'est pas itérable. Parcours
`Object.entries(objet)`, `Object.keys(objet)` ou `Object.values(objet)`.

**Oublier les propriétés héritées avec `for...in`.** Si tu dois vraiment l'utiliser, filtre
avec `Object.hasOwn(objet, cle)`.

**Modifier le tableau pendant qu'on le parcourt.** Ajouter ou retirer des éléments pendant
un `for...of` décale le parcours. Construis plutôt un nouveau tableau.

## À retenir

- `for...of` parcourt les **valeurs** d'un itérable : tableau, chaîne, `Map`, `Set`.
- `for...in` parcourt les **noms de propriétés**, en chaînes, héritées comprises.
- Sur un tableau : `for...of`, et `entries()` pour l'index.
- Sur un objet : `for (const [cle, valeur] of Object.entries(objet))`.

## Exercices

1. Calcule le total d'un panier de la forme `[{ prix, quantite }]` avec `for...of`.

   :::indice
   Chaque tour te donne directement un article : multiplie son prix par sa quantité.
   :::

   :::solution
   ```js
   const panier = [
     { prix: 12.5, quantite: 2 },
     { prix: 3, quantite: 4 },
   ];

   let total = 0;
   for (const article of panier) {
     total += article.prix * article.quantite;
   }

   console.log(total); // 37
   ```
   :::

2. Affiche chaque fruit et sa quantité pour `const stock = { pommes: 12, poires: 0 }`, sans
   utiliser `for...in`.

   :::indice
   `Object.entries(stock)` renvoie un tableau de paires `[clé, valeur]`, que `for...of` sait
   parcourir.
   :::

   :::solution
   ```js
   const stock = { pommes: 12, poires: 0 };

   for (const [fruit, quantite] of Object.entries(stock)) {
     console.log(`${fruit} : ${quantite}`);
   }
   // pommes : 12
   // poires : 0
   ```

   `Object.entries` ne renvoie que les propriétés propres de l'objet : aucune propriété
   héritée ne peut apparaître.
   :::

3. Explique ce qu'affiche ce code, puis corrige-le pour afficher les valeurs du tableau.

   ```js
   const mesures = [10, 20];
   mesures.unite = 'cm';
   for (const element in mesures) {
     console.log(element);
   }
   ```

   :::indice
   `for...in` parcourt les noms de propriétés, pas les valeurs, et une propriété ajoutée à un
   tableau reste une propriété.
   :::

   :::solution
   Le code affiche `'0'`, `'1'` puis `'unite'` : des noms de propriétés, sous forme de
   chaînes, y compris la propriété ajoutée.

   ```js
   const mesures = [10, 20];
   mesures.unite = 'cm';

   for (const mesure of mesures) {
     console.log(mesure);
   }
   // 10
   // 20
   ```

   `for...of` ne parcourt que les éléments du tableau.
   :::

## Questions d'entretien

- Quelle est la différence entre `for...of` et `for...in` ?

  :::indice
  L'un parcourt des valeurs, l'autre des noms de propriétés.
  :::

  :::reponse
  `for...of` parcourt les valeurs d'un itérable — tableau, chaîne, `Map`, `Set` — grâce au
  protocole d'itération (`Symbol.iterator`). `for...in` parcourt les noms des propriétés
  énumérables d'un objet, sous forme de chaînes, y compris celles héritées du prototype. On
  utilise `for...of` pour les collections, et `Object.entries` avec `for...of` pour les
  objets.
  :::

- Pourquoi éviter `for...in` sur un tableau ?

  :::indice
  Quel est le type des index qu'il fournit, et quelles autres propriétés peut-il rencontrer ?
  :::

  :::reponse
  Il fournit les index sous forme de chaînes, ce qui casse les calculs (`'1' + 1` vaut
  `'11'`). Il énumère aussi toute propriété ajoutée au tableau et les propriétés
  énumérables héritées, par exemple ajoutées au prototype par une bibliothèque. Et il n'est
  pas conçu pour garantir un ordre adapté à un parcours. `for...of` ou les méthodes de
  tableau n'ont aucun de ces défauts.
  :::

- Pourquoi `for (const valeur of { a: 1 })` lève-t-il une `TypeError` ?

  :::indice
  Qu'est-ce qu'un objet doit posséder pour être parcouru par `for...of` ?
  :::

  :::reponse
  `for...of` exige un itérable, c'est-à-dire un objet qui possède une méthode
  `Symbol.iterator`. Les tableaux, les chaînes, les `Map` et les `Set` en ont une ; un objet
  littéral non, car l'ordre et la nature de ce qu'il faudrait parcourir — clés, valeurs,
  paires — ne sont pas évidents. On choisit donc explicitement `Object.keys`,
  `Object.values` ou `Object.entries`.
  :::
