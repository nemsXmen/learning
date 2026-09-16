---
id: javascript-set
title: "Le Set : une collection de valeurs uniques"
slug: set
technology: javascript
level: beginner
module: map-et-set
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-tableaux-chercher
skills:
  - set-collection
tags:
  - javascript
  - map-et-set
---

## Objectifs

- Créer un `Set`, y ajouter des valeurs et tester leur présence.
- Dédoublonner un tableau, et calculer union, intersection et différence.
- Savoir pourquoi `has` est plus rapide que `includes` sur de grandes collections.

## Introduction

« Chaque valeur au plus une fois » : les tags d'un article, les identifiants déjà traités,
les visiteurs uniques d'une page. Avec un tableau, il faut vérifier soi-même avant chaque
ajout. Le `Set` fait respecter cette règle par construction, et répond bien plus vite à la
question « est-ce que je connais déjà cette valeur ? ».

## Concept

Un `Set` est une collection de valeurs **uniques**, parcourue dans l'ordre d'insertion.

| Opération | Syntaxe | Renvoie |
| --- | --- | --- |
| Créer | `new Set()` ou `new Set(iterable)` | le `Set` |
| Ajouter | `ensemble.add(valeur)` | le `Set`, donc chaînable |
| Tester | `ensemble.has(valeur)` | `true` / `false` |
| Retirer | `ensemble.delete(valeur)` | `true` si la valeur y était |
| Compter | `ensemble.size` | un nombre |
| Vider | `ensemble.clear()` | `undefined` |
| Convertir en tableau | `[...ensemble]` | un tableau |

Un `Set` se parcourt avec `for...of` ou `forEach`.

## Exemple

```js
const tags = new Set(['js', 'css', 'js', 'html']);
console.log(tags.size); // 3 : le doublon est ignoré
console.log([...tags]); // ['js', 'css', 'html'] : ordre d'insertion

tags.add('node').add('js');
console.log(tags.size); // 4

console.log(tags.has('css')); // true
tags.delete('css');
console.log(tags.has('css')); // false

for (const tag of tags) {
  console.log(tag); // 'js', 'html', 'node'
}

const a = new Set(['js', 'css', 'html']);
const b = new Set(['js', 'node']);
console.log([...a].filter((x) => b.has(x))); // ['js'] : intersection
console.log([...a].filter((x) => !b.has(x))); // ['css', 'html'] : différence
console.log([...new Set([...a, ...b])]); // ['js', 'css', 'html', 'node'] : union
```

## Comment ça fonctionne

L'unicité repose sur l'algorithme *SameValueZero*, le même que `includes` : il se comporte
comme `===`, sauf que `NaN` y est considéré égal à lui-même. Un `Set` ne peut donc contenir
qu'un seul `NaN`, et distingue `0` de `'0'`.

Pour les **objets**, la comparaison porte sur la référence. Deux objets de même contenu
sont deux valeurs différentes :

```js
const ensemble = new Set([{ id: 1 }, { id: 1 }]);
console.log(ensemble.size); // 2
```

Pour dédoublonner des objets sur un critère, on indexe plutôt par une clé, avec une `Map`.

`has` s'appuie sur une table de hachage : le temps de réponse ne dépend pratiquement pas de
la taille de la collection. `includes` sur un tableau parcourt les éléments un par un. Sur
quelques dizaines d'éléments, la différence est invisible ; dans une boucle qui teste des
milliers d'appartenances, elle fait passer l'algorithme d'un coût quadratique à un coût
linéaire.

Les moteurs récents ajoutent des méthodes d'ensemble natives — `union`, `intersection`,
`difference` — qui remplacent les conversions par tableau vues plus haut. Les écritures
avec `filter` restent compatibles partout.

## Erreurs fréquentes

**Appeler `map` ou `filter` sur un `Set`.** Il n'a pas ces méthodes : convertis d'abord en
tableau avec `[...ensemble]`.

**Dédoublonner des objets avec un `Set`.** La comparaison porte sur les références, pas sur
le contenu.

**Utiliser `ensemble[0]`.** Un `Set` n'a pas d'index : passe par `[...ensemble][0]`, ou
itère.

**Oublier que `add` renvoie le `Set`.** C'est pratique pour chaîner, mais
`const x = ensemble.add(1)` ne met pas la valeur ajoutée dans `x`.

## À retenir

- `Set` = valeurs uniques, dans l'ordre d'insertion.
- `add`, `has`, `delete`, `size`, `clear` ; pas d'index, pas de `map`.
- `[...new Set(tableau)]` dédoublonne en une ligne.
- Unicité par *SameValueZero* : un seul `NaN`, mais les objets comparés par référence.
- `has` reste rapide quelle que soit la taille, contrairement à `includes`.

## Exercices

1. Dédoublonne `[3, 1, 3, 2, 1]` et récupère un tableau trié par ordre croissant.

   :::indice
   Un `Set` supprime les doublons ; il faut ensuite revenir à un tableau pour trier.
   :::

   :::solution
   ```js
   const nombres = [3, 1, 3, 2, 1];

   const uniques = [...new Set(nombres)].sort((a, b) => a - b);
   console.log(uniques); // [1, 2, 3]
   ```
   :::

2. Calcule les tags communs à deux articles, puis ceux qui n'appartiennent qu'au premier.

   :::indice
   Convertis le second tableau en `Set` pour profiter de `has`, puis filtre le premier.
   :::

   :::solution
   ```js
   const article1 = ['js', 'css', 'html'];
   const article2 = ['js', 'node'];

   const dansLe2 = new Set(article2);
   const communs = article1.filter((tag) => dansLe2.has(tag));
   const propres = article1.filter((tag) => !dansLe2.has(tag));

   console.log(communs); // ['js']
   console.log(propres); // ['css', 'html']
   ```
   :::

3. À partir de `['ada', 'grace', 'ada', 'linus']`, compte les visiteurs uniques et dis si
   `'grace'` est venue.

   :::indice
   Deux membres du `Set` suffisent : l'un compte, l'autre teste.
   :::

   :::solution
   ```js
   const visites = ['ada', 'grace', 'ada', 'linus'];
   const visiteurs = new Set(visites);

   console.log(visiteurs.size); // 3
   console.log(visiteurs.has('grace')); // true
   ```
   :::

## Questions d'entretien

- Quand préférer un `Set` à un tableau ?

  :::indice
  Pense à l'unicité, et à la question que le code pose le plus souvent.
  :::

  :::reponse
  Quand les valeurs doivent être uniques et que la question principale est « cette valeur
  est-elle présente ? ». Le `Set` garantit l'unicité sans vérification manuelle et répond en
  temps quasi constant. On garde un tableau quand l'ordre, les index, les doublons ou les
  méthodes comme `map` et `reduce` comptent, ou quand les données doivent partir en JSON, ce
  qu'un `Set` ne permet pas directement.
  :::

- Pourquoi `has` est-il plus rapide que `includes` ?

  :::indice
  Comment chaque structure retrouve-t-elle une valeur ?
  :::

  :::reponse
  Un `Set` indexe ses valeurs dans une table de hachage : il calcule une empreinte de la
  valeur cherchée et va directement au bon emplacement, en temps quasi constant. `includes`
  compare les éléments du tableau un par un, proportionnellement à sa longueur. Le gain
  apparaît quand on teste l'appartenance de façon répétée : remplacer `includes` dans une
  boucle par un `Set` construit une seule fois fait passer l'algorithme de quadratique à
  linéaire.
  :::

- Que devient l'ordre des valeurs dans un `Set` ?

  :::indice
  Ajoute des valeurs, supprimes-en une, réajoute-la, puis itère.
  :::

  :::reponse
  Un `Set` conserve l'ordre d'insertion : l'itération renvoie les valeurs dans l'ordre où
  elles ont été ajoutées la première fois. Réajouter une valeur déjà présente ne la déplace
  pas ; la supprimer puis la réajouter la place en fin de collection. C'est ce qui rend
  `[...new Set(tableau)]` sûr pour dédoublonner en conservant l'ordre d'apparition.
  :::
