---
id: javascript-heritage-prototypal
title: "Héritage prototypal en pratique, et prototypes face aux classes"
slug: heritage-prototypal
technology: javascript
level: advanced
module: prototypes
order: 4
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-object-create
skills:
  - prototypal-inheritance
tags:
  - javascript
  - runtime
---

## Objectifs

- Faire hériter un constructeur d'un autre, en reliant correctement les deux prototypes.
- Appeler la version parente d'une méthode redéfinie.
- Montrer que `class` et `extends` produisent la même chaîne, et connaître ce qui les distingue
  réellement.

## Introduction

Le chapitre précédent reliait un objet à un prototype. L'héritage consiste à relier deux
**prototypes** entre eux : les instances d'un chien trouvent les méthodes des chiens, puis,
un niveau plus haut, celles des animaux. C'est ce que `class Chien extends Animal` fait en
coulisses. Le construire une fois à la main permet de comprendre ce que produit la syntaxe
moderne — et de lire le code écrit avant elle.

## Concept

Pour que `Chien` hérite d'`Animal`, trois liens sont nécessaires :

| Lien | Écriture | Rôle |
| --- | --- | --- |
| Données du parent | `Animal.call(this, nom)` dans `Chien` | initialiser les propriétés héritées |
| Méthodes du parent | `Chien.prototype = Object.create(Animal.prototype)` | chaîne des instances |
| Constructeur | `Chien.prototype.constructor = Chien` | rétablir la propriété écrasée |

La chaîne obtenue pour une instance :

```text
rex → Chien.prototype → Animal.prototype → Object.prototype → null
```

Avec `class`, `extends` pose ces liens, et `super(...)` remplace `Animal.call(this, ...)`.
Il ajoute un lien de plus : `Object.getPrototypeOf(Chien) === Animal`, ce qui fait hériter
aussi les méthodes **statiques**.

## Exemple

```js
function Animal(nom) {
  this.nom = nom;
}
Animal.prototype.decrire = function () {
  return `${this.nom} est un animal`;
};

function Chien(nom, race) {
  Animal.call(this, nom); // données du parent
  this.race = race;
}
Chien.prototype = Object.create(Animal.prototype); // méthodes du parent
Chien.prototype.constructor = Chien;
Chien.prototype.decrire = function () {
  const base = Animal.prototype.decrire.call(this); // version parente
  return `${base}, un ${this.race}`;
};

const rex = new Chien('Rex', 'berger');
console.log(rex.decrire()); // 'Rex est un animal, un berger'
console.log(rex instanceof Chien, rex instanceof Animal); // true true

class AnimalClasse {
  constructor(nom) {
    this.nom = nom;
  }
  decrire() {
    return `${this.nom} est un animal`;
  }
}
class ChienClasse extends AnimalClasse {
  constructor(nom, race) {
    super(nom);
    this.race = race;
  }
  decrire() {
    return `${super.decrire()}, un ${this.race}`;
  }
}

const medor = new ChienClasse('Médor', 'caniche');
console.log(medor.decrire()); // 'Médor est un animal, un caniche'
console.log(
  Object.getPrototypeOf(ChienClasse.prototype) === AnimalClasse.prototype, // true
  Object.getPrototypeOf(ChienClasse) === AnimalClasse, // true : héritage des statiques
);
console.log(Object.keys(Chien.prototype), Object.keys(ChienClasse.prototype)); // ['constructor', 'decrire'] []
```

## Comment ça fonctionne

Chacun des trois liens répond à un besoin distinct. `Animal.call(this, nom)` exécute le
constructeur parent **sur l'instance en cours**, pour qu'elle reçoive `nom` comme propriété
propre. `Object.create(Animal.prototype)` crée un nouveau prototype pour `Chien`, dont le
prototype est celui d'`Animal` : les méthodes des animaux deviennent accessibles un niveau
plus haut. Comme ce nouvel objet remplace le `Chien.prototype` d'origine, sa propriété
`constructor` a disparu, d'où la troisième ligne.

Redéfinir `decrire` sur `Chien.prototype` **masque** la version d'`Animal` pour les chiens.
Pour réutiliser la version parente, on l'appelle explicitement sur l'instance :
`Animal.prototype.decrire.call(this)`. Dans une classe, `super.decrire()` fait la même chose ;
le moteur retrouve le parent grâce à une référence interne vers l'objet qui contient la méthode,
et non grâce à `this`.

La syntaxe `class` produit bien la même chaîne pour les instances, comme le montre l'exemple.
Elle n'est pourtant pas qu'un raccourci d'écriture :

| Différence | Constructeur et prototype | Classe |
| --- | --- | --- |
| Appel sans `new` | autorisé, source de bugs | `TypeError` |
| Mode strict | selon le fichier | toujours |
| Méthodes énumérables | oui, si affectées | non |
| Hoisting | la déclaration de fonction est hoistée | zone morte temporelle |
| Héritage des statiques | à faire soi-même | automatique |
| Champs privés `#` | impossibles | disponibles |
| Hériter d'un type natif comme `Array` | peu fiable | pris en charge |

Le code moderne utilise donc `class`. Savoir lire la version à la main reste utile pour le
code existant, pour comprendre ce que montre un débogueur, et pour les rares cas de délégation
directe avec `Object.create`.

Une chaîne d'héritage profonde a un coût réel, surtout en lisibilité : pour savoir d'où vient
une méthode, il faut remonter plusieurs niveaux. Au-delà de deux, la composition est souvent
préférable, comme le détaille la partie Object-Oriented.

## Erreurs fréquentes

**Écrire `Chien.prototype = Animal.prototype`.** Les deux constructeurs partagent alors le
même objet : ajouter une méthode aux chiens l'ajoute aux animaux.

**Oublier `Animal.call(this, …)`.** Les instances n'ont pas les propriétés du parent.

**Oublier de rétablir `constructor`.** `rex.constructor` renvoie `Animal`.

**Relier les prototypes après avoir ajouté des méthodes.** L'affectation de
`Chien.prototype` efface les méthodes déjà posées.

**Empiler les niveaux d'héritage.** Au-delà de deux niveaux, préfère la composition.

## À retenir

- Héritage à la main : `Parent.call(this)`, `Object.create(Parent.prototype)`, `constructor`.
- La méthode parente s'appelle avec `Parent.prototype.methode.call(this)`, ou `super`.
- `class … extends` produit la même chaîne, plus l'héritage des méthodes statiques.
- Les classes ajoutent des garanties : `new` obligatoire, mode strict, méthodes non
  énumérables, champs privés.
- Jamais `Enfant.prototype = Parent.prototype` : un seul objet pour deux types.

## Exercices

1. Fais hériter `Salarie(nom, poste)` de `Personne(nom)` sans `class`, de sorte que
   `presenter()` de `Salarie` réutilise celle de `Personne`.

   ```js
   function Personne(nom) { this.nom = nom; }
   Personne.prototype.presenter = function () { return `Je suis ${this.nom}`; };
   ```

   :::indice
   Trois liens : les données du parent, la chaîne des prototypes, le constructeur.
   :::

   :::indice
   Pour la version parente de la méthode, appelle-la sur `this` avec `call`.
   :::

   :::solution
   ```js
   function Salarie(nom, poste) {
     Personne.call(this, nom);
     this.poste = poste;
   }
   Salarie.prototype = Object.create(Personne.prototype);
   Salarie.prototype.constructor = Salarie;
   Salarie.prototype.presenter = function () {
     return `${Personne.prototype.presenter.call(this)}, ${this.poste}`;
   };

   const ada = new Salarie('Ada', 'ingénieure');
   console.log(ada.presenter()); // 'Je suis Ada, ingénieure'
   console.log(ada instanceof Personne, ada.constructor === Salarie); // true true
   ```
   :::

2. Explique pourquoi `new Oiseau().voler` existe désormais sur tous les animaux, et corrige.

   ```js
   function Animal() {}
   function Oiseau() {}
   Oiseau.prototype = Animal.prototype;
   Oiseau.prototype.voler = function () { return 'je vole'; };
   console.log(typeof new Animal().voler); // 'function'
   ```

   :::indice
   Combien d'objets prototype existe-t-il après l'affectation ?
   :::

   :::solution
   L'affectation ne crée pas de nouveau prototype : `Oiseau.prototype` et `Animal.prototype`
   désignent le **même** objet, donc toute méthode ajoutée aux oiseaux l'est aussi aux animaux.
   Il faut un objet distinct qui délègue au prototype parent.

   ```js
   function Animal() {}
   function Oiseau() {}
   Oiseau.prototype = Object.create(Animal.prototype);
   Oiseau.prototype.constructor = Oiseau;
   Oiseau.prototype.voler = function () { return 'je vole'; };

   console.log(typeof new Animal().voler, new Oiseau().voler()); // 'undefined' 'je vole'
   ```
   :::

3. Réécris la solution de l'exercice 1 avec `class`, puis vérifie que la chaîne de prototypes
   des instances est de même forme.

   :::indice
   `extends` relie les prototypes, `super(nom)` remplace l'appel au constructeur parent, et
   `super.presenter()` la version parente de la méthode.
   :::

   :::solution
   ```js
   class PersonneClasse {
     constructor(nom) {
       this.nom = nom;
     }
     presenter() {
       return `Je suis ${this.nom}`;
     }
   }

   class SalarieClasse extends PersonneClasse {
     constructor(nom, poste) {
       super(nom);
       this.poste = poste;
     }
     presenter() {
       return `${super.presenter()}, ${this.poste}`;
     }
   }

   const grace = new SalarieClasse('Grace', 'architecte');
   console.log(grace.presenter()); // 'Je suis Grace, architecte'
   console.log(Object.getPrototypeOf(Object.getPrototypeOf(grace)) === PersonneClasse.prototype); // true
   ```

   Même forme de chaîne, deux lignes de câblage en moins, et une erreur immédiate en cas
   d'oubli de `new` ou de `super`.
   :::

## Questions d'entretien

- Les classes JavaScript ne sont-elles que du sucre syntaxique ?

  :::indice
  La chaîne produite est-elle différente ? Et le comportement autour ?
  :::

  :::reponse
  Pour la chaîne de prototypes, oui : une classe produit un constructeur et un objet
  `prototype` reliés exactement comme on le ferait à la main. Mais la syntaxe apporte des
  garanties qu'on ne peut pas reproduire simplement : appel sans `new` interdit, mode strict,
  méthodes non énumérables, zone morte temporelle, héritage des statiques, `super`, champs
  privés et héritage fiable des types natifs comme `Array` ou `Error`. « Surtout du sucre,
  avec des garde-fous » est la réponse exacte.
  :::

- Comment appeler la version parente d'une méthode redéfinie ?

  :::indice
  Deux écritures : avec et sans classe.
  :::

  :::reponse
  Sans classe, on récupère la méthode sur le prototype parent et on l'exécute sur l'instance
  courante : `Parent.prototype.methode.call(this, …arguments)`. Dans une classe, on écrit
  `super.methode(…)`. Dans les deux cas, `this` reste l'instance enfant, si bien que la méthode
  parente travaille avec les données de l'objet réel.
  :::

- Pourquoi préférer la composition à une chaîne d'héritage profonde ?

  :::indice
  Pense à la lecture du code et à l'évolution des classes parentes.
  :::

  :::reponse
  Chaque niveau d'héritage couple l'enfant aux détails du parent : une modification en haut de
  la chaîne se répercute sur tous les descendants, et pour savoir d'où vient une méthode il faut
  remonter plusieurs définitions. La composition assemble des objets aux responsabilités
  étroites, qu'on remplace indépendamment. L'héritage reste pertinent pour une relation « est
  un » stable et peu profonde — un ou deux niveaux.
  :::
