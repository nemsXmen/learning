---
id: javascript-iterateurs
title: "Itérables et itérateurs : le protocole derrière for...of"
slug: iterables-et-iterateurs
technology: javascript
level: advanced
module: iterateurs-generateurs
order: 1
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-for-of-for-in
  - javascript-classes-bases
skills:
  - iterators
tags:
  - javascript
  - avance
---

## Objectifs

- Décrire le protocole d'itération : `Symbol.iterator`, `next`, `{ value, done }`.
- Rendre un objet itérable pour qu'il fonctionne avec `for...of`, le spread et le destructuring.
- Distinguer un itérable, qu'on peut parcourir plusieurs fois, d'un itérateur, qui s'épuise.

## Introduction

`for...of` parcourt un tableau, une chaîne, une `Map` ou un `Set`. Le spread `[...valeur]`, le destructuring,
`Array.from`, `Promise.all` acceptent ces mêmes valeurs. Ce n'est pas une liste de cas particuliers : toutes ces
syntaxes reposent sur un **protocole** commun, que n'importe quel objet peut implémenter. Le connaître permet de
rendre ses propres structures aussi naturelles à parcourir qu'un tableau.

## Concept

| Terme | Définition |
| --- | --- |
| **Itérable** | un objet qui possède une méthode `[Symbol.iterator]()` renvoyant un itérateur |
| **Itérateur** | un objet qui possède une méthode `next()` |
| Résultat de `next()` | `{ value, done }` : la valeur suivante, et `done: true` quand c'est terminé |

Ce qui consomme des itérables :

| Syntaxe ou fonction | Exemple |
| --- | --- |
| `for...of` | `for (const x of iterable)` |
| Spread | `[...iterable]`, `Math.max(...iterable)` |
| Destructuring de tableau | `const [premier, ...reste] = iterable` |
| Constructeurs et utilitaires | `Array.from`, `new Set`, `new Map`, `Promise.all`, `Object.fromEntries` |

Itérables natifs : tableaux, chaînes, `Map`, `Set`, `arguments`, `NodeList`. Un objet littéral **n'est pas** itérable.

## Exemple

```js
const tableau = [10, 20];
const iterateur = tableau[Symbol.iterator]();
console.log(iterateur.next()); // { value: 10, done: false }
console.log(iterateur.next()); // { value: 20, done: false }
console.log(iterateur.next()); // { value: undefined, done: true }

class Intervalle {
  constructor(debut, fin) {
    this.debut = debut;
    this.fin = fin;
  }

  [Symbol.iterator]() {
    let courant = this.debut;
    const fin = this.fin;
    return {
      next: () =>
        courant <= fin ? { value: courant++, done: false } : { value: undefined, done: true },
    };
  }
}

const semaine = new Intervalle(1, 7);
console.log([...semaine]); // [1, 2, 3, 4, 5, 6, 7]
console.log(Math.max(...semaine)); // 7

const [lundi, mardi, ...autres] = semaine;
console.log(lundi, mardi, autres.length); // 1 2 5

let total = 0;
for (const jour of semaine) {
  total += jour;
}
console.log(total); // 28 : l'intervalle se parcourt autant de fois qu'on veut

console.log([...'été'].length); // 3 : une chaîne s'itère par caractère
```

## Comment ça fonctionne

Quand le moteur rencontre `for (const x of valeur)`, il appelle `valeur[Symbol.iterator]()` pour obtenir un
**itérateur**, puis appelle `next()` à chaque tour. Tant que le résultat a `done: false`, il affecte `value` à `x` et
exécute le corps ; dès que `done` vaut `true`, la boucle s'arrête. Le spread, le destructuring et `Array.from` font
exactement la même chose. Si `valeur` n'a pas de méthode `Symbol.iterator`, le moteur lève
`TypeError: valeur is not iterable` — le message qu'on obtient en essayant de parcourir un objet littéral.

`Symbol.iterator` est un **symbole bien connu** : une clé de propriété unique, définie par le langage, qui ne peut
entrer en collision avec aucune chaîne. C'est ce qui permet d'ajouter le protocole à n'importe quel objet sans risquer
d'écraser une propriété existante. Le module suivant détaille les symboles.

La distinction entre **itérable** et **itérateur** est importante. L'itérable est la collection : chaque appel à
`[Symbol.iterator]()` crée un **nouvel** itérateur, qui repart du début. C'est pourquoi `semaine` peut être parcourue
plusieurs fois. L'itérateur, lui, garde une position et **s'épuise** : une fois `done` atteint, il reste terminé. Dans
l'exemple, `courant` est une variable locale à chaque appel, capturée par la fonction `next` — une closure —, ce qui
donne à chaque parcours son propre état.

Un itérateur peut aussi définir une méthode `return()`. Le moteur l'appelle quand un parcours s'arrête avant la fin —
`break`, `return` ou exception dans la boucle, destructuring qui ne lit que les premières valeurs —, pour libérer une
ressource comme un fichier ouvert.

Le protocole est **paresseux** : les valeurs sont produites une à une, à la demande. Un itérateur peut donc
représenter une suite très longue, voire infinie, tant que le code qui le consomme s'arrête à temps. Écrire ces
itérateurs à la main est verbeux ; les **générateurs**, sujet du chapitre suivant, les produisent automatiquement.

## Erreurs fréquentes

**Parcourir un objet littéral avec `for...of`.** Il n'est pas itérable : utilise `Object.entries`.

**Partager l'état du parcours dans l'objet lui-même.** Un second parcours reprendrait où le premier s'est arrêté.

**Oublier `done: true`.** La boucle ne se termine jamais.

**Étaler un itérable infini.** `[...naturels]` ne termine pas.

**Confondre itérable et itérateur.** Un itérateur déjà consommé ne produit plus rien.

## À retenir

- Itérable : une méthode `[Symbol.iterator]()` ; itérateur : une méthode `next()` qui renvoie `{ value, done }`.
- `for...of`, le spread, le destructuring et `Array.from` utilisent ce protocole.
- Chaque appel à `[Symbol.iterator]()` doit créer un nouvel itérateur.
- Un itérateur s'épuise ; `return()` permet de nettoyer un parcours interrompu.
- Le protocole est paresseux : les valeurs sont produites à la demande.

## Exercices

1. Rends itérable une classe `Playlist` qui contient un tableau de titres, pour que `[...playlist]` et `for...of`
   parcourent ses titres.

   :::indice
   La méthode `[Symbol.iterator]()` peut simplement renvoyer l'itérateur du tableau interne.
   :::

   :::solution
   ```js
   class Playlist {
     #titres = [];

     ajouter(titre) {
       this.#titres.push(titre);
       return this;
     }

     [Symbol.iterator]() {
       return this.#titres[Symbol.iterator]();
     }
   }

   const playlist = new Playlist().ajouter('Intro').ajouter('Refrain');
   console.log([...playlist]); // ['Intro', 'Refrain']
   for (const titre of playlist) console.log(titre); // 'Intro', puis 'Refrain'
   ```

   Déléguer à l'itérateur du tableau donne le bon comportement sans exposer le tableau privé.
   :::

2. Écris `associer(a, b)` qui renvoie un itérable de paires `[elementDeA, elementDeB]`, et s'arrête dès que l'un des deux
   itérables est épuisé. Il doit fonctionner avec n'importe quels itérables, pas seulement des tableaux.

   :::indice
   Obtiens un itérateur pour chaque argument, puis appelle leurs `next()` en parallèle dans ton propre `next()`.
   :::

   :::solution
   ```js
   function associer(a, b) {
     return {
       [Symbol.iterator]() {
         const iterateurA = a[Symbol.iterator]();
         const iterateurB = b[Symbol.iterator]();
         return {
           next() {
             const x = iterateurA.next();
             const y = iterateurB.next();
             if (x.done || y.done) return { value: undefined, done: true };
             return { value: [x.value, y.value], done: false };
           },
         };
       },
     };
   }

   console.log([...associer(['a', 'b', 'c'], new Set([1, 2]))]); // [['a', 1], ['b', 2]]
   console.log(Object.fromEntries(associer('xy', [10, 20]))); // { x: 10, y: 20 }
   ```
   :::

3. Un lecteur de lignes ouvre une ressource. Ajoute à son itérateur une méthode `return()` qui la ferme, et vérifie
   qu'elle est appelée quand la boucle s'arrête avec `break`.

   ```js
   function lignes(texte, journal) {
     return {
       [Symbol.iterator]() {
         journal.push('ouvert');
         const liste = texte.split('\n');
         let i = 0;
         return { next: () => (i < liste.length ? { value: liste[i++], done: false } : { value: undefined, done: true }) };
       },
     };
   }
   ```

   :::indice
   `return()` doit renvoyer `{ done: true }` ; le moteur l'appelle seul lors d'une sortie anticipée.
   :::

   :::solution
   ```js
   function lignes(texte, journal) {
     return {
       [Symbol.iterator]() {
         journal.push('ouvert');
         const liste = texte.split('\n');
         let i = 0;
         return {
           next: () => (i < liste.length ? { value: liste[i++], done: false } : { value: undefined, done: true }),
           return: () => {
             journal.push('fermé');
             return { value: undefined, done: true };
           },
         };
       },
     };
   }

   const journal = [];
   for (const ligne of lignes('ERREUR disque\nINFO démarrage\nINFO prêt', journal)) {
     if (ligne.startsWith('ERREUR')) {
       journal.push(`trouvé : ${ligne}`);
       break;
     }
   }
   console.log(journal); // ['ouvert', 'trouvé : ERREUR disque', 'fermé']
   ```

   Un parcours mené jusqu'au bout n'appelle pas `return()` : la ressource doit alors être fermée quand `next()` renvoie
   `done: true`.
   :::

## Questions d'entretien

- Qu'est-ce que le protocole d'itération ?

  :::indice
  Deux rôles, deux méthodes, un format de résultat.
  :::

  :::reponse
  Un objet est itérable s'il possède une méthode `[Symbol.iterator]()` qui renvoie un itérateur. Un itérateur possède une
  méthode `next()` qui renvoie `{ value, done }`. `for...of`, le spread, le destructuring, `Array.from`, `Promise.all` ou
  `new Map` reposent tous sur ce protocole, ce qui permet à n'importe quelle structure de s'intégrer au langage comme un
  tableau.
  :::

- Quelle différence entre un itérable et un itérateur ?

  :::indice
  Lequel peut être parcouru plusieurs fois ?
  :::

  :::reponse
  L'itérable représente la collection : chaque appel à `[Symbol.iterator]()` produit un nouvel itérateur qui repart du
  début, donc on peut le parcourir autant de fois qu'on veut. L'itérateur représente un parcours en cours : il garde une
  position et s'épuise une fois terminé. Les itérateurs natifs sont eux-mêmes itérables et renvoient `this`, ce qui permet
  de les passer à `for...of`, mais ils ne se rembobinent pas.
  :::

- Pourquoi un objet littéral n'est-il pas itérable ?

  :::indice
  Que faudrait-il parcourir : les clés, les valeurs ou les paires ?
  :::

  :::reponse
  Parce qu'il n'a pas de méthode `Symbol.iterator`, et que le langage n'impose pas de choix entre clés, valeurs ou paires.
  On choisit explicitement avec `Object.keys`, `Object.values` ou `Object.entries`, qui renvoient des tableaux itérables. Un
  objet peut toutefois devenir itérable si on lui ajoute sa propre méthode `[Symbol.iterator]`.
  :::
