---
id: javascript-functions
title: Fonctions
slug: functions
technology: javascript
level: beginner
module: fundamentals
order: 2
estimatedMinutes: 25
difficulty: 2
xp: 80
prerequisites:
  - javascript-variables
skills:
  - functions
tags:
  - javascript
  - fundamentals
---

# Fonctions

## Objectifs

- Distinguer déclaration, expression et fonction fléchée.
- Prévoir la valeur de `this` selon la forme choisie.
- Savoir quand une fonction fléchée est le mauvais outil.

## Introduction

En JavaScript une fonction est une valeur ordinaire : on peut la stocker, la passer
en argument, la renvoyer. C'est ce qui rend possibles les callbacks, les closures et
la programmation fonctionnelle. Mais trois syntaxes coexistent, et elles ne diffèrent
pas seulement par l'apparence.

## Concept

| Forme | Remontée | `this` | `arguments` |
| --- | --- | --- | --- |
| Déclaration `function f() {}` | complète | dynamique, dépend de l'appel | oui |
| Expression `const f = function () {}` | non | dynamique | oui |
| Fléchée `const f = () => {}` | non | lexical, hérité | non |

La ligne qui compte est celle de `this`. Une fonction classique reçoit son `this` **au
moment de l'appel** ; une fonction fléchée le capture **là où elle est écrite**, une
fois pour toutes.

## Exemple

```js
const compteur = {
  total: 0,

  incrementerClassique() {
    // `this` dépend de l'appel : ici, l'objet compteur
    this.total += 1;
  },

  incrementerRetarde() {
    // La fléchée hérite du `this` de incrementerRetarde : l'objet compteur
    setTimeout(() => {
      this.total += 1;
    }, 100);
  },
};
```

Écrire le `setTimeout` avec `function () { this.total += 1 }` casserait tout : `this`
y vaudrait l'objet global ou `undefined` en mode strict.

## Comment ça fonctionne

Une déclaration de fonction est entièrement remontée : le moteur l'enregistre, corps
compris, avant d'exécuter la moindre ligne. On peut donc l'appeler plus haut que sa
définition. Une expression de fonction suit la règle de la variable qui la porte :
avec `const`, elle reste dans la zone morte temporelle jusqu'à son affectation.

```js
direBonjour();           // fonctionne : déclaration remontée
function direBonjour() {}

direAurevoir();          // ReferenceError : const dans la zone morte
const direAurevoir = () => {};
```

Les paramètres suivent leurs propres règles : une valeur par défaut n'est évaluée
qu'au moment où l'argument est absent, et elle peut dépendre des paramètres
précédents.

```js
function creer(nom, id = nom.toLowerCase()) {
  return { nom, id };
}
creer('Ada'); // { nom: 'Ada', id: 'ada' }
```

## Erreurs fréquentes

**Utiliser une fléchée comme méthode d'objet.** Elle capture le `this` du module, pas
celui de l'objet :

```js
const mauvais = {
  total: 0,
  incrementer: () => {
    this.total += 1; // `this` n'est pas `mauvais`
  },
};
```

**Croire qu'une fléchée est juste une syntaxe plus courte.** Elle n'a ni `this`, ni
`arguments`, ni `prototype` — donc pas de `new`, pas de méthode d'objet, pas de
fonction constructeur.

**Compter sur la remontée d'une expression.** Seule la déclaration `function` est
utilisable avant sa ligne.

## À retenir

- Une fonction est une valeur : elle se passe, se stocke, se renvoie.
- La déclaration est remontée avec son corps ; l'expression suit sa variable.
- `this` classique dépend de l'appel ; `this` fléché dépend de l'écriture.
- La fléchée est idéale en callback, inadaptée en méthode.

## Exercices

1. Réécris une méthode d'objet cassée par une fléchée pour qu'elle fonctionne.
2. Écris une fonction dont le second paramètre a une valeur par défaut calculée à
   partir du premier.
3. Montre par un exemple qu'une déclaration est appelable avant sa définition, mais
   pas une expression.

## Questions d'entretien

- Quelle est la différence de `this` entre une fonction fléchée et une fonction
  classique, et quand cette différence devient-elle un bug ?
- Pourquoi ne peut-on pas utiliser `new` avec une fonction fléchée ?
- Dans quel ordre le moteur enregistre-t-il les déclarations de fonctions et les
  déclarations `var` ?
