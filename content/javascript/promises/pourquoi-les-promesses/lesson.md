---
id: javascript-promesses-etats
title: "Pourquoi les promesses, et leurs trois états"
slug: pourquoi-les-promesses
technology: javascript
level: intermediate
module: promises
order: 1
estimatedMinutes: 25
difficulty: 3
xp: 80
prerequisites:
  - javascript-event-loop
skills:
  - promise-states
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Expliquer les problèmes des callbacks imbriqués que les promesses résolvent.
- Décrire les trois états d'une promesse et la règle qui les rend définitifs.
- Consommer une promesse existante avec `then` et `catch`.

## Introduction

Enchaîner trois opérations asynchrones avec des callbacks produit une pyramide de fonctions
imbriquées, où chaque niveau doit traiter ses propres erreurs. Pire : on confie son callback à
une fonction tierce en espérant qu'elle l'appellera une fois, et une seule. Les **promesses**
remplacent ce « rappelle-moi » par un objet qu'on reçoit tout de suite et qui représente le
résultat à venir. C'est la brique sur laquelle reposent `fetch`, `async` et `await`.

## Concept

Une promesse est un objet qui représente le résultat **futur** d'une opération asynchrone.

| État | Signification | Réaction déclenchée |
| --- | --- | --- |
| *pending* (en attente) | l'opération n'est pas terminée | aucune pour l'instant |
| *fulfilled* (tenue) | l'opération a réussi, avec une valeur | les callbacks de `then` |
| *rejected* (rompue) | l'opération a échoué, avec une raison | les callbacks de `catch` |

Une promesse tenue ou rompue est dite **réglée** (*settled*). Deux règles fondamentales :

1. une promesse ne change d'état **qu'une seule fois** : réglée, elle le reste ;
2. un callback de `then` s'exécute **toujours de façon asynchrone**, même si la promesse est
   déjà réglée au moment où on l'attache.

## Exemple

```js
// Opérations simulées, fondées sur des callbacks.
function chargerUtilisateur(id, rappel) {
  setTimeout(() => rappel(null, { id, nom: 'Ada' }), 10);
}
function chargerCommandes(utilisateur, rappel) {
  setTimeout(() => rappel(null, [{ total: 30 }, { total: 12 }]), 10);
}

// Avec des callbacks : imbrication, et une erreur à gérer à chaque niveau.
chargerUtilisateur(1, (erreur, utilisateur) => {
  if (erreur) return console.error(erreur);
  chargerCommandes(utilisateur, (erreur2, commandes) => {
    if (erreur2) return console.error(erreur2);
    console.log('callbacks :', commandes.length); // callbacks : 2
  });
});

// Les mêmes opérations, sous forme de promesses.
const utilisateurPromis = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, nom: 'Ada' }), 10));
const commandesPromises = () =>
  new Promise((resolve) => setTimeout(() => resolve([{ total: 30 }, { total: 12 }]), 10));

utilisateurPromis(1)
  .then((utilisateur) => commandesPromises(utilisateur))
  .then((commandes) => console.log('promesses :', commandes.length)) // promesses : 2
  .catch((erreur) => console.error(erreur)); // un seul endroit pour toutes les erreurs

const promesse = utilisateurPromis(2);
console.log(promesse); // Promise { <pending> } : l'objet existe avant le résultat
```

## Comment ça fonctionne

Les callbacks imbriqués posent trois problèmes. La **lisibilité** : chaque étape ajoute un niveau
d'indentation, et la logique se lit de gauche à droite au lieu de haut en bas. Les **erreurs** :
chaque niveau doit tester la sienne, et une exception levée dans un callback échappe au `try`
qui entoure l'appel initial. La **confiance** : en passant un callback, on confie à une autre
fonction le soin de l'appeler une fois, ni zéro ni deux — c'est l'inversion de contrôle.

Une promesse inverse cette relation. La fonction asynchrone **renvoie immédiatement** un objet ; le
code appelant y attache ses réactions quand il le souhaite. Comme la promesse ne se règle qu'une
fois, un callback de `then` ne peut pas être appelé deux fois, et attacher un `then` après coup
fonctionne : si la promesse est déjà tenue, le callback s'exécute quand même, avec la valeur.

Ce callback est toujours exécuté comme **microtâche**, jamais pendant l'appel à `then`. Cette
règle rend le comportement prévisible : le code qui suit `then` s'exécute toujours avant la
réaction, que la promesse soit déjà réglée ou non. Le chapitre sur l'event loop a montré la
conséquence sur l'ordre d'affichage.

`then` renvoie une **nouvelle** promesse, ce qui permet d'enchaîner les étapes à plat, et un seul
`catch` en fin de chaîne reçoit l'erreur de n'importe quelle étape. Le chapitre 3 de ce module
détaille ces règles de chaînage.

Enfin, une promesse n'est **pas** l'opération elle-même : elle n'offre aucun moyen d'annuler le
travail en cours, ni de connaître son avancement. Elle représente seulement l'issue. L'annulation
passe par d'autres outils, comme `AbortController`, présenté avec `fetch`.

## Erreurs fréquentes

**Imbriquer des `then` comme des callbacks.** Renvoie la promesse suivante et enchaîne à plat.

**Oublier le `catch` final.** Une promesse rompue sans réaction devient un rejet non géré, qui
arrête un processus Node.js.

**Lire l'état d'une promesse de façon synchrone.** Il n'existe pas d'accès direct : on réagit
avec `then`, `catch` ou `await`.

**Croire qu'une promesse annule l'opération quand on l'ignore.** Le travail continue.

## À retenir

- Une promesse représente le résultat futur d'une opération asynchrone.
- Trois états : en attente, tenue, rompue ; une fois réglée, elle ne change plus.
- Les réactions de `then` et `catch` s'exécutent toujours en microtâche.
- Les promesses remplacent l'imbrication par une chaîne, avec un seul point de gestion d'erreur.
- Une promesse représente une issue : elle ne permet ni d'annuler ni de suivre l'avancement.

## Exercices

1. Pour chaque ligne, donne l'état final de la promesse.

   ```js
   const a = new Promise(() => {});
   const b = Promise.resolve(42);
   const c = new Promise((resolve, reject) => { reject(new Error('non')); resolve('oui'); });
   const d = new Promise(() => { throw new Error('boum'); });
   ```

   :::indice
   Une promesse change d'état une seule fois, et une erreur levée dans l'exécuteur compte comme un
   rejet.
   :::

   :::solution
   - `a` reste **en attente** pour toujours : rien ne la règle.
   - `b` est **tenue** avec 42.
   - `c` est **rompue** : le `reject` arrive en premier, le `resolve` suivant est ignoré.
   - `d` est **rompue** avec l'erreur `boum`, levée dans l'exécuteur.
   :::

2. Donne l'ordre des affichages, et explique pourquoi la promesse déjà tenue n'affiche pas sa valeur en
   premier.

   ```js
   const pret = Promise.resolve('valeur');
   pret.then((v) => console.log(v));
   console.log('après then');
   ```

   :::indice
   Un callback de `then` peut-il s'exécuter pendant l'appel à `then` ?
   :::

   :::solution
   L'ordre est `après then`, puis `valeur`. Même quand la promesse est déjà tenue, le callback est
   placé en microtâche : il s'exécute après la fin du code synchrone en cours.
   :::

3. Réécris cette pyramide en une chaîne de promesses à plat, avec un seul `catch`. Les fonctions
   `trouverClient`, `trouverPanier` et `calculerTotal` renvoient des promesses.

   ```js
   trouverClient(7).then((client) => {
     trouverPanier(client).then((panier) => {
       calculerTotal(panier).then((total) => {
         console.log(total);
       });
     });
   });
   ```

   :::indice
   Dans un `then`, **renvoie** la promesse suivante au lieu d'attacher un `then` imbriqué.
   :::

   :::solution
   ```js
   const trouverClient = (id) => Promise.resolve({ id });
   const trouverPanier = () => Promise.resolve([20, 22]);
   const calculerTotal = (panier) => Promise.resolve(panier.reduce((s, p) => s + p, 0));

   trouverClient(7)
     .then((client) => trouverPanier(client))
     .then((panier) => calculerTotal(panier))
     .then((total) => console.log(total)) // 42
     .catch((erreur) => console.error('Échec :', erreur.message));
   ```

   La version imbriquée n'avait aucune gestion d'erreur, et une erreur dans une étape interne
   n'aurait jamais atteint un `catch` posé sur la chaîne extérieure.
   :::

## Questions d'entretien

- Quels problèmes les promesses résolvent-elles par rapport aux callbacks ?

  :::indice
  Pense à l'imbrication, aux erreurs et à la confiance accordée à la fonction appelée.
  :::

  :::reponse
  Elles remplacent l'imbrication par une chaîne plate, centralisent la gestion d'erreurs dans un
  `catch` qui reçoit l'échec de n'importe quelle étape, et suppriment l'inversion de contrôle :
  au lieu de confier un callback en espérant qu'il sera appelé une seule fois, on reçoit un objet
  qui ne se règle qu'une fois et auquel on attache ses réactions quand on veut. Elles servent aussi
  de base commune à `fetch`, `async` et `await`.
  :::

- Quels sont les états d'une promesse ?

  :::indice
  Trois états, et une règle sur leurs transitions.
  :::

  :::reponse
  En attente (*pending*), tenue (*fulfilled*) avec une valeur, ou rompue (*rejected*) avec une
  raison. Une promesse passe au plus une fois de l'attente à l'un des deux états réglés, et n'en
  change plus ensuite. Il n'existe pas de lecture synchrone de l'état : on y réagit avec `then`,
  `catch`, `finally` ou `await`.
  :::

- Un `then` attaché à une promesse déjà tenue s'exécute-t-il immédiatement ?

  :::indice
  Pense à la file dans laquelle la réaction est placée.
  :::

  :::reponse
  Non. La réaction est toujours placée en microtâche : elle s'exécute après le code synchrone en
  cours, même si la valeur est disponible depuis longtemps. Cette garantie rend le comportement
  identique que la promesse soit déjà réglée ou non, et évite qu'un code se comporte parfois de
  façon synchrone et parfois de façon asynchrone.
  :::
