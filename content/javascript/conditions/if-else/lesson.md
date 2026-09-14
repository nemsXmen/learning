---
id: javascript-if-else
title: "if, else et else if"
slug: if-else
technology: javascript
level: beginner
module: conditions
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 60
prerequisites:
  - javascript-comparaisons
skills:
  - conditionals
tags:
  - javascript
  - conditions
---

## Objectifs

- Écrire des conditions avec `if`, `else` et `else if`.
- Ordonner une chaîne de conditions pour qu'elle donne le bon résultat.
- Réduire l'imbrication des conditions.

## Introduction

Un programme qui fait toujours la même chose n'est pas très utile. Dès qu'il faut
calculer des frais de port différents selon le montant, afficher un message selon l'heure
ou refuser un mot de passe trop court, il faut **choisir** quel code exécuter. C'est le
rôle de `if`. La syntaxe se retient en une minute ; ce qui demande de l'attention, c'est
l'ordre des conditions et la lisibilité quand elles s'accumulent.

## Concept

```js
if (condition) {
  // exécuté si la condition est vraie
} else if (autreCondition) {
  // exécuté si la première est fausse et celle-ci vraie
} else {
  // exécuté si aucune condition n'est vraie
}
```

| Élément | Obligatoire | Nombre |
| --- | --- | --- |
| `if` | oui | un seul, en premier |
| `else if` | non | autant que nécessaire |
| `else` | non | au plus un, en dernier |

Dans une chaîne `if` / `else if` / `else`, **une seule branche s'exécute** : la première
dont la condition est vraie. Les suivantes ne sont même pas évaluées.

La condition n'a pas besoin d'être un booléen : elle est convertie. `0`, `''`, `null`,
`undefined` et `NaN` sont traités comme faux, presque tout le reste comme vrai.

## Exemple

```js
const montant = 42;
const estExpress = false;

let fraisDePort;
if (estExpress) {
  fraisDePort = 9.9;
} else if (montant >= 50) {
  fraisDePort = 0;
} else {
  fraisDePort = 4.9;
}

console.log(`Frais de port : ${fraisDePort} €`); // Frais de port : 4.9 €
```

L'ordre des conditions porte une règle métier : la livraison express est payante **même**
au-delà de 50 €, c'est pourquoi elle est testée en premier.

## Comment ça fonctionne

Le moteur évalue la condition du `if`, la convertit en booléen, et exécute le bloc
correspondant. S'il est faux, il passe au `else if` suivant, et ainsi de suite. Dès
qu'une branche s'exécute, toute la chaîne est terminée.

C'est pourquoi **l'ordre compte** quand les conditions se recouvrent :

```js
const note = 17;

// Faux : note >= 10 est déjà vrai pour 17, les autres branches ne sont jamais atteintes
if (note >= 10) console.log('Passable');
else if (note >= 16) console.log('Très bien');

// Juste : du plus exigeant au moins exigeant
if (note >= 16) console.log('Très bien');
else if (note >= 10) console.log('Passable');
```

Des conditions imbriquées peuvent souvent être fusionnées avec `&&` :

```js
// Imbriqué
if (estConnecte) {
  if (estAdmin) {
    afficherTableauDeBord();
  }
}

// Aplati
if (estConnecte && estAdmin) {
  afficherTableauDeBord();
}
```

## Erreurs fréquentes

**Écrire `=` au lieu de `===`.** `if (age = 18)` affecte 18 et la condition est toujours
vraie.

**Mal ordonner les `else if`.** Une condition plus large placée avant une condition plus
précise l'empêche de s'exécuter. Commence par le cas le plus spécifique.

**Omettre les accolades.** Sans accolades, seule la première instruction dépend du `if`.
Ajouter une seconde ligne indentée donne l'illusion qu'elle en dépend aussi.

**Empiler les niveaux d'imbrication.** Au-delà de deux niveaux, le code devient difficile
à suivre. Fusionne avec `&&`, ou sors tôt du traitement (chapitre « Guard clauses »).

## À retenir

- Dans une chaîne `if` / `else if` / `else`, une seule branche s'exécute : la première
  vraie.
- Ordonne les conditions du cas le plus spécifique au plus général.
- Mets toujours des accolades.
- Deux `if` imbriqués sans `else` se fusionnent souvent en un `&&`.

## Exercices

1. Calcule les frais de port : 9,90 € en express quel que soit le montant, sinon gratuit
   à partir de 50 €, sinon 4,90 €. Teste avec 30 €, 60 € et 60 € en express.

   :::indice
   Quelle règle doit l'emporter sur les autres ? Teste-la en premier.
   :::

   :::solution
   ```js
   const montant = 60;
   const estExpress = true;

   let frais;
   if (estExpress) {
     frais = 9.9;
   } else if (montant >= 50) {
     frais = 0;
   } else {
     frais = 4.9;
   }

   console.log(frais); // 9.9 (30 € donne 4.9, 60 € sans express donne 0)
   ```
   :::

2. Aplatis ce code en une seule condition.

   ```js
   if (panier.length > 0) {
     if (estConnecte) {
       validerCommande();
     }
   }
   ```

   :::indice
   Deux `if` imbriqués sans `else` exécutent le bloc quand les deux conditions sont vraies
   en même temps.
   :::

   :::solution
   ```js
   if (panier.length > 0 && estConnecte) {
     validerCommande();
   }
   ```

   Le résultat est identique, avec un niveau d'imbrication en moins. Grâce au
   court-circuit, `estConnecte` n'est pas évalué quand le panier est vide.
   :::

3. Affiche l'appréciation d'une note sur 20 : « Très bien » à partir de 16, « Bien » à
   partir de 14, « Passable » à partir de 10, « Insuffisant » sinon.

   :::indice
   Les conditions se recouvrent : 17 est à la fois supérieur à 16, 14 et 10. Dans quel
   ordre les tester ?
   :::

   :::solution
   ```js
   const note = 14.5;

   let appreciation;
   if (note >= 16) {
     appreciation = 'Très bien';
   } else if (note >= 14) {
     appreciation = 'Bien';
   } else if (note >= 10) {
     appreciation = 'Passable';
   } else {
     appreciation = 'Insuffisant';
   }

   console.log(appreciation); // Bien
   ```

   Du seuil le plus haut au plus bas : chaque branche n'est atteinte que si les seuils
   supérieurs ont échoué, ce qui rend inutile d'écrire `note >= 14 && note < 16`.
   :::

## Questions d'entretien

- Pourquoi l'ordre des `else if` compte-t-il ?

  :::indice
  Combien de branches d'une chaîne s'exécutent au maximum ?
  :::

  :::reponse
  Une chaîne `if` / `else if` / `else` s'arrête à la première condition vraie. Si une
  condition large précède une condition plus précise, la précise n'est jamais atteinte :
  tester `note >= 10` avant `note >= 16` classe un 17 en « Passable ». On ordonne donc du cas
  le plus spécifique au plus général, ce qui évite aussi de répéter des bornes du type
  `>= 14 && < 16`.
  :::

- Pourquoi mettre des accolades même quand un `if` ne contient qu'une ligne ?

  :::indice
  Que se passe-t-il quand quelqu'un ajoute une seconde ligne indentée sous un `if` sans
  accolades ?
  :::

  :::reponse
  Sans accolades, seule l'instruction qui suit immédiatement dépend du `if`. Une ligne
  ajoutée plus tard, même indentée, s'exécute toujours : l'indentation trompe le lecteur.
  Des bugs de sécurité réels sont nés de cette erreur. Les accolades rendent la portée du
  `if` explicite, et la plupart des configurations ESLint les imposent avec la règle
  `curly`.
  :::

- Comment réduire l'imbrication de conditions ?

  :::indice
  Il existe au moins deux techniques : l'une combine les conditions, l'autre sort tôt.
  :::

  :::reponse
  On fusionne les `if` imbriqués sans `else` avec `&&`. On donne des noms aux conditions
  complexes en les stockant dans des variables. Et dans une fonction, on traite d'abord les
  cas invalides avec des sorties anticipées (*guard clauses*) : le cas normal se lit
  ensuite sans indentation. Au-delà, on extrait des fonctions ou on remplace une longue
  chaîne par une table de correspondance.
  :::
