---
id: javascript-fonctions-pures
title: "Fonctions pures et effets de bord"
slug: fonctions-pures
technology: javascript
level: intermediate
module: fonctions
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-fonctions-parametres
skills:
  - pure-functions
tags:
  - javascript
  - fonctions
---

## Objectifs

- Reconnaître une fonction pure, et nommer les effets de bord d'une fonction impure.
- Rendre une fonction testable en sortant ses dépendances cachées.
- Organiser un programme avec un noyau pur et des effets repoussés aux bords.

## Introduction

Deux fonctions qui calculent la même chose peuvent être très différentes à l'usage : l'une
se teste en une ligne, l'autre demande de préparer une base de données et de figer
l'horloge. La différence tient à la **pureté** — une notion simple, et probablement le plus
grand levier de qualité disponible sans rien changer à ses outils.

## Concept

Une fonction est **pure** si elle respecte deux conditions :

1. pour les mêmes entrées, elle renvoie toujours la même sortie ;
2. elle ne produit aucun effet observable en dehors d'elle-même.

Un **effet de bord** est tout ce qu'une fonction fait d'autre que renvoyer une valeur :

| Effet de bord | Exemple |
| --- | --- |
| Modifier une variable extérieure | `total += prix` |
| Modifier un argument | `panier.push(article)` |
| Écrire quelque part | `console.log`, DOM, fichier, réseau |
| Lire une source changeante | `Date.now()`, `Math.random()`, une variable globale |

Les deux dernières lignes cassent la première condition : même entrée, sortie différente.

## Exemple

```js
// Impure : dépend d'un état extérieur et le modifie.
let total = 0;
function ajouter(prix) {
  total += prix;
  console.log('total', total);
  return total;
}

// Pure : tout ce dont elle a besoin entre par les paramètres.
function additionner(total, prix) {
  return total + prix;
}
console.log(additionner(0, 10), additionner(0, 10)); // 10 10, toujours

// Impure : lit l'horloge.
function estExpire(jeton) {
  return jeton.expireLe < Date.now();
}

// Pure : l'instant devient une entrée.
function estExpireA(jeton, maintenant) {
  return jeton.expireLe < maintenant;
}
console.log(estExpireA({ expireLe: 100 }, 200)); // true, testable sans horloge

// Impure : modifie l'argument reçu.
function trierPrix(produits) {
  return produits.sort((a, b) => a.prix - b.prix);
}

// Pure : renvoie une nouvelle liste.
function parPrix(produits) {
  return produits.toSorted((a, b) => a.prix - b.prix);
}
```

## Comment ça fonctionne

Une fonction pure est **remplaçable par son résultat** : puisque `additionner(0, 10)` vaut
toujours 10, le programme se comporte pareil si on écrit 10 à la place. Cette propriété a
trois conséquences pratiques.

**Le test devient trivial** : on appelle avec des valeurs, on compare le résultat. Aucun
montage, aucun nettoyage, aucun ordre d'exécution à respecter. Les tests d'une fonction
impure, eux, doivent figer l'horloge, remplacer le réseau ou remettre l'état à zéro.

**La mémoïsation devient possible** : on peut garder le résultat d'un appel et le
réutiliser, ce qui n'a aucun sens si la fonction dépend de l'heure.

**Le raisonnement reste local** : pour comprendre une fonction pure, il suffit de la lire.
Pour une fonction impure, il faut connaître tout ce qui touche à l'état qu'elle lit.

Un programme entièrement pur ne servirait à rien : il ne pourrait ni afficher, ni
enregistrer. L'objectif n'est donc pas la pureté partout, mais une **répartition** : un
noyau pur qui décide et calcule, une fine coquille impure qui lit les entrées et applique
les effets. Les dépendances cachées — horloge, aléa, requêtes — deviennent des
**paramètres** : la fonction reste pure, et l'appelant fournit `Date.now()` une seule fois,
au bord du programme.

`console.log` est un effet de bord au sens strict, puisqu'il écrit dans un flux extérieur.
En pratique, on le tolère pendant la mise au point, mais une fonction dont le journal fait
partie du contrat n'est plus testable comme une fonction pure.

## Erreurs fréquentes

**Modifier les arguments reçus.** `produits.sort(...)` réordonne la liste de l'appelant.
Utilise `toSorted`, `map`, `filter`.

**Lire l'horloge ou l'aléa au fond d'une fonction.** La fonction devient intestable :
fais-en un paramètre.

**Renvoyer une valeur *et* modifier un état.** Le lecteur ne voit que la première moitié du
contrat.

**Dépendre d'une variable globale.** La fonction cesse d'être réutilisable ailleurs.

## À retenir

- Pure : mêmes entrées, même sortie, aucun effet observable.
- Effets courants : mutation d'argument, variable globale, écriture, horloge, aléa.
- Une fonction pure se teste sans montage et peut être mémoïsée.
- On ne supprime pas les effets : on les repousse aux bords du programme.
- Les dépendances cachées deviennent des paramètres.

## Exercices

1. Rends pure cette fonction, qui s'appuie sur un total global.

   ```js
   let total = 0;
   function ajouter(prix) {
     total += prix;
     return total;
   }
   ```

   :::indice
   Tout ce dont la fonction a besoin doit entrer par ses paramètres, et tout ce qu'elle
   produit doit sortir par son retour.
   :::

   :::solution
   ```js
   function additionner(total, prix) {
     return total + prix;
   }

   console.log(additionner(0, 10)); // 10
   console.log([10, 20, 5].reduce(additionner, 0)); // 35
   ```

   L'état ne disparaît pas : il est tenu par l'appelant, ici par `reduce`. La fonction, elle,
   redevient prévisible et réutilisable.
   :::

2. Rends testable une fonction qui vérifie l'expiration d'un jeton avec `Date.now()`.

   :::indice
   L'instant présent est une entrée comme une autre.
   :::

   :::solution
   ```js
   function estExpire(jeton, maintenant = Date.now()) {
     return jeton.expireLe < maintenant;
   }

   console.log(estExpire({ expireLe: 100 }, 200)); // true
   console.log(estExpire({ expireLe: 100 }, 50)); // false
   ```

   La valeur par défaut garde l'appel courant simple, et le test fournit son propre instant :
   plus besoin de figer l'horloge.
   :::

3. Repère les trois impuretés de cette fonction, puis propose une version pure.

   ```js
   const remises = { ada: 0.1 };
   function prixFinal(panier) {
     panier.total = panier.articles.reduce((s, a) => s + a.prix, 0);
     console.log('calcul', new Date());
     return panier.total * (1 - (remises[panier.client] ?? 0));
   }
   ```

   :::indice
   Regarde ce qu'elle modifie, ce qu'elle écrit, et ce qu'elle lit en dehors de ses
   paramètres.
   :::

   :::solution
   Elle modifie son argument (`panier.total`), elle écrit dans la console une valeur qui
   change à chaque appel, et elle lit la table `remises` définie à l'extérieur.

   ```js
   function prixFinal(panier, remise = 0) {
     const total = panier.articles.reduce((somme, a) => somme + a.prix, 0);
     return total * (1 - remise);
   }

   const panier = { client: 'ada', articles: [{ prix: 100 }] };
   console.log(prixFinal(panier, remises[panier.client] ?? 0)); // 90
   console.log(panier.total); // undefined : le panier est intact
   ```

   La table des remises reste utile, mais c'est l'appelant qui la consulte : la décision
   métier sort du calcul.
   :::

## Questions d'entretien

- Qu'est-ce qu'une fonction pure, et pourquoi en écrire ?

  :::indice
  Deux conditions, et trois bénéfices concrets.
  :::

  :::reponse
  Une fonction pure renvoie toujours la même sortie pour les mêmes entrées et ne produit
  aucun effet observable : pas de mutation d'argument, pas d'écriture, pas de lecture d'une
  source changeante. L'intérêt est pratique : elle se teste sans montage ni nettoyage, elle
  peut être mémoïsée ou déplacée sans risque, et on peut la comprendre en la lisant seule,
  sans connaître le reste du programme.
  :::

- `console.log` rend-il une fonction impure ?

  :::indice
  Est-ce observable en dehors de la fonction ?
  :::

  :::reponse
  Oui, au sens strict : écrire dans un flux extérieur est un effet de bord, et une fonction
  qui journalise ne peut plus être remplacée par son résultat. En pratique, on tolère un
  journal temporaire de mise au point, mais dès que le journal fait partie du contrat — un
  audit, une trace attendue —, il doit être traité comme un effet à part entière, produit par
  l'appelant ou par un collaborateur injecté.
  :::

- Comment tester une fonction qui dépend de l'heure ou du hasard ?

  :::indice
  D'où viennent ces valeurs, et où pourraient-elles venir à la place ?
  :::

  :::reponse
  En sortant la dépendance : l'instant ou la source aléatoire devient un paramètre, avec
  éventuellement une valeur par défaut pour le code de production —
  `function estExpire(jeton, maintenant = Date.now())`. Le test fournit alors ses propres
  valeurs, et la fonction redevient pure. L'autre approche, remplacer l'horloge globale par
  un faux objet dans le test, fonctionne aussi mais couple le test à l'implémentation et
  rend l'ordre des tests important.
  :::
