---
id: javascript-object-create
title: "Constructor functions et Object.create"
slug: constructeurs-et-object-create
technology: javascript
level: intermediate
module: prototypes
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-prototype-proto
skills:
  - constructor-functions
tags:
  - javascript
  - runtime
---

## Objectifs

- Décrire précisément les quatre étapes de `new`.
- Écrire une fonction constructeur avec des méthodes partagées sur son prototype.
- Créer un objet avec un prototype choisi, sans constructeur, grâce à `Object.create`.

## Introduction

Avant `class`, les objets « typés » de JavaScript se fabriquaient avec des fonctions
constructeurs et `new`. On en croise encore partout : dans le code existant, dans les
bibliothèques, et sous la syntaxe `class` elle-même, qui produit exactement ce mécanisme.
`Object.create` offre une seconde voie, plus directe : relier un objet à un prototype sans
passer par un constructeur.

## Concept

`new Constructeur(arguments)` réalise quatre étapes :

| Étape | Effet |
| --- | --- |
| 1 | crée un objet vide |
| 2 | lui donne `Constructeur.prototype` comme `[[Prototype]]` |
| 3 | appelle `Constructeur` avec `this` égal à ce nouvel objet |
| 4 | renvoie l'objet — sauf si le constructeur renvoie lui-même un **objet** |

`Object.create` fait les étapes 1 et 2, et rien d'autre :

| Écriture | Résultat |
| --- | --- |
| `Object.create(proto)` | un objet vide dont le prototype est `proto` |
| `Object.create(proto, descripteurs)` | idem, avec des propriétés définies par descripteurs |
| `Object.create(null)` | un objet sans aucun prototype |

Par convention, un constructeur porte un nom en majuscule, et ses méthodes sont rangées sur
son `prototype`, pas dans le constructeur.

## Exemple

```js
function Compte(titulaire, solde = 0) {
  this.titulaire = titulaire; // données propres à chaque instance
  this.solde = solde;
}

Compte.prototype.deposer = function (montant) {
  this.solde += montant; // méthode partagée par toutes les instances
  return this.solde;
};

const compteAda = new Compte('Ada', 100);
const compteGrace = new Compte('Grace');
console.log(compteAda.deposer(50), compteGrace.deposer(10)); // 150 10
console.log(compteAda.deposer === compteGrace.deposer); // true : une seule fonction

function construire(Constructeur, ...args) {
  const objet = Object.create(Constructeur.prototype); // étapes 1 et 2
  const resultat = Constructeur.apply(objet, args); // étape 3
  return resultat !== null && typeof resultat === 'object' ? resultat : objet; // étape 4
}
const compteLinus = construire(Compte, 'Linus', 5);
console.log(compteLinus.deposer(5), compteLinus instanceof Compte); // 10 true

const modeleSalutation = {
  saluer() {
    return `Bonjour ${this.nom}`;
  },
};
const ada = Object.create(modeleSalutation);
ada.nom = 'Ada';
console.log(ada.saluer()); // 'Bonjour Ada'

const registre = Object.create(null);
registre.toString = 'une clé comme une autre';
console.log(Object.keys(registre), 'hasOwnProperty' in registre); // ['toString'] false
```

## Comment ça fonctionne

La fonction `construire` de l'exemple reproduit `new` étape par étape, et c'est la meilleure
description de ce qu'il fait. `Object.create(Constructeur.prototype)` produit l'objet relié au
bon prototype ; `apply` exécute le constructeur avec cet objet comme `this` ; enfin, le
résultat est renvoyé.

La quatrième étape a une subtilité : si le constructeur renvoie explicitement un **objet**,
c'est lui que `new` renvoie, et l'objet préparé est abandonné. Une valeur **primitive**
renvoyée est ignorée. Ce comportement sert rarement, mais il explique certains motifs de
cache ou de singleton rencontrés dans du code ancien.

Les **méthodes** vont sur le prototype, les **données** dans le constructeur. Une méthode
définie dans le constructeur — `this.deposer = function () {}` — serait recréée pour chaque
instance : même comportement, mais une fonction par objet au lieu d'une seule. Sur le
prototype, elle est partagée, et `this` lui fournit les données de l'instance appelante. Pour
la même raison, une méthode de prototype ne doit pas être une fonction fléchée : elle n'aurait
pas le `this` de l'instance.

**Oublier `new`** est l'erreur typique des constructeurs. `Compte('Ada')` devient un appel
seul : en mode strict, `this` vaut `undefined` et `this.titulaire = …` lève une `TypeError` ;
en mode non strict, les propriétés atterrissent sur l'objet global. Un constructeur peut s'en
protéger en testant `new.target`, qui vaut `undefined` quand la fonction n'est pas appelée
avec `new`. Les classes, elles, refusent d'office d'être appelées sans `new`.

`Object.create` permet la **délégation pure** : un objet modèle contient les comportements, et
d'autres objets y délèguent sans constructeur ni `prototype`. Son second argument accepte des
descripteurs de propriétés, abordés dans la partie Advanced.

Enfin, `Object.create(null)` produit un objet sans aucune propriété héritée : ni `toString`,
ni `hasOwnProperty`, ni `__proto__`. C'est un dictionnaire dont toutes les clés sont sûres.
Pour ce besoin, une `Map` reste en général plus pratique.

## Erreurs fréquentes

**Appeler un constructeur sans `new`.** `TypeError` en mode strict, pollution de l'objet
global sinon.

**Définir les méthodes dans le constructeur.** Chaque instance porte ses propres copies.

**Écrire une méthode de prototype en fonction fléchée.** Elle ne reçoit pas le `this` de
l'instance.

**Renvoyer un objet depuis un constructeur sans le vouloir.** Il remplace l'instance créée par
`new`.

**Appeler une méthode héritée d'`Object.prototype` sur un objet créé par `Object.create(null)`.**
Elle n'existe pas : utilise `Object.hasOwn(objet, cle)`.

## À retenir

- `new` : objet vide, relié à `Constructeur.prototype`, constructeur appelé avec ce `this`,
  objet renvoyé.
- Un objet renvoyé par le constructeur remplace l'instance ; une primitive est ignorée.
- Données dans le constructeur, méthodes sur le prototype.
- `Object.create(proto)` relie sans constructeur ; `Object.create(null)` ne relie à rien.
- `new.target` permet de détecter un oubli de `new`.

## Exercices

1. Écris un constructeur `Minuteur(duree)` avec une méthode partagée `restant(ecoule)` qui
   renvoie le temps restant, jamais négatif. Vérifie que deux minuteurs partagent la méthode.

   :::indice
   La durée est une donnée d'instance ; la méthode va sur `Minuteur.prototype`.
   :::

   :::solution
   ```js
   function Minuteur(duree) {
     this.duree = duree;
   }

   Minuteur.prototype.restant = function (ecoule) {
     return Math.max(0, this.duree - ecoule);
   };

   const court = new Minuteur(30);
   const long = new Minuteur(120);
   console.log(court.restant(45), long.restant(45)); // 0 75
   console.log(court.restant === long.restant); // true
   ```
   :::

2. Protège ce constructeur contre un appel sans `new`, de façon qu'il fonctionne dans les
   deux cas.

   ```js
   function Utilisateur(nom) {
     this.nom = nom;
   }
   ```

   :::indice
   `new.target` vaut `undefined` quand la fonction n'est pas appelée avec `new`.
   :::

   :::solution
   ```js
   function Utilisateur(nom) {
     if (!new.target) {
       return new Utilisateur(nom);
     }
     this.nom = nom;
   }

   const a = new Utilisateur('Ada');
   const b = Utilisateur('Grace');
   console.log(a.nom, b.nom, b instanceof Utilisateur); // 'Ada' 'Grace' true
   ```

   Une autre option est de lever une erreur explicite. Une classe règle la question
   d'office, en refusant tout appel sans `new`.
   :::

3. Sans constructeur ni classe, crée un modèle `forme` avec une méthode `decrire()`, puis deux
   objets qui y délèguent avec leurs propres dimensions.

   :::indice
   `Object.create(modele)` crée un objet relié au modèle ; ajoute ensuite ses propriétés
   propres.
   :::

   :::solution
   ```js
   const forme = {
     decrire() {
       return `${this.nom} de ${this.largeur} × ${this.hauteur}`;
     },
   };

   function creerForme(nom, largeur, hauteur) {
     const objet = Object.create(forme);
     Object.assign(objet, { nom, largeur, hauteur });
     return objet;
   }

   console.log(creerForme('Carré', 2, 2).decrire()); // 'Carré de 2 × 2'
   console.log(creerForme('Bandeau', 10, 1).decrire()); // 'Bandeau de 10 × 1'
   ```
   :::

## Questions d'entretien

- Que fait exactement `new` ?

  :::indice
  Quatre étapes, dont une qui dépend de ce que renvoie le constructeur.
  :::

  :::reponse
  Il crée un objet vide, lui donne `Constructeur.prototype` comme prototype, appelle le
  constructeur avec `this` égal à cet objet, puis renvoie l'objet. Si le constructeur renvoie
  explicitement un objet, c'est cet objet qui est renvoyé à la place ; une valeur primitive
  renvoyée est ignorée. Une fonction fléchée ne peut pas être appelée avec `new`, faute de
  propriété `prototype`.
  :::

- Quelle différence entre `Object.create(proto)` et `new Constructeur()` ?

  :::indice
  Lequel des deux exécute du code d'initialisation ?
  :::

  :::reponse
  Les deux créent un objet relié à un prototype, mais `Object.create` s'arrête là : aucun
  constructeur n'est exécuté, aucune propriété n'est initialisée, et le prototype peut être
  n'importe quel objet, ou `null`. `new` suppose une fonction dotée d'une propriété
  `prototype` et exécute son code d'initialisation. `Object.create` convient à la délégation
  directe entre objets, `new` — ou une classe — à la fabrication d'instances d'un type.
  :::

- À quoi sert `Object.create(null)` ?

  :::indice
  Qu'hérite normalement un objet littéral vide ?
  :::

  :::reponse
  À créer un objet sans aucune propriété héritée. Un littéral vide hérite d'`Object.prototype`
  — `toString`, `hasOwnProperty`, l'accesseur `__proto__` —, ce qui pose problème quand les
  clés viennent de données externes : une clé `"__proto__"` ou `"toString"` peut entrer en
  collision. Un objet sans prototype est un dictionnaire sûr. En code moderne, une `Map`
  remplit ce rôle plus clairement et n'a pas ces pièges.
  :::
