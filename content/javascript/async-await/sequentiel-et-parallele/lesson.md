---
id: javascript-parallele
title: "Séquentiel contre parallèle, et Promise.all"
slug: sequentiel-et-parallele
technology: javascript
level: intermediate
module: async-await
order: 3
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-async-erreurs
skills:
  - async-parallel
tags:
  - javascript
  - asynchrone
---

## Objectifs

- Repérer les `await` successifs qui rendent séquentielles des opérations indépendantes.
- Lancer des opérations ensemble et attendre leurs résultats avec `Promise.all`.
- Traiter un tableau en parallèle avec `map`, ou en séquence avec `for...of`, selon le besoin.

## Introduction

`async` / `await` rend le code si lisible qu'on en oublie ce qu'il fait. Trois `await` à la suite
attendent la fin de chaque opération avant de lancer la suivante : trois requêtes de 100 ms prennent
alors 300 ms, alors qu'elles pourraient en prendre 100. C'est le défaut de performance le plus courant
du JavaScript asynchrone, et l'un des plus simples à corriger — à condition de savoir quand les
opérations sont vraiment indépendantes.

## Concept

| Situation | Écriture | Durée pour trois opérations de 100 ms |
| --- | --- | --- |
| Chaque étape dépend de la précédente | `await` successifs | environ 300 ms, et c'est nécessaire |
| Opérations indépendantes | `await Promise.all([a(), b(), c()])` | environ 100 ms |
| Tableau traité en parallèle | `await Promise.all(liste.map(async (x) => …))` | la durée de la plus longue |
| Tableau traité dans l'ordre | `for (const x of liste) await traiter(x)` | la somme des durées |

Une opération démarre **au moment où la fonction qui la lance est appelée**, pas au moment de
l'`await`. Paralléliser, c'est donc appeler toutes les fonctions d'abord, puis attendre les résultats.

## Exemple

```js
const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));
const chargerProfil = () => attendre(100, 'profil');
const chargerNotifications = () => attendre(100, 'notifications');
const chargerPreferences = () => attendre(100, 'préférences');
const arrondi = (debut) => Math.round((Date.now() - debut) / 100) * 100;

async function sequentiel() {
  const debut = Date.now();
  const profil = await chargerProfil();
  const notifications = await chargerNotifications(); // ne démarre qu'après le profil
  const preferences = await chargerPreferences();
  return { duree: arrondi(debut), valeurs: [profil, notifications, preferences] };
}

async function parallele() {
  const debut = Date.now();
  const [profil, notifications, preferences] = await Promise.all([
    chargerProfil(),
    chargerNotifications(),
    chargerPreferences(),
  ]);
  return { duree: arrondi(debut), valeurs: [profil, notifications, preferences] };
}

console.log((await sequentiel()).duree); // 300
console.log((await parallele()).duree); // 100

const ids = [1, 2, 3];
const utilisateurs = await Promise.all(ids.map(async (id) => attendre(50, { id })));
console.log(utilisateurs.map((u) => u.id)); // [1, 2, 3] : dans l'ordre des ids
```

## Comment ça fonctionne

Appeler `chargerProfil()` **démarre** la requête et renvoie une promesse ; `await` ne fait qu'attendre
son issue. Dans la version séquentielle, chaque appel est placé après l'`await` précédent : la
deuxième requête ne peut pas démarrer avant la fin de la première. Dans la version parallèle, les
trois appels ont lieu dans le tableau passé à `Promise.all`, donc au même moment, et l'`await`
attend que les trois soient tenues. Le parallélisme vient de l'environnement, qui gère plusieurs
attentes à la fois ; le fil JavaScript, lui, reste unique.

On pourrait aussi lancer les opérations dans des variables, puis les attendre une à une :
`const a = chargerProfil(); const b = chargerNotifications(); return [await a, await b];`. Les
opérations sont bien simultanées, mais ce motif a un défaut sérieux : si `b` est rompue pendant qu'on
attend `a`, aucun gestionnaire n'est encore attaché à `b`. Node.js signale alors un rejet non géré, qui
peut arrêter le processus, même si un `try` finit par rattraper l'erreur. `Promise.all` attache ses
gestionnaires à toutes les promesses immédiatement : c'est l'écriture à préférer.

Sur un tableau, `map` avec un callback `async` produit un tableau de promesses, que `Promise.all`
attend. `forEach`, en revanche, ignore les promesses renvoyées : le code qui suit s'exécute avant la
fin du travail, et les erreurs sont perdues. Quand l'ordre compte, ou que chaque élément doit attendre
le précédent, une boucle `for...of` avec `await` est l'écriture correcte.

Le parallélisme a une limite : lancer dix mille requêtes à la fois sature le serveur, la mémoire ou
les quotas d'une API. `Promise.all` n'impose aucune borne. Le chapitre suivant montre comment limiter
le nombre d'opérations simultanées.

Enfin, `Promise.all` échoue dès la première rupture. Si l'on a besoin des résultats qui ont réussi
malgré l'échec d'une partie, c'est `Promise.allSettled` qu'il faut.

## Erreurs fréquentes

**Enchaîner des `await` pour des opérations indépendantes.** Lance-les ensemble avec `Promise.all`.

**Passer un callback `async` à `forEach`.** Rien n'est attendu : utilise `map` et `Promise.all`, ou
`for...of`.

**Lancer puis attendre une à une.** Une rupture précoce devient un rejet non géré.

**Paralléliser des étapes dépendantes.** Si une étape a besoin du résultat d'une autre, elle doit
l'attendre.

**Lancer des milliers d'opérations à la fois.** Limite la concurrence.

## À retenir

- Une opération démarre à l'appel de sa fonction ; `await` n'en attend que l'issue.
- Opérations indépendantes : `await Promise.all([...])`.
- Tableau en parallèle : `Promise.all(liste.map(async …))` ; dans l'ordre : `for...of` avec `await`.
- Jamais de callback `async` dans `forEach`.
- Le parallélisme sans limite sature les ressources : borne-le.

## Exercices

1. Cette fonction met environ 300 ms. Réécris-la pour qu'elle en mette environ 100, sans changer ce
   qu'elle renvoie.

   ```js
   async function tableauDeBord() {
     const ventes = await chargerVentes(); // 100 ms
     const stock = await chargerStock(); // 100 ms
     const avis = await chargerAvis(); // 100 ms
     return { ventes, stock, avis };
   }
   ```

   :::indice
   Aucune de ces fonctions n'utilise le résultat d'une autre.
   :::

   :::solution
   ```js
   const attendre = (ms, v) => new Promise((resolve) => setTimeout(() => resolve(v), ms));
   const chargerVentes = () => attendre(100, 42);
   const chargerStock = () => attendre(100, 7);
   const chargerAvis = () => attendre(100, 4.5);

   async function tableauDeBord() {
     const [ventes, stock, avis] = await Promise.all([chargerVentes(), chargerStock(), chargerAvis()]);
     return { ventes, stock, avis };
   }

   const debut = Date.now();
   console.log(await tableauDeBord(), Date.now() - debut < 200); // { ventes: 42, stock: 7, avis: 4.5 } true
   ```
   :::

2. Ce code affiche `0 utilisateurs activés` alors que les trois activations réussissent. Explique pourquoi
   et corrige.

   ```js
   async function activerTous(ids) {
     let actives = 0;
     ids.forEach(async (id) => {
       await activer(id);
       actives += 1;
     });
     console.log(`${actives} utilisateurs activés`);
   }
   ```

   :::indice
   `forEach` attend-il les promesses renvoyées par son callback ?
   :::

   :::solution
   `forEach` lance les trois callbacks, ignore les promesses qu'ils renvoient et rend la main
   immédiatement : le `console.log` s'exécute avant la moindre activation.

   ```js
   const activer = (id) => new Promise((resolve) => setTimeout(() => resolve(id), 10));

   async function activerTous(ids) {
     const resultats = await Promise.all(ids.map((id) => activer(id)));
     console.log(`${resultats.length} utilisateurs activés`);
   }

   await activerTous([1, 2, 3]); // '3 utilisateurs activés'
   ```
   :::

3. Des mouvements de stock doivent être appliqués **dans l'ordre**, chacun après la fin du précédent,
   car un retrait ne peut dépasser le stock disponible. Écris `appliquer(mouvements, enregistrer)`.

   :::indice
   Ici la séquence est voulue : une boucle `for...of` avec `await`.
   :::

   :::solution
   ```js
   async function appliquer(mouvements, enregistrer) {
     let stock = 0;
     for (const mouvement of mouvements) {
       if (stock + mouvement < 0) {
         throw new Error(`Mouvement ${mouvement} refusé : stock ${stock}`);
       }
       stock += mouvement;
       await enregistrer(stock);
     }
     return stock;
   }

   const historique = [];
   const enregistrer = (valeur) => new Promise((resolve) => setTimeout(() => resolve(historique.push(valeur)), 5));

   console.log(await appliquer([10, -3, 5], enregistrer), historique); // 12 [10, 7, 12]
   await appliquer([2, -5], enregistrer).catch((e) => console.log(e.message)); // 'Mouvement -5 refusé : stock 2'
   ```

   En parallèle, l'ordre des enregistrements ne serait pas garanti, et la règle métier n'aurait plus de
   sens.
   :::

## Questions d'entretien

- Pourquoi trois `await` successifs peuvent-ils être un problème de performance ?

  :::indice
  Quand chaque opération démarre-t-elle ?
  :::

  :::reponse
  Parce que chaque opération n'est lancée qu'après la fin de la précédente : trois requêtes
  indépendantes de 100 ms prennent 300 ms au lieu de 100. Ce n'est un problème que si les opérations ne
  dépendent pas les unes des autres. Dans ce cas, on les lance ensemble et on attend leurs résultats
  avec `Promise.all`, qui renvoie les valeurs dans l'ordre fourni.
  :::

- Comment traiter un tableau d'éléments de façon asynchrone ?

  :::indice
  Deux écritures selon que l'ordre compte, et une à éviter.
  :::

  :::reponse
  En parallèle, avec `await Promise.all(liste.map(async (element) => …))`, qui lance tout et attend
  l'ensemble. En séquence, quand l'ordre compte ou que chaque étape dépend de la précédente, avec une
  boucle `for...of` contenant un `await`. Jamais avec `forEach`, qui n'attend pas les promesses de son
  callback : le code suivant s'exécute trop tôt et les erreurs sont perdues.
  :::

- Pourquoi préférer `Promise.all` à « lancer puis attendre une à une » ?

  :::indice
  Que se passe-t-il si la seconde promesse est rompue pendant qu'on attend la première ?
  :::

  :::reponse
  Les deux écritures lancent les opérations en même temps, mais attendre une à une laisse les autres
  promesses sans gestionnaire pendant l'attente. Si l'une est rompue à ce moment-là, l'environnement la
  considère comme un rejet non géré — ce qui peut arrêter un processus Node.js — même si un `try` la
  rattrape plus tard. `Promise.all` attache ses gestionnaires à toutes les promesses immédiatement et
  échoue proprement à la première erreur.
  :::
