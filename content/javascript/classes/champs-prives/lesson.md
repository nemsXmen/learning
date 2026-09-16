---
id: javascript-champs-prives
title: "Champs publics, champs privés et invariants"
slug: champs-prives
technology: javascript
level: intermediate
module: classes
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-classes-accesseurs
skills:
  - class-private-fields
tags:
  - javascript
  - classes
---

## Objectifs

- Déclarer des champs publics et des champs privés `#` dans le corps d'une classe.
- Protéger un invariant : un état qu'aucun code extérieur ne peut rendre incohérent.
- Tester qu'un objet est bien une instance de la classe avec `#champ in objet`.

## Introduction

Un compte bancaire dont n'importe quel code peut écrire `compte.solde = 1e9` ne protège
rien. Jusqu'ici, deux solutions existaient : la convention `_solde`, qui n'empêche aucun
accès, et les closures, qui obligent à renoncer aux classes. Depuis ES2022, les classes ont
des **champs privés**, garantis par le langage : hors de la classe, ils n'existent tout
simplement pas.

## Concept

| Écriture | Nature | Accessible depuis |
| --- | --- | --- |
| `solde = 0;` | champ public | partout |
| `#solde = 0;` | champ privé | le corps de la classe uniquement |
| `#verifier() {}` | méthode privée | le corps de la classe uniquement |
| `static #compteur = 0;` | champ statique privé | le corps de la classe uniquement |
| `#solde in objet` | test de marque | le corps de la classe ; vrai si l'objet possède ce champ |

Les champs se déclarent **dans le corps de la classe**, hors du constructeur. Un champ privé
doit obligatoirement y être déclaré avant d'être utilisé : l'écrire seulement dans le
constructeur est une erreur de syntaxe.

Un **invariant** est une règle toujours vraie pour un objet valide — « le solde n'est jamais
négatif ». Les champs privés permettent de la garantir : la seule façon de modifier l'état
passe par des méthodes qui la vérifient.

## Exemple

```js
class CompteBancaire {
  static #prochainNumero = 1;

  #solde = 0;
  #historique = [];
  numero;

  constructor(titulaire) {
    this.titulaire = titulaire;
    this.numero = CompteBancaire.#prochainNumero++;
  }

  deposer(montant) {
    this.#verifierMontant(montant);
    this.#solde += montant;
    this.#historique.push(`+${montant}`);
  }

  retirer(montant) {
    this.#verifierMontant(montant);
    if (montant > this.#solde) {
      throw new RangeError('Solde insuffisant');
    }
    this.#solde -= montant;
    this.#historique.push(`-${montant}`);
  }

  get solde() {
    return this.#solde;
  }

  get historique() {
    return [...this.#historique]; // une copie : l'appelant ne peut pas le modifier
  }

  #verifierMontant(montant) {
    if (!(montant > 0)) {
      throw new RangeError('Le montant doit être positif');
    }
  }

  static estCompte(objet) {
    return #solde in objet;
  }
}

const compte = new CompteBancaire('Ada');
compte.deposer(100);
compte.retirer(30);
console.log(compte.solde, compte.historique); // 70 ['+100', '-30']

try {
  compte.solde = 1_000_000; // getter seul : affectation refusée
} catch (erreur) {
  console.log(erreur.name); // 'TypeError'
}

console.log(Object.keys(compte)); // ['numero', 'titulaire'] : aucun champ privé
console.log(JSON.stringify(compte)); // '{"numero":1,"titulaire":"Ada"}'
console.log(CompteBancaire.estCompte(compte), CompteBancaire.estCompte({ solde: 70 })); // true false
// compte.#solde; // SyntaxError : impossible d'écrire ce nom hors de la classe
```

## Comment ça fonctionne

Un nom commençant par `#` n'est pas une clé de propriété ordinaire : c'est un **nom privé**,
dont la portée est le corps de la classe, exactement comme une variable a une portée. Hors
de ce corps, le nom n'existe pas, et écrire `compte.#solde` est une **erreur de syntaxe**
détectée avant toute exécution. Les champs privés n'apparaissent ni dans `Object.keys`, ni
dans `JSON.stringify`, ni dans `for...in`, et un `structuredClone` de l'instance les perd.

Chaque instance porte ses propres emplacements privés. Lire `objet.#solde` sur un objet qui
n'a pas été construit par la classe lève une `TypeError`. D'où le **test de marque**
`#solde in objet` : il répond sans lever d'erreur, et contrairement à `instanceof`, il ne se
laisse pas tromper par un objet fabriqué avec `Object.create(CompteBancaire.prototype)`.

Les champs sont initialisés à la construction, dans l'ordre de déclaration. Pour une classe
sans parent, ils le sont **avant** le corps du constructeur — ce qui explique que `numero`
précède `titulaire` dans `Object.keys`. Pour une classe dérivée, ils le sont juste **après**
le retour de `super()`. Un initialiseur de champ ne voit donc pas les paramètres du
constructeur : `#solde = soldeInitial` ne fonctionne pas, il faut affecter dans le
constructeur.

Les noms privés ne s'héritent pas en tant que noms : une sous-classe ne peut pas écrire
`this.#solde`, même si ses instances possèdent bien cet emplacement. Elle passe par les
méthodes et accesseurs publics de la classe parente. C'est voulu : la classe parente reste seule garante de son invariant.

Avant les champs privés, les deux solutions étaient la convention `_solde`, simple mais
contournable, et une closure autour de la classe ou une `WeakMap` indexée par instance. Le
résultat est le même que `#`, avec plus de code : en JavaScript moderne, `#` est la réponse
par défaut.

## Erreurs fréquentes

**Utiliser un champ privé sans le déclarer dans le corps.** `this.#solde = 0` seul dans le
constructeur est une erreur de syntaxe.

**Exposer une référence vers un état privé.** Un getter qui renvoie `this.#historique`
directement laisse l'appelant le modifier : renvoie une copie.

**Initialiser un champ avec un paramètre du constructeur.** L'initialiseur ne voit pas les
paramètres : affecte dans le constructeur.

**Attendre les champs privés dans une sérialisation.** `JSON.stringify` et `structuredClone`
les ignorent : prévois une méthode `toJSON` si nécessaire.

**Vouloir lire `#champ` depuis une sous-classe.** Passe par l'interface publique du parent.

## À retenir

- `#nom` est privé au corps de la classe ; hors de celui-ci, c'est une erreur de syntaxe.
- Un champ privé doit être déclaré dans le corps avant d'être utilisé.
- Les champs sont initialisés avant le constructeur, ou juste après `super()`.
- `#champ in objet` teste qu'un objet a vraiment été construit par la classe.
- Les champs privés servent à garantir un invariant : l'état ne change que par des méthodes
  qui le vérifient.

## Exercices

1. Remplace la convention `_valeur` par un vrai champ privé, sans changer l'usage de la
   classe.

   ```js
   class Jauge {
     constructor(maximum) {
       this.maximum = maximum;
       this._valeur = 0;
     }
     remplir(quantite) {
       this._valeur = Math.min(this.maximum, this._valeur + quantite);
     }
     get valeur() {
       return this._valeur;
     }
   }
   ```

   :::indice
   Le champ privé se déclare dans le corps de la classe, puis s'utilise avec `this.#…`.
   :::

   :::solution
   ```js
   class Jauge {
     #valeur = 0;

     constructor(maximum) {
       this.maximum = maximum;
     }

     remplir(quantite) {
       this.#valeur = Math.min(this.maximum, this.#valeur + quantite);
     }

     get valeur() {
       return this.#valeur;
     }
   }

   const jauge = new Jauge(10);
   jauge.remplir(7);
   jauge.remplir(7);
   console.log(jauge.valeur, Object.keys(jauge)); // 10 ['maximum']
   ```
   :::

2. Écris une méthode statique `Jauge.estJauge(objet)` qui ne se laisse pas tromper par un
   objet créé avec `Object.create(Jauge.prototype)`.

   :::indice
   `instanceof` regarde la chaîne de prototypes ; un test sur un champ privé regarde ce que
   le constructeur a réellement installé.
   :::

   :::solution
   ```js
   class Jauge {
     #valeur = 0;

     static estJauge(objet) {
       return #valeur in objet;
     }
   }

   const vraie = new Jauge();
   const imitation = Object.create(Jauge.prototype);

   console.log(imitation instanceof Jauge); // true : trompé
   console.log(Jauge.estJauge(vraie), Jauge.estJauge(imitation)); // true false
   ```
   :::

3. Écris une classe `Intervalle(debut, fin)` qui garantit en permanence `debut <= fin` :
   refus à la construction, et méthode `deplacer(decalage)` qui conserve l'invariant.

   :::indice
   Garde `debut` et `fin` en champs privés, expose-les en lecture seule, et vérifie la règle
   dans le constructeur.
   :::

   :::solution
   ```js
   class Intervalle {
     #debut;
     #fin;

     constructor(debut, fin) {
       if (debut > fin) {
         throw new RangeError('Le début doit précéder la fin');
       }
       this.#debut = debut;
       this.#fin = fin;
     }

     get debut() {
       return this.#debut;
     }

     get fin() {
       return this.#fin;
     }

     deplacer(decalage) {
       return new Intervalle(this.#debut + decalage, this.#fin + decalage);
     }
   }

   const creneau = new Intervalle(9, 12).deplacer(2);
   console.log(creneau.debut, creneau.fin); // 11 14
   try {
     new Intervalle(5, 1);
   } catch (erreur) {
     console.log(erreur.name); // 'RangeError'
   }
   ```

   Renvoyer un nouvel intervalle plutôt que modifier l'existant rend l'invariant encore plus
   simple à garantir : un objet valide ne cesse jamais de l'être.
   :::

## Questions d'entretien

- Quelle différence entre un champ `#prive` et la convention `_prive` ?

  :::indice
  L'un est une règle du langage, l'autre un accord entre développeurs.
  :::

  :::reponse
  `_prive` est une propriété publique ordinaire : n'importe quel code peut la lire ou la
  modifier, elle apparaît dans `Object.keys` et dans le JSON. `#prive` est un nom privé dont la
  portée est le corps de la classe : y accéder ailleurs est une erreur de syntaxe, et il
  n'apparaît dans aucune énumération. La convention signale une intention ; le champ privé
  garantit l'encapsulation, donc l'invariant.
  :::

- Champs privés ou closures : lesquels choisir pour cacher un état ?

  :::indice
  Les deux cachent réellement l'état. Qu'est-ce qui les distingue à l'usage ?
  :::

  :::reponse
  Les deux offrent une confidentialité réelle. Les champs privés s'intègrent à une classe :
  méthodes partagées sur le prototype, héritage, test de marque avec `#champ in objet`, et un
  coût mémoire par instance limité aux données. Une factory avec closures évite `this` et
  `new`, mais recrée ses fonctions pour chaque objet. Dans une base de code qui utilise des
  classes, `#` est la réponse ; dans un style fonctionnel, la closure reste naturelle.
  :::

- Qu'est-ce qu'un test de marque, et pourquoi l'utiliser plutôt qu'`instanceof` ?

  :::indice
  Que regarde `instanceof`, et peut-on le tromper ?
  :::

  :::reponse
  `#champ in objet` vérifie que l'objet possède l'emplacement privé installé par le
  constructeur de la classe, donc qu'il a réellement été construit par elle. `instanceof` ne
  regarde que la chaîne de prototypes : un objet créé avec `Object.create(Classe.prototype)`
  ou dont on a changé le prototype le trompe, et il échoue entre deux fenêtres ou iframes. Le
  test de marque est la vérification fiable avant d'accéder à des champs privés.
  :::
