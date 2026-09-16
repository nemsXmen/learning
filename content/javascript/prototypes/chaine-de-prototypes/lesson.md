---
id: javascript-chaine-prototypes
title: "La chaîne de prototypes et la recherche de propriété"
slug: chaine-de-prototypes
technology: javascript
level: intermediate
module: prototypes
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-this
  - javascript-objets-creer
skills:
  - prototype-chain
tags:
  - javascript
  - runtime
---

## Objectifs

- Décrire le lien de prototype que possède chaque objet, et la chaîne qu'il forme.
- Suivre la recherche d'une propriété à travers cette chaîne, jusqu'à `null`.
- Distinguer lecture et écriture : une écriture crée une propriété propre qui masque celle
  du prototype.

## Introduction

`[1, 2].map` existe, alors que ce tableau ne contient que deux nombres. `{}.toString()`
fonctionne, alors que l'objet est vide. Ces méthodes ne sont pas copiées dans chaque
valeur : elles sont **trouvées ailleurs**, en suivant un lien caché. Ce lien, le prototype,
est le mécanisme d'héritage de JavaScript — y compris sous la syntaxe `class`.

## Concept

Chaque objet possède un lien interne, noté `[[Prototype]]` dans la spécification, vers un
autre objet ou vers `null`. En suivant ces liens de proche en proche, on obtient la
**chaîne de prototypes**.

| Valeur | Sa chaîne |
| --- | --- |
| `{}` | `Object.prototype` → `null` |
| `[1, 2]` | `Array.prototype` → `Object.prototype` → `null` |
| `function () {}` | `Function.prototype` → `Object.prototype` → `null` |
| `Object.create(animal)` | `animal` → `Object.prototype` → `null` |

Les règles d'accès :

| Opération | Comportement |
| --- | --- |
| Lire `objet.p` | cherche `p` dans l'objet, puis dans chaque prototype ; `undefined` si rien |
| Écrire `objet.p = v` | crée ou modifie la propriété **propre** `p`, sans toucher aux prototypes |
| `Object.hasOwn(objet, 'p')` | vrai seulement pour une propriété propre |
| `'p' in objet` | vrai si `p` existe n'importe où dans la chaîne |

## Exemple

```js
const animal = {
  pattes: 4,
  respirer() {
    return `${this.nom} respire`;
  },
};

// Object.create crée un objet dont le prototype est animal (détaillé au chapitre 3).
const chien = Object.create(animal);
chien.nom = 'Rex';

console.log(chien.respirer()); // 'Rex respire' : méthode trouvée sur animal
console.log(chien.pattes); // 4 : propriété héritée
console.log(Object.hasOwn(chien, 'pattes'), 'pattes' in chien); // false true

chien.pattes = 3; // crée une propriété propre qui masque celle d'animal
console.log(chien.pattes, animal.pattes); // 3 4

console.log(Object.getPrototypeOf(chien) === animal); // true
console.log(Object.getPrototypeOf(animal) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null

console.log(Object.getPrototypeOf([1, 2]) === Array.prototype); // true
console.log(chien.inexistante); // undefined : fin de chaîne atteinte
```

## Comment ça fonctionne

Pour lire `chien.respirer`, le moteur regarde d'abord les propriétés **propres** de `chien`.
Il n'y trouve pas `respirer` ; il suit alors le lien `[[Prototype]]` vers `animal`, où la
méthode existe, et s'arrête. S'il avait atteint `null` sans rien trouver, la lecture aurait
renvoyé `undefined`. Rien n'est copié : `chien` ne contient que `nom`, et c'est la recherche
qui donne l'illusion qu'il possède tout le reste.

Dans la méthode héritée, `this` vaut `chien`, pas `animal`. La règle de la méthode s'applique
à l'appel `chien.respirer()` : peu importe où la fonction a été trouvée, l'objet devant le
point est `chien`. C'est ce qui permet à une seule fonction, rangée sur le prototype, de
servir toutes les instances avec leurs propres données.

L'**écriture** ne suit pas la chaîne. `chien.pattes = 3` crée une propriété propre sur
`chien`, qui **masque** désormais celle d'`animal` pour toute lecture sur `chien`, sans
modifier `animal`. Deux exceptions existent : si la chaîne contient un **accesseur** `set`
pour ce nom, il est appelé au lieu de créer une propriété ; et si la propriété héritée est
non modifiable, l'écriture échoue — silencieusement en mode non strict, avec une `TypeError`
en mode strict.

Le piège le plus courant vient de là. Une valeur **modifiable** placée sur un prototype —
un tableau, un objet — est **partagée** par tous les objets qui en héritent :
`chien.jouets.push('balle')` ne fait aucune écriture sur `chien`, il lit `jouets` sur le
prototype et modifie ce tableau commun. Les données propres à chaque objet doivent donc être
créées sur l'objet lui-même, et le prototype réservé aux méthodes et aux constantes.

Enfin, `for...in` parcourt aussi les propriétés énumérables héritées, alors que
`Object.keys` s'en tient aux propriétés propres, comme vu dans la partie Data Structures.

## Erreurs fréquentes

**Placer un tableau ou un objet modifiable sur un prototype.** Tous les héritiers partagent
la même instance.

**Croire qu'une écriture modifie le prototype.** Elle crée une propriété propre qui masque la
valeur héritée.

**Tester l'existence avec `in` quand on veut une propriété propre.** Utilise `Object.hasOwn`.

**Modifier `Object.prototype` ou `Array.prototype`.** Toutes les valeurs du programme — et
des bibliothèques — sont touchées.

## À retenir

- Chaque objet a un lien `[[Prototype]]` ; ces liens forment une chaîne qui finit par `null`.
- Lecture : l'objet, puis chaque prototype, jusqu'à trouver ou atteindre `null`.
- Écriture : propriété propre, qui masque la valeur héritée.
- Dans une méthode héritée, `this` reste l'objet sur lequel on l'appelle.
- Pas de valeur modifiable partagée sur un prototype : méthodes et constantes seulement.

## Exercices

1. Pour chaque ligne, dis où la propriété est trouvée, ou pourquoi elle ne l'est pas.

   ```js
   const vehicule = { roues: 4, demarrer() { return 'vroum'; } };
   const moto = Object.create(vehicule);
   moto.roues = 2;

   moto.roues;
   moto.demarrer();
   moto.toString;
   moto.voler;
   ```

   :::indice
   Pars de l'objet, puis remonte : `vehicule`, puis `Object.prototype`, puis `null`.
   :::

   :::solution
   - `moto.roues` vaut `2` : propriété propre de `moto`, qui masque celle de `vehicule`.
   - `moto.demarrer()` renvoie `'vroum'` : méthode trouvée sur `vehicule`.
   - `moto.toString` est une fonction : trouvée sur `Object.prototype`, deux niveaux plus haut.
   - `moto.voler` vaut `undefined` : la chaîne est parcourue jusqu'à `null` sans résultat.
   :::

2. Tous les chiens partagent le même tableau de jouets. Explique pourquoi, puis corrige.

   ```js
   const chienBase = { jouets: [], ajouterJouet(j) { this.jouets.push(j); } };
   const rex = Object.create(chienBase);
   const medor = Object.create(chienBase);
   rex.ajouterJouet('balle');
   console.log(medor.jouets); // ['balle']
   ```

   :::indice
   `this.jouets.push(...)` écrit-il une propriété sur `rex`, ou lit-il un tableau existant ?
   :::

   :::solution
   `push` ne fait aucune écriture de propriété sur `rex` : `this.jouets` est **lu**, trouvé sur
   `chienBase`, puis ce tableau unique est modifié. Les données propres doivent être créées
   sur chaque objet.

   ```js
   const chienBase = { ajouterJouet(j) { this.jouets.push(j); } };

   function creerChien() {
     const chien = Object.create(chienBase);
     chien.jouets = []; // propriété propre, un tableau par chien
     return chien;
   }

   const rex = creerChien();
   const medor = creerChien();
   rex.ajouterJouet('balle');
   console.log(rex.jouets, medor.jouets); // ['balle'] []
   ```
   :::

3. Écris `chaine(objet)` qui renvoie la liste des prototypes d'un objet, du plus proche au
   plus lointain, sans inclure `null`.

   :::indice
   Boucle avec `Object.getPrototypeOf` tant que le résultat n'est pas `null`.
   :::

   :::solution
   ```js
   function chaine(objet) {
     const prototypes = [];
     let courant = Object.getPrototypeOf(objet);
     while (courant !== null) {
       prototypes.push(courant);
       courant = Object.getPrototypeOf(courant);
     }
     return prototypes;
   }

   const liste = chaine([1, 2]);
   console.log(liste.length); // 2
   console.log(liste[0] === Array.prototype, liste[1] === Object.prototype); // true true
   ```
   :::

## Questions d'entretien

- Comment fonctionne la recherche d'une propriété en JavaScript ?

  :::indice
  Que se passe-t-il quand la propriété n'est pas sur l'objet lui-même ?
  :::

  :::reponse
  Le moteur cherche d'abord parmi les propriétés propres de l'objet. S'il ne trouve pas, il
  suit le lien `[[Prototype]]` et recommence sur le prototype, et ainsi de suite jusqu'à
  trouver la propriété ou atteindre `null`, auquel cas la lecture renvoie `undefined`. Rien
  n'est copié : c'est une délégation. Une méthode trouvée plus haut s'exécute avec `this`
  égal à l'objet de départ, ce qui permet de partager les méthodes entre toutes les instances.
  :::

- Quelle différence entre `Object.hasOwn(objet, 'p')` et `'p' in objet` ?

  :::indice
  L'un regarde seulement l'objet, l'autre toute la chaîne.
  :::

  :::reponse
  `Object.hasOwn` ne renvoie `true` que si `p` est une propriété propre de l'objet. `in`
  renvoie `true` si `p` existe n'importe où dans la chaîne de prototypes, y compris sur
  `Object.prototype` : `'toString' in {}` vaut `true`. Pour valider des données ou parcourir
  un dictionnaire, on veut presque toujours les propriétés propres.
  :::

- Pourquoi ne faut-il pas placer un tableau sur un prototype ?

  :::indice
  Ajouter un élément au tableau crée-t-il une propriété sur l'objet héritier ?
  :::

  :::reponse
  Parce qu'il est partagé par tous les objets qui héritent du prototype. Modifier le tableau
  avec `push` n'écrit aucune propriété sur l'héritier : la lecture trouve le tableau du
  prototype, et c'est ce tableau commun qui change, visible depuis toutes les instances. Seule
  une affectation, `objet.tableau = []`, créerait une propriété propre. Le prototype doit
  contenir le comportement partagé — méthodes, constantes — et chaque objet ses propres
  données.
  :::
