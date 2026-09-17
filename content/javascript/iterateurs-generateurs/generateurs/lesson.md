---
id: javascript-generateurs
title: "Générateurs : function*, yield et suites paresseuses"
slug: generateurs
technology: javascript
level: advanced
module: iterateurs-generateurs
order: 2
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-iterateurs
skills:
  - generators
tags:
  - javascript
  - avance
---

## Objectifs

- Écrire une fonction génératrice avec `function*` et `yield` pour produire des valeurs une à une.
- Construire des suites paresseuses, y compris infinies, et les enchaîner sans créer de tableaux intermédiaires.
- Déléguer à un autre itérable avec `yield*`, et comprendre ce que deviennent `return` et `finally`.

## Introduction

Le chapitre précédent a montré qu'un itérateur écrit à la main demande un objet, une méthode `next` et une
gestion attentive de l'état. Une **fonction génératrice** fait tout cela automatiquement : on écrit le parcours
comme une boucle ordinaire, et chaque `yield` fournit la valeur suivante. Le code devient aussi lisible qu'une
fonction classique, tout en restant paresseux.

## Concept

| Écriture | Effet |
| --- | --- |
| `function* nom() {}` | déclare une fonction génératrice |
| Appel `nom()` | n'exécute rien : renvoie un **objet générateur**, à la fois itérateur et itérable |
| `yield valeur` | suspend la fonction et fournit `{ value: valeur, done: false }` |
| `return valeur` | termine : `{ value: valeur, done: true }`, ignoré par `for...of` |
| `yield* iterable` | produit toutes les valeurs d'un autre itérable |
| `generateur.next(x)` | reprend l'exécution ; `x` devient le résultat du `yield` en attente |

Une méthode génératrice s'écrit `*[Symbol.iterator]() { … }` dans une classe : c'est la façon la plus simple de rendre
une structure itérable.

## Exemple

```js
function* compter(jusqua) {
  for (let n = 1; n <= jusqua; n++) {
    yield n;
  }
  return 'terminé';
}

const generateur = compter(2);
console.log(generateur.next(), generateur.next(), generateur.next());
// { value: 1, done: false } { value: 2, done: false } { value: 'terminé', done: true }
console.log([...compter(3)]); // [1, 2, 3] : la valeur de return n'est pas incluse

class Intervalle {
  constructor(debut, fin) {
    this.debut = debut;
    this.fin = fin;
  }

  *[Symbol.iterator]() {
    for (let n = this.debut; n <= this.fin; n++) yield n;
  }
}
console.log([...new Intervalle(3, 6)]); // [3, 4, 5, 6]

function* naturels() {
  let n = 0;
  while (true) yield n++; // infini, mais rien n'est calculé à l'avance
}

function* filtrer(iterable, predicat) {
  for (const valeur of iterable) if (predicat(valeur)) yield valeur;
}

function* prendre(iterable, combien) {
  if (combien <= 0) return;
  for (const valeur of iterable) {
    yield valeur;
    if (--combien === 0) return;
  }
}

const multiplesDeSept = prendre(filtrer(naturels(), (n) => n % 7 === 0 && n > 0), 4);
console.log([...multiplesDeSept]); // [7, 14, 21, 28]

function* toutesLesLignes() {
  yield* ['en-tête'];
  yield* compter(2);
}
console.log([...toutesLesLignes()]); // ['en-tête', 1, 2]
```

## Comment ça fonctionne

Appeler une fonction génératrice n'exécute **aucune** de ses lignes : on obtient un objet générateur, en attente.
Chaque appel à `next()` reprend l'exécution là où elle s'était arrêtée, jusqu'au `yield` suivant, qui suspend à
nouveau la fonction en conservant ses variables locales. C'est la même idée de suspension que `await`, appliquée à la
production de valeurs. Quand la fonction atteint un `return` ou sa dernière ligne, le générateur est terminé et le
reste définitivement.

L'objet générateur est à la fois un **itérateur**, puisqu'il a `next()`, et un **itérable**, puisque sa méthode
`[Symbol.iterator]()` renvoie lui-même. On peut donc le passer directement à `for...of` ou au spread — une seule fois,
puisqu'il s'épuise. C'est pourquoi une méthode `*[Symbol.iterator]()` dans une classe est si pratique : chaque parcours
appelle la méthode et obtient un générateur neuf.

La **paresse** permet de composer des étapes sans matérialiser de tableaux. Dans l'exemple, `naturels` est infini,
mais `filtrer` et `prendre` ne demandent une valeur que lorsqu'on leur en demande une : le calcul s'arrête dès que
quatre multiples de 7 ont été produits. Avec des méthodes de tableau, il faudrait créer le tableau complet — impossible
ici. `prendre` ne consomme d'ailleurs **jamais** une valeur de trop : il s'arrête juste après la dernière produite.

`yield*` délègue le parcours à un autre itérable, générateur compris, et renvoie la valeur de `return` du générateur
délégué. `next(valeur)` permet l'inverse de `yield` : envoyer une valeur **dans** le générateur, qui la reçoit comme
résultat de l'expression `yield` en attente. Ce mécanisme a servi de base aux bibliothèques asynchrones avant
`async` / `await` ; il reste rare dans le code applicatif.

Enfin, un parcours interrompu par `break` appelle la méthode `return()` du générateur : l'exécution reprend dans un
éventuel bloc `finally`, ce qui permet de libérer une ressource même quand la boucle s'arrête tôt.

## Erreurs fréquentes

**Attendre qu'un appel de générateur exécute quelque chose.** Rien ne se passe avant le premier `next()`.

**Parcourir deux fois le même objet générateur.** Il est épuisé après le premier parcours.

**Étaler un générateur infini.** `[...naturels()]` ne termine jamais : limite d'abord le nombre de valeurs.

**Compter sur la valeur de `return` dans `for...of`.** Elle est ignorée.

**Écrire un itérateur à la main quand un générateur suffit.** `*[Symbol.iterator]()` est plus court et plus sûr.

## À retenir

- `function*` renvoie un générateur ; chaque `next()` exécute jusqu'au `yield` suivant.
- Un générateur est un itérateur et un itérable, qui s'épuise.
- Les générateurs permettent des suites paresseuses, même infinies, composées sans tableaux intermédiaires.
- `yield*` délègue à un autre itérable ; `*[Symbol.iterator]()` rend une classe itérable.
- Un `break` déclenche le `finally` du générateur.

## Exercices

1. Écris un générateur `fibonacci()` infini, puis affiche les dix premiers termes sans créer de tableau intermédiaire
   dans le générateur.

   :::indice
   Garde les deux derniers termes dans des variables, et produis le premier avant de décaler.
   :::

   :::solution
   ```js
   function* fibonacci() {
     let [a, b] = [0, 1];
     while (true) {
       yield a;
       [a, b] = [b, a + b];
     }
   }

   const termes = [];
   for (const terme of fibonacci()) {
     if (termes.length === 10) break;
     termes.push(terme);
   }
   console.log(termes); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
   ```
   :::

2. Écris un générateur `enTranches(iterable, taille)` qui regroupe les valeurs de n'importe quel itérable en tableaux de
   `taille` éléments, la dernière tranche pouvant être plus courte.

   :::indice
   Accumule dans un tableau, produis-le quand il est plein, et n'oublie pas la tranche restante à la fin.
   :::

   :::solution
   ```js
   function* enTranches(iterable, taille) {
     let tranche = [];
     for (const valeur of iterable) {
       tranche.push(valeur);
       if (tranche.length === taille) {
         yield tranche;
         tranche = [];
       }
     }
     if (tranche.length > 0) yield tranche;
   }

   console.log([...enTranches([1, 2, 3, 4, 5], 2)]); // [[1, 2], [3, 4], [5]]
   console.log([...enTranches('abcdef', 3)]); // [['a', 'b', 'c'], ['d', 'e', 'f']]
   ```
   :::

3. Montre qu'un générateur exécute son bloc `finally` quand la boucle qui le parcourt s'arrête avec `break`, en écrivant
   `lireEnregistrements(journal)` qui note « ouverture » et « fermeture ».

   :::indice
   Place les `yield` dans un `try`, et la fermeture dans le `finally`.
   :::

   :::solution
   ```js
   function* lireEnregistrements(journal) {
     journal.push('ouverture');
     try {
       yield 'enregistrement 1';
       yield 'enregistrement 2';
       yield 'enregistrement 3';
     } finally {
       journal.push('fermeture');
     }
   }

   const journal = [];
   for (const enregistrement of lireEnregistrements(journal)) {
     journal.push(enregistrement);
     if (enregistrement.endsWith('2')) break;
   }
   console.log(journal); // ['ouverture', 'enregistrement 1', 'enregistrement 2', 'fermeture']
   ```

   Le `break` appelle `return()` sur le générateur, qui reprend son exécution dans le `finally` au lieu de continuer la
   boucle.
   :::

## Questions d'entretien

- Qu'est-ce qu'un générateur, et en quoi diffère-t-il d'une fonction classique ?

  :::indice
  Que se passe-t-il au moment de l'appel, et à chaque `yield` ?
  :::

  :::reponse
  Un générateur est une fonction déclarée avec `function*` dont l'exécution peut être suspendue et reprise. L'appeler ne
  lance rien et renvoie un objet générateur ; chaque appel à `next()` exécute le code jusqu'au prochain `yield`, qui livre
  une valeur et suspend la fonction en conservant son état. Une fonction classique s'exécute en entier et renvoie une
  seule valeur. L'objet générateur étant itérable, on le parcourt avec `for...of`.
  :::

- Qu'apporte l'évaluation paresseuse des générateurs ?

  :::indice
  Pense à une suite infinie, ou à un traitement qui s'arrête tôt.
  :::

  :::reponse
  Les valeurs ne sont calculées qu'au moment où elles sont demandées. On peut donc représenter des suites infinies, enchaîner
  des étapes de filtrage et de transformation sans créer de tableaux intermédiaires, et arrêter le calcul dès qu'on a ce qu'il
  faut. C'est aussi économe en mémoire pour traiter de gros volumes élément par élément.
  :::

- À quoi sert `yield*` ?

  :::indice
  Comment un générateur peut-il produire toutes les valeurs d'un autre ?
  :::

  :::reponse
  `yield*` délègue le parcours à un autre itérable : toutes ses valeurs sont produites par le générateur courant, comme si
  on les avait données une à une avec `yield`. Appliqué à un générateur, il renvoie en plus la valeur de son `return`. Il
  permet de composer des générateurs, par exemple pour parcourir récursivement une arborescence.
  :::
