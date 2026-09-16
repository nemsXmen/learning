---
id: javascript-async-await
title: "async et await : lire l'asynchrone comme du synchrone"
slug: async-et-await
technology: javascript
level: intermediate
module: async-await
order: 1
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-then-catch
skills:
  - async-await
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Écrire une fonction `async` et comprendre qu'elle renvoie toujours une promesse.
- Utiliser `await` pour attendre une promesse sans bloquer le programme.
- Réécrire une chaîne de `then` en code linéaire, et savoir ce qui se passe sous le capot.

## Introduction

Les promesses ont remplacé l'imbrication par des chaînes, mais une chaîne reste une suite de
callbacks : une variable obtenue à la première étape n'est pas visible à la troisième sans
contorsion. `async` et `await`, arrivés avec ES2017, permettent d'écrire le même enchaînement
ligne après ligne, avec des variables ordinaires et des `if` ordinaires. Ce n'est pas un nouveau
mécanisme : c'est une écriture des promesses.

## Concept

| Écriture | Effet |
| --- | --- |
| `async function f() {}` | `f` renvoie **toujours** une promesse |
| `return valeur` dans `f` | la promesse renvoyée est tenue avec `valeur` |
| `throw erreur` dans `f` | la promesse renvoyée est rompue avec `erreur` |
| `await promesse` | suspend **la fonction** jusqu'au règlement, puis donne la valeur ou lève l'erreur |
| `await valeur` | une valeur ordinaire est traitée comme une promesse déjà tenue |

`await` n'est utilisable que dans une fonction `async`, ou au niveau supérieur d'un module ES.
Les fonctions fléchées et les méthodes peuvent aussi être `async`.

## Exemple

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));
const trouverClient = (id) => attendre(10, { id, nom: 'Ada' });
const trouverCommandes = (client) => attendre(10, [{ total: 30 }, { total: 12 }]);

// Avec then : la variable client n'est plus visible à la dernière étape.
function resumeAvecThen(id) {
  return trouverClient(id)
    .then((client) => trouverCommandes(client).then((commandes) => ({ client, commandes })))
    .then(({ client, commandes }) => `${client.nom} : ${commandes.length} commandes`);
}

// Avec async / await : une lecture linéaire, des variables ordinaires.
async function resume(id) {
  const client = await trouverClient(id);
  const commandes = await trouverCommandes(client);
  return `${client.nom} : ${commandes.length} commandes`;
}

console.log(resume(1) instanceof Promise); // true : une fonction async renvoie une promesse
console.log(await resume(1)); // 'Ada : 2 commandes' (await au niveau supérieur d'un module)
console.log(await resumeAvecThen(1)); // 'Ada : 2 commandes'

async function demonstration() {
  console.log('B : début de la fonction');
  await null;
  console.log('D : reprise après await');
}
console.log('A');
demonstration();
console.log('C : le programme continue pendant la suspension');
```

## Comment ça fonctionne

Une fonction `async` enveloppe son résultat dans une promesse : `return x` équivaut à tenir la
promesse avec `x`, et une exception non rattrapée la rompt. L'appelant reçoit donc toujours une
promesse, même si la fonction ne contient aucun `await`.

Quand l'exécution atteint `await p`, la fonction est **suspendue** : son contexte d'exécution est
mis de côté, et elle rend la main à son appelant, qui continue immédiatement — d'où l'affichage de
`C` avant `D`. Quand `p` se règle, la **reprise** de la fonction est programmée en microtâche.
Rien n'est bloqué : pendant l'attente, la boucle d'événements traite les autres callbacks. `await`
suspend une fonction, jamais le programme.

Sous le capot, chaque `await` correspond à un `then` : la suite de la fonction joue le rôle du
callback. Les règles des promesses s'appliquent donc à l'identique — reprise en microtâche, valeur
tenue renvoyée par `await`, rupture levée comme exception. Même `await 42` provoque une suspension :
la valeur est enveloppée dans une promesse tenue, et la suite attend une microtâche.

Le gain de lisibilité est réel : les variables des étapes précédentes restent visibles, les
conditions et les boucles s'écrivent normalement, et la pile d'appels d'une erreur ressemble à
celle d'un code synchrone. Le coût est une tentation : écrire des `await` les uns après les autres
même quand les opérations sont indépendantes, ce qui les rend séquentielles sans raison. Le
chapitre 3 de ce module y est consacré.

Au niveau supérieur d'un **module ES**, `await` est autorisé directement. Le chargement du module
attend alors la promesse, ainsi que celui des modules qui l'importent : à réserver à
l'initialisation, comme la lecture d'une configuration.

## Erreurs fréquentes

**Oublier `await`.** La variable contient une promesse, pas la valeur : `client.nom` vaut
`undefined`.

**Croire qu'une fonction `async` renvoie directement sa valeur.** Elle renvoie une promesse.

**Utiliser `await` dans une fonction qui n'est pas `async`.** C'est une erreur de syntaxe.

**Enchaîner des `await` pour des opérations indépendantes.** Elles s'exécutent l'une après l'autre.

**Penser que `await` bloque le programme.** Seule la fonction est suspendue.

## À retenir

- Une fonction `async` renvoie toujours une promesse.
- `await` suspend la fonction jusqu'au règlement, puis donne la valeur ou lève l'erreur.
- La reprise se fait en microtâche ; le reste du programme continue pendant l'attente.
- `async` / `await` est une écriture des promesses, avec les mêmes règles.
- `await` au niveau supérieur n'existe que dans les modules ES.

## Exercices

1. Réécris cette fonction avec `async` et `await`, sans changer ce qu'elle renvoie.

   ```js
   function nomDuPremierAuteur(idArticle) {
     return chargerArticle(idArticle)
       .then((article) => chargerAuteur(article.auteurs[0]))
       .then((auteur) => auteur.nom.toUpperCase());
   }
   ```

   :::indice
   Chaque `then` devient un `await` suivi d'une affectation.
   :::

   :::solution
   ```js
   const chargerArticle = (id) => Promise.resolve({ id, auteurs: [7, 8] });
   const chargerAuteur = (id) => Promise.resolve({ id, nom: 'Grace' });

   async function nomDuPremierAuteur(idArticle) {
     const article = await chargerArticle(idArticle);
     const auteur = await chargerAuteur(article.auteurs[0]);
     return auteur.nom.toUpperCase();
   }

   console.log(await nomDuPremierAuteur(1)); // 'GRACE'
   ```
   :::

2. Donne l'ordre des affichages sous la forme `1 2 3 4`, et explique la position de `3`.

   ```js
   async function tache() {
     console.log('1');
     await null;
     console.log('3');
   }
   tache();
   console.log('2');
   setTimeout(() => console.log('4'), 0);
   ```

   :::indice
   Jusqu'au premier `await`, la fonction s'exécute de façon synchrone. Sa reprise est une
   microtâche.
   :::

   :::solution
   L'ordre est `1 2 3 4`. La fonction affiche `1` de façon synchrone, puis se suspend sur `await` et
   rend la main : `2` s'affiche. Sa reprise est une microtâche, exécutée dès la fin du code
   synchrone, avant la macrotâche du minuteur : `3`, puis `4`.
   :::

3. Écris une fonction `async` `premierDisponible(ids, estDisponible)` qui teste les identifiants un
   par un, dans l'ordre, et renvoie le premier disponible, ou `null`. `estDisponible(id)` renvoie une
   promesse de booléen.

   :::indice
   Une boucle `for...of` avec `await` à l'intérieur attend chaque test avant le suivant, et `return`
   interrompt la boucle.
   :::

   :::solution
   ```js
   async function premierDisponible(ids, estDisponible) {
     for (const id of ids) {
       if (await estDisponible(id)) {
         return id;
       }
     }
     return null;
   }

   const testes = [];
   const estDisponible = async (id) => {
     testes.push(id);
     return id === 'b';
   };

   console.log(await premierDisponible(['a', 'b', 'c'], estDisponible), testes); // 'b' ['a', 'b']
   ```

   La boucle s'arrête dès le résultat trouvé : `c` n'est jamais testé. C'est un cas où l'exécution
   séquentielle est voulue.
   :::

## Questions d'entretien

- Que renvoie une fonction `async` ?

  :::indice
  Même si elle contient `return 42` et aucun `await`.
  :::

  :::reponse
  Toujours une promesse. Une valeur renvoyée tient cette promesse, une exception non rattrapée la
  rompt, et une promesse renvoyée est adoptée. L'appelant doit donc utiliser `await` ou `then` pour
  obtenir le résultat, même si la fonction ne fait rien d'asynchrone.
  :::

- `await` bloque-t-il le programme ?

  :::indice
  Qu'est-ce qui est suspendu : la fonction, ou la boucle d'événements ?
  :::

  :::reponse
  Non. `await` suspend uniquement la fonction `async` en cours : elle rend la main à son appelant,
  et la boucle d'événements continue de traiter minuteurs, événements et autres callbacks. Quand la
  promesse se règle, la reprise de la fonction est programmée en microtâche. Un calcul synchrone
  long, lui, bloque tout, qu'il soit dans une fonction `async` ou non.
  :::

- Quel rapport entre `async` / `await` et les promesses ?

  :::indice
  À quoi correspond chaque `await` ?
  :::

  :::reponse
  C'est une écriture des promesses, pas un mécanisme différent. Une fonction `async` renvoie une
  promesse, et chaque `await` équivaut à attacher la suite de la fonction comme callback de `then`.
  Les règles sont donc les mêmes : reprise en microtâche, rejet transformé en exception, possibilité
  de mélanger les deux styles. On peut attendre n'importe quelle promesse, et appeler `then` sur le
  résultat d'une fonction `async`.
  :::
