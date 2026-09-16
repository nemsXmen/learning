---
id: javascript-rest-spread
title: "Rest et spread : un nombre libre d'arguments"
slug: rest-et-spread
technology: javascript
level: intermediate
module: fonctions-avancees
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-fonctions-parametres
skills:
  - rest-spread-arguments
tags:
  - javascript
  - fonctions
---

## Objectifs

- Accepter un nombre libre d'arguments avec un paramètre de reste.
- Étaler un tableau en arguments à l'appel avec le spread.
- Remplacer l'objet `arguments` par une écriture moderne et lisible.

## Introduction

`Math.max(1, 2, 3)` accepte autant d'arguments qu'on veut ; `console.log` aussi. À
l'inverse, on a souvent un tableau et une fonction qui attend des arguments séparés. Les
trois points `...` répondent aux deux besoins : **rester** côté déclaration, **étaler**
côté appel. Même symbole, deux sens opposés — et c'est ce qui les rend faciles à confondre.

## Concept

| Où | Nom | Rôle |
| --- | --- | --- |
| Dans la déclaration | reste | rassemble les arguments restants dans un tableau |
| Dans l'appel | spread | étale un itérable en arguments séparés |

```js
function additionner(...nombres) {}  // reste : nombres est un tableau
additionner(...[1, 2, 3]);           // spread : trois arguments
```

Règles du paramètre de reste : il est **unique**, toujours **en dernier**, et c'est un vrai
tableau — avec `map`, `filter` et `reduce`, contrairement à l'objet `arguments`.

## Exemple

```js
function additionner(...nombres) {
  return nombres.reduce((somme, n) => somme + n, 0);
}
console.log(additionner()); // 0
console.log(additionner(1, 2, 3)); // 6

function journaliser(niveau, ...messages) {
  return `[${niveau}] ${messages.join(' ')}`;
}
console.log(journaliser('info', 'serveur', 'démarré')); // '[info] serveur démarré'

const scores = [12, 45, 7];
console.log(Math.max(...scores)); // 45
console.log(Math.max(scores)); // NaN : un tableau n'est pas un nombre

const debut = [1, 2];
const fin = [5, 6];
console.log([...debut, 3, 4, ...fin]); // [1, 2, 3, 4, 5, 6]

function ancienne() {
  return Array.from(arguments).join('-'); // objet arguments, forme historique
}
console.log(ancienne('a', 'b')); // 'a-b'
```

## Comment ça fonctionne

Le paramètre de reste rassemble tout ce qui n'a pas été capté par les paramètres précédents,
dans un **vrai tableau** — vide s'il ne reste rien. C'est sa principale différence avec
l'objet `arguments`, qui ressemble à un tableau sans en être un, n'existe pas dans les
fonctions fléchées, et ne dit pas quels arguments la fonction attend vraiment.

Le spread, côté appel, fonctionne avec n'importe quel **itérable** : tableau, chaîne, `Set`,
`Map`. `Math.max(...scores)` transmet donc trois arguments distincts, là où
`Math.max(scores)` transmet un tableau, converti en `NaN`.

Il y a une limite pratique : étaler un très grand tableau — de l'ordre de la centaine de
milliers d'éléments — peut dépasser la taille de la pile d'appels et lever une
`RangeError`. Pour un maximum sur un gros volume, une boucle ou un `reduce` reste plus sûr.

`f.length` ignore le paramètre de reste : `(a, ...reste) => {}` a une longueur de 1. Et
comme le reste doit être le dernier paramètre, `function f(...nombres, dernier)` est une
erreur de syntaxe.

Le même symbole sert à copier un tableau, `[...liste]`, ou un objet, `{ ...objet }` : dans
les deux cas, il s'agit d'étaler le contenu dans une nouvelle structure.

## Erreurs fréquentes

**Passer un tableau à une fonction variadique.** `Math.max(scores)` donne `NaN` : il faut
`Math.max(...scores)`.

**Placer le reste ailleurs qu'en dernier.** C'est une erreur de syntaxe.

**Utiliser `arguments` dans une fonction fléchée.** Il n'y existe pas : utilise `...args`.

**Traiter `arguments` comme un tableau.** Il n'a ni `map` ni `filter` ; il faut d'abord
`Array.from(arguments)`.

## À retenir

- Déclaration : `...nom` rassemble les arguments restants dans un tableau.
- Appel : `...iterable` étale les valeurs en arguments séparés.
- Le reste est unique et toujours en dernier ; il est vide plutôt qu'absent.
- `arguments` est une survivance : `...args` le remplace, y compris dans les fléchées.
- Étaler un très grand tableau peut lever une `RangeError`.

## Exercices

1. Écris `moyenne(...notes)` qui accepte un nombre libre de notes et renvoie `0` si on ne
   lui en passe aucune.

   :::indice
   Le paramètre de reste est un tableau, éventuellement vide : teste sa longueur avant de
   diviser.
   :::

   :::solution
   ```js
   function moyenne(...notes) {
     if (notes.length === 0) {
       return 0;
     }
     return notes.reduce((somme, note) => somme + note, 0) / notes.length;
   }

   console.log(moyenne(12, 15, 9)); // 12
   console.log(moyenne()); // 0
   ```

   Sans le garde-fou, la division par `0` renverrait `NaN`.
   :::

2. À partir de `const scores = [12, 45, 7]`, affiche le plus grand score, puis crée un
   tableau qui insère `0` avant ces scores et `100` après.

   :::indice
   `Math.max` attend des arguments séparés, pas un tableau.
   :::

   :::solution
   ```js
   const scores = [12, 45, 7];

   console.log(Math.max(...scores)); // 45
   console.log([0, ...scores, 100]); // [0, 12, 45, 7, 100]
   ```
   :::

3. Écris `journaliser(niveau, ...messages)` qui produit `[info] serveur démarré`, puis
   appelle-la en lui passant un tableau de messages déjà constitué.

   :::indice
   Le reste rassemble à la déclaration ; le spread étale à l'appel. Les deux se combinent.
   :::

   :::solution
   ```js
   function journaliser(niveau, ...messages) {
     return `[${niveau}] ${messages.join(' ')}`;
   }

   console.log(journaliser('info', 'serveur', 'démarré')); // '[info] serveur démarré'

   const parties = ['serveur', 'démarré'];
   console.log(journaliser('info', ...parties)); // même résultat
   console.log(journaliser('info', parties)); // '[info] serveur,démarré' : un seul argument
   ```

   Le dernier appel montre la différence : sans spread, le tableau entier devient un seul
   message, et `join` affiche sa conversion en chaîne.
   :::

## Questions d'entretien

- Quelle différence entre le reste et le spread ?

  :::indice
  Le symbole est le même : ce qui change, c'est l'endroit où il apparaît.
  :::

  :::reponse
  Le reste apparaît dans une **déclaration** — paramètres, destructuring — et **rassemble**
  plusieurs valeurs dans un tableau ou un objet. Le spread apparaît dans un **appel** ou un
  littéral et **étale** un itérable en valeurs séparées. L'un concentre, l'autre disperse ;
  on les distingue en regardant si l'on est en train de recevoir ou d'envoyer des valeurs.
  :::

- Pourquoi préférer `...args` à l'objet `arguments` ?

  :::indice
  Regarde le type de chacun, et les fonctions où ils existent.
  :::

  :::reponse
  `...args` est un vrai tableau : il a `map`, `filter` et `reduce`, et il apparaît dans la
  signature, donc le lecteur voit que la fonction est variadique. `arguments` est un
  objet ressemblant à un tableau, qu'il faut convertir avec `Array.from`, il n'existe pas dans
  les fonctions fléchées, et il masque la véritable signature. C'est une survivance d'avant
  ES2015.
  :::

- Y a-t-il une limite au spread dans un appel ?

  :::indice
  Que devient chaque valeur étalée, du point de vue de l'appel de fonction ?
  :::

  :::reponse
  Oui : chaque valeur devient un argument, et le nombre d'arguments d'un appel est limité par
  la pile. Étaler un tableau de plusieurs centaines de milliers d'éléments peut lever une
  `RangeError: Maximum call stack size exceeded`. Pour agréger un gros volume, on utilise une
  boucle ou `reduce` plutôt que `Math.max(...enorme)`.
  :::
