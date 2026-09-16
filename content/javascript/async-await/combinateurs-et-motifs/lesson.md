---
id: javascript-combinateurs
title: "allSettled, race, any et les motifs asynchrones professionnels"
slug: combinateurs-et-motifs
technology: javascript
level: advanced
module: async-await
order: 4
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-parallele
skills:
  - async-patterns
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Choisir le bon combinateur selon qu'on veut tous les résultats, le premier, ou le premier succès.
- Imposer un délai maximal à une opération avec `Promise.race`.
- Écrire une nouvelle tentative avec attente croissante, et limiter le nombre d'opérations simultanées.

## Introduction

`Promise.all` couvre le cas où tout doit réussir. Les applications réelles ont d'autres exigences :
envoyer des notifications par plusieurs canaux et rapporter chaque échec, interroger deux serveurs
miroirs et garder le premier qui répond, abandonner une requête trop lente, réessayer une opération
instable sans saturer le serveur. Ce chapitre rassemble les combinateurs restants et les motifs
qu'on retrouve dans tout code de production.

## Concept

| Combinateur | Tenu quand | Rompu quand | Usage typique |
| --- | --- | --- | --- |
| `Promise.all` | toutes sont tenues | la première est rompue | tout est nécessaire |
| `Promise.allSettled` | toutes sont réglées | jamais | rapporter chaque succès et chaque échec |
| `Promise.race` | la première réglée est tenue | la première réglée est rompue | délai maximal |
| `Promise.any` | la première est tenue | toutes sont rompues (`AggregateError`) | premier succès parmi des sources équivalentes |

`allSettled` renvoie un tableau d'objets `{ status: 'fulfilled', value }` ou
`{ status: 'rejected', reason }`, dans l'ordre des entrées.

## Exemple

```js
const operation = (nom, ms, echoue = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (echoue ? reject(new Error(`${nom} a échoué`)) : resolve(nom)), ms),
  );

const bilans = await Promise.allSettled([
  operation('email', 10),
  operation('sms', 20, true),
  operation('push', 5),
]);
console.log(bilans.map((b) => (b.status === 'fulfilled' ? b.value : `échec : ${b.reason.message}`)));
// ['email', 'échec : sms a échoué', 'push']

console.log(await Promise.race([operation('lent', 50), operation('rapide', 10)])); // 'rapide'
console.log(await Promise.any([operation('miroir A', 30, true), operation('miroir B', 20)])); // 'miroir B'

function avecDelaiMax(promesse, ms) {
  let minuteur;
  const limite = new Promise((_, reject) => {
    minuteur = setTimeout(() => reject(new Error(`Délai de ${ms} ms dépassé`)), ms);
  });
  return Promise.race([promesse, limite]).finally(() => clearTimeout(minuteur));
}

console.log(await avecDelaiMax(operation('rapide', 10), 100)); // 'rapide'
console.log(await avecDelaiMax(operation('lente', 200), 50).catch((e) => e.message));
// 'Délai de 50 ms dépassé'
```

## Comment ça fonctionne

`allSettled` ne se rompt jamais : il attend que chaque promesse soit réglée et décrit chaque issue.
C'est l'outil des opérations **indépendantes dont on veut un bilan** — envoyer une notification par
trois canaux et savoir lesquels ont échoué, sans qu'un échec empêche de connaître les autres résultats.

`race` se règle comme la **première** promesse réglée, qu'elle soit tenue ou rompue. Son usage
principal est le délai maximal : on met l'opération en course avec une promesse qui se rompt après
un délai. Deux détails comptent. Il faut **annuler le minuteur** une fois la course terminée, sinon il
reste actif et retient son callback — d'où le `finally`. Et `race` ne stoppe pas l'opération perdante :
une requête trop lente continue de s'exécuter en arrière-plan. Pour l'interrompre réellement, on passe
un `AbortSignal`, comme `AbortSignal.timeout(ms)` avec `fetch`, présenté dans la partie HTTP.

`any` ignore les ruptures tant qu'il reste une chance de succès, et se tient avec la **première valeur
réussie**. Il ne se rompt que si toutes échouent, avec une `AggregateError` dont la propriété `errors`
liste les raisons. C'est le bon choix pour des sources équivalentes, comme des serveurs miroirs.

Deux motifs complètent la boîte à outils. La **nouvelle tentative avec attente croissante** relance une
opération qui a échoué, en doublant le délai à chaque essai — 100 ms, 200 ms, 400 ms — pour ne pas
bombarder un service déjà en difficulté ; on ne réessaie que les erreurs passagères, jamais une requête
invalide. La **limitation de concurrence** exécute une longue liste de tâches avec, au plus, `n`
opérations en cours : un petit nombre de « travailleurs » prennent chacun la tâche suivante dès qu'ils
ont fini la leur.

Tous ces motifs reposent sur la même idée : une promesse représente une issue, et les combinateurs
décident laquelle attendre. L'annulation, elle, demande un mécanisme explicite.

## Erreurs fréquentes

**Utiliser `Promise.all` quand on veut un bilan.** Il s'arrête au premier échec : prends `allSettled`.

**Oublier d'annuler le minuteur d'un délai maximal.** Il reste actif après la course.

**Croire que `race` interrompt l'opération perdante.** Elle continue : utilise un `AbortSignal`.

**Réessayer sans attente croissante.** Les tentatives rapprochées aggravent la surcharge.

**Réessayer toutes les erreurs.** Une requête invalide échouera toujours.

## À retenir

- `all` : tout doit réussir. `allSettled` : le bilan de chacune. `race` : la première réglée.
  `any` : le premier succès.
- Délai maximal : `race` avec une promesse qui se rompt, puis `clearTimeout`.
- Aucun combinateur n'annule le travail en cours : il faut un `AbortSignal`.
- Nouvelle tentative : délai croissant, erreurs passagères seulement.
- Limiter la concurrence : `n` travailleurs qui piochent dans une file de tâches.

## Exercices

1. Envoie un message par trois canaux indépendants, puis renvoie
   `{ reussis: [...], echecs: [...] }` avec le nom des canaux, sans qu'un échec interrompe les autres.

   :::indice
   `allSettled` garde l'ordre des entrées : associe chaque bilan au canal de même index.
   :::

   :::solution
   ```js
   const envoyer = (canal, echoue) =>
     new Promise((resolve, reject) => setTimeout(() => (echoue ? reject(new Error(canal)) : resolve(canal)), 10));

   async function diffuser(canaux) {
     const bilans = await Promise.allSettled(canaux.map(({ nom, echoue }) => envoyer(nom, echoue)));
     const reussis = [];
     const echecs = [];
     bilans.forEach((bilan, index) => {
       (bilan.status === 'fulfilled' ? reussis : echecs).push(canaux[index].nom);
     });
     return { reussis, echecs };
   }

   console.log(await diffuser([{ nom: 'email' }, { nom: 'sms', echoue: true }, { nom: 'push' }]));
   // { reussis: ['email', 'push'], echecs: ['sms'] }
   ```
   :::

2. Écris `reessayer(operation, { tentatives, delaiInitial })` : elle appelle `operation()`, et en cas
   d'échec attend `delaiInitial`, puis le double, et ainsi de suite, jusqu'à `tentatives` essais au
   total. Elle relève la dernière erreur si tout échoue.

   :::indice
   Une boucle `for` avec un `try` / `catch` ; le délai d'attente vaut `delaiInitial * 2 ** index`.
   :::

   :::solution
   ```js
   const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

   async function reessayer(operation, { tentatives = 3, delaiInitial = 100 } = {}) {
     let derniereErreur;
     for (let index = 0; index < tentatives; index++) {
       try {
         return await operation();
       } catch (erreur) {
         derniereErreur = erreur;
         if (index < tentatives - 1) {
           await attendre(delaiInitial * 2 ** index);
         }
       }
     }
     throw derniereErreur;
   }

   let appels = 0;
   const instable = async () => {
     appels += 1;
     if (appels < 3) throw new Error('service indisponible');
     return 'réponse';
   };

   console.log(await reessayer(instable, { tentatives: 4, delaiInitial: 10 }), appels); // 'réponse' 3
   ```

   Attentes successives : 10 ms, puis 20 ms. En production, on ajoute un peu d'aléa au délai pour que
   de nombreux clients ne réessaient pas tous au même instant.
   :::

3. Écris `executerAvecLimite(taches, limite)` : `taches` est un tableau de fonctions qui renvoient une
   promesse. Au plus `limite` tâches doivent être en cours à la fois, et le résultat doit être le
   tableau des valeurs dans l'ordre des tâches.

   :::indice
   Crée `limite` travailleurs asynchrones. Chacun prend l'index suivant dans une variable partagée, exécute
   la tâche, range le résultat, et recommence tant qu'il reste des tâches.
   :::

   :::solution
   ```js
   async function executerAvecLimite(taches, limite) {
     const resultats = new Array(taches.length);
     let prochain = 0;

     async function travailleur() {
       while (prochain < taches.length) {
         const index = prochain++;
         resultats[index] = await taches[index]();
       }
     }

     await Promise.all(Array.from({ length: Math.min(limite, taches.length) }, travailleur));
     return resultats;
   }

   let enCours = 0;
   let maximum = 0;
   const tache = (valeur) => async () => {
     enCours += 1;
     maximum = Math.max(maximum, enCours);
     await new Promise((resolve) => setTimeout(resolve, 10));
     enCours -= 1;
     return valeur;
   };

   const valeurs = await executerAvecLimite([1, 2, 3, 4, 5, 6].map(tache), 2);
   console.log(valeurs, maximum); // [1, 2, 3, 4, 5, 6] 2
   ```

   Il n'y a pas de conflit sur `prochain++` : l'incrément est synchrone, et un seul travailleur
   s'exécute à la fois entre deux `await`.
   :::

## Questions d'entretien

- Quelle différence entre `Promise.all`, `allSettled`, `race` et `any` ?

  :::indice
  Pour chacun : quand est-il tenu, quand est-il rompu ?
  :::

  :::reponse
  `all` est tenu quand toutes sont tenues et rompu à la première rupture. `allSettled` attend que toutes
  soient réglées et n'est jamais rompu : il décrit chaque issue. `race` se règle comme la première
  promesse réglée, succès ou échec. `any` est tenu par la première réussite et n'est rompu, avec une
  `AggregateError`, que si toutes échouent. Aucun d'eux n'annule les opérations qui restent en cours.
  :::

- Comment imposer un délai maximal à une opération asynchrone ?

  :::indice
  Une course entre deux promesses, et un nettoyage.
  :::

  :::reponse
  On met l'opération en course, avec `Promise.race`, contre une promesse qui se rompt après le délai, et
  l'on annule le minuteur dans un `finally` pour ne pas le laisser actif. Cette technique libère
  l'appelant mais n'arrête pas l'opération, qui continue en arrière-plan. Pour interrompre réellement une
  requête, on lui passe un `AbortSignal`, par exemple `AbortSignal.timeout(ms)` avec `fetch`.
  :::

- Pourquoi réessayer avec une attente croissante plutôt qu'immédiatement ?

  :::indice
  Pense à un service déjà surchargé, et à des milliers de clients.
  :::

  :::reponse
  Parce qu'un échec vient souvent d'une surcharge ou d'une coupure passagère : réessayer immédiatement
  ajoute de la charge au pire moment et échoue pour la même raison. Doubler l'attente à chaque essai
  laisse au service le temps de se rétablir, et ajouter un peu d'aléa évite que tous les clients
  réessaient en même temps. On limite le nombre d'essais, et on ne réessaie que les erreurs
  passagères : une requête invalide échouera toujours.
  :::
