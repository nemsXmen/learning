---
id: javascript-quand-classe
title: "Quand une classe est le bon outil"
slug: quand-utiliser-une-classe
technology: javascript
level: intermediate
module: classes
order: 4
estimatedMinutes: 25
difficulty: 3
xp: 70
prerequisites:
  - javascript-champs-prives
skills:
  - class-design-choice
tags:
  - javascript
  - classes
---

## Objectifs

- Choisir entre un objet littéral, un module de fonctions, une fabrique et une classe.
- Reconnaître les classes qui n'en sont pas : sans état, ou sans comportement.
- Justifier une classe par ce qu'elle apporte réellement : un état protégé et des instances
  nombreuses.

## Introduction

Après trois chapitres sur les classes, la tentation est de tout écrire en classes. Beaucoup
de développeurs venus de Java ou de C# le font, et produisent des `class Utils` pleines de
méthodes statiques. JavaScript offre d'autres outils, souvent plus simples. Ce chapitre ne
présente aucune syntaxe : il donne des critères pour ne sortir la classe que lorsqu'elle
paie son coût.

## Concept

| Besoin | Outil adapté |
| --- | --- |
| Des données sans comportement | un objet littéral |
| Des traitements sans état | des fonctions exportées d'un module |
| Un état caché, peu d'instances, pas d'héritage | une fabrique avec closure |
| Un état à protéger, de nombreuses instances, un comportement partagé | une classe |
| Un framework ou une API native qui exige une classe | une classe |

Trois signaux indiquent qu'une classe n'est **pas** justifiée :

- elle ne contient que des méthodes statiques : c'est un module déguisé ;
- elle n'a qu'un constructeur et une méthode : c'est une fonction déguisée ;
- elle n'expose que des getters et setters sur ses champs : c'est un objet littéral déguisé.

## Exemple

```js
// 1. Aucun état, que des statiques : une classe pour rien.
class OutilsPrix {
  static ttc(ht, taux = 0.2) {
    return Math.round(ht * (1 + taux) * 100) / 100;
  }
}
// Le même service en fonction : importable seule, sans this ni new.
const ttc = (ht, taux = 0.2) => Math.round(ht * (1 + taux) * 100) / 100;
console.log(OutilsPrix.ttc(10), ttc(10)); // 12 12

// 2. Des données sans comportement : un objet suffit, et se sérialise tel quel.
const adresse = { rue: '1 rue de la Paix', ville: 'Paris' };
console.log(JSON.stringify(adresse)); // '{"rue":"1 rue de la Paix","ville":"Paris"}'

// 3. Un état cohérent à garantir : la classe apporte quelque chose.
class Panier {
  #lignes = new Map();

  ajouter(produit, prix, quantite = 1) {
    if (!(quantite > 0)) {
      throw new RangeError('Quantité invalide');
    }
    const ligne = this.#lignes.get(produit) ?? { prix, quantite: 0 };
    ligne.quantite += quantite;
    this.#lignes.set(produit, ligne);
  }

  get total() {
    let total = 0;
    for (const { prix, quantite } of this.#lignes.values()) {
      total += prix * quantite;
    }
    return total;
  }
}

const panier = new Panier();
panier.ajouter('clavier', 50);
panier.ajouter('clavier', 50);
panier.ajouter('souris', 20);
console.log(panier.total); // 120
```

## Comment ça fonctionne

Une classe a des **coûts** réels, même s'ils sont discrets. Elle introduit `this`, avec les
pièges de liaison vus dans la partie Runtime. Ses instances se sérialisent mal : `JSON`
produit un objet ordinaire, et il faut reconstruire l'instance à la lecture. Ses méthodes
statiques inutilisées sont plus difficiles à éliminer du bundle final que des fonctions
exportées une à une, que les outils de build retirent quand personne ne les importe. Enfin,
elle invite à l'héritage, dont les inconvénients sont traités au module suivant.

Ces coûts valent la peine quand la classe apporte ce que les autres outils n'offrent pas
aussi bien :

- un **invariant** protégé par des champs privés, comme le total du panier qui ne peut pas
  devenir incohérent, puisque les lignes ne changent que par `ajouter` ;
- de **nombreuses instances** qui partagent leur comportement via le prototype ;
- une **identité** et un cycle de vie : une connexion, un minuteur, un composant ;
- un **contrat attendu par l'environnement** : une sous-classe d'`Error`, un élément
  personnalisé du DOM, un contrôleur de framework.

Face à une **fabrique**, le choix est plus fin. La fabrique évite `this` et `new`, et cache
son état sans syntaxe nouvelle ; la classe partage ses méthodes, offre l'héritage et le test
de marque. Le critère le plus solide reste la cohérence avec le reste de la base de code : un
projet qui mélange les deux styles sans raison est plus difficile à lire que l'un ou l'autre.

Un **module ES** joue déjà le rôle d'espace de noms et de singleton : ses variables sont
privées tant qu'elles ne sont pas exportées, et il n'est évalué qu'une fois. Une classe
instanciée une seule fois, ou remplie de statiques, reproduit ce que le module donne
gratuitement.

## Erreurs fréquentes

**Écrire une classe de méthodes statiques.** Exporte des fonctions.

**Envelopper des données dans des getters et setters sans règle.** Un objet littéral dit la
même chose en moins de lignes.

**Créer une classe pour un seul appel.** `new Calcul(x).executer()` est une fonction.

**Instancier une classe une seule fois pour s'en servir d'espace de noms.** Un module le fait
déjà.

**Choisir la classe par habitude d'un autre langage.** Pars du besoin : état, invariant,
nombre d'instances.

## À retenir

- Données seules : objet. Traitements sans état : fonctions d'un module.
- État caché et peu d'instances : fabrique. Invariant et nombreuses instances : classe.
- Une classe uniquement statique, ou à une seule méthode, n'est pas une classe utile.
- Une classe coûte : `this`, sérialisation, bundle, tentation de l'héritage.
- Le module ES est déjà un espace de noms et un singleton.

## Exercices

1. Pour chaque besoin, choisis entre objet littéral, fonctions de module, fabrique et classe,
   en une phrase de justification.

   - a) La configuration de l'application, lue au démarrage.
   - b) Des fonctions de formatage de dates.
   - c) Des centaines de minuteurs indépendants, chacun avec son état et ses méthodes.
   - d) Une erreur applicative `ValidationError` portant la liste des champs invalides.

   :::indice
   Pour chaque cas, demande-toi : y a-t-il un état ? Faut-il le protéger ? Combien
   d'instances ? L'environnement impose-t-il une forme ?
   :::

   :::solution
   - a) **Objet littéral** : des données sans comportement, lisibles et sérialisables.
   - b) **Fonctions de module** : des traitements sans état ; chaque fonction s'importe
     séparément.
   - c) **Classe** : un état par instance, un comportement partagé par le prototype, et des
     invariants à tenir.
   - d) **Classe** : l'environnement l'impose — `class ValidationError extends Error` conserve
     la pile d'appels et fonctionne avec `instanceof`.
   :::

2. Remplace cette classe par des fonctions exportées, sans changer le résultat des appels.

   ```js
   export class Texte {
     static majuscules(s) { return s.toUpperCase(); }
     static tronquer(s, n) { return s.length > n ? `${s.slice(0, n)}…` : s; }
   }
   ```

   :::indice
   Aucune méthode n'utilise `this` : rien ne relie ces fonctions à une instance.
   :::

   :::solution
   ```js
   export function majuscules(s) {
     return s.toUpperCase();
   }

   export function tronquer(s, n) {
     return s.length > n ? `${s.slice(0, n)}…` : s;
   }

   console.log(majuscules('ada'), tronquer('JavaScript', 4)); // 'ADA' 'Java…'
   ```

   Chez l'appelant, `Texte.tronquer(x, 4)` devient `tronquer(x, 4)`, ou
   `import * as Texte from './texte.js'` pour garder exactement la même écriture.
   :::

3. Ce code laisse n'importe qui rendre le stock négatif. Transforme-le en classe qui garantit
   que la quantité reste positive ou nulle.

   ```js
   const stock = { quantite: 10 };
   function retirer(stock, n) {
     stock.quantite -= n;
   }
   ```

   :::indice
   La quantité doit devenir un champ privé, modifiable seulement par une méthode qui vérifie
   la règle.
   :::

   :::solution
   ```js
   class Stock {
     #quantite;

     constructor(quantite) {
       if (!(quantite >= 0)) {
         throw new RangeError('Quantité initiale invalide');
       }
       this.#quantite = quantite;
     }

     retirer(n) {
       if (n > this.#quantite) {
         throw new RangeError('Stock insuffisant');
       }
       this.#quantite -= n;
     }

     get quantite() {
       return this.#quantite;
     }
   }

   const stock = new Stock(10);
   stock.retirer(4);
   console.log(stock.quantite); // 6
   ```

   Ici la classe se justifie : il y a une règle métier à tenir, et plus aucun chemin ne permet
   de la contourner.
   :::

## Questions d'entretien

- Quand une classe est-elle justifiée en JavaScript ?

  :::indice
  Qu'apporte-t-elle que ni un objet, ni un module, ni une fabrique n'offrent aussi bien ?
  :::

  :::reponse
  Quand il y a un état à protéger par des invariants, de nombreuses instances qui partagent
  leur comportement, une identité ou un cycle de vie, ou quand l'environnement impose une
  classe — sous-classe d'`Error`, élément personnalisé, contrôleur de framework. Pour des
  données seules, un objet suffit ; pour des traitements sans état, des fonctions ; pour peu
  d'instances avec état caché, une fabrique est souvent plus simple.
  :::

- Pourquoi une classe ne contenant que des méthodes statiques est-elle un défaut de
  conception ?

  :::indice
  Qu'est-ce qu'un module ES offre déjà ?
  :::

  :::reponse
  Parce qu'elle n'utilise aucune des capacités d'une classe : pas d'instance, pas d'état, pas
  de `this`. Elle ne sert que d'espace de noms, ce qu'un module ES fournit déjà. Les fonctions
  exportées sont plus simples à importer une par une, plus faciles à éliminer du bundle quand
  elles ne servent pas, et `import * as Nom` redonne la même écriture si on la souhaite.
  :::

- Classe ou fonction fabrique : comment trancher ?

  :::indice
  Pense au partage des méthodes, à `this`, à l'héritage et à la cohérence du projet.
  :::

  :::reponse
  La fabrique évite `this` et `new`, cache son état par closure et se compose facilement ; son
  coût est une copie des fonctions par objet. La classe partage ses méthodes via le prototype,
  offre l'héritage, les champs privés et le test de marque, au prix des pièges de `this`. Pour
  beaucoup d'instances ou quand un framework attend une classe, la classe l'emporte ; sinon,
  les deux sont légitimes, et le critère décisif est la cohérence avec le reste du code.
  :::
