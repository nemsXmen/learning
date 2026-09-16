---
id: javascript-fonctions-flechees
title: "Expressions de fonction et fonctions fléchées"
slug: expressions-et-fonctions-flechees
technology: javascript
level: intermediate
module: fonctions-avancees
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-functions
skills:
  - arrow-functions
tags:
  - javascript
  - fonctions
---

## Objectifs

- Écrire une fonction sous forme d'expression, nommée ou anonyme.
- Utiliser les fonctions fléchées et leur retour implicite.
- Choisir entre déclaration, expression et fléchée en connaissant ce que chacune apporte.

## Introduction

Jusqu'ici, une fonction se déclarait avec `function`. Mais une fonction est une **valeur** :
on peut la ranger dans une variable, la passer en argument, la renvoyer. Les fonctions
fléchées, arrivées avec ES2015, rendent cette écriture assez courte pour tenir dans un
appel à `map` — et c'est la forme que l'on croise le plus souvent dans le code moderne.

## Concept

| Forme | Écriture | Hoistée | `this` propre |
| --- | --- | --- | --- |
| Déclaration | `function double(n) { return n * 2; }` | oui | oui |
| Expression anonyme | `const double = function (n) { return n * 2; };` | non | oui |
| Expression nommée | `const double = function calcul(n) { … };` | non | oui |
| Fléchée | `const double = (n) => n * 2;` | non | non, hérité |

Les formes d'une fonction fléchée, de la plus complète à la plus courte :

```js
const double = (n) => { return n * 2; }; // corps en bloc, return explicite
const double2 = (n) => n * 2;            // retour implicite
const somme = (a, b) => a + b;           // plusieurs paramètres
const zero = () => 0;                    // aucun paramètre
const point = () => ({ x: 0, y: 0 });    // objet : parenthèses obligatoires
```

## Exemple

```js
function doubleDeclare(n) {
  return n * 2;
}

const doubleExpression = function (n) {
  return n * 2;
};

const doubleFleche = (n) => n * 2;

console.log(doubleDeclare(4), doubleExpression(4), doubleFleche(4)); // 8 8 8

const nombres = [1, 2, 3];
console.log(nombres.map((n) => n * 2)); // [2, 4, 6]
console.log(nombres.filter((n) => n % 2 === 1)); // [1, 3]

const versObjet = (nom) => ({ nom, cree: true });
console.log(versObjet('Ada')); // { nom: 'Ada', cree: true }

const sansParentheses = (nom) => { nom, cree: true };
console.log(sansParentheses('Ada')); // undefined : le corps est un bloc, pas un objet

console.log(avantDeclaration()); // 'ok' : la déclaration est hoistée
function avantDeclaration() {
  return 'ok';
}
```

## Comment ça fonctionne

Une **déclaration** de fonction est hoistée entièrement : le moteur la connaît avant
d'exécuter la ligne, donc on peut l'appeler plus haut dans le fichier. Une **expression**
suit les règles de la variable qui la reçoit : avec `const` ou `let`, l'appeler avant sa
ligne lève une `ReferenceError` — la zone morte temporelle.

Une **fonction fléchée** est plus qu'une syntaxe courte : elle n'a pas de `this` propre, pas
d'objet `arguments`, pas de `prototype`, et ne peut pas être appelée avec `new`. Elle
emprunte le `this` de l'endroit où elle est écrite, ce qui est exactement ce qu'on veut dans
un callback, et exactement ce qu'on ne veut pas pour une méthode d'objet qui doit parler de
son objet. Le détail de `this` est traité dans la partie Runtime ; retiens pour l'instant
que la fléchée ne s'en attribue pas.

Le **retour implicite** ne fonctionne que sans accolades : `(n) => n * 2` renvoie, alors que
`(n) => { n * 2; }` exécute un bloc et renvoie `undefined`. Pour renvoyer un objet littéral,
il faut des parenthèses, sinon l'accolade est lue comme un bloc : `() => ({ x: 0 })`.

Les fonctions gardent un nom même anonymes : `const double = () => {}` donne à la fonction
le nom `double`, ce qui rend les piles d'appel lisibles. Une expression nommée,
`const f = function calcul() {}`, permet en plus à la fonction de s'appeler elle-même par
son nom interne.

## Erreurs fréquentes

**Oublier les parenthèses autour d'un objet renvoyé.** `() => { x: 1 }` renvoie `undefined`.

**Appeler une expression avant sa définition.** `ReferenceError` : contrairement à une
déclaration, elle n'est pas hoistée.

**Utiliser une fléchée comme méthode qui a besoin de `this`.** Elle hérite du `this`
extérieur et ne parle pas de son objet.

**Ajouter des accolades en gardant le retour implicite en tête.** Dès qu'il y a un bloc, il
faut écrire `return`.

## À retenir

- Une fonction est une valeur : elle se range dans une variable, se passe, se renvoie.
- Déclaration : hoistée. Expression : soumise à la zone morte temporelle.
- Fléchée : courte, retour implicite sans accolades, pas de `this` ni de `new`.
- Objet renvoyé par une fléchée : parenthèses obligatoires.
- Pour un callback, la fléchée est le choix par défaut.

## Exercices

1. Réécris ces trois fonctions en fléchées les plus concises possibles.

   ```js
   function carre(n) { return n * n; }
   function somme(a, b) { return a + b; }
   function saluer() { return 'Bonjour'; }
   ```

   :::indice
   Sans accolades, le corps d'une fléchée est directement la valeur renvoyée. Un paramètre
   unique peut se passer de parenthèses, mais la convention est de les garder.
   :::

   :::solution
   ```js
   const carre = (n) => n * n;
   const somme = (a, b) => a + b;
   const saluer = () => 'Bonjour';

   console.log(carre(4), somme(2, 3), saluer()); // 16 5 'Bonjour'
   ```
   :::

2. Écris en une seule ligne une fonction `enPoint(x, y)` qui renvoie `{ x, y }`.

   :::indice
   Une accolade en début de corps est lue comme un bloc : il faut lever l'ambiguïté.
   :::

   :::solution
   ```js
   const enPoint = (x, y) => ({ x, y });

   console.log(enPoint(1, 2)); // { x: 1, y: 2 }
   console.log(((x, y) => { x, y })(1, 2)); // undefined : sans parenthèses, c'est un bloc
   ```
   :::

3. Explique pourquoi le premier appel échoue et pas le second.

   ```js
   console.log(aire(2)); // ?
   console.log(perimetre(2)); // ?
   const aire = (c) => c * c;
   function perimetre(c) { return c * 4; }
   ```

   :::indice
   Les deux formes ne sont pas connues du moteur au même moment.
   :::

   :::solution
   `aire` est une expression affectée à un `const` : la liaison existe mais reste dans la zone
   morte temporelle jusqu'à sa ligne, donc l'appel lève
   `ReferenceError: Cannot access 'aire' before initialization`. `perimetre` est une
   déclaration : elle est hoistée complètement et peut être appelée avant sa ligne.

   ```js
   console.log(perimetre(2)); // 8
   const aire = (c) => c * c;
   console.log(aire(2)); // 4, une fois la ligne exécutée
   function perimetre(c) { return c * 4; }
   ```

   En pratique, on déclare avant d'utiliser : compter sur le hoisting rend la lecture plus
   difficile.
   :::

## Questions d'entretien

- Quelle différence entre une déclaration et une expression de fonction ?

  :::indice
  Essaie d'appeler chacune avant sa ligne.
  :::

  :::reponse
  Une déclaration, `function f() {}`, est hoistée entièrement : elle est utilisable avant sa
  ligne dans la même portée. Une expression, `const f = function () {}` ou une fléchée, suit
  la variable qui la reçoit : avec `const` ou `let`, l'appeler avant lève une `ReferenceError`.
  L'expression a l'avantage d'être une valeur ordinaire, qu'on peut passer, renvoyer ou
  définir conditionnellement.
  :::

- Que perd-on en utilisant une fonction fléchée ?

  :::indice
  Trois choses qu'une fonction classique possède et qu'une fléchée n'a pas.
  :::

  :::reponse
  Une fléchée n'a pas de `this` propre — elle emprunte celui de son environnement d'écriture
  —, pas d'objet `arguments`, et pas de `prototype` : elle ne peut pas être utilisée avec
  `new`. Ces absences sont un avantage dans un callback, où l'on veut justement garder le
  `this` extérieur, et un défaut pour une méthode d'objet ou un constructeur, qui ont besoin
  du leur.
  :::

- Pourquoi `() => { nom: 'Ada' }` ne renvoie-t-il pas d'objet ?

  :::indice
  Comment le moteur lit-il une accolade juste après la flèche ?
  :::

  :::reponse
  Après la flèche, une accolade ouvre un **corps de fonction**, pas un objet littéral. Le
  contenu est alors lu comme des instructions : `nom:` devient une étiquette et `'Ada'` une
  expression sans effet. Le corps ne contient aucun `return`, donc la fonction renvoie
  `undefined`. Il faut entourer l'objet de parenthèses : `() => ({ nom: 'Ada' })`.
  :::
