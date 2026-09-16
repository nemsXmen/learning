---
id: javascript-classes-bases
title: "Classes : pourquoi, et la syntaxe de base"
slug: classes-bases
technology: javascript
level: intermediate
module: classes
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-objets-creer
  - javascript-factory-functions
  - javascript-object-create
skills:
  - classes-basics
tags:
  - javascript
  - classes
---

## Objectifs

- Déclarer une classe avec `class` et son `constructor`.
- Créer des instances avec `new`, et comprendre ce que fait cet opérateur.
- Reconnaître ce qu'une classe apporte face à un objet littéral répété.

## Introduction

Dès qu'une application manipule plusieurs objets de même forme — des utilisateurs, des
commandes, des tâches —, écrire chaque objet à la main devient répétitif et fragile : il
suffit d'oublier une propriété pour qu'une fonction plante trois fichiers plus loin. Une
classe est un moule : elle décrit une fois la forme et les opérations, et produit ensuite
autant d'objets qu'on veut, tous cohérents.

`class` est arrivé avec ES2015. Ce n'est pas un nouveau modèle d'objets — JavaScript n'a
qu'un seul modèle —, c'est une syntaxe plus lisible pour ce qu'on écrivait déjà avec des
fonctions constructrices. Cette syntaxe est aujourd'hui celle qu'on croise dans la plupart
des bases de code, et celle que les autres langages rendent immédiatement familière.

## Concept

Une classe déclare un nom et un corps. Le corps contient un `constructor`, exécuté à chaque
création d'instance, et des méthodes.

| Élément | Rôle |
| --- | --- |
| `class Nom { … }` | déclare le moule |
| `constructor(args)` | initialise une instance, reçoit les arguments de `new` |
| `this` | l'instance en cours de construction ou d'utilisation |
| `new Nom(args)` | crée une instance et renvoie l'objet |

Trois règles à retenir dès maintenant :

- Une classe s'appelle **obligatoirement** avec `new`. `Personne('Ana')` lève une
  `TypeError`.
- Le corps d'une classe est toujours en **mode strict**, même dans un fichier qui ne l'est
  pas.
- Une déclaration de classe n'est pas utilisable avant sa ligne : contrairement à
  `function`, elle reste dans la zone morte temporelle.

## Exemple

```js
class Tache {
  constructor(titre, echeance) {
    this.titre = titre;
    this.echeance = echeance;
    this.terminee = false;
  }

  terminer() {
    this.terminee = true;
    return this;
  }

  resume() {
    const etat = this.terminee ? 'faite' : 'à faire';
    return `${this.titre} (${etat}, ${this.echeance})`;
  }
}

const tache = new Tache('Écrire le rapport', '2026-10-02');
console.log(tache.resume()); // 'Écrire le rapport (à faire, 2026-10-02)'

tache.terminer();
console.log(tache.resume()); // 'Écrire le rapport (faite, 2026-10-02)'

const autre = new Tache('Relire', '2026-10-05');
console.log(autre.terminee); // false : état indépendant

console.log(tache instanceof Tache); // true
console.log(typeof Tache); // 'function'
```

## Comment ça fonctionne

`new Tache('Écrire le rapport', '2026-10-02')` fait quatre choses, dans cet ordre : il crée
un objet vide, il lie ce nouvel objet à `this`, il exécute le `constructor` avec les
arguments reçus, puis il renvoie l'objet. On n'écrit donc jamais `return this` dans un
constructeur : c'est déjà son comportement.

Les propriétés affectées dans le constructeur — `this.titre`, `this.terminee` — appartiennent
à **chaque instance** : deux tâches ont deux titres. Les méthodes, elles, ne sont pas copiées
dans chaque objet ; elles sont définies une seule fois et partagées par toutes les instances.
C'est la différence de coût avec une fabrique, où chaque objet renvoyé embarque ses propres
fonctions.

```js
const a = new Tache('A', '2026-01-01');
const b = new Tache('B', '2026-01-02');
console.log(a.terminer === b.terminer); // true : une seule fonction partagée
console.log(a.titre === b.titre); // false : un état par instance
```

Le mot-clé `this`, à l'intérieur d'une méthode, désigne l'objet sur lequel la méthode est
appelée. `tache.resume()` met `tache` dans `this`. Ce point mérite d'être gardé en tête :
si la méthode est détachée de son objet — passée en callback, par exemple —, `this` n'est
plus celui qu'on croit. On y reviendra ; en attendant, appelle tes méthodes sur leur objet.

Une classe peut aussi s'écrire comme une expression, utile pour la créer dans une fonction
ou la passer en argument :

```js
const Point = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};
console.log(new Point(1, 2).x); // 1
```

Enfin, `typeof Tache` vaut `'function'`. Une classe est une fonction particulière, marquée
comme non appelable sans `new`. C'est la confirmation que la syntaxe recouvre un mécanisme
plus ancien, pas un type inédit.

## Erreurs fréquentes

**Oublier `new`.** `const t = Tache('titre')` lève `TypeError: Class constructor Tache cannot
be invoked without 'new'`. C'est une amélioration par rapport aux fonctions constructrices,
qui polluaient silencieusement l'objet global.

**Mettre une virgule entre les méthodes.** Un corps de classe n'est pas un objet littéral :
les méthodes se suivent sans séparateur, et une virgule est une erreur de syntaxe.

**Écrire `return quelqueChose` dans le constructeur.** Renvoyer un objet remplace l'instance
et casse `instanceof` ; renvoyer une primitive est simplement ignoré. Dans les deux cas, le
lecteur est induit en erreur.

**Utiliser la classe avant sa déclaration.** `new Tache()` placé au-dessus de `class Tache`
lève une `ReferenceError`. Le hoisting des `function` ne s'applique pas ici.

**Faire d'une classe un simple sac de fonctions.** Une classe sans état, dont toutes les
méthodes sont statiques, n'apporte rien qu'un module ne fasse déjà.

## À retenir

- `class` déclare un moule ; `constructor` initialise chaque instance.
- `new` crée l'objet, le lie à `this`, exécute le constructeur et renvoie l'objet.
- Les propriétés sont propres à l'instance, les méthodes sont partagées.
- Appeler une classe sans `new` lève une `TypeError`.
- Le corps d'une classe est en mode strict et n'est pas hoisté.

## Exercices

1. Écris une classe `Livre` avec `titre`, `auteur` et `pages`, et une méthode `description()`
   qui renvoie `"Titre — Auteur (320 pages)"`. Crée deux livres et affiche leur description.

   :::indice
   Les trois valeurs arrivent en arguments du constructeur et se rangent dans `this`.
   :::

   :::solution
   ```js
   class Livre {
     constructor(titre, auteur, pages) {
       this.titre = titre;
       this.auteur = auteur;
       this.pages = pages;
     }

     description() {
       return `${this.titre} — ${this.auteur} (${this.pages} pages)`;
     }
   }

   const un = new Livre('Le Horla', 'Maupassant', 120);
   const deux = new Livre('Bouvard et Pécuchet', 'Flaubert', 320);
   console.log(un.description()); // 'Le Horla — Maupassant (120 pages)'
   console.log(deux.description()); // 'Bouvard et Pécuchet — Flaubert (320 pages)'
   ```
   :::

2. Écris une classe `Compteur` avec une valeur de départ par défaut à `0`, une méthode
   `incrementer()` et une méthode `reinitialiser()`. Fais en sorte que `incrementer()` puisse
   s'enchaîner : `compteur.incrementer().incrementer()`.

   :::indice
   Une valeur par défaut se déclare dans la signature du constructeur.
   :::

   :::indice
   Pour enchaîner les appels, chaque méthode doit renvoyer l'instance elle-même.
   :::

   :::solution
   ```js
   class Compteur {
     constructor(depart = 0) {
       this.valeur = depart;
     }

     incrementer() {
       this.valeur += 1;
       return this;
     }

     reinitialiser() {
       this.valeur = 0;
       return this;
     }
   }

   const compteur = new Compteur(5);
   compteur.incrementer().incrementer();
   console.log(compteur.valeur); // 7
   console.log(compteur.reinitialiser().valeur); // 0
   ```
   :::

3. Ce code produit deux tâches identiques alors qu'on en attend deux différentes. Trouve le
   problème et corrige-le.

   ```js
   class Tache {
     constructor(titre) {
       titre = titre;
     }
   }

   const a = new Tache('A');
   console.log(a.titre); // undefined
   ```

   :::indice
   Regarde ce que la ligne du constructeur affecte réellement, et à quoi.
   :::

   :::solution
   ```js
   class Tache {
     constructor(titre) {
       this.titre = titre; // sans `this.`, on réaffecte le paramètre à lui-même
     }
   }

   const a = new Tache('A');
   const b = new Tache('B');
   console.log(a.titre, b.titre); // 'A' 'B'
   ```

   `titre = titre` réaffecte le paramètre local : l'instruction est légale, sans effet, et
   l'instance ne reçoit aucune propriété.
   :::

## Questions d'entretien

- Que fait exactement l'opérateur `new` ?

  :::indice
  Décompose l'opération en étapes, depuis l'objet vide jusqu'à la valeur renvoyée.
  :::

  :::reponse
  `new` crée un objet vide, lie cet objet à `this`, exécute le constructeur avec les
  arguments fournis, puis renvoie l'objet — sans qu'on ait à écrire `return`. Le nouvel
  objet est aussi relié à la classe, ce qui rend `instanceof` fiable et donne accès aux
  méthodes partagées. Si le constructeur renvoie explicitement un objet, c'est cet objet qui
  sort à la place, ce qui casse `instanceof` ; renvoyer une primitive est ignoré.
  :::

- Une classe JavaScript est-elle un nouveau type d'entité dans le langage ?

  :::indice
  Que vaut `typeof MaClasse` ?
  :::

  :::reponse
  Non. `typeof MaClasse` vaut `'function'` : une classe est une fonction, avec des règles
  supplémentaires — appel obligatoire avec `new`, corps en mode strict, pas de hoisting
  utilisable. La syntaxe `class` donne une écriture claire et un vocabulaire commun avec les
  autres langages, mais le modèle d'objets sous-jacent de JavaScript n'a pas changé.
  :::

- Une classe stocke-t-elle ses méthodes dans chaque instance ?

  :::indice
  Compare `a.methode === b.methode` pour deux instances.
  :::

  :::reponse
  Non. Les propriétés affectées dans le constructeur appartiennent à chaque instance, mais
  les méthodes sont définies une seule fois et partagées : pour deux instances `a` et `b`,
  `a.methode === b.methode` vaut `true`. C'est la différence de coût mémoire avec une factory
  function, dont chaque objet renvoyé porte ses propres fonctions. À l'échelle de quelques
  milliers d'objets, l'écart est sans importance ; il compte sur des volumes très élevés.
  :::
