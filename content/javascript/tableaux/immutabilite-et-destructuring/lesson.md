---
id: javascript-tableaux-immutabilite
title: "Immutabilité des tableaux et destructuring"
slug: immutabilite-et-destructuring
technology: javascript
level: intermediate
module: tableaux
order: 6
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-tableaux-ajouter-retirer
skills:
  - arrays-immutability
tags:
  - javascript
  - tableaux
---

## Objectifs

- Ajouter, retirer et remplacer des éléments en créant un nouveau tableau plutôt qu'en
  modifiant l'original.
- Mettre à jour un objet dans un tableau d'objets sans muter les données existantes.
- Extraire des valeurs d'un tableau avec le destructuring : position, reste, valeurs par
  défaut, échange.

## Introduction

Modifier un tableau sur place est simple, mais dangereux dès qu'il est partagé : une
fonction qui trie « sa » liste trie aussi celle de l'appelant, un composant React qui fait
`push` dans son état ne se réaffiche pas. La solution est de **ne jamais modifier** les
données existantes et de toujours **produire une nouvelle version**. JavaScript moderne
rend ce style naturel, et le destructuring complète le tableau en rendant la lecture des
valeurs tout aussi concise.

## Concept

Chaque opération mutante a une version qui renvoie un nouveau tableau :

| Intention | Mutant | Non mutant |
| --- | --- | --- |
| Ajouter à la fin | `t.push(x)` | `[...t, x]` |
| Ajouter au début | `t.unshift(x)` | `[x, ...t]` |
| Retirer selon une condition | `splice` dans une boucle | `t.filter((e) => condition)` |
| Retirer l'index `i` | `t.splice(i, 1)` | `t.toSpliced(i, 1)` |
| Remplacer l'index `i` | `t[i] = x` | `t.with(i, x)` |
| Transformer | modification dans une boucle | `t.map(...)` |
| Trier / inverser | `sort` / `reverse` | `toSorted` / `toReversed` |

Le **destructuring** lit des valeurs par position :

| Écriture | Effet |
| --- | --- |
| `const [a, b] = tableau` | `a` reçoit l'index 0, `b` l'index 1 |
| `const [, deuxieme] = tableau` | ignore le premier élément |
| `const [premier, ...reste] = tableau` | `reste` reçoit un tableau des éléments suivants |
| `const [x = 0] = tableau` | `x` vaut `0` si l'élément est `undefined` |
| `[a, b] = [b, a]` | échange deux variables |

## Exemple

```js
const panier = ['clavier', 'souris', 'câble'];

const avecEcran = [...panier, 'écran'];
const sansSouris = panier.toSpliced(1, 1);
const avecManette = panier.with(1, 'manette');

console.log(avecEcran); // ['clavier', 'souris', 'câble', 'écran']
console.log(sansSouris); // ['clavier', 'câble']
console.log(avecManette); // ['clavier', 'manette', 'câble']
console.log(panier); // ['clavier', 'souris', 'câble'] : jamais modifié

const taches = [
  { id: 1, titre: 'Écrire le test', fait: false },
  { id: 2, titre: 'Corriger le bug', fait: false },
];
const misesAJour = taches.map((tache) => (tache.id === 2 ? { ...tache, fait: true } : tache));
console.log(taches[1].fait, misesAJour[1].fait); // false true

const [meilleur, ...autres] = [98, 87, 75, 60];
console.log(meilleur, autres); // 98 [87, 75, 60]

let gauche = 'A';
let droite = 'B';
[gauche, droite] = [droite, gauche];
console.log(gauche, droite); // 'B' 'A'
```

## Comment ça fonctionne

Le spread `[...t]` crée un nouveau tableau qui contient **les mêmes éléments**. Pour des
primitives, c'est une vraie copie. Pour des objets, les deux tableaux contiennent les mêmes
objets : c'est une **copie superficielle**. C'est pourquoi l'exemple des tâches crée un
nouvel objet avec `{ ...tache, fait: true }` au lieu d'écrire `tache.fait = true`, qui
modifierait l'objet partagé par les deux tableaux.

`with`, `toSpliced`, `toSorted` et `toReversed` sont arrivés avec ES2023. `with` lève une
`RangeError` pour un index hors du tableau, là où `t[i] = x` créerait silencieusement un
trou.

Le destructuring s'appuie sur le protocole d'itération : il fonctionne avec tout itérable,
une chaîne ou un `Set` par exemple. Appliqué à `undefined` ou `null`, il lève une
`TypeError` : `const [a] = undefined`. Une valeur par défaut ne s'applique que si l'élément
vaut `undefined`, pas `null`.

Pour empêcher toute modification, `Object.freeze(tableau)` fige le tableau : `push` y lève
une `TypeError`. Le gel reste superficiel, comme la copie.

## Erreurs fréquentes

**Croire que `const copie = tableau` copie.** Les deux noms désignent le même tableau.
Écris `[...tableau]`.

**Modifier les objets d'une copie superficielle.** `[...taches][0].fait = true` modifie
aussi l'original. Crée un nouvel objet.

**Destructurer une valeur qui peut être absente.** `const [premier] = resultat` échoue si
`resultat` vaut `undefined`. Fournis une valeur par défaut : `const [premier] = resultat ?? []`.

**Mélanger mutation et non-mutation.** `const trie = liste.sort()` semble créer une
nouvelle version, mais modifie `liste`. Choisis explicitement `toSorted`.

## À retenir

- Ne modifie pas un tableau partagé : produis une nouvelle version.
- `[...t, x]`, `filter`, `map`, `with`, `toSpliced`, `toSorted` renvoient un nouveau tableau.
- Le spread copie superficiellement : pour modifier un objet, crée-en un nouveau avec
  `{ ...objet }`.
- `const [premier, ...reste] = t` ; `[a, b] = [b, a]` pour échanger.
- Destructurer `undefined` lève une `TypeError`.

## Exercices

1. Sans modifier `panier = ['clavier', 'souris', 'câble']`, crée un panier avec `'écran'`
   ajouté à la fin, et un autre sans l'élément d'index 1.

   :::indice
   Pour l'ajout, le spread. Pour le retrait par index, une méthode ES2023 ou `filter` avec
   l'index.
   :::

   :::solution
   ```js
   const panier = ['clavier', 'souris', 'câble'];

   const avecEcran = [...panier, 'écran'];
   const sansIndex1 = panier.toSpliced(1, 1);
   const sansIndex1Classique = panier.filter((_, index) => index !== 1);

   console.log(avecEcran); // ['clavier', 'souris', 'câble', 'écran']
   console.log(sansIndex1); // ['clavier', 'câble']
   console.log(panier); // ['clavier', 'souris', 'câble']
   ```
   :::

2. Marque comme terminée la tâche d'identifiant 2, sans modifier ni le tableau `taches` ni
   ses objets.

   :::indice
   `map` produit un nouveau tableau. Pour la tâche concernée, renvoie un nouvel objet ;
   pour les autres, renvoie l'objet tel quel.
   :::

   :::solution
   ```js
   const taches = [
     { id: 1, titre: 'Écrire le test', fait: false },
     { id: 2, titre: 'Corriger le bug', fait: false },
   ];

   const misesAJour = taches.map((tache) =>
     tache.id === 2 ? { ...tache, fait: true } : tache,
   );

   console.log(misesAJour[1].fait); // true
   console.log(taches[1].fait); // false
   console.log(misesAJour[0] === taches[0]); // true : les tâches inchangées sont partagées
   ```

   Garder les objets inchangés partagés est voulu : seul ce qui change est recréé, ce qui
   est économe en mémoire et permet de détecter rapidement ce qui a changé.
   :::

3. À partir de `scores = [98, 87, 75, 60]`, récupère le meilleur score et le tableau des
   autres en une ligne, puis échange les valeurs de deux variables `a` et `b`.

   :::indice
   Le destructuring accepte un élément de reste, précédé de `...`, en dernière position.
   :::

   :::solution
   ```js
   const scores = [98, 87, 75, 60];
   const [meilleur, ...autres] = scores;
   console.log(meilleur, autres); // 98 [87, 75, 60]

   let a = 1;
   let b = 2;
   [a, b] = [b, a];
   console.log(a, b); // 2 1
   ```
   :::

## Questions d'entretien

- Pourquoi préférer des opérations non mutantes sur les tableaux ?

  :::indice
  Que se passe-t-il quand plusieurs parties du code partagent le même tableau ?
  :::

  :::reponse
  Un tableau modifié sur place change pour toutes les parties du code qui le référencent, ce
  qui crée des effets à distance difficiles à tracer. Produire une nouvelle version rend les
  données prévisibles : une valeur ne change jamais une fois créée. Cela permet aussi de
  détecter un changement par simple comparaison de références, ce sur quoi s'appuient React,
  Redux ou les mécanismes d'historique et d'annulation.
  :::

- Que se passe-t-il si l'on modifie un objet de `[...tableauDObjets]` ?

  :::indice
  Qu'est-ce que le spread copie exactement ?
  :::

  :::reponse
  Le spread crée un nouveau tableau, mais y place les mêmes références d'objets : c'est une
  copie superficielle. Modifier une propriété d'un objet de la copie modifie donc l'objet de
  l'original. Pour une mise à jour immuable, on crée un nouvel objet pour l'élément concerné,
  `{ ...objet, propriete: valeur }`, ou on fait une copie profonde avec `structuredClone`
  quand toute la structure doit être indépendante.
  :::

- Comment échanger deux variables sans variable temporaire ?

  :::indice
  Le destructuring peut aussi être utilisé dans une affectation, pas seulement dans une
  déclaration.
  :::

  :::reponse
  Avec une affectation par destructuring : `[a, b] = [b, a]`. Le membre de droite crée un
  tableau avec les valeurs actuelles, puis le destructuring les affecte dans l'ordre inverse.
  Attention au point-virgule : si la ligne précédente n'en a pas, la ligne commençant par `[`
  serait lue comme un accès à la ligne d'avant.
  :::
