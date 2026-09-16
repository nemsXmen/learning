---
id: javascript-classes-accesseurs
title: "Méthodes statiques, getters et setters"
slug: methodes-statiques-accesseurs
technology: javascript
level: intermediate
module: classes
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-classes-bases
skills:
  - class-accessors
tags:
  - javascript
  - classes
---

## Objectifs

- Distinguer une méthode d'instance d'une méthode statique, et savoir où placer chaque
  comportement.
- Exposer une valeur calculée ou validée avec un `get` et un `set`.
- Écrire une fabrique statique qui crée des instances à partir d'un autre format.

## Introduction

Le chapitre précédent a posé l'essentiel : un constructeur et des méthodes. Une classe
réelle a souvent besoin de plus. Certaines opérations concernent **le type** plutôt qu'une
instance — comparer deux températures, en créer une depuis un autre format. D'autres
valeurs se lisent comme des propriétés mais sont **calculées** ou **contrôlées**. Les
méthodes statiques et les accesseurs répondent à ces deux besoins.

## Concept

| Élément | Écriture | Appelé sur | Rangé sur |
| --- | --- | --- | --- |
| Méthode d'instance | `resume() {}` | une instance : `tache.resume()` | `Classe.prototype` |
| Méthode statique | `static comparer(a, b) {}` | la classe : `Classe.comparer()` | la classe elle-même |
| Champ statique | `static MAXIMUM = 10;` | la classe : `Classe.MAXIMUM` | la classe elle-même |
| Getter | `get aire() {}` | lu comme une propriété : `forme.aire` | `Classe.prototype` |
| Setter | `set largeur(v) {}` | affecté comme une propriété : `forme.largeur = 3` | `Classe.prototype` |

Un **accesseur** ressemble à une propriété pour qui l'utilise, mais exécute une fonction à
chaque lecture ou écriture.

## Exemple

```js
class Temperature {
  static ZERO_ABSOLU = -273.15;

  constructor(celsius) {
    this.celsius = celsius;
  }

  get fahrenheit() {
    return this.celsius * 1.8 + 32;
  }

  set fahrenheit(valeur) {
    this.celsius = (valeur - 32) / 1.8;
  }

  static depuisFahrenheit(valeur) {
    const temperature = new Temperature(0);
    temperature.fahrenheit = valeur;
    return temperature;
  }

  static comparer(a, b) {
    return a.celsius - b.celsius;
  }
}

const ebullition = new Temperature(100);
console.log(ebullition.fahrenheit); // 212 : lu comme une propriété, calculé

const gel = new Temperature(10);
gel.fahrenheit = 32; // le setter met à jour celsius
console.log(gel.celsius); // 0

const tiede = Temperature.depuisFahrenheit(50);
console.log(tiede.celsius); // 10

const triees = [ebullition, gel, tiede].sort(Temperature.comparer);
console.log(triees.map((t) => t.celsius)); // [0, 10, 100]

console.log(Temperature.ZERO_ABSOLU); // -273.15
console.log(typeof ebullition.comparer); // 'undefined' : statique, absente des instances
console.log(Object.keys(ebullition)); // ['celsius'] : l'accesseur vit sur le prototype
```

## Comment ça fonctionne

Une méthode d'instance est rangée sur `Classe.prototype` et trouvée par la chaîne de
prototypes de chaque instance. Une méthode **statique** est une propriété de la fonction
classe elle-même : les instances ne la voient pas, puisque la classe ne fait pas partie de
leur chaîne. Dans une méthode statique, `this` vaut la classe sur laquelle on l'appelle ;
une sous-classe qui hérite de la méthode l'appelle donc avec `this` égal à la sous-classe,
ce qui permet d'écrire `new this()` dans une fabrique réutilisable.

Un getter et un setter définissent une **propriété accesseur** sur le prototype. Lire
`ebullition.fahrenheit` ne trouve pas de valeur stockée : le moteur remonte la chaîne,
rencontre l'accesseur et exécute le getter avec `this` égal à l'instance. Écrire
`gel.fahrenheit = 32` fait de même avec le setter — c'est l'exception à la règle « une
écriture crée une propriété propre » vue avec les prototypes.

Un getter **sans setter** rend la propriété lisible mais non modifiable : dans du code en
mode strict, donc dans un module, l'affectation lève une `TypeError`. Un setter doit stocker
sa valeur **ailleurs** que sous son propre nom : `set celsius(v) { this.celsius = v; }`
rappellerait le setter à l'infini, jusqu'au débordement de pile. On utilise un autre nom,
ou un champ privé, présenté au chapitre suivant.

Un getter doit rester **bon marché et sans effet de bord** : celui qui écrit `forme.aire`
s'attend à lire une valeur, pas à déclencher une requête réseau ou à modifier l'objet. Si
l'opération est coûteuse ou prend des paramètres, c'est une méthode.

Les méthodes statiques conviennent aux **fabriques** — `depuisFahrenheit`, `depuisJSON` —,
aux **comparateurs** et aux constantes liées au type. Une classe qui ne contient **que** des
membres statiques, en revanche, n'a pas besoin d'être une classe : un module de fonctions
suffit, comme le détaille le chapitre 4.

## Erreurs fréquentes

**Appeler une méthode statique sur une instance.** `ebullition.comparer` vaut `undefined` :
écris `Temperature.comparer`.

**Écrire un setter qui s'affecte lui-même.** `this.nom = v` dans `set nom` déclenche une
récursion infinie.

**Affecter une propriété qui n'a qu'un getter.** `TypeError` en mode strict.

**Cacher un calcul coûteux ou un effet de bord dans un getter.** Utilise une méthode.

**Remplir une classe de méthodes statiques.** Des fonctions exportées font le même travail.

## À retenir

- Méthode d'instance sur le prototype ; méthode et champ statiques sur la classe.
- Dans une méthode statique, `this` est la classe appelante.
- `get` et `set` exposent une propriété calculée ou contrôlée, rangée sur le prototype.
- Un setter stocke sous un autre nom, sinon il se rappelle à l'infini.
- Fabriques et comparateurs en statique ; calculs légers en getter ; le reste en méthodes.

## Exercices

1. Écris une classe `Rectangle` avec `largeur` et `hauteur`, et un getter `aire`. Vérifie
   que l'aire suit les changements de dimensions.

   :::indice
   Le getter ne stocke rien : il recalcule à chaque lecture à partir des propriétés.
   :::

   :::solution
   ```js
   class Rectangle {
     constructor(largeur, hauteur) {
       this.largeur = largeur;
       this.hauteur = hauteur;
     }

     get aire() {
       return this.largeur * this.hauteur;
     }
   }

   const r = new Rectangle(2, 3);
   console.log(r.aire); // 6
   r.largeur = 5;
   console.log(r.aire); // 15
   ```
   :::

2. Écris une classe `Personne` dont le setter `age` refuse une valeur négative avec une
   `RangeError`, et dont le getter renvoie l'âge enregistré.

   :::indice
   Le setter ne peut pas écrire `this.age` : stocke la valeur sous un autre nom.
   :::

   :::solution
   ```js
   class Personne {
     constructor(nom, age) {
       this.nom = nom;
       this.age = age; // passe déjà par le setter
     }

     get age() {
       return this.ageEnregistre;
     }

     set age(valeur) {
       if (valeur < 0) {
         throw new RangeError('Un âge ne peut pas être négatif');
       }
       this.ageEnregistre = valeur;
     }
   }

   const ada = new Personne('Ada', 36);
   console.log(ada.age); // 36
   try {
     ada.age = -1;
   } catch (erreur) {
     console.log(erreur.name); // 'RangeError'
   }
   console.log(ada.age); // 36 : valeur inchangée
   ```

   La validation s'applique aussi dans le constructeur, puisqu'il passe par le setter. Le nom
   `ageEnregistre` reste visible de l'extérieur : le chapitre suivant le rend réellement
   privé.
   :::

3. Ajoute à une classe `Couleur(r, v, b)` une fabrique statique `depuisHex('#ff8000')`.

   :::indice
   Découpe la chaîne en trois paires de caractères, puis `parseInt(paire, 16)`.
   :::

   :::solution
   ```js
   class Couleur {
     constructor(r, v, b) {
       Object.assign(this, { r, v, b });
     }

     static depuisHex(hex) {
       const [r, v, b] = [1, 3, 5].map((debut) => parseInt(hex.slice(debut, debut + 2), 16));
       return new this(r, v, b);
     }
   }

   console.log(Couleur.depuisHex('#ff8000')); // Couleur { r: 255, v: 128, b: 0 }
   ```

   `new this(...)` plutôt que `new Couleur(...)` : une sous-classe qui hérite de la fabrique
   obtient des instances de son propre type.
   :::

## Questions d'entretien

- Quand utiliser une méthode statique plutôt qu'une méthode d'instance ?

  :::indice
  L'opération a-t-elle besoin des données d'une instance précise ?
  :::

  :::reponse
  Quand l'opération concerne le type sans dépendre d'une instance : fabriquer une instance
  depuis un autre format, comparer deux instances, exposer une constante. Une méthode
  d'instance, elle, travaille sur les données de `this`. Si une classe finit par ne contenir
  que des membres statiques, c'est le signe qu'un module de fonctions suffirait.
  :::

- Getter ou méthode : comment choisir ?

  :::indice
  Qu'attend celui qui lit `objet.valeur` ?
  :::

  :::reponse
  Un getter se lit comme une propriété : il doit donc se comporter comme une valeur, rapide à
  obtenir, sans paramètre et sans effet de bord. On l'utilise pour une donnée dérivée, comme
  une aire ou un nom complet. Dès que l'opération est coûteuse, peut échouer, prend des
  arguments ou modifie quelque chose, une méthode rend ce coût visible à l'appel.
  :::

- Pourquoi `set nom(valeur) { this.nom = valeur; }` provoque-t-il une erreur ?

  :::indice
  Que déclenche l'affectation `this.nom = …` à l'intérieur du setter ?
  :::

  :::reponse
  Parce que `this.nom = valeur` passe à nouveau par l'accesseur `nom`, qui se rappelle
  lui-même indéfiniment, jusqu'à `RangeError: Maximum call stack size exceeded`. Le setter
  doit stocker la valeur sous un autre nom — une propriété interne, ou de préférence un champ
  privé `#nom` — et le getter lire ce même emplacement.
  :::
