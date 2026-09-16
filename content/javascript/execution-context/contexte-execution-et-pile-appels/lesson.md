---
id: javascript-contexte-execution
title: "Contexte d'exécution et pile d'appels"
slug: contexte-execution-et-pile-appels
technology: javascript
level: intermediate
module: execution-context
order: 1
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-portees
skills:
  - execution-context
tags:
  - javascript
  - runtime
---

## Objectifs

- Décrire ce qu'est un contexte d'exécution et ce qu'il contient.
- Suivre l'empilement et le dépilement des contextes dans la pile d'appels.
- Lire une trace d'erreur et reconnaître un débordement de pile.

## Introduction

Jusqu'ici, le code a été lu comme un texte : des portées imbriquées, des noms visibles ou
non. Le moteur, lui, ne lit pas un texte : il **empile des contextes**. Chaque appel de
fonction crée une petite structure qui sait quelles variables existent, quel est son `this`
et où revenir une fois terminée. Comprendre cette structure explique d'un coup la trace
d'une erreur, l'ordre des `console.log`, et le fameux `Maximum call stack size exceeded`.

## Concept

Un **contexte d'exécution** est l'ensemble des informations dont le moteur a besoin pour
exécuter un morceau de code. Il en existe trois sortes :

| Contexte | Créé quand | Détruit quand |
| --- | --- | --- |
| Global | le script ou le module démarre | le programme se termine |
| De fonction | une fonction est appelée | la fonction retourne |
| `eval` | `eval()` est appelé | l'évaluation se termine |

Chaque contexte contient trois choses :

1. Un **environnement lexical** : les noms déclarés ici, plus un lien vers le contexte
   englobant lexicalement — c'est la chaîne de portée, vue au module 12.
2. Un **environnement de variables** : la partie réservée aux déclarations `var`.
3. Une valeur de **`this`**, déterminée par la manière dont la fonction a été appelée.

Ces contextes sont rangés dans une **pile d'appels** : le dernier créé est le premier
retiré. Le moteur n'exécute jamais que le contexte au sommet. Un seul thread, une seule
pile : c'est ce qui fait que JavaScript ne fait qu'une chose à la fois.

## Exemple

```js
function troisieme() {
  console.log('sommet de la pile');
  return 3;
}

function deuxieme() {
  return troisieme() + 2;
}

function premiere() {
  return deuxieme() + 1;
}

console.log(premiere()); // 'sommet de la pile' puis 6
```

Au moment où `troisieme` s'exécute, la pile contient, de bas en haut :

```text
troisieme        <- en cours d'exécution
deuxieme
premiere
global
```

Chaque `return` retire le contexte du sommet et rend la main à celui d'en dessous. Quand
`premiere` retourne, la pile ne contient plus que le contexte global.

```js
function niveau(n) {
  if (n === 0) throw new Error('arrivé au fond');
  return niveau(n - 1);
}

try {
  niveau(3);
} catch (erreur) {
  console.log(erreur.message); // 'arrivé au fond'
  // erreur.stack liste : niveau, niveau, niveau, niveau, puis l'appelant
}
```

## Comment ça fonctionne

Au démarrage, le moteur crée le contexte global et le place au bas de la pile. Dans un
navigateur, son `this` vaut `window` ; dans un module ES, il vaut `undefined`. Puis il
exécute les instructions.

Chaque fois qu'un appel de fonction est rencontré, un nouveau contexte est **empilé** :
ses paramètres sont liés aux arguments reçus, ses déclarations enregistrées, son `this`
fixé. L'exécution de l'appelant est suspendue exactement à cette ligne. Quand la fonction
atteint un `return` — ou sa dernière ligne, ce qui revient à `return undefined` —, son
contexte est **dépilé** : ses variables locales deviennent inaccessibles et l'appelant
reprend là où il s'était arrêté. La valeur renvoyée est le seul lien qui subsiste — sauf si
une fonction interne a été renvoyée, auquel cas son environnement survit : c'est la closure.

La propriété `stack` d'une erreur est une photographie de la pile au moment où l'erreur a
été créée. Elle se lit de haut en bas : la ligne du haut est la fonction qui a échoué, les
suivantes sont ses appelants. C'est la première chose à regarder devant une erreur, avant
même le message.

La pile a une taille limitée, de l'ordre de quelques milliers de contextes selon le moteur.
Une récursion sans condition d'arrêt l'épuise et lève `RangeError: Maximum call stack size
exceeded`. Ce n'est pas une fuite de mémoire : c'est simplement trop d'appels imbriqués en
même temps.

```js
function sansFin() {
  return sansFin();
}
// sansFin(); // RangeError: Maximum call stack size exceeded
```

Enfin, la pile explique pourquoi une fonction longue **bloque** la page : tant que son
contexte est au sommet, rien d'autre ne s'exécute, ni un clic, ni un rendu. Les tâches
asynchrones ne s'exécutent que lorsque la pile est vide — c'est le sujet de la partie
consacrée à l'event loop.

## Erreurs fréquentes

**Confondre pile d'appels et chaîne de portée.** La pile dit **qui a appelé qui** et change
à chaque exécution ; la chaîne de portée dit **où le code est écrit** et ne change jamais.
Une fonction ne voit pas les variables de son appelant, même s'il est juste en dessous
d'elle dans la pile.

**Lire une trace d'erreur à l'envers.** La ligne du haut est la plus proche du problème ;
celles du bas ne sont que le chemin qui y a mené.

**Oublier la condition d'arrêt d'une récursion.** Toute fonction récursive doit avoir un cas
de base atteint avec certitude, sinon la pile déborde.

**Croire qu'une fonction asynchrone s'exécute « en parallèle ».** Elle attend que la pile
soit vide. Une boucle de calcul de dix secondes gèle tout le reste.

**Compter sur les variables locales après le retour.** Le contexte est dépilé : ce qui n'a
pas été renvoyé, ou capturé par une closure, disparaît.

## À retenir

- Un contexte d'exécution contient un environnement lexical, un environnement de variables
  et un `this`.
- Chaque appel empile un contexte ; chaque `return` le dépile.
- Le moteur n'exécute que le contexte au sommet : un seul thread, une seule pile.
- La propriété `stack` d'une erreur se lit de haut en bas.
- Une récursion sans cas de base lève `RangeError: Maximum call stack size exceeded`.

## Exercices

1. Donne l'ordre exact des affichages de ce code, et décris la pile au moment où
   `console.log('c')` s'exécute.

   ```js
   function c() {
     console.log('c');
   }
   function b() {
     console.log('b avant');
     c();
     console.log('b après');
   }
   function a() {
     console.log('a avant');
     b();
     console.log('a après');
   }
   a();
   ```

   :::indice
   Un appel suspend l'appelant à la ligne exacte où il se trouve.
   :::

   :::solution
   L'ordre est : `a avant`, `b avant`, `c`, `b après`, `a après`.

   Au moment de `console.log('c')`, la pile contient, de bas en haut : global, `a`, `b`,
   `c`. Chaque appelant est suspendu sur sa ligne d'appel et ne reprend qu'une fois le
   contexte supérieur dépilé.
   :::

2. Cette fonction déborde la pile. Corrige-la pour qu'elle calcule la somme des entiers de
   `n` à 1.

   ```js
   function somme(n) {
     return n + somme(n - 1);
   }
   ```

   :::indice
   Il manque le cas où la récursion doit s'arrêter.
   :::

   :::indice
   Que doit renvoyer `somme(0)` pour que l'addition reste juste ?
   :::

   :::solution
   ```js
   function somme(n) {
     if (n <= 0) return 0;
     return n + somme(n - 1);
   }

   console.log(somme(4)); // 10
   ```

   Sans le cas de base, `somme` s'appelle avec `-1`, `-2`, et ainsi de suite : chaque appel
   empile un contexte jusqu'à `RangeError`. Pour de très grands `n`, une boucle évite le
   problème entièrement, puisqu'elle n'empile rien.
   :::

3. Écris une fonction `profondeurMax()` qui mesure combien d'appels imbriqués la pile
   supporte dans ton environnement, sans faire planter le programme.

   :::indice
   Une récursion qui compte, et un `try` / `catch` autour du premier appel.
   :::

   :::indice
   L'erreur attendue est une `RangeError` : attrape-la au niveau de l'appel initial.
   :::

   :::solution
   ```js
   function profondeurMax() {
     let profondeur = 0;

     function descendre() {
       profondeur += 1;
       descendre();
     }

     try {
       descendre();
     } catch (erreur) {
       // RangeError : la pile est pleine
     }

     return profondeur;
   }

   console.log(profondeurMax()); // par exemple 11034 — dépend du moteur
   ```

   Le nombre varie d'un moteur à l'autre et d'une exécution à l'autre : il dépend de la
   taille de la pile et de la place que prend chaque contexte. C'est pourquoi aucun code de
   production ne doit s'appuyer sur une profondeur précise.
   :::

## Questions d'entretien

- Qu'est-ce que la pile d'appels, et pourquoi n'y en a-t-il qu'une ?

  :::indice
  Combien de choses JavaScript peut-il exécuter à un instant donné ?
  :::

  :::reponse
  C'est la structure qui empile les contextes d'exécution : chaque appel en ajoute un au
  sommet, chaque retour le retire. Le moteur n'exécute que le contexte du sommet. Il n'y en a
  qu'une parce que JavaScript s'exécute sur un seul thread : à un instant donné, une seule
  fonction est en cours. C'est ce qui rend le modèle simple à raisonner — pas de verrou, pas
  de condition de course sur les variables — et ce qui impose que tout travail long soit
  découpé ou déporté, faute de quoi il bloque l'interface.
  :::

- Quelle différence entre la pile d'appels et la chaîne de portée ?

  :::indice
  L'une dépend de l'exécution, l'autre de l'écriture.
  :::

  :::reponse
  La pile décrit l'**exécution** : qui a appelé qui, et dans quel ordre les contextes seront
  dépilés. Elle change à chaque exécution du programme. La chaîne de portée décrit
  l'**écriture** : quels environnements une fonction peut consulter pour résoudre un nom,
  déterminé une fois pour toutes par l'endroit où elle est définie. Une fonction peut donc être
  au sommet de la pile juste au-dessus de son appelant sans voir aucune de ses variables
  locales.
  :::

- Que signifie `Maximum call stack size exceeded`, et comment le corriger ?

  :::indice
  Quelle ressource est épuisée, et par quoi ?
  :::

  :::reponse
  La pile a atteint sa taille limite : trop de contextes sont empilés simultanément. Dans la
  quasi-totalité des cas, la cause est une récursion sans cas de base, ou dont le cas de base
  n'est jamais atteint — un décrément qui saute la valeur d'arrêt, par exemple. Plus rarement,
  c'est une récursion correcte mais trop profonde pour le volume de données. On corrige en
  ajoutant ou en réparant le cas de base, puis, si la profondeur reste un problème, en
  réécrivant l'algorithme sous forme de boucle avec une pile explicite, ce qui n'empile plus
  de contextes.
  :::
