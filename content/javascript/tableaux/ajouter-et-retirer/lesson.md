---
id: javascript-tableaux-ajouter-retirer
title: "Ajouter et retirer : push, pop, shift, unshift et splice"
slug: ajouter-et-retirer
technology: javascript
level: beginner
module: tableaux
order: 2
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-tableaux-creer
skills:
  - arrays-mutation
tags:
  - javascript
  - tableaux
---

## Objectifs

- Ajouter et retirer des éléments au début ou à la fin d'un tableau.
- Insérer, supprimer ou remplacer des éléments au milieu avec `splice`.
- Savoir ce que renvoie chaque méthode, et qu'elles modifient toutes le tableau d'origine.

## Introduction

Une file d'attente où les clients arrivent et sont servis, un historique d'actions qu'on
annule, une liste de tâches dont on supprime un élément : les tableaux changent au fil du
programme. Cinq méthodes couvrent ces besoins. Elles ont un point commun capital : elles
**modifient le tableau sur place**, ce qui est parfois exactement ce qu'on veut, et
parfois la source d'un bug difficile à retrouver.

## Concept

| Méthode | Position | Effet | Renvoie |
| --- | --- | --- | --- |
| `push(...elements)` | fin | ajoute | la nouvelle longueur |
| `pop()` | fin | retire le dernier | l'élément retiré |
| `unshift(...elements)` | début | ajoute | la nouvelle longueur |
| `shift()` | début | retire le premier | l'élément retiré |
| `splice(debut, nombre, ...elements)` | n'importe où | retire `nombre` éléments à partir de `debut`, puis insère `elements` | un tableau des éléments retirés |

Deux structures classiques en découlent :

- une **pile** (*stack*, dernier arrivé, premier sorti) : `push` et `pop` ;
- une **file** (*queue*, premier arrivé, premier sorti) : `push` et `shift`.

## Exemple

```js
const file = [];
file.push('Ada');
file.push('Grace', 'Linus');
console.log(file); // ['Ada', 'Grace', 'Linus']

const servi = file.shift();
console.log(servi, file); // 'Ada' ['Grace', 'Linus']

const historique = ['saisir', 'gras', 'souligner'];
const annule = historique.pop();
console.log(annule, historique); // 'souligner' ['saisir', 'gras']

const lettres = ['a', 'b', 'c', 'd', 'e'];
const retires = lettres.splice(1, 2); // retire 2 éléments à partir de l'index 1
console.log(retires, lettres); // ['b', 'c'] ['a', 'd', 'e']

lettres.splice(1, 0, 'X', 'Y'); // n'en retire aucun, insère à l'index 1
console.log(lettres); // ['a', 'X', 'Y', 'd', 'e']

lettres.splice(-1, 1, 'Z'); // remplace le dernier
console.log(lettres); // ['a', 'X', 'Y', 'd', 'Z']
```

## Comment ça fonctionne

Toutes ces méthodes **modifient le tableau d'origine**. Si ce tableau est partagé —
passé à une fonction, stocké dans l'état d'une interface —, toutes les parties du code qui
le référencent voient la modification.

Leurs valeurs de retour surprennent souvent. `push` et `unshift` renvoient la **longueur**,
pas le tableau : `const liste = [].push('a')` met `1` dans `liste`.

`push` et `pop` agissent en fin de tableau : aucun autre élément ne bouge, c'est très
rapide. `shift` et `unshift` agissent au début : **tous les autres éléments doivent être
décalés** d'un index. Sur un tableau de plusieurs milliers d'éléments répété dans une
boucle, la différence devient sensible.

`splice` accepte un début négatif, compté depuis la fin. Sans deuxième argument, il retire
tout à partir de `debut`.

Retirer un élément avec `delete tableau[i]` est une fausse bonne idée : l'emplacement
devient un trou et `length` ne change pas. Utilise `splice(i, 1)`.

## Erreurs fréquentes

**Utiliser la valeur de retour de `push` comme tableau.** Elle vaut la nouvelle longueur.

**Confondre `splice` et `slice`.** `splice` modifie le tableau et renvoie ce qu'il a
retiré ; `slice` ne le modifie pas et renvoie une copie partielle.

**Retirer des éléments en parcourant le tableau vers l'avant.** Après un `splice(i, 1)`,
l'élément suivant prend l'index `i` et la boucle le saute. Parcours à l'envers, ou crée un
nouveau tableau avec `filter`.

**Supprimer avec `delete`.** Il laisse un trou et ne change pas la longueur.

**Modifier un tableau partagé par erreur.** Si d'autres parties du code en dépendent,
travaille sur une copie ou utilise les méthodes non mutantes, vues plus loin.

## À retenir

- `push` / `pop` à la fin, `unshift` / `shift` au début ; `splice` n'importe où.
- Toutes modifient le tableau d'origine.
- `push` et `unshift` renvoient la longueur ; `pop` et `shift`, l'élément retiré ;
  `splice`, un tableau des éléments retirés.
- `shift` et `unshift` décalent tous les éléments : plus lents sur de grands tableaux.
- Jamais `delete tableau[i]` : `splice(i, 1)`.

## Exercices

1. Simule une file d'attente : trois clients arrivent (« Ada », « Grace », « Linus »), puis
   le premier arrivé est servi. Affiche le client servi et ceux qui attendent encore.

   :::indice
   Une file ajoute à la fin et retire au début.
   :::

   :::solution
   ```js
   const file = [];
   file.push('Ada', 'Grace', 'Linus');

   const servi = file.shift();
   console.log(`Servi : ${servi}`); // Servi : Ada
   console.log(`En attente : ${file.join(', ')}`); // En attente : Grace, Linus
   ```
   :::

2. Retire l'élément `'b'` du tableau `['a', 'b', 'c']`, sans connaître sa position à
   l'avance, et sans rien retirer s'il est absent.

   :::indice
   `indexOf` donne la position de l'élément, ou `-1`. `splice(index, 1)` retire un élément.
   :::

   :::solution
   ```js
   const lettres = ['a', 'b', 'c'];
   const index = lettres.indexOf('b');

   if (index !== -1) {
     lettres.splice(index, 1);
   }

   console.log(lettres); // ['a', 'c']
   ```

   Sans le test, `splice(-1, 1)` retirerait le **dernier** élément quand `'b'` est absent.
   :::

3. Retire tous les nombres négatifs de `[3, -1, -2, 5, -4]` en modifiant le tableau
   lui-même.

   :::indice
   Retirer un élément décale tous ceux qui suivent. Dans quel sens parcourir le tableau pour
   que ce décalage ne fasse sauter aucun élément ?
   :::

   :::solution
   ```js
   const nombres = [3, -1, -2, 5, -4];

   for (let i = nombres.length - 1; i >= 0; i--) {
     if (nombres[i] < 0) {
       nombres.splice(i, 1);
     }
   }

   console.log(nombres); // [3, 5]
   ```

   En parcourant vers l'avant, le `-2` qui suit le `-1` prendrait son index après la
   suppression et serait sauté. Si modifier le tableau n'est pas nécessaire,
   `nombres.filter((n) => n >= 0)` crée un nouveau tableau, plus simplement.
   :::

## Questions d'entretien

- Quelle différence entre `splice` et `slice` ?

  :::indice
  L'un modifie le tableau, l'autre non.
  :::

  :::reponse
  `splice(debut, nombre, ...elements)` modifie le tableau sur place : il retire des éléments
  et peut en insérer, puis renvoie un tableau des éléments retirés. `slice(debut, fin)` ne
  modifie rien : il renvoie une copie de la portion demandée, `fin` exclu. Leurs noms se
  ressemblent, leurs effets sont opposés ; depuis ES2023, `toSpliced` offre une version non
  mutante de `splice`.
  :::

- Pourquoi `shift` peut-il être lent sur un grand tableau ?

  :::indice
  Que devient l'index de chaque élément quand on retire le premier ?
  :::

  :::reponse
  Retirer le premier élément oblige à décaler tous les autres d'un index : l'opération est
  en O(n). `pop`, qui retire le dernier, ne déplace rien. Appeler `shift` dans une boucle sur
  un grand tableau devient donc quadratique. Pour une vraie file volumineuse, on utilise un
  index de lecture qui avance, ou une structure dédiée.
  :::

- Pourquoi `delete tableau[i]` est-il une mauvaise idée ?

  :::indice
  Regarde la longueur du tableau et le contenu de l'index `i` après l'opération.
  :::

  :::reponse
  `delete` supprime la propriété d'index `i` sans décaler les éléments suivants ni changer
  `length` : il crée un trou. Les méthodes traitent ensuite ce trou de façon incohérente, et
  le tableau se comporte comme s'il avait toujours cet emplacement. Pour retirer un élément,
  on utilise `splice(i, 1)`, ou `filter` pour obtenir un nouveau tableau.
  :::
