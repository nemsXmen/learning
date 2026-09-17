---
id: javascript-fetch-erreurs
title: "Erreurs, annulation et délai maximal avec fetch"
slug: erreurs-annulation-et-delai
technology: javascript
level: advanced
module: fetch
order: 2
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-fetch
  - javascript-combinateurs
skills:
  - fetch-errors
tags:
  - javascript
  - http
---

## Objectifs

- Distinguer les quatre issues d'échec d'une requête : réseau, statut HTTP, annulation, délai dépassé.
- Annuler une requête avec `AbortController`, et imposer un délai avec `AbortSignal.timeout`.
- Éviter qu'une réponse lente et obsolète écrase une réponse plus récente.

## Introduction

Une requête peut échouer de plusieurs façons, qui n'appellent pas la même réaction : un réseau coupé invite à
réessayer, un `422` à corriger la saisie, une annulation volontaire à ne rien afficher du tout. Une requête peut
aussi ne jamais répondre, ou répondre trop tard, après qu'une requête plus récente a déjà affiché ses résultats. Ce
chapitre traite ces situations, qui distinguent un client HTTP fiable d'un simple appel à `fetch`.

## Concept

| Issue | Comment elle se manifeste | Réaction typique |
| --- | --- | --- |
| Échec réseau | promesse rompue, `TypeError` | proposer de réessayer |
| Statut d'erreur | réponse tenue, `ok` à `false` | selon le statut : corriger, se connecter, réessayer |
| Annulation | promesse rompue, `AbortError` | ne rien afficher |
| Délai dépassé | promesse rompue, `TimeoutError` | message et nouvelle tentative possible |

Les outils d'annulation :

| Outil | Rôle |
| --- | --- |
| `new AbortController()` | fournit un `signal` et une méthode `abort()` |
| `fetch(adresse, { signal })` | la requête s'arrête quand le signal est annulé |
| `AbortSignal.timeout(ms)` | un signal annulé automatiquement après `ms` |
| `AbortSignal.any([s1, s2])` | un signal annulé dès que l'un des signaux l'est |

Annuler interrompt vraiment la requête : la connexion est fermée et le corps n'est pas téléchargé, contrairement à
`Promise.race`, qui ne fait qu'ignorer la réponse.

## Exemple

```js
const API = 'https://api.boutique.exemple';

class ErreurHttp extends Error {
  constructor(statut) {
    super(`Erreur HTTP ${statut}`);
    this.name = 'ErreurHttp';
    this.statut = statut;
  }
}

async function charger(chemin, { signal } = {}) {
  const reponse = await fetch(`${API}${chemin}`, {
    signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(100)]),
  });
  if (!reponse.ok) throw new ErreurHttp(reponse.status);
  return reponse.json();
}

function decrireEchec(erreur) {
  if (erreur.name === 'TimeoutError') return 'délai dépassé';
  if (erreur.name === 'AbortError') return 'annulée';
  if (erreur instanceof ErreurHttp) return `statut ${erreur.statut}`;
  if (erreur instanceof TypeError) return 'réseau indisponible';
  return 'erreur inconnue';
}

for (const chemin of ['/produits/1', '/produits/99', '/lent?ms=300']) {
  try {
    const donnees = await charger(chemin);
    console.log(chemin, '→', donnees.nom);
  } catch (erreur) {
    console.log(chemin, '→', decrireEchec(erreur));
  }
}
// '/produits/1 → Clavier', '/produits/99 → statut 404', '/lent?ms=300 → délai dépassé'

const annulation = new AbortController();
const enCours = charger('/lent?ms=80', { signal: annulation.signal });
annulation.abort();
console.log(await enCours.catch(decrireEchec)); // 'annulée'
```

## Comment ça fonctionne

Les quatre issues se reconnaissent sans ambiguïté. Un **échec réseau** rompt la promesse de `fetch` avec une
`TypeError`, dont le message varie selon l'environnement — « Failed to fetch » dans Chrome, « fetch failed » dans
Node.js : on se fie au type, pas au texte. Un **statut d'erreur** donne une réponse tenue, que le code transforme en
erreur explicite, comme `ErreurHttp`. Une **annulation** rompt la promesse avec une `DOMException` nommée `AbortError`,
et un **délai** dépassé avec `AbortSignal.timeout` produit une `TimeoutError`.

`AbortController` sépare deux rôles : le **signal**, transmis à `fetch` et à tout ce qui doit réagir à l'annulation,
et la méthode **`abort()`**, gardée par le code qui décide d'annuler. Un même signal peut arrêter plusieurs requêtes à
la fois — utile quand l'utilisateur quitte une page. Si l'on passe une raison à `abort(raison)`, la promesse est rompue
avec **cette raison** plutôt qu'avec une `AbortError` : pour savoir si une requête a été annulée, `signal.aborted` est
alors plus fiable que le nom de l'erreur.

`AbortSignal.any` combine plusieurs signaux : une annulation par l'utilisateur **et** un délai maximal, comme dans la
fonction `charger`. Le signal combiné est annulé dès que l'un des deux l'est, et la raison conservée permet de savoir
lequel.

Le dernier piège est la **concurrence de réponses**. Dans une recherche instantanée, l'utilisateur tape « c », « cl »,
« cla » : trois requêtes partent, et rien ne garantit qu'elles reviennent dans l'ordre. Si la réponse à « c » arrive en
dernier, elle écrase les résultats de « cla », et l'interface affiche des résultats qui ne correspondent pas à la
saisie. La solution consiste à **annuler la requête précédente** avant d'en lancer une nouvelle : une seule réponse,
la plus récente, peut alors être affichée.

Une annulation n'est pas une panne : elle ne doit afficher aucun message d'erreur. On l'écarte donc explicitement dans
le `catch`, avant de traiter les autres cas.

## Erreurs fréquentes

**Afficher un message d'erreur pour une annulation volontaire.** Ignore `AbortError`.

**Se fier au texte d'une erreur réseau.** Il change selon le navigateur : teste le type.

**Laisser des requêtes sans délai maximal.** Une requête peut rester en attente très longtemps.

**Lancer une nouvelle recherche sans annuler la précédente.** Une réponse lente écrase une réponse récente.

**Tester `name === 'AbortError'` après `abort(raison)`.** L'erreur est la raison : teste `signal.aborted`.

## À retenir

- Réseau : `TypeError` ; statut : réponse avec `ok` à `false` ; annulation : `AbortError` ; délai : `TimeoutError`.
- `AbortController` fournit un `signal` pour `fetch` et `abort()` pour annuler.
- `AbortSignal.timeout(ms)` impose un délai ; `AbortSignal.any` combine plusieurs signaux.
- Annuler interrompt vraiment la requête, contrairement à `Promise.race`.
- Annuler la requête précédente évite qu'une réponse obsolète écrase la plus récente.

## Exercices

1. Écris `rechercher(terme)` pour une recherche instantanée : chaque appel annule la requête précédente, seule la réponse
   la plus récente est renvoyée, et une recherche annulée renvoie `null` sans erreur.

   :::indice
   Garde le contrôleur de la dernière requête dans une variable extérieure, et appelle son `abort()` au début de chaque
   recherche.
   :::

   :::solution
   ```js
   let controleurRecherche = null;

   async function rechercher(terme, delaiServeur) {
     controleurRecherche?.abort();
     const controleur = new AbortController();
     controleurRecherche = controleur;
     try {
       const adresse = `${API}/recherche?q=${encodeURIComponent(terme)}&ms=${delaiServeur}`;
       const reponse = await fetch(adresse, { signal: controleur.signal });
       return await reponse.json();
     } catch (erreur) {
       if (controleur.signal.aborted) return null;
       throw erreur;
     }
   }

   const resultats = await Promise.all([rechercher('c', 80), rechercher('cl', 50), rechercher('cla', 10)]);
   console.log(resultats.map((r) => r?.q ?? null)); // [null, null, 'cla']
   ```

   Même si la réponse à « c » est la plus lente, elle ne peut plus écraser celle de « cla » : sa requête a été annulée.
   :::

2. Écris `chargerAvecDelai(chemin, ms)` qui renvoie `{ ok: true, donnees }` en cas de succès, et sinon
   `{ ok: false, message }` avec « Le serveur met trop de temps à répondre » pour un délai dépassé, « Connexion
   impossible » pour une erreur réseau, et « Erreur 404 » par exemple pour un statut.

   :::indice
   `AbortSignal.timeout(ms)` pour le délai ; teste d'abord le nom `TimeoutError`, puis le type `TypeError`.
   :::

   :::solution
   ```js
   async function chargerAvecDelai(chemin, ms) {
     try {
       const reponse = await fetch(`${API}${chemin}`, { signal: AbortSignal.timeout(ms) });
       if (!reponse.ok) return { ok: false, message: `Erreur ${reponse.status}` };
       return { ok: true, donnees: await reponse.json() };
     } catch (erreur) {
       if (erreur.name === 'TimeoutError') return { ok: false, message: 'Le serveur met trop de temps à répondre' };
       if (erreur instanceof TypeError) return { ok: false, message: 'Connexion impossible' };
       throw erreur;
     }
   }

   console.log(await chargerAvecDelai('/produits/1', 500)); // { ok: true, donnees: { id: 1, nom: 'Clavier', prix: 50 } }
   console.log((await chargerAvecDelai('/lent?ms=300', 50)).message); // 'Le serveur met trop de temps à répondre'
   console.log((await chargerAvecDelai('/produits/99', 500)).message); // 'Erreur 404'
   ```

   Le délai couvre aussi la lecture du corps : un serveur qui envoie ses en-têtes puis bloque est interrompu de la même façon.
   :::

3. Quand l'utilisateur quitte une page, toutes les requêtes qu'elle a lancées doivent s'arrêter. Écris
   `creerChargeurDePage()`, qui renvoie une fonction `charger(chemin)` et une fonction `quitter()`, et vérifie que trois
   requêtes en cours sont toutes interrompues.

   :::indice
   Un seul `AbortController` pour la page ; son signal est passé à chaque requête.
   :::

   :::solution
   ```js
   function creerChargeurDePage() {
     const controleur = new AbortController();
     return {
       charger: (chemin) => fetch(`${API}${chemin}`, { signal: controleur.signal }).then((r) => r.json()),
       quitter: () => controleur.abort(),
     };
   }

   const page = creerChargeurDePage();
   const requetes = ['/lent?ms=200', '/lent?ms=300', '/lent?ms=400'].map(page.charger);
   page.quitter();

   const bilans = await Promise.allSettled(requetes);
   console.log(bilans.map((b) => b.reason?.name)); // ['AbortError', 'AbortError', 'AbortError']
   ```
   :::

## Questions d'entretien

- Comment distinguer les différentes causes d'échec d'une requête `fetch` ?

  :::indice
  Quatre cas : deux rompent la promesse avec un nom particulier, un avec un type, et un ne la rompt pas.
  :::

  :::reponse
  Un statut d'erreur ne rompt pas la promesse : on le détecte avec `response.ok`. Un échec réseau rompt la promesse avec
  une `TypeError`, au message variable selon l'environnement. Une annulation produit une `AbortError`, et un délai
  imposé par `AbortSignal.timeout` une `TimeoutError`. On teste le nom ou le type plutôt que le message, et l'on ignore
  les annulations volontaires au lieu d'afficher une erreur.
  :::

- Quelle différence entre annuler avec `AbortController` et utiliser `Promise.race` pour un délai ?

  :::indice
  Que devient la requête perdante dans chaque cas ?
  :::

  :::reponse
  `Promise.race` ne fait qu'arrêter d'attendre : la requête continue, consomme de la bande passante et peut encore
  produire des effets. `AbortController` interrompt réellement la requête : la connexion est fermée, le téléchargement du
  corps s'arrête, et la promesse est rompue avec une `AbortError`. `AbortSignal.timeout` combine les deux besoins en une
  ligne.
  :::

- Comment éviter qu'une réponse ancienne écrase une réponse récente dans une recherche instantanée ?

  :::indice
  Les réponses reviennent-elles forcément dans l'ordre des requêtes ?
  :::

  :::reponse
  Les réponses ne reviennent pas forcément dans l'ordre : une requête pour « c » peut répondre après celle pour « cla ».
  On annule donc la requête précédente avant chaque nouvelle recherche, avec un `AbortController` conservé entre les
  appels, et l'on ignore les annulations. On peut aussi comparer un identifiant de requête et n'afficher que la plus
  récente, mais l'annulation économise en plus le réseau et le serveur.
  :::
