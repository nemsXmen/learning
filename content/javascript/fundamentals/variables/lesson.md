---
id: javascript-variables
title: Variables et liaisons
slug: variables
technology: javascript
level: beginner
module: fundamentals
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

# Variables et liaisons

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
2. Corrige une boucle `var` avec `setTimeout` sans utiliser `let` (indice : une
   fonction qui capture son argument).
3. Explique en une phrase pourquoi `const config = {}` puis `config.debug = true`
   ne lève aucune erreur.

## Questions d'entretien

- Quelle différence entre la remontée (*hoisting*) de `var` et celle de `let` ?
- `const` rend-il un objet immuable ? Pourquoi cette question revient-elle si souvent ?
- Pourquoi une boucle `let` produit-elle une liaison par itération alors qu'un bloc
  ordinaire n'en produit qu'une ?
