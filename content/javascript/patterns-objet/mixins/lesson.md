---
id: javascript-mixins
title: "Mixins et réutilisation horizontale"
slug: mixins
technology: javascript
level: advanced
module: patterns-objet
order: 1
estimatedMinutes: 25
difficulty: 4
xp: 90
prerequisites:
  - javascript-composition
skills:
  - mixins
tags:
  - javascript
  - patterns
---

## Objectifs

- Ajouter un même comportement à des classes sans lien de parenté, avec un mixin.
- Écrire un mixin objet et un mixin de classe, et connaître la différence.
- Repérer les risques des mixins : collisions de noms, dépendances implicites, getters figés.

## Introduction

L'héritage est vertical : une classe n'a qu'un parent. Or certains comportements traversent
des types sans rapport — sérialiser, horodater, valider concernent aussi bien un article
qu'une commande. Les copier dans chaque classe duplique le code ; créer un parent commun
invente une relation « est un » qui n'existe pas. Le **mixin** propose une troisième voie :
mélanger un comportement dans une classe, horizontalement.

## Concept

| Forme | Écriture | Particularité |
| --- | --- | --- |
| Mixin objet | `Object.assign(Classe.prototype, mixin)` | copie les méthodes dans le prototype |
| Mixin de classe | `const Mixin = (Base) => class extends Base { … }` | crée un maillon de chaîne ; `super` fonctionne |
| Application | `class Article extends AvecA(AvecB(Document)) {}` | les mixins s'empilent de l'intérieur vers l'extérieur |

Un mixin de classe est une **fonction qui reçoit une classe et renvoie une sous-classe**.
Chaque application ajoute un niveau à la chaîne de prototypes, entre la classe de base et la
classe finale.

## Exemple

```js
// Mixin objet : des méthodes copiées dans un prototype.
const Journalisable = {
  journaliser(message) {
    return `[${this.constructor.name}] ${message}`;
  },
};

class Commande {}
Object.assign(Commande.prototype, Journalisable);
console.log(new Commande().journaliser('créée')); // '[Commande] créée'

// Mixins de classe : des fonctions qui fabriquent une sous-classe.
const AvecValidation = (Base) =>
  class extends Base {
    estValide() {
      return this.texte.trim().length > 0;
    }
  };

const AvecResume = (Base) =>
  class extends Base {
    resume(longueur = 10) {
      return this.texte.length > longueur ? `${this.texte.slice(0, longueur)}…` : this.texte;
    }
  };

class Document {
  constructor(texte) {
    this.texte = texte;
  }
}

class Article extends AvecResume(AvecValidation(Document)) {}

const article = new Article('Les mixins en JavaScript');
console.log(article.estValide(), article.resume()); // true 'Les mixins…'
console.log(article instanceof Document); // true

// Collision : deux mixins définissent la même méthode, le dernier gagne sans prévenir.
const EnMajuscules = { afficher() { return 'MAJ'; } };
const EnMinuscules = { afficher() { return 'min'; } };
class Etiquette {}
Object.assign(Etiquette.prototype, EnMajuscules, EnMinuscules);
console.log(new Etiquette().afficher()); // 'min'
```

## Comment ça fonctionne

Un **mixin objet** repose sur `Object.assign`, qui copie les propriétés propres et
énumérables de chaque source dans la cible. Les méthodes arrivent sur le prototype et se
comportent comme des méthodes écrites dans la classe. Deux limites découlent de cette copie.
Si deux sources définissent le même nom, la dernière **écrase** la précédente sans erreur.
Et un **getter** n'est pas copié comme accesseur : `Object.assign` le lit une fois et copie
la **valeur** obtenue, qui reste figée. Pour conserver les accesseurs, on copie les
descripteurs : `Object.defineProperties(cible, Object.getOwnPropertyDescriptors(mixin))`.

Un **mixin de classe** ne copie rien : `AvecValidation(Document)` crée une vraie sous-classe
de `Document`, et `AvecResume(...)` une sous-classe de celle-ci. La chaîne d'`Article` est
donc `Article → AvecResume → AvecValidation → Document`. Tout ce que permet l'héritage
fonctionne : `super.methode()`, un constructeur qui appelle `super(...args)`, l'ordre de
résolution prévisible. L'ordre d'application compte : le mixin le plus extérieur est trouvé en
premier, et c'est lui qui gagne en cas de collision.

Les deux formes partagent un défaut : la **dépendance implicite**. `AvecValidation` suppose
que l'objet possède `this.texte`, sans que rien ne l'exprime. Appliqué à une classe sans
`texte`, il échoue à l'exécution. Plus on empile de mixins, plus ces hypothèses cachées se
multiplient, et plus il devient difficile de savoir d'où vient une méthode.

C'est la différence avec la **composition** vue au module précédent : les mixins fusionnent
tous les comportements dans **un seul objet**, qui partage un seul espace de noms ; la
composition garde des objets séparés, qui communiquent par leurs interfaces. Les mixins
conviennent à de petits comportements transverses, indépendants et stables ; dès qu'un
comportement a son propre état ou ses propres règles, un objet composé est plus sûr.

## Erreurs fréquentes

**Ignorer les collisions.** Deux mixins avec une méthode `valider` : l'un des deux disparaît
en silence. Nomme précisément, ou vérifie l'absence du nom avant de mélanger.

**Copier un getter avec `Object.assign`.** Il devient une valeur figée : copie les
descripteurs.

**Laisser des dépendances implicites.** Documente ce que le mixin attend, ou vérifie-le.

**Empiler de nombreux mixins.** Au-delà de deux ou trois, la chaîne devient illisible :
compose des objets.

**Mélanger dans un prototype natif.** `Object.assign(Array.prototype, …)` modifie tous les
tableaux du programme et des bibliothèques.

## À retenir

- Un mixin ajoute un comportement transverse à des classes sans parent commun.
- Mixin objet : `Object.assign` copie les méthodes ; collisions et getters figés.
- Mixin de classe : `(Base) => class extends Base {}` ; vraie chaîne, `super` disponible.
- Le mixin le plus extérieur est trouvé en premier.
- Au-delà de petits comportements sans état, préfère la composition.

## Exercices

1. Écris un mixin objet `Comparable` qui ajoute `estPlusGrandQue(autre)` à toute classe
   possédant une méthode `valeur()`, et applique-le à `Prix` et à `Duree`.

   :::indice
   Le mixin appelle `this.valeur()` et `autre.valeur()` : il dépend de cette méthode, sans rien
   savoir d'autre sur la classe.
   :::

   :::solution
   ```js
   const Comparable = {
     estPlusGrandQue(autre) {
       return this.valeur() > autre.valeur();
     },
   };

   class Prix {
     constructor(euros) { this.euros = euros; }
     valeur() { return this.euros; }
   }

   class Duree {
     constructor(minutes) { this.minutes = minutes; }
     valeur() { return this.minutes; }
   }

   Object.assign(Prix.prototype, Comparable);
   Object.assign(Duree.prototype, Comparable);

   console.log(new Prix(20).estPlusGrandQue(new Prix(15))); // true
   console.log(new Duree(5).estPlusGrandQue(new Duree(30))); // false
   ```
   :::

2. Écris un mixin de classe `Horodatable` qui ajoute une propriété `creeLe` à chaque instance,
   sans empêcher la classe de base de recevoir ses propres arguments.

   :::indice
   Le mixin a besoin d'un constructeur : il doit transmettre tous les arguments à `super`.
   :::

   :::solution
   ```js
   const Horodatable = (Base) =>
     class extends Base {
       constructor(...args) {
         super(...args);
         this.creeLe = new Date().toISOString().slice(0, 10);
       }
     };

   class Utilisateur {
     constructor(nom) {
       this.nom = nom;
     }
   }

   class UtilisateurHorodate extends Horodatable(Utilisateur) {}

   const ada = new UtilisateurHorodate('Ada');
   console.log(ada.nom, /^\d{4}-\d{2}-\d{2}$/.test(ada.creeLe)); // 'Ada' true
   ```
   :::

3. Ce mixin est censé toujours renvoyer l'heure courante, mais la valeur ne change jamais.
   Explique pourquoi et corrige sans abandonner le mixin objet.

   ```js
   const Horloge = {
     get maintenant() {
       return Date.now();
     },
   };
   class Tableau {}
   Object.assign(Tableau.prototype, Horloge);
   ```

   :::indice
   Que copie `Object.assign` quand la source possède un getter ?
   :::

   :::solution
   `Object.assign` lit chaque propriété de la source et copie sa **valeur**. Le getter est donc
   exécuté une seule fois, au moment du mélange, et `Tableau.prototype.maintenant` devient un
   nombre figé. Il faut copier les descripteurs pour conserver l'accesseur :

   ```js
   const Horloge = {
     get maintenant() {
       return Date.now();
     },
   };
   class Tableau {}
   Object.defineProperties(Tableau.prototype, Object.getOwnPropertyDescriptors(Horloge));

   const descripteur = Object.getOwnPropertyDescriptor(Tableau.prototype, 'maintenant');
   console.log(typeof descripteur.get); // 'function' : l'accesseur est conservé
   ```
   :::

## Questions d'entretien

- Qu'est-ce qu'un mixin, et quel problème résout-il ?

  :::indice
  Pense à un comportement utile à des classes qui n'ont aucun parent commun.
  :::

  :::reponse
  Un mixin est un ensemble de méthodes que l'on ajoute à une classe sans héritage direct, pour
  partager un comportement transverse — sérialisation, horodatage, comparaison — entre des types
  sans relation « est un ». Il évite à la fois la duplication du code et l'invention d'un parent
  commun artificiel. Il reste adapté à de petits comportements sans état ; au-delà, la
  composition d'objets est plus sûre.
  :::

- Quelle différence entre un mixin objet et un mixin de classe ?

  :::indice
  L'un copie des propriétés, l'autre crée un maillon de chaîne.
  :::

  :::reponse
  Le mixin objet copie des méthodes dans un prototype avec `Object.assign` : c'est simple, mais
  les collisions écrasent en silence, les getters sont figés, et `super` n'a pas de sens. Le
  mixin de classe est une fonction `(Base) => class extends Base {}` qui crée une vraie
  sous-classe : il s'insère dans la chaîne de prototypes, peut avoir un constructeur et utiliser
  `super`, et l'ordre d'application définit clairement qui gagne en cas de conflit.
  :::

- Quels sont les risques des mixins ?

  :::indice
  Trois pistes : les noms, les hypothèses sur `this`, et la lisibilité.
  :::

  :::reponse
  Les collisions de noms, qui font disparaître une méthode sans erreur ; les dépendances
  implicites, puisqu'un mixin suppose des propriétés sur `this` que rien ne déclare ; et la
  perte de lisibilité quand plusieurs mixins s'empilent, au point de ne plus savoir d'où vient
  une méthode. S'y ajoutent, pour les mixins objet, les getters figés par `Object.assign`. On les
  limite en gardant les mixins petits, sans état, peu nombreux et documentés.
  :::
