---
id: javascript-factory-functions
title: "Factory functions et données privées"
slug: factory-functions
technology: javascript
level: intermediate
module: closures
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-closures
skills:
  - factory-functions
tags:
  - javascript
  - closures
---

## Objectifs

- Fabriquer des objets avec une fonction plutôt qu'avec un constructeur.
- Rendre un état réellement inaccessible de l'extérieur grâce à une closure.
- Reconnaître le motif module, et savoir quand une classe est préférable.

## Introduction

Un compteur dont la valeur ne peut pas être modifiée de l'extérieur, un porte-monnaie dont
le solde n'est accessible que par des opérations autorisées : dans beaucoup de langages,
cela demande un mot-clé `private`. En JavaScript, une closure suffit — et c'est un motif
qu'on croise dans d'innombrables bibliothèques.

## Concept

Une **factory function** est une fonction ordinaire qui renvoie un objet. Les variables
déclarées dans la fabrique restent visibles par les méthodes renvoyées, et **seulement**
par elles.

| Motif | Idée |
| --- | --- |
| Factory | `function creer(...) { … return { methode() {} }; }` |
| Données privées | une variable de la fabrique, jamais exposée dans l'objet renvoyé |
| Motif module | une fonction exécutée immédiatement, qui renvoie une interface publique |

Comparé à `class`, ce motif n'a besoin ni de `new`, ni de `this` : chaque objet renvoyé
possède ses propres fonctions, attachées à son propre environnement.

## Exemple

```js
function creerCompteur(depart = 0) {
  let valeur = depart; // privée : aucune référence ne sort

  return {
    incrementer() {
      valeur += 1;
      return valeur;
    },
    valeurActuelle() {
      return valeur;
    },
  };
}

const compteur = creerCompteur(10);
console.log(compteur.incrementer()); // 11
console.log(compteur.valeurActuelle()); // 11
console.log(compteur.valeur); // undefined : inaccessible
compteur.valeur = 999; // ajoute une propriété sans effet
console.log(compteur.valeurActuelle()); // 11

const autre = creerCompteur();
console.log(autre.valeurActuelle()); // 0 : état indépendant

function creerPorteMonnaie(solde = 0) {
  return {
    deposer(montant) {
      if (montant <= 0) throw new Error('Montant invalide');
      solde += montant;
      return solde;
    },
    retirer(montant) {
      if (montant > solde) throw new Error('Solde insuffisant');
      solde -= montant;
      return solde;
    },
    get solde() {
      return solde;
    },
  };
}

const compte = creerPorteMonnaie(100);
compte.deposer(50);
console.log(compte.solde); // 150
```

## Comment ça fonctionne

À chaque appel de `creerCompteur`, une nouvelle portée est créée, avec sa variable `valeur`.
Les fonctions renvoyées sont écrites **à l'intérieur** de cette portée : elles gardent un
lien vers elle, et c'est ce lien qui les rend capables de lire et modifier `valeur` après le
retour de la fabrique. Deux compteurs créés séparément ont donc deux états indépendants,
sans aucune coordination de notre part.

La confidentialité est réelle, pas conventionnelle : `valeur` n'est référencée par aucune
propriété de l'objet renvoyé, donc il n'existe aucun chemin pour y accéder — ni
`compteur.valeur`, ni `Object.keys`, ni le débogueur d'un autre module. C'est la différence
avec la convention `_valeur`, qui signale une intention sans rien empêcher.

Le **motif module** applique la même idée à l'échelle d'un fichier : une fonction exécutée
immédiatement enferme l'état et ne renvoie que l'interface publique. Avant les modules ES,
c'était la façon standard d'éviter de polluer l'espace global ; aujourd'hui, un module ES
fait cela nativement, et le motif sert surtout pour un singleton avec état.

Face aux **classes**, le choix se pose ainsi. La fabrique : pas de `new`, pas de `this`, une
confidentialité totale, mais chaque objet embarque ses propres fonctions — un coût mémoire
qui ne compte que pour des dizaines de milliers d'instances. La classe : méthodes partagées
par le prototype, héritage natif, champs privés `#champ` depuis ES2022, et un `this` dont il
faut gérer la liaison. Les deux sont légitimes ; ce qui est à éviter, c'est de les mélanger
dans une même base de code sans raison.

## Erreurs fréquentes

**Exposer l'état par mégarde.** Renvoyer `{ valeur, incrementer }` fige une copie de la
primitive et brise l'encapsulation ; pour un objet, cela donne un accès direct.

**Croire que `_prive` est privé.** Le tiret bas est une convention : rien n'empêche l'accès.

**Oublier que chaque appel crée un état neuf.** Deux appels à la fabrique donnent deux
objets sans mémoire commune ; il faut un seul appel partagé pour un état commun.

**Recréer la fabrique dans une boucle serrée.** Chaque objet porte ses propres fonctions :
sur de très grands volumes, une classe est plus économe.

## À retenir

- Une factory est une fonction qui renvoie un objet, sans `new` ni `this`.
- Les variables de la fabrique deviennent un état réellement privé.
- Chaque appel crée un état indépendant.
- Motif module : enfermer l'état, ne renvoyer que l'interface publique.
- Classe ou fabrique : méthodes partagées et héritage d'un côté, simplicité et
  confidentialité de l'autre.

## Exercices

1. Écris `creerCompteur(depart)` dont la valeur ne peut être ni lue ni modifiée directement,
   et vérifie que deux compteurs sont indépendants.

   :::indice
   La variable d'état se déclare dans la fabrique, et n'apparaît dans aucune propriété de
   l'objet renvoyé.
   :::

   :::solution
   ```js
   function creerCompteur(depart = 0) {
     let valeur = depart;
     return {
       incrementer: () => (valeur += 1),
       lire: () => valeur,
     };
   }

   const a = creerCompteur(10);
   const b = creerCompteur();
   a.incrementer();
   console.log(a.lire(), b.lire()); // 11 0
   console.log(a.valeur); // undefined
   ```
   :::

2. Écris `creerPorteMonnaie(solde)` qui refuse un dépôt négatif et un retrait supérieur au
   solde, et n'expose le solde qu'en lecture.

   :::indice
   Un accesseur `get` permet d'exposer une valeur sans permettre son écriture.
   :::

   :::solution
   ```js
   function creerPorteMonnaie(solde = 0) {
     return {
       deposer(montant) {
         if (montant <= 0) throw new Error('Montant invalide');
         return (solde += montant);
       },
       retirer(montant) {
         if (montant > solde) throw new Error('Solde insuffisant');
         return (solde -= montant);
       },
       get solde() {
         return solde;
       },
     };
   }

   const compte = creerPorteMonnaie(100);
   compte.deposer(50);
   compte.solde = 10_000; // sans effet : pas de setter
   console.log(compte.solde); // 150
   ```
   :::

3. Transforme ce code en motif module : une seule instance, un état caché, deux opérations
   publiques.

   ```js
   let entrees = [];
   function ajouter(ligne) { entrees.push(ligne); }
   function tout() { return entrees; }
   ```

   :::indice
   Une fonction exécutée immédiatement enferme l'état et renvoie l'interface publique.
   :::

   :::solution
   ```js
   const journal = (() => {
     const entrees = [];
     return {
       ajouter(ligne) {
         entrees.push(ligne);
         return entrees.length;
       },
       tout() {
         return [...entrees]; // copie : l'appelant ne peut pas modifier l'état
       },
     };
   })();

   journal.ajouter('démarrage');
   journal.tout().push('triche'); // sans effet sur l'état interne
   console.log(journal.tout()); // ['démarrage']
   ```

   Renvoyer une copie est essentiel : sans elle, `tout()` livrerait une référence directe sur
   le tableau privé.
   :::

## Questions d'entretien

- Comment obtenir des données réellement privées en JavaScript ?

  :::indice
  Qu'est-ce qui rend une variable inaccessible depuis l'extérieur ?
  :::

  :::reponse
  Par une closure : une variable déclarée dans une fabrique, référencée seulement par les
  fonctions renvoyées, n'est atteignable par aucun chemin extérieur. Depuis ES2022, les
  classes offrent aussi les champs privés `#champ`, avec la même garantie au niveau du
  langage. La convention `_champ`, en revanche, ne protège rien : elle signale une intention.
  :::

- Factory ou classe : comment choisir ?

  :::indice
  Pense au partage des méthodes, à `this`, et à l'héritage.
  :::

  :::reponse
  La fabrique évite `new` et `this`, offre une confidentialité totale et se compose bien ;
  son coût est que chaque objet porte ses propres fonctions, ce qui ne pèse qu'à très grande
  échelle. La classe partage ses méthodes via le prototype, propose l'héritage, les champs
  privés et un vocabulaire familier, mais impose de surveiller la liaison de `this`. Le
  critère décisif est la cohérence : suivre ce que fait déjà la base de code.
  :::

- Qu'est-ce que le motif module, et sert-il encore ?

  :::indice
  Quel problème résolvait-il avant les modules ES ?
  :::

  :::reponse
  C'est une fonction exécutée immédiatement qui enferme un état et ne renvoie qu'une
  interface publique. Avant les modules ES, c'était la seule façon d'éviter de polluer
  l'espace global dans un fichier chargé par `<script>`. Les modules ES rendent cet isolement
  natif, mais le motif reste utile pour créer un singleton avec état à l'intérieur d'un
  module — un cache, un journal, une file.
  :::
