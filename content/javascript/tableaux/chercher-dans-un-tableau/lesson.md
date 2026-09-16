---
id: javascript-tableaux-chercher
title: "Chercher : includes, indexOf, find, findIndex, some et every"
slug: chercher-dans-un-tableau
technology: javascript
level: beginner
module: tableaux
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 70
prerequisites:
  - javascript-tableaux-creer
skills:
  - arrays-search
tags:
  - javascript
  - tableaux
---

## Objectifs

- Tester la présence d'une valeur avec `includes`, et trouver sa position avec `indexOf`.
- Trouver un élément ou sa position selon une condition avec `find` et `findIndex`.
- Vérifier qu'au moins un élément, ou tous, respectent une condition avec `some` et
  `every`.

## Introduction

Le chapitre sur les boucles montrait comment chercher un élément avec `for` et `break`.
Les tableaux proposent des méthodes qui font ce travail en une ligne, s'arrêtent dès que
le résultat est connu, et disent clairement ce qu'on cherche. Elles introduisent aussi une
idée qui revient partout en JavaScript : passer **une fonction** qui décrit la condition.

## Concept

Deux familles de recherche :

**Par valeur**, avec une égalité :

| Méthode | Renvoie |
| --- | --- |
| `includes(valeur)` | `true` / `false` |
| `indexOf(valeur)` | l'index de la première occurrence, ou `-1` |

**Par condition**, avec une fonction qui renvoie vrai ou faux pour chaque élément :

| Méthode | Renvoie |
| --- | --- |
| `find(fonction)` | le premier élément qui correspond, ou `undefined` |
| `findIndex(fonction)` | son index, ou `-1` |
| `findLast(fonction)` / `findLastIndex(fonction)` | la même chose en partant de la fin |
| `some(fonction)` | `true` si **au moins un** élément correspond |
| `every(fonction)` | `true` si **tous** les éléments correspondent |

La fonction reçoit l'élément, puis son index et le tableau. On l'écrit le plus souvent en
fonction fléchée : `(utilisateur) => utilisateur.id === 3`.

## Exemple

```js
const utilisateurs = [
  { id: 1, nom: 'Ada', role: 'admin', verifie: true },
  { id: 2, nom: 'Grace', role: 'membre', verifie: true },
  { id: 3, nom: 'Linus', role: 'membre', verifie: false },
];

const roles = ['admin', 'membre', 'invite'];
console.log(roles.includes('invite')); // true
console.log(roles.indexOf('membre')); // 1

const linus = utilisateurs.find((utilisateur) => utilisateur.id === 3);
console.log(linus.nom); // 'Linus'

const position = utilisateurs.findIndex((utilisateur) => utilisateur.nom === 'Grace');
console.log(position); // 1

console.log(utilisateurs.some((utilisateur) => utilisateur.role === 'admin')); // true
console.log(utilisateurs.every((utilisateur) => utilisateur.verifie)); // false

const inconnu = utilisateurs.find((utilisateur) => utilisateur.id === 99);
console.log(inconnu); // undefined
```

## Comment ça fonctionne

`find`, `findIndex` et `some` **s'arrêtent au premier élément qui correspond** ; `every`
s'arrête au premier qui ne correspond pas. Sur un grand tableau, c'est bien plus économe
qu'un parcours complet.

`includes` et `indexOf` comparent des **valeurs**. Pour des objets, ils comparent donc
l'identité, pas le contenu :

```js
const panier = [{ id: 2 }];
console.log(panier.includes({ id: 2 })); // false : un autre objet
console.log(panier.some((article) => article.id === 2)); // true
```

Les deux ne traitent pas `NaN` pareil : `includes` le trouve, `indexOf` non, car il utilise
`===` et `NaN !== NaN`.

Sur un **tableau vide**, `some` renvoie `false`, et `every` renvoie `true` : aucun élément
ne contredit la condition. C'est logique mathématiquement, mais cela surprend quand on
vérifie « tous les articles sont en stock » sur un panier vide.

## Erreurs fréquentes

**Chercher un objet avec `includes` ou `indexOf`.** Ils comparent l'identité. Utilise
`some` ou `find` avec une condition sur une propriété.

**Utiliser le résultat de `find` sans vérifier qu'il existe.**
`utilisateurs.find(...).nom` lève une `TypeError` si rien n'est trouvé. Teste le résultat,
ou utilise `?.`.

**Oublier le cas du tableau vide avec `every`.** `[].every(condition)` vaut `true`. Vérifie
aussi que le tableau n'est pas vide si cela a un sens métier.

**Utiliser `filter` pour un seul élément.** `filter(...)[0]` parcourt tout le tableau et
crée un tableau inutile : `find` s'arrête au premier.

## À retenir

- Par valeur : `includes` (booléen), `indexOf` (position ou `-1`).
- Par condition : `find` (élément ou `undefined`), `findIndex` (position ou `-1`).
- `some` : au moins un ; `every` : tous — et `true` sur un tableau vide.
- `includes` compare l'identité des objets : pour un objet, `some` ou `find`.
- Ces méthodes s'arrêtent dès que la réponse est connue.

## Exercices

1. Dans le tableau `utilisateurs` de l'exemple, trouve l'utilisateur d'identifiant 3 et
   affiche son nom, ou « Utilisateur introuvable » s'il n'existe pas.

   :::indice
   `find` renvoie l'élément trouvé, ou `undefined` : teste le résultat avant de lire `nom`.
   :::

   :::solution
   ```js
   const utilisateur = utilisateurs.find((u) => u.id === 3);

   if (utilisateur) {
     console.log(utilisateur.nom); // 'Linus'
   } else {
     console.log('Utilisateur introuvable');
   }
   ```

   En une ligne : `console.log(utilisateur?.nom ?? 'Utilisateur introuvable')`.
   :::

2. Pour un tableau de produits `{ nom, prix, stock }`, vérifie qu'au moins un produit est en
   rupture de stock, et que tous les prix sont strictement positifs.

   :::indice
   « Au moins un » et « tous » correspondent chacun à une méthode.
   :::

   :::solution
   ```js
   const produits = [
     { nom: 'Clavier', prix: 49, stock: 3 },
     { nom: 'Souris', prix: 19, stock: 0 },
   ];

   const auMoinsUneRupture = produits.some((produit) => produit.stock === 0);
   const prixValides = produits.every((produit) => produit.prix > 0);

   console.log(auMoinsUneRupture, prixValides); // true true
   ```
   :::

3. Explique pourquoi ce code affiche `false`, puis corrige-le.

   ```js
   const panier = [{ id: 1 }, { id: 2 }];
   console.log(panier.includes({ id: 2 }));
   ```

   :::indice
   `includes` compare-t-il le contenu des objets, ou autre chose ?
   :::

   :::solution
   `{ id: 2 }` crée un nouvel objet, distinct de celui du panier. `includes` compare
   l'identité des objets, pas leur contenu.

   ```js
   const panier = [{ id: 1 }, { id: 2 }];
   console.log(panier.some((article) => article.id === 2)); // true
   ```
   :::

## Questions d'entretien

- Quelle différence entre `find` et `filter` ?

  :::indice
  Combien d'éléments renvoie chacun, et quand s'arrête-t-il ?
  :::

  :::reponse
  `find` renvoie le premier élément qui correspond, ou `undefined`, et s'arrête dès qu'il
  l'a trouvé. `filter` parcourt tout le tableau et renvoie un nouveau tableau de tous les
  éléments qui correspondent, éventuellement vide. On utilise `find` pour un élément unique,
  comme une recherche par identifiant, et `filter` pour un sous-ensemble.
  :::

- Pourquoi `[].every(condition)` vaut-il `true` ?

  :::indice
  Existe-t-il un élément du tableau vide qui ne respecte pas la condition ?
  :::

  :::reponse
  `every` renvoie `false` dès qu'il trouve un élément qui ne respecte pas la condition. Un
  tableau vide n'en contient aucun : la condition n'est jamais contredite, donc le résultat
  est `true`. C'est la vérité « par vacuité » de la logique. En pratique, si « tous les
  articles sont valides » n'a de sens qu'avec au moins un article, il faut aussi tester
  `tableau.length > 0`.
  :::

- Quelle différence entre `includes` et `indexOf` face à `NaN` ?

  :::indice
  Quelle comparaison chacune utilise-t-elle ?
  :::

  :::reponse
  `indexOf` compare avec l'égalité stricte `===`, et `NaN` n'est égal à rien, pas même à
  lui-même : `[NaN].indexOf(NaN)` vaut `-1`. `includes` utilise l'algorithme *SameValueZero*,
  qui considère `NaN` égal à `NaN` : `[NaN].includes(NaN)` vaut `true`. C'est une raison de
  plus de préférer `includes` pour tester la présence d'une valeur.
  :::
