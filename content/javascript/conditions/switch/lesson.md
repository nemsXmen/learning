---
id: javascript-switch
title: "switch, et quand le préférer à if"
slug: switch
technology: javascript
level: beginner
module: conditions
order: 3
estimatedMinutes: 20
difficulty: 2
xp: 60
prerequisites:
  - javascript-if-else
skills:
  - switch-statement
tags:
  - javascript
  - conditions
---

## Objectifs

- Écrire un `switch` avec `case`, `break` et `default`.
- Comprendre le passage d'un `case` au suivant, et l'utiliser volontairement.
- Choisir entre `if`, `switch` et une table de correspondance.

## Introduction

Quand une variable peut prendre une dizaine de valeurs connues — un statut de commande,
un code de jour, une action utilisateur —, une longue chaîne de `else if` qui répète
`statut === '...'` devient pénible à lire. `switch` exprime cette situation directement.
Il a cependant un comportement qui surprend : sans `break`, l'exécution **continue** dans
le `case` suivant.

## Concept

```js
switch (expression) {
  case valeur1:
    // exécuté si expression === valeur1
    break;
  case valeur2:
    // exécuté si expression === valeur2
    break;
  default:
    // exécuté si aucun case ne correspond
}
```

| Mot-clé | Rôle |
| --- | --- |
| `case valeur:` | point d'entrée si l'expression est strictement égale à la valeur |
| `break` | sortir du `switch` |
| `default:` | point d'entrée si aucun `case` ne correspond (facultatif) |

Trois règles à retenir :

- la comparaison est **stricte** (`===`) : `'1'` ne correspond pas à `case 1` ;
- l'exécution commence au premier `case` qui correspond et **continue** jusqu'au prochain
  `break` ou à la fin : c'est le *fall-through* ;
- `default` peut être placé n'importe où, même s'il est d'usage de le mettre en dernier.

## Exemple

```js
const statut = 'expediee';

let message;
switch (statut) {
  case 'en-attente':
    message = 'Commande reçue';
    break;
  case 'expediee':
    message = 'Commande en route';
    break;
  case 'livree':
    message = 'Commande livrée';
    break;
  default:
    message = 'Statut inconnu';
}

console.log(message); // Commande en route
```

Le passage volontaire d'un `case` à l'autre permet de regrouper des valeurs :

```js
const jour = 6; // 0 = dimanche, 6 = samedi, comme Date.prototype.getDay()

switch (jour) {
  case 0:
  case 6:
    console.log('Week-end');
    break;
  default:
    console.log('Semaine');
}
```

## Comment ça fonctionne

L'expression du `switch` est évaluée **une seule fois**. Le moteur la compare ensuite,
dans l'ordre, à la valeur de chaque `case` avec l'égalité stricte. Au premier `case` qui
correspond, il exécute les instructions — et continue en ignorant les `case` suivants
tant qu'il ne rencontre pas de `break`.

Tous les `case` partagent **un seul bloc** : déclarer la même variable avec `let` dans deux
`case` provoque une `SyntaxError`. Il suffit d'ajouter des accolades à chaque `case` pour
lui donner sa propre portée :

```js
switch (forme) {
  case 'carre': {
    const aire = cote * cote;
    console.log(aire);
    break;
  }
  case 'cercle': {
    const aire = Math.PI * rayon ** 2;
    console.log(aire);
    break;
  }
}
```

Quand chaque `case` ne fait qu'associer une valeur à une autre, une **table de
correspondance** est souvent plus courte, et modifiable sans toucher à la logique :

```js
const MESSAGES = {
  'en-attente': 'Commande reçue',
  expediee: 'Commande en route',
  livree: 'Commande livrée',
};
const message = MESSAGES[statut] ?? 'Statut inconnu';
```

## Erreurs fréquentes

**Oublier `break`.** L'exécution se poursuit dans le `case` suivant et écrase le
résultat. Si le passage est voulu, signale-le d'un commentaire.

**Compter sur une conversion de type.** `switch ('1')` n'entre pas dans `case 1`. Convertis
la valeur avant le `switch`.

**Déclarer la même variable dans deux `case`.** Ajoute des accolades autour de chaque
`case`.

**Écrire `switch (true)` pour des plages de valeurs.** Ça fonctionne, mais une chaîne de
`if` / `else if` exprime plus clairement des comparaisons comme `note >= 16`.

## À retenir

- `switch` compare avec `===`, dans l'ordre des `case`.
- Sans `break`, l'exécution continue dans le `case` suivant.
- Regroupe des valeurs en enchaînant des `case` vides.
- Accolades par `case` pour déclarer des variables.
- Pour une simple association de valeurs, une table de correspondance est souvent
  meilleure.

## Exercices

1. Convertis un numéro de jour de 0 à 6 en nom de jour (0 pour dimanche, comme
   `Date.prototype.getDay()`), avec « inconnu » pour toute autre valeur.

   :::indice
   Un `case` par jour, un `break` à chaque fois, et `default` pour les valeurs hors
   limites.
   :::

   :::solution
   ```js
   const numero = 3;

   let nom;
   switch (numero) {
     case 0: nom = 'dimanche'; break;
     case 1: nom = 'lundi'; break;
     case 2: nom = 'mardi'; break;
     case 3: nom = 'mercredi'; break;
     case 4: nom = 'jeudi'; break;
     case 5: nom = 'vendredi'; break;
     case 6: nom = 'samedi'; break;
     default: nom = 'inconnu';
   }

   console.log(nom); // mercredi
   ```
   :::

2. Affiche « Week-end » pour le samedi et le dimanche, et « Semaine » sinon, en utilisant
   volontairement le passage d'un `case` à l'autre.

   :::indice
   Deux `case` qui se suivent sans instruction entre eux mènent au même code.
   :::

   :::solution
   ```js
   const numero = 0;

   switch (numero) {
     case 0: // dimanche
     case 6: // samedi
       console.log('Week-end');
       break;
     default:
       console.log('Semaine');
   }
   // Week-end
   ```
   :::

3. Réécris l'exercice 1 sans `switch`, avec une structure de données.

   :::indice
   Les numéros de 0 à 6 sont exactement les index d'un tableau de 7 éléments.
   :::

   :::solution
   ```js
   const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

   const numero = 9;
   const nom = JOURS[numero] ?? 'inconnu';
   console.log(nom); // inconnu
   ```

   Le code tient en deux lignes, et changer la langue ne demande que de modifier les
   données. Un index hors du tableau renvoie `undefined`, que `??` remplace.
   :::

## Questions d'entretien

- Que se passe-t-il si on oublie `break` dans un `switch` ?

  :::indice
  Où l'exécution s'arrête-t-elle quand un `case` correspond ?
  :::

  :::reponse
  L'exécution continue dans les `case` suivants, sans tester leur valeur, jusqu'au prochain
  `break` ou jusqu'à la fin du `switch`. C'est le *fall-through*. Oublié, il écrase un
  résultat ou déclenche une action en trop. Voulu, il permet de regrouper plusieurs valeurs
  sur le même traitement ; on le signale alors par un commentaire, et ESLint le vérifie avec
  la règle `no-fallthrough`.
  :::

- `switch` utilise-t-il `==` ou `===` ?

  :::indice
  Est-ce que `switch ('1')` entre dans `case 1` ?
  :::

  :::reponse
  `switch` compare avec l'égalité stricte, comme `===`. `switch ('1')` n'entre donc pas dans
  `case 1`. Quand la valeur vient d'un formulaire ou d'une URL, il faut la convertir avant le
  `switch` pour qu'elle corresponde aux `case` numériques.
  :::

- Quand préférer une table de correspondance à un `switch` ?

  :::indice
  Que font réellement les `case` dans la plupart des `switch` ?
  :::

  :::reponse
  Quand chaque `case` associe simplement une valeur à une autre : un code à un libellé, un
  statut à une couleur. Un objet ou une `Map` est alors plus court, ne peut pas oublier de
  `break`, se modifie sans toucher à la logique, et peut même venir d'un fichier de
  configuration. On garde `switch` quand les branches exécutent des traitements différents.
  :::
