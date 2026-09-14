---
id: javascript-variables
title: Variables et liaisons
slug: variables
technology: javascript
level: beginner
module: variables-et-valeurs
order: 1
estimatedMinutes: 20
difficulty: 1
xp: 60
prerequisites: []
skills:
  - variables
tags:
  - javascript
  - fundamentals
---

## Objectifs

- Distinguer une variable, une liaison et une valeur.
- Choisir entre `const` et `let` sans hésiter.
- Expliquer pourquoi `const` n'empêche pas de modifier un objet.

## Introduction

Une variable en JavaScript n'est pas une boîte qui contient une valeur. C'est un
**nom attaché à un emplacement mémoire** — ce que la spécification appelle une
*liaison* (*binding*). Cette nuance, qui paraît théorique, explique la moitié des
surprises du langage : la réaffectation, les closures, le comportement de `const`
sur les objets.

## Concept

Trois mots-clés créent des liaisons, et ils diffèrent sur deux axes seulement :

| Mot-clé | Portée | Réaffectable | Remontée utilisable |
| --- | --- | --- | --- |
| `const` | bloc | non | non (zone morte temporelle) |
| `let` | bloc | oui | non (zone morte temporelle) |
| `var` | fonction | oui | oui, avec la valeur `undefined` |

`const` gèle **la liaison**, pas la valeur. Le nom ne pourra plus pointer ailleurs ;
ce qu'il désigne reste modifiable si c'est un objet ou un tableau.

La règle pratique tient en une phrase : `const` par défaut, `let` quand la
réaffectation est réellement nécessaire, `var` jamais dans du code neuf.

## Exemple

```js
const utilisateur = { nom: 'Ada' };
utilisateur.nom = 'Grace'; // autorisé : on modifie l'objet
// utilisateur = {};       // TypeError : on réaffecterait la liaison

let compteur = 0;
compteur += 1; // autorisé

{
  const interne = 'visible ici seulement';
  console.log(interne); // 'visible ici seulement'
}
// console.log(interne); // ReferenceError : hors du bloc
```

## Comment ça fonctionne

À l'entrée d'un bloc, le moteur crée un *environnement lexical* et y enregistre les
liaisons `let` et `const` déclarées dans ce bloc — mais sans valeur. Elles existent
et sont pourtant inutilisables : c'est la **zone morte temporelle** (*temporal dead
zone*). Y accéder lève une `ReferenceError`, ce qui est bien plus utile que le
`undefined` silencieux de `var`.

```js
console.log(a); // undefined   → var existe déjà, sans valeur
console.log(b); // ReferenceError → b est dans la zone morte
var a = 1;
let b = 2;
```

La `ReferenceError` n'est pas une punition : c'est le moteur qui t'évite de lire une
variable avant qu'elle ne veuille dire quelque chose.

## Erreurs fréquentes

**Croire que `const` rend une valeur immuable.** Il gèle le nom, pas le contenu. Pour
figer un objet, il faut `Object.freeze()` — et encore, en surface uniquement.

**Utiliser `var` dans une boucle avec un callback.** Les trois callbacks partagent la
même liaison de fonction et affichent tous `3` :

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3, 3, 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0, 1, 2
```

Avec `let`, chaque itération reçoit sa propre liaison. C'est une règle spécifique aux
boucles, et elle explique à elle seule pourquoi `var` a disparu du code moderne.

## À retenir

- Une variable est un nom attaché à un emplacement, pas une boîte.
- `const` gèle la liaison, jamais la valeur pointée.
- `let` et `const` sont limités au bloc ; `var` à la fonction.
- La zone morte temporelle transforme une erreur silencieuse en erreur bruyante.

## Exercices

1. Écris un bloc où une même variable `total` existe en deux versions indépendantes,
   sans jamais réaffecter.

   :::indice
   Un bloc `{ }` ouvre une nouvelle portée pour `let` et `const`.
   :::

   :::indice
   Déclare `total` une fois dehors, puis une seconde fois dans le bloc : c'est une
   autre liaison, qui masque la première le temps du bloc.
   :::

   :::solution
   ```js
   const total = 10;
   {
     const total = 20; // une nouvelle liaison, propre au bloc
     console.log(total); // 20
   }
   console.log(total); // 10
   ```

   Aucune réaffectation : deux déclarations, donc deux liaisons distinctes.
   :::

2. Corrige une boucle `var` avec `setTimeout` sans utiliser `let`.

   :::indice
   Les trois rappels partagent le même `i`, qu'ils lisent une fois la boucle terminée.
   :::

   :::indice
   Une fonction qui reçoit `i` en argument crée, à chaque appel, son propre paramètre.
   :::

   :::solution
   ```js
   for (var i = 0; i < 3; i++) {
     (function (j) {
       setTimeout(function () {
         console.log(j);
       }, 0);
     })(i);
   }
   // 0, 1, 2
   ```

   Autre voie : `setTimeout(console.log, 0, i)` transmet la valeur de `i` au rappel au
   moment où la minuterie est programmée.
   :::

3. Explique en une phrase pourquoi `const config = {}` puis `config.debug = true`
   ne lève aucune erreur.

   :::indice
   Demande-toi ce que `const` protège : la liaison, ou la valeur qu'elle désigne ?
   :::

   :::solution
   `const` interdit de réaffecter la liaison `config`, pas de modifier l'objet qu'elle
   désigne : `config.debug = true` ajoute une propriété, et `config` pointe toujours
   vers le même objet.
   :::

## Questions d'entretien

- Quelle différence entre la remontée (*hoisting*) de `var` et celle de `let` ?

  :::indice
  Les deux sont remontées. Regarde ce qui se passe quand on les lit avant leur ligne
  de déclaration.
  :::

  :::reponse
  `var` est remontée et initialisée à `undefined` : la lire avant sa déclaration
  renvoie `undefined`. `let` et `const` sont remontées mais pas initialisées : jusqu'à
  leur déclaration, elles sont dans la zone morte temporelle, et y accéder lève une
  `ReferenceError`. `var` est limitée à la fonction, `let` et `const` au bloc.
  :::

- `const` rend-il un objet immuable ? Pourquoi cette question revient-elle si souvent ?

  :::indice
  Essaie de modifier une propriété d'un objet déclaré avec `const`.
  :::

  :::reponse
  Non. `const` empêche de réaffecter la liaison, pas de muter la valeur : les
  propriétés restent modifiables. Pour figer un objet, il faut `Object.freeze()`, et
  seulement en surface — les objets imbriqués restent modifiables. La question revient
  parce qu'elle sépare qui sait ce qu'est une liaison de qui a retenu « const, donc
  constant ».
  :::

- Pourquoi une boucle `let` produit-elle une liaison par itération alors qu'un bloc
  ordinaire n'en produit qu'une ?

  :::indice
  Pense à ce que capturent les fonctions créées dans le corps de la boucle.
  :::

  :::reponse
  Pour une boucle `for`, la spécification crée une nouvelle liaison `let` à chaque
  itération et y recopie la valeur de l'itération précédente. Chaque fonction créée
  dans le corps capture donc sa propre liaison. Un bloc ordinaire n'est exécuté qu'une
  fois : il ne crée qu'un environnement, donc qu'une liaison.
  :::
