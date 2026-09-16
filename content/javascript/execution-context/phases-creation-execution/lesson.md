---
id: javascript-phases-execution
title: "Les deux phases : création et exécution"
slug: phases-creation-execution
technology: javascript
level: intermediate
module: execution-context
order: 2
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-contexte-execution
  - javascript-hoisting
skills:
  - execution-phases
tags:
  - javascript
  - runtime
---

## Objectifs

- Décrire ce que le moteur prépare dans un contexte avant d'en exécuter la première ligne.
- Prédire l'état exact des paramètres, des variables et des fonctions à l'entrée d'une
  fonction.
- Résoudre les conflits de noms entre paramètre, `var` et déclaration de fonction.

## Introduction

Le chapitre précédent a montré qu'un appel empile un contexte d'exécution. Ce contexte ne
naît pas prêt à l'emploi : le moteur le **construit** d'abord, puis l'**exécute**. Le
hoisting, vu au module Portée, n'est que la partie visible de cette construction. Ici, on
regarde la construction en entier — ce qui permet de prédire des comportements qui
semblent arbitraires tant qu'on ne connaît pas l'ordre des opérations.

## Concept

Tout contexte — global ou de fonction — passe par deux phases.

**Phase de création**, avant la première instruction :

| Étape | Effet |
| --- | --- |
| 1. Environnement | un nouvel environnement est créé, relié à l'environnement extérieur |
| 2. Paramètres | chaque paramètre reçoit l'argument correspondant, ou `undefined` |
| 3. Déclarations de fonction | chaque nom est lié à la fonction complète |
| 4. `var` | chaque nom **non encore lié** reçoit `undefined` |
| 5. `let`, `const`, `class` | chaque nom est enregistré **sans valeur** (zone morte) |
| 6. `this` | la valeur est fixée selon la manière dont la fonction est appelée |

**Phase d'exécution** : les instructions s'exécutent ligne à ligne, les affectations
remplacent les valeurs préparées, les appels créent de nouveaux contextes.

## Exemple

```js
function commander(produit) {
  // Entrée dans la fonction : la phase de création est déjà terminée.
  console.log(produit); // 'clavier' : paramètre lié à l'argument
  console.log(typeof calculer); // 'function' : déclaration liée avec son corps
  console.log(remise); // undefined : var enregistrée sans valeur utile
  // console.log(total); // ReferenceError : let en zone morte

  var remise = 0.1;
  let total = calculer(100, remise);
  console.log(total); // 90

  function calculer(prix, taux) {
    return prix * (1 - taux);
  }
}

commander('clavier');

function conflit() {
  console.log(typeof valeur); // 'function' : la fonction a été liée en premier
  var valeur = 42;
  function valeur() {}
  console.log(typeof valeur); // 'number' : l'affectation a remplacé la fonction
}
conflit();
```

## Comment ça fonctionne

L'ordre de la phase de création explique les cas qui surprennent. Les **paramètres** sont
liés en premier, puis les **déclarations de fonction**, puis les **`var`**. Une `var` ne
réinitialise jamais un nom déjà lié : dans `function f(a) { var a; }`, le `var a` ne fait
rien, et `a` garde l'argument reçu. Une déclaration de fonction, elle, **remplace** un
paramètre ou une `var` du même nom au moment de la création — mais une affectation
ultérieure, pendant l'exécution, la remplacera à son tour. C'est ce que montre la fonction
`conflit` de l'exemple.

`let`, `const` et `class` sont bien enregistrés pendant la création : dire qu'ils « ne sont
pas hoistés » est inexact. Ils sont enregistrés **sans valeur**, et c'est cet état qui
produit la zone morte temporelle. La différence avec `var` n'est pas l'existence de la
liaison, mais son initialisation.

La valeur de `this` est fixée à la création, à partir de **l'appel** : méthode, fonction
seule, `new`, `call`. Le module suivant y est consacré. Une fonction fléchée fait exception :
elle ne reçoit pas de `this` propre et n'a pas d'objet `arguments`.

Le contexte **global** suit les mêmes étapes, avec une particularité dans un script
classique : les `var` et les déclarations de fonction du niveau supérieur deviennent des
propriétés de l'objet global (`window` dans un navigateur), alors que `let` et `const` n'en
deviennent pas. Dans un module ES, rien ne devient propriété globale.

Enfin, il faut distinguer **définir** une fonction et l'**appeler**. Écrire la fonction crée
un objet fonction, une seule fois. Chaque appel déclenche une nouvelle phase de création,
avec des liaisons neuves : deux appels ne partagent rien, sauf ce qu'ils lisent dans les
environnements extérieurs.

## Erreurs fréquentes

**Croire que le moteur déplace le code.** Rien ne bouge : il enregistre les déclarations
avant d'exécuter.

**Dire que `let` n'est pas hoisté.** Il est enregistré, sans valeur ; d'où la zone morte.

**Donner le même nom à une `var` et à une fonction.** L'état dépend de la ligne où l'on se
trouve : renomme l'une des deux.

**Attendre qu'un `var` réinitialise un paramètre.** Il ne fait rien si le nom est déjà lié.

**Confondre définition et appel.** La création du contexte a lieu à chaque appel, pas à la
définition.

## À retenir

- Chaque contexte est d'abord créé, puis exécuté.
- Création : environnement, paramètres, fonctions, `var` à `undefined`, `let`/`const` en
  zone morte, `this`.
- Une `var` ne réinitialise pas un nom déjà lié ; une déclaration de fonction le remplace.
- `let` et `const` sont enregistrés, mais pas initialisés.
- Chaque appel reprend une phase de création complète, avec des liaisons neuves.

## Exercices

1. Donne la valeur de chaque `console.log` à l'entrée de la fonction, en justifiant par la
   phase de création.

   ```js
   function inscrire(nom) {
     console.log(nom);
     console.log(role);
     console.log(typeof valider);
     var role = 'membre';
     function valider() { return true; }
   }
   inscrire('Ada');
   ```

   :::indice
   Suis l'ordre : paramètres, déclarations de fonction, puis `var`.
   :::

   :::solution
   - `nom` affiche `'Ada'` : les paramètres sont liés aux arguments en premier.
   - `role` affiche `undefined` : la `var` est enregistrée avec cette valeur, l'affectation
     n'a lieu qu'à sa ligne.
   - `typeof valider` affiche `'function'` : la déclaration est liée avec son corps pendant
     la création.
   :::

2. Prédis les deux affichages, puis explique-les.

   ```js
   function test() {
     console.log(typeof x);
     var x = 'texte';
     function x() {}
     console.log(typeof x);
   }
   test();
   ```

   :::indice
   Pendant la création, qui l'emporte entre la déclaration de fonction et la `var` ? Et
   pendant l'exécution ?
   :::

   :::solution
   Le premier affiche `'function'` : à la création, la déclaration de fonction lie `x` à la
   fonction, et la `var x` ne réinitialise pas un nom déjà lié. Le second affiche
   `'string'` : pendant l'exécution, l'affectation `x = 'texte'` remplace la fonction. La
   ligne `function x() {}` ne fait rien à l'exécution, son travail a été fait à la création.
   :::

3. Que renvoie `f(5)` ? Explique pourquoi la `var` ne change rien.

   ```js
   function f(n) {
     var n;
     return n;
   }
   ```

   :::indice
   Une `var` réinitialise-t-elle un nom déjà lié ?
   :::

   :::solution
   `f(5)` renvoie `5`. Le paramètre `n` est lié à 5 dès le début de la création ; la
   déclaration `var n` trouve un nom déjà lié et ne le touche pas. Il n'y a pas d'affectation,
   donc rien ne change à l'exécution. Avec `var n = 0`, en revanche, l'affectation
   s'appliquerait et la fonction renverrait 0.
   :::

## Questions d'entretien

- Que fait le moteur pendant la phase de création d'un contexte ?

  :::indice
  Pense à l'environnement, aux différentes déclarations, et à `this`.
  :::

  :::reponse
  Il crée un environnement relié à l'environnement extérieur, lie les paramètres aux
  arguments, lie les déclarations de fonction avec leur corps, enregistre les `var` avec
  `undefined` si le nom n'est pas déjà pris, enregistre `let`, `const` et `class` sans valeur
  — d'où la zone morte —, et fixe `this` selon la forme de l'appel. Aucune instruction n'est
  exécutée : c'est la phase suivante qui déroule le code et effectue les affectations.
  :::

- `let` et `const` sont-ils hoistés ?

  :::indice
  La liaison existe-t-elle avant la ligne de déclaration ?
  :::

  :::reponse
  Oui, au sens où leurs liaisons sont créées pendant la phase de création, comme celles de
  `var`. La différence est qu'elles ne sont pas **initialisées** : toute lecture avant la ligne
  de déclaration lève une `ReferenceError`. La preuve est le masquage : un `let x` dans une
  fonction empêche de lire un `x` extérieur dès le début de la fonction, ce qui ne serait pas
  le cas si la liaison n'existait pas encore.
  :::

- Quelle différence entre définir une fonction et l'appeler, du point de vue du moteur ?

  :::indice
  Qu'est-ce qui est créé une seule fois, et qu'est-ce qui est créé à chaque fois ?
  :::

  :::reponse
  Définir une fonction crée un **objet fonction**, une seule fois, qui mémorise
  l'environnement où il a été défini. L'appeler crée un **contexte d'exécution** neuf, avec sa
  propre phase de création : nouvelles liaisons pour les paramètres et les variables locales,
  nouvelle valeur de `this`. Deux appels de la même fonction ne partagent donc aucune variable
  locale, seulement ce qu'ils lisent dans les environnements extérieurs.
  :::
