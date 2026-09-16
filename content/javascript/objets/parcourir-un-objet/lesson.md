---
id: javascript-objets-parcourir
title: "Parcourir et transformer un objet"
slug: parcourir-un-objet
technology: javascript
level: intermediate
module: objets
order: 3
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-objets-creer
skills:
  - objects-iteration
tags:
  - javascript
  - objets
---

## Objectifs

- Parcourir un objet avec `Object.keys`, `Object.values` et `Object.entries`.
- Savoir pourquoi `for...in` demande une précaution, et quand l'utiliser.
- Transformer un objet en passant par ses entrées et `Object.fromEntries`.

## Introduction

Les objets n'ont ni `map` ni `filter`. Pour les parcourir ou les transformer, on passe par
leurs **entrées** : on convertit l'objet en tableau de paires, on applique les méthodes de
tableau déjà connues, et on reconvertit. Ce va-et-vient est le motif standard du JavaScript
moderne pour travailler sur des objets.

## Concept

| Fonction | Renvoie | Exemple sur `{ a: 1, b: 2 }` |
| --- | --- | --- |
| `Object.keys(objet)` | les noms de propriétés | `['a', 'b']` |
| `Object.values(objet)` | les valeurs | `[1, 2]` |
| `Object.entries(objet)` | les paires `[cle, valeur]` | `[['a', 1], ['b', 2]]` |
| `Object.fromEntries(paires)` | un objet | `{ a: 1, b: 2 }` |
| `for (const cle in objet)` | parcourt les clés, héritées comprises | — |

Les trois premières ne voient que les propriétés **propres et énumérables**. Le motif de
transformation est toujours le même :

```js
Object.fromEntries(Object.entries(objet).map(/* ou .filter */));
```

## Exemple

```js
const stock = { clavier: 12, souris: 0, ecran: 3 };

for (const cle of Object.keys(stock)) {
  console.log(cle); // 'clavier', 'souris', 'ecran'
}

console.log(Object.values(stock).reduce((total, n) => total + n, 0)); // 15

for (const [produit, quantite] of Object.entries(stock)) {
  console.log(`${produit} : ${quantite}`);
}

const disponibles = Object.fromEntries(
  Object.entries(stock).filter(([, quantite]) => quantite > 0),
);
console.log(disponibles); // { clavier: 12, ecran: 3 }

const doubles = Object.fromEntries(
  Object.entries(stock).map(([produit, quantite]) => [produit, quantite * 2]),
);
console.log(doubles); // { clavier: 24, souris: 0, ecran: 6 }

const inverse = Object.fromEntries(
  Object.entries({ fr: 'Français', en: 'Anglais' }).map(([cle, valeur]) => [valeur, cle]),
);
console.log(inverse); // { 'Français': 'fr', 'Anglais': 'en' }
```

## Comment ça fonctionne

`Object.entries` produit un tableau de tableaux à deux cases. Le destructuring dans le
paramètre du callback, `([cle, valeur]) => ...`, les nomme directement. Une virgule seule,
`([, valeur])`, ignore la clé.

`for...in` parcourt les clés énumérables **de l'objet et de ses prototypes**. Sur un objet
littéral, cela ne pose pas de problème en pratique, mais dès qu'un prototype est enrichi,
des clés inattendues apparaissent. On protège donc la boucle avec
`if (!Object.hasOwn(objet, cle)) continue;`, ou on utilise `Object.keys`, qui n'a pas ce
défaut. Attention aussi : `for...of` ne fonctionne pas directement sur un objet, qui n'est
pas itérable — d'où le passage par `Object.keys` ou `Object.entries`.

L'ordre de parcours est celui vu au premier chapitre : clés entières croissantes d'abord,
puis les autres dans leur ordre d'insertion.

`Object.fromEntries` accepte n'importe quel itérable de paires : il convertit donc aussi une
`Map` en objet, et `new Map(Object.entries(objet))` fait l'inverse.

## Erreurs fréquentes

**Appeler `objet.map(...)`.** Les objets n'ont pas les méthodes des tableaux. Passe par
`Object.entries`.

**Utiliser `for...in` sur un tableau.** Il parcourt les index sous forme de **chaînes**, et
peut inclure des propriétés ajoutées. Pour un tableau, `for...of` ou `forEach`.

**Oublier `Object.hasOwn` dans un `for...in`.** Des clés héritées peuvent apparaître.

**Oublier de reconvertir après `entries`.** Sans `Object.fromEntries`, le résultat reste un
tableau de paires.

## À retenir

- `Object.keys`, `values`, `entries` : propriétés propres et énumérables.
- Motif de transformation : `Object.fromEntries(Object.entries(o).map(...))`.
- `for...in` remonte les prototypes : protège-le, ou préfère `Object.keys`.
- Un objet n'est pas itérable : `for...of` ne s'y applique pas directement.
- `Object.fromEntries` convertit aussi une `Map` en objet.

## Exercices

1. Affiche chaque produit du stock sous la forme `clavier : 12`.

   :::indice
   `Object.entries` donne des paires que le destructuring peut nommer dans la boucle.
   :::

   :::solution
   ```js
   const stock = { clavier: 12, souris: 0, ecran: 3 };

   for (const [produit, quantite] of Object.entries(stock)) {
     console.log(`${produit} : ${quantite}`);
   }
   ```
   :::

2. À partir de `{ clavier: 49, souris: 19, ecran: 199 }`, crée un objet ne contenant que les
   produits à moins de 50.

   :::indice
   Convertis en entrées, filtre comme un tableau, puis reconvertis en objet.
   :::

   :::solution
   ```js
   const prix = { clavier: 49, souris: 19, ecran: 199 };

   const abordables = Object.fromEntries(
     Object.entries(prix).filter(([, montant]) => montant < 50),
   );

   console.log(abordables); // { clavier: 49, souris: 19 }
   ```

   La virgule seule dans `([, montant])` ignore la clé, dont on n'a pas besoin.
   :::

3. Inverse les clés et les valeurs de `{ fr: 'Français', en: 'Anglais' }`.

   :::indice
   Chaque paire `[cle, valeur]` doit devenir `[valeur, cle]`.
   :::

   :::solution
   ```js
   const langues = { fr: 'Français', en: 'Anglais' };

   const inverse = Object.fromEntries(
     Object.entries(langues).map(([code, nom]) => [nom, code]),
   );

   console.log(inverse); // { 'Français': 'fr', 'Anglais': 'en' }
   ```

   Si deux valeurs sont identiques, la dernière écrase la première : l'inversion n'est fiable
   que si les valeurs sont uniques.
   :::

## Questions d'entretien

- Quelle différence entre `for...in` et `Object.keys` ?

  :::indice
  Quelles propriétés chacun voit-il ?
  :::

  :::reponse
  `for...in` parcourt les clés énumérables de l'objet **et de sa chaîne de prototypes**, ce
  qui peut faire apparaître des clés inattendues si un prototype a été enrichi.
  `Object.keys` ne renvoie que les clés propres et énumérables, dans un tableau qu'on peut
  ensuite filtrer ou transformer. On préfère `Object.keys` ou `Object.entries` ; si l'on
  utilise `for...in`, on filtre avec `Object.hasOwn`.
  :::

- Comment transformer toutes les valeurs d'un objet ?

  :::indice
  Les objets n'ont pas de `map` : par quoi passer ?
  :::

  :::reponse
  On passe par les entrées :
  `Object.fromEntries(Object.entries(objet).map(([cle, valeur]) => [cle, transformer(valeur)]))`.
  Le même motif avec `filter` sélectionne des propriétés, et en modifiant le premier élément
  de la paire on renomme les clés. Pour de gros volumes ou des clés non textuelles, une `Map`
  est souvent plus adaptée.
  :::

- Pourquoi `for...of` ne fonctionne-t-il pas sur un objet ?

  :::indice
  De quoi `for...of` a-t-il besoin pour parcourir une valeur ?
  :::

  :::reponse
  `for...of` exige un **itérable**, c'est-à-dire une valeur qui expose une méthode
  `Symbol.iterator` : c'est le cas des tableaux, des chaînes, des `Map` et des `Set`, pas des
  objets littéraux. On parcourt donc `Object.keys(objet)` ou `Object.entries(objet)`, qui sont
  des tableaux. Un objet peut devenir itérable si on lui définit soi-même `Symbol.iterator`.
  :::
