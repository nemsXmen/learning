---
id: javascript-choisir-sa-boucle
title: "Choisir sa boucle, éviter les boucles inutiles et mesurer leur coût"
slug: choisir-sa-boucle
technology: javascript
level: intermediate
module: boucles
order: 4
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-for-of-for-in
skills:
  - loop-complexity
tags:
  - javascript
  - boucles
  - performance
---

## Objectifs

- Choisir la boucle qui exprime le mieux une intention.
- Estimer le coût d'une boucle quand les données grandissent : O(1), O(n), O(n²).
- Supprimer le travail inutile : sortie anticipée, recherche avec un `Set`, double
  parcours évité.

## Introduction

Toutes les boucles peuvent s'écrire les unes avec les autres ; ce n'est pas une raison pour
les employer au hasard. La bonne boucle rend l'intention évidente pour le lecteur. Et sur
de vraies données — dix mille commandes, cent mille lignes —, la façon de boucler compte
bien plus que la vitesse du processeur : deux boucles imbriquées maladroites peuvent
transformer une opération instantanée en plusieurs minutes.

## Concept

| Intention | Boucle adaptée |
| --- | --- |
| Répéter un nombre de fois connu, ou avoir besoin de l'index | `for` |
| Parcourir les valeurs d'une collection | `for...of` |
| Répéter tant qu'une condition reste vraie, sans savoir combien de fois | `while` |
| Exécuter au moins une fois, puis vérifier | `do...while` |
| Parcourir les propriétés d'un objet | `for...of` sur `Object.entries` |
| Transformer, filtrer, chercher dans un tableau | `map`, `filter`, `find`, `some` (module 07) |

La **complexité** décrit comment le nombre d'opérations évolue quand la taille des données
`n` augmente :

| Notation | Évolution | Exemple |
| --- | --- | --- |
| O(1) | constante | lire `tableau[0]`, `set.has(valeur)` |
| O(n) | proportionnelle | une boucle sur le tableau |
| O(n²) | quadratique | deux boucles imbriquées sur les mêmes données |

Avec 1 000 éléments, O(n) représente 1 000 opérations et O(n²) un million. Avec 100 000
éléments : 100 000 contre dix milliards.

## Exemple

Détecter une adresse e-mail en double, de deux façons :

```js
const emails = ['ada@exemple.fr', 'grace@exemple.fr', 'ada@exemple.fr'];

// O(n²) : chaque adresse est comparée à toutes les suivantes
let doublonLent = false;
for (let i = 0; i < emails.length && !doublonLent; i++) {
  for (let j = i + 1; j < emails.length; j++) {
    if (emails[i] === emails[j]) {
      doublonLent = true;
      break;
    }
  }
}

// O(n) : on retient ce qu'on a déjà vu dans un Set
const dejaVues = new Set();
let doublonRapide = false;
for (const email of emails) {
  if (dejaVues.has(email)) {
    doublonRapide = true;
    break;
  }
  dejaVues.add(email);
}

console.log(doublonLent, doublonRapide); // true true
```

## Comment ça fonctionne

Un `Set` retrouve une valeur en temps constant en moyenne, quelle que soit sa taille : il
ne parcourt pas ses éléments, il calcule directement où chercher. Un tableau, lui, doit être
parcouru : `includes` et `indexOf` sont en O(n).

Le piège le plus courant est donc **une boucle cachée dans une méthode** :

```js
const communs = [];
for (const id of commandesA) {
  if (commandesB.includes(id)) communs.push(id); // includes reparcourt commandesB
}
// O(n × m) : acceptable pour 50 éléments, désastreux pour 50 000
```

Préparer un `Set` une fois, avant la boucle, ramène le tout à O(n + m).

Les « micro-optimisations » souvent citées, comme stocker `tableau.length` dans une
variable, n'ont presque aucun effet dans les moteurs modernes. Ce qui compte, c'est
l'algorithme. Et avant d'optimiser, on **mesure** : `console.time` ou le profileur des
outils de développement montrent si la boucle est vraiment le problème.

## Erreurs fréquentes

**Appeler `includes` ou `indexOf` dans une boucle sur de grandes données.** Chaque appel
reparcourt le tableau. Construis un `Set` avant la boucle.

**Continuer à boucler après avoir trouvé.** Sors avec `break`, ou utilise `some` et `find`,
qui s'arrêtent d'eux-mêmes.

**Parcourir plusieurs fois les mêmes données.** Calculer le total dans une boucle, puis le
maximum dans une autre, puis la moyenne dans une troisième : une seule boucle suffit.

**Optimiser sans mesurer.** Réécrire une boucle de dix éléments pour gagner une
microseconde rend le code moins lisible sans aucun bénéfice.

## À retenir

- Choisis la boucle qui dit ce que tu fais : `for` pour compter, `for...of` pour parcourir,
  `while` pour attendre.
- Deux boucles imbriquées sur les mêmes données : O(n²).
- `includes` dans une boucle est une boucle imbriquée cachée ; un `Set` la supprime.
- Sors dès que le résultat est connu.
- Mesure avant d'optimiser : l'algorithme compte plus que les détails.

## Exercices

1. Choisis la boucle la plus adaptée à chaque situation : afficher les 12 mois avec leur
   numéro, lire des lignes jusqu'à rencontrer une ligne vide, additionner les prix d'un
   panier, afficher toutes les propriétés d'un objet.

   :::indice
   Demande-toi à chaque fois : connais-tu le nombre de tours ? As-tu besoin de l'index ?
   Parcours-tu des valeurs ou des propriétés ?
   :::

   :::solution
   - Les 12 mois avec leur numéro : `for`, le nombre de tours est connu et l'index sert.
   - Des lignes jusqu'à une ligne vide : `while`, on ne sait pas combien il y en aura.
   - Les prix d'un panier : `for...of`, seules les valeurs comptent.
   - Les propriétés d'un objet : `for...of` sur `Object.entries(objet)`.
   :::

2. Réécris ce code pour qu'il passe de O(n × m) à O(n + m).

   ```js
   const communs = [];
   for (const id of commandesA) {
     if (commandesB.includes(id)) {
       communs.push(id);
     }
   }
   ```

   :::indice
   Qu'est-ce qui coûte cher ici ? Prépare, une seule fois avant la boucle, une structure
   qui répond en temps constant.
   :::

   :::solution
   ```js
   const commandesA = [3, 7, 12, 25];
   const commandesB = [7, 25, 40];

   const idsB = new Set(commandesB); // O(m), une seule fois
   const communs = [];
   for (const id of commandesA) {
     if (idsB.has(id)) {
       communs.push(id); // has est en temps constant
     }
   }

   console.log(communs); // [7, 25]
   ```

   Construire le `Set` coûte O(m), la boucle O(n) : O(n + m) au total, au lieu de parcourir
   `commandesB` pour chaque élément de `commandesA`.
   :::

3. Ce code vérifie qu'au moins un produit est en rupture de stock. Fais-le s'arrêter dès
   que la réponse est connue.

   ```js
   let rupture = false;
   for (const produit of produits) {
     if (produit.stock === 0) {
       rupture = true;
     }
   }
   ```

   :::indice
   Une fois `rupture` passé à `true`, les tours suivants ne peuvent plus rien changer.
   :::

   :::solution
   ```js
   let rupture = false;
   for (const produit of produits) {
     if (produit.stock === 0) {
       rupture = true;
       break;
     }
   }
   ```

   La méthode `some`, vue au module 07, exprime la même chose en une ligne et s'arrête aussi
   d'elle-même : `const rupture = produits.some((produit) => produit.stock === 0);`.
   :::

## Questions d'entretien

- Que signifie O(n²), et dans quel code l'observe-t-on ?

  :::indice
  Que devient le nombre d'opérations quand la taille des données double ?
  :::

  :::reponse
  O(n²) signifie que le nombre d'opérations croît comme le carré de la taille des données :
  doubler les données multiplie le travail par quatre. On l'observe typiquement avec deux
  boucles imbriquées sur les mêmes données, ou avec une méthode qui parcourt un tableau —
  `includes`, `indexOf`, `find` — appelée dans une boucle. C'est invisible sur quelques
  dizaines d'éléments et paralysant sur des dizaines de milliers.
  :::

- Pourquoi `includes` dans une boucle peut-il être lent, et comment l'éviter ?

  :::indice
  Comment `includes` trouve-t-il une valeur dans un tableau ?
  :::

  :::reponse
  `includes` parcourt le tableau élément par élément jusqu'à trouver la valeur : c'est une
  opération en O(n). Appelé à chaque tour d'une boucle, il crée une boucle imbriquée
  cachée. On construit un `Set` une seule fois avant la boucle : sa méthode `has` répond en
  temps constant en moyenne, ce qui ramène le traitement à O(n).
  :::

- Faut-il stocker `tableau.length` dans une variable avant une boucle `for` ?

  :::indice
  Qu'est-ce qui a vraiment de l'effet sur la durée d'une boucle ?
  :::

  :::reponse
  Presque jamais. Les moteurs modernes optimisent déjà la lecture de `length`, et le gain
  est négligeable face au coût du corps de la boucle. Cette micro-optimisation rend aussi
  le code incorrect si le tableau change pendant le parcours. Ce qui a un effet réel, c'est
  la complexité de l'algorithme : supprimer une boucle imbriquée, sortir tôt, utiliser la
  bonne structure. Et on mesure avant de modifier quoi que ce soit.
  :::
