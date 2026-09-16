---
id: javascript-extends-super
title: "extends et super"
slug: extends-et-super
technology: javascript
level: intermediate
module: heritage
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-champs-prives
  - javascript-heritage-prototypal
skills:
  - class-inheritance
tags:
  - javascript
  - classes
---

## Objectifs

- Déclarer une classe dérivée avec `extends`, et appeler le constructeur parent avec `super`.
- Réutiliser une méthode parente avec `super.methode()`.
- Étendre correctement une classe native comme `Error`.

## Introduction

La partie Runtime a montré ce que `extends` construit sous le capot : deux chaînes de
prototypes reliées. Ce chapitre passe du côté de l'usage : les règles précises de `super`,
qui provoquent la plupart des erreurs, et le cas le plus courant d'héritage en JavaScript
applicatif — les erreurs personnalisées.

## Concept

| Écriture | Rôle |
| --- | --- |
| `class Cercle extends Forme` | `Cercle` hérite des méthodes d'instance et statiques de `Forme` |
| `super(arguments)` | appelle le constructeur parent ; obligatoire dans un constructeur dérivé |
| `super.methode()` | appelle la version parente d'une méthode |
| Pas de constructeur | équivaut à `constructor(...args) { super(...args); }` |

Deux règles sur le constructeur d'une classe dérivée :

1. il **doit** appeler `super(...)` avant de se terminer ;
2. il ne peut pas utiliser `this` **avant** cet appel.

## Exemple

```js
class Forme {
  constructor(nom) {
    this.nom = nom;
  }

  aire() {
    return 0;
  }

  decrire() {
    return `${this.nom} d'aire ${this.aire()}`;
  }
}

class Cercle extends Forme {
  constructor(rayon) {
    super('cercle'); // d'abord le parent
    this.rayon = rayon; // ensuite seulement, this
  }

  aire() {
    return Math.round(Math.PI * this.rayon ** 2 * 100) / 100;
  }
}

class Carre extends Forme {
  constructor(cote) {
    super('carré');
    this.cote = cote;
  }

  aire() {
    return this.cote ** 2;
  }

  decrire() {
    return `${super.decrire()} (côté ${this.cote})`;
  }
}

console.log(new Cercle(2).decrire()); // "cercle d'aire 12.57"
console.log(new Carre(3).decrire()); // "carré d'aire 9 (côté 3)"
console.log(new Carre(3) instanceof Forme); // true

class ErreurHttp extends Error {
  constructor(statut, message) {
    super(message);
    this.name = 'ErreurHttp';
    this.statut = statut;
  }
}

const erreur = new ErreurHttp(404, 'Ressource introuvable');
console.log(erreur instanceof Error, erreur.statut); // true 404
console.log(String(erreur)); // 'ErreurHttp: Ressource introuvable'
```

## Comment ça fonctionne

Dans une classe de base, `new` crée l'objet avant d'exécuter le constructeur. Dans une
classe **dérivée**, c'est différent : l'objet est créé par le constructeur **parent**, au
moment de l'appel `super(...)`. Avant cet appel, `this` n'existe tout simplement pas encore.
Le lire lève `ReferenceError: Must call super constructor in derived class before accessing
'this'`. Oublier complètement `super` produit la même erreur à la fin du constructeur.

Ce fonctionnement a une conséquence sur l'ordre d'initialisation. Les champs déclarés dans la
classe dérivée sont installés **juste après** le retour de `super()`. Si le constructeur
parent appelle une méthode que l'enfant redéfinit, cette méthode s'exécute alors que les
champs de l'enfant valent encore `undefined`. C'est un piège classique, détaillé au chapitre
suivant.

`super.methode()` ne passe pas par `this` pour trouver le parent. Chaque méthode déclarée dans
une classe mémorise l'objet où elle est définie, et `super` part du prototype de cet objet.
C'est pourquoi `super.decrire()` dans `Carre` trouve bien `Forme.prototype.decrire`, et que
l'exécution se fait avec `this` égal à l'instance : `this.aire()` y appelle la version du
carré.

Une classe sans constructeur reçoit un constructeur implicite qui transmet tous ses arguments
au parent. On n'écrit donc un constructeur dérivé que pour ajouter quelque chose.

Étendre une classe **native** fonctionne avec `class`, contrairement à l'ancienne méthode par
prototypes. Pour `Error`, deux détails comptent : appeler `super(message)` pour obtenir le
message et la pile d'appels, et définir `name`, faute de quoi l'erreur s'affiche comme une
simple `Error`. Pour `Array`, les méthodes comme `map` renvoient même des instances de la
sous-classe.

## Erreurs fréquentes

**Utiliser `this` avant `super()`.** `ReferenceError` : appelle le parent en premier.

**Oublier `super()` dans un constructeur dérivé.** Même erreur, à la sortie du constructeur.

**Écrire un constructeur qui se contente d'appeler `super`.** Le constructeur implicite fait
déjà exactement cela.

**Oublier `name` dans une erreur personnalisée.** Les journaux affichent `Error` au lieu du
vrai type.

**Hériter pour réutiliser deux méthodes.** L'héritage exprime une relation « est un » ; pour
réutiliser du code, préfère la composition, vue plus loin dans ce module.

## À retenir

- `extends` relie les instances et les méthodes statiques au parent.
- Dans un constructeur dérivé, `super(...)` crée l'objet : rien sur `this` avant lui.
- `super.methode()` appelle la version parente, avec `this` égal à l'instance.
- Sans constructeur, les arguments sont transmis au parent automatiquement.
- Erreur personnalisée : `extends Error`, `super(message)` et un `name` explicite.

## Exercices

1. Écris `Rectangle extends Forme` avec `largeur` et `hauteur`, qui redéfinit `aire()`, en
   partant de la classe `Forme` de l'exemple.

   :::indice
   Le constructeur appelle d'abord `super('rectangle')`, puis stocke ses dimensions.
   :::

   :::solution
   ```js
   class Rectangle extends Forme {
     constructor(largeur, hauteur) {
       super('rectangle');
       this.largeur = largeur;
       this.hauteur = hauteur;
     }

     aire() {
       return this.largeur * this.hauteur;
     }
   }

   console.log(new Rectangle(3, 4).decrire()); // "rectangle d'aire 12"
   ```

   `decrire`, héritée de `Forme`, appelle `this.aire()` : c'est la version du rectangle qui
   s'exécute.
   :::

2. Ce constructeur lève une `ReferenceError`. Explique pourquoi et corrige.

   ```js
   class Administrateur extends Utilisateur {
     constructor(nom, droits) {
       this.droits = droits;
       super(nom);
     }
   }
   ```

   :::indice
   Dans une classe dérivée, qui crée l'objet désigné par `this` ?
   :::

   :::solution
   Dans une classe dérivée, l'objet est créé par le constructeur parent lors de `super(nom)`.
   Avant cet appel, `this` n'existe pas : l'affecter lève une `ReferenceError`.

   ```js
   class Administrateur extends Utilisateur {
     constructor(nom, droits) {
       super(nom);
       this.droits = droits;
     }
   }
   ```
   :::

3. Écris `ErreurValidation extends Error` qui reçoit la liste des champs invalides, produit
   le message `Champs invalides : email, age`, et se reconnaît avec `instanceof`.

   :::indice
   Construis le message avant de le passer à `super`, puis définis `name` et `champs`.
   :::

   :::solution
   ```js
   class ErreurValidation extends Error {
     constructor(champs) {
       super(`Champs invalides : ${champs.join(', ')}`);
       this.name = 'ErreurValidation';
       this.champs = champs;
     }
   }

   try {
     throw new ErreurValidation(['email', 'age']);
   } catch (erreur) {
     if (erreur instanceof ErreurValidation) {
       console.log(erreur.message, erreur.champs.length); // 'Champs invalides : email, age' 2
     }
   }
   ```
   :::

## Questions d'entretien

- Pourquoi faut-il appeler `super()` avant d'utiliser `this` dans une classe dérivée ?

  :::indice
  Dans une classe dérivée, l'objet est-il créé par `new` ou par le parent ?
  :::

  :::reponse
  Parce que dans une classe dérivée, l'instance est créée par le constructeur parent au moment
  de `super()`. Avant cet appel, il n'existe aucun objet à désigner, et toute lecture de `this`
  lève une `ReferenceError`. Ce modèle permet d'étendre des classes natives comme `Array` ou
  `Error`, dont les instances ont une structure interne que seul leur propre constructeur sait
  créer.
  :::

- Que fait une classe dérivée qui n'a pas de constructeur ?

  :::indice
  Le moteur ajoute un constructeur implicite. Que contient-il ?
  :::

  :::reponse
  Elle reçoit un constructeur implicite équivalent à `constructor(...args) { super(...args); }` :
  tous les arguments sont transmis au parent. Il est donc inutile d'écrire un constructeur qui
  ne fait qu'appeler `super` ; on en écrit un seulement pour ajouter des propriétés ou une
  validation.
  :::

- Comment écrire correctement une erreur personnalisée ?

  :::indice
  Pense au message, à la pile d'appels, au nom affiché et à `instanceof`.
  :::

  :::reponse
  On étend `Error` avec `class`, on appelle `super(message)` pour obtenir `message` et `stack`,
  on définit `this.name` pour que les journaux affichent le bon type, et on ajoute les données
  utiles au diagnostic, comme un code de statut ou la liste des champs. L'appelant peut alors
  filtrer avec `instanceof` et lire ces données. Depuis ES2022, l'option `{ cause }` de `super`
  permet aussi de chaîner l'erreur d'origine.
  :::
