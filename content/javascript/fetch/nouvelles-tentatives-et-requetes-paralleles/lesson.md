---
id: javascript-fetch-paralleles
title: "Nouvelles tentatives et requêtes parallèles"
slug: nouvelles-tentatives-et-requetes-paralleles
technology: javascript
level: advanced
module: fetch
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-fetch-erreurs
skills:
  - fetch-resilience
tags:
  - javascript
  - http
---

## Objectifs

- Réessayer une requête seulement quand c'est utile et sans danger.
- Respecter `Retry-After` et espacer les tentatives pour ne pas aggraver une surcharge.
- Charger plusieurs ressources en parallèle et afficher ce qui a réussi malgré un échec partiel.

## Introduction

Le réseau est imparfait : un serveur redémarre, un équilibreur de charge renvoie `503` pendant quelques secondes,
un quota de requêtes est atteint. Réessayer résout beaucoup de ces pannes passagères — à condition de le faire avec
discernement. Et une page qui dépend de plusieurs API doit charger ses données en parallèle, sans tout perdre dès
qu'une seule d'entre elles échoue. Ce chapitre applique à HTTP les motifs asynchrones de la partie 6.

## Concept

**Quand réessayer ?**

| Situation | Réessayer ? |
| --- | --- |
| Erreur réseau, `TypeError` | oui, si la requête est idempotente |
| `429 Too Many Requests` | oui, après le délai de `Retry-After` |
| `502`, `503`, `504` | oui, avec une attente croissante |
| `500` | avec prudence : l'erreur peut être permanente |
| `400`, `401`, `403`, `404`, `422` | non : la requête elle-même doit changer |
| Annulation par l'utilisateur | non |

**Comment ?** Un nombre maximal de tentatives, une attente qui double entre deux essais, un peu d'aléa pour éviter
que tous les clients réessaient ensemble, et `Retry-After` quand le serveur l'indique. On ne réessaie
automatiquement que les méthodes **idempotentes** — `GET`, `PUT`, `DELETE` —, sauf protection explicite par une clé
d'idempotence.

**En parallèle** : `Promise.all` quand tout est nécessaire, `Promise.allSettled` quand un résultat partiel reste utile.

## Exemple

```js
const API = 'https://api.boutique.exemple';
const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const STATUTS_TEMPORAIRES = new Set([429, 502, 503, 504]);

async function fetchAvecTentatives(chemin, { tentatives = 3, delaiBase = 50 } = {}) {
  for (let essai = 1; ; essai++) {
    let reponse;
    try {
      reponse = await fetch(`${API}${chemin}`);
    } catch (erreur) {
      if (!(erreur instanceof TypeError) || essai === tentatives) throw erreur;
    }
    if (reponse && !STATUTS_TEMPORAIRES.has(reponse.status)) return reponse;
    if (essai === tentatives) return reponse;

    const retryAfter = Number(reponse?.headers.get('retry-after'));
    const attente = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delaiBase * 2 ** (essai - 1);
    console.log(`essai ${essai} : statut ${reponse?.status ?? 'réseau'}, nouvel essai dans ${attente} ms`);
    await attendre(attente);
  }
}

const reponse = await fetchAvecTentatives('/instable');
console.log(reponse.status, await reponse.json()); // 200 { tentative: 3 }

const [produits, profil, produitAbsent] = await Promise.allSettled([
  fetch(`${API}/produits`).then((r) => r.json()),
  fetch(`${API}/profil`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`profil : ${r.status}`)))),
  fetch(`${API}/produits/99`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`produit : ${r.status}`)))),
]);
console.log(produits.status, produits.value.length); // 'fulfilled' 2
console.log(profil.status, profil.reason.message); // 'rejected' 'profil : 401'
console.log(produitAbsent.reason.message); // 'produit : 404'
```

## Comment ça fonctionne

Une nouvelle tentative ne sert que si la cause de l'échec peut **disparaître d'elle-même**. Une coupure réseau, un
redémarrage de serveur ou une surcharge sont passagers ; une requête invalide, un droit manquant ou une ressource
supprimée ne le sont pas. La fonction de l'exemple ne réessaie donc que les erreurs réseau et les statuts `429`,
`502`, `503` et `504`, et renvoie immédiatement toute autre réponse à l'appelant, qui la traitera normalement.

L'**attente** entre deux essais est essentielle. Réessayer immédiatement, c'est ajouter de la charge à un serveur qui
peine déjà ; si des milliers de clients le font en même temps, la panne s'aggrave. L'attente exponentielle — 50, 100,
200 ms — laisse au service le temps de se rétablir, et un léger aléa ajouté au délai étale les tentatives des
différents clients. Quand le serveur envoie `Retry-After`, il indique lui-même le délai à respecter, en secondes ou
sous forme de date : on s'y conforme.

Le **nombre de tentatives** doit rester borné, et la durée totale acceptable pour l'utilisateur : au-delà, mieux vaut
afficher une erreur et proposer de réessayer manuellement. Une nouvelle tentative doit aussi respecter l'**annulation** :
si l'utilisateur a quitté la page, on arrête au lieu de réessayer.

Enfin, réessayer une requête **non idempotente** est dangereux : un `POST` dont la réponse s'est perdue a peut-être
été traité, et le renvoyer créerait un doublon. On ne le fait que si l'API accepte une **clé d'idempotence**, un
identifiant unique envoyé dans un en-tête qui permet au serveur de reconnaître une répétition.

Pour les **requêtes parallèles**, le choix du combinateur dépend du besoin. Un tableau de bord qui affiche plusieurs
blocs indépendants utilise `Promise.allSettled` : les blocs qui ont réussi s'affichent, les autres montrent un message
d'erreur local. Une page qui n'a de sens que si toutes les données sont là utilise `Promise.all`, qui échoue dès la
première erreur. Avec beaucoup de requêtes, on limite la concurrence, comme vu dans la partie Asynchronous, pour ne pas
saturer le navigateur ou le serveur.

## Erreurs fréquentes

**Réessayer un `400` ou un `404`.** La requête échouera toujours de la même façon.

**Réessayer immédiatement et sans limite.** La surcharge s'aggrave ; espace et borne les tentatives.

**Ignorer `Retry-After`.** Le serveur indique le délai à respecter.

**Réessayer automatiquement un `POST`.** Le risque de doublon est réel sans clé d'idempotence.

**Utiliser `Promise.all` pour des blocs indépendants.** Un seul échec vide tout l'écran : `allSettled`.

## À retenir

- On réessaie les erreurs passagères : réseau, `429`, `502`, `503`, `504` — jamais les `4xx` de la requête.
- Tentatives bornées, attente exponentielle avec aléa, et respect de `Retry-After`.
- Seules les requêtes idempotentes se réessaient sans précaution.
- `allSettled` pour afficher un résultat partiel, `all` quand tout est nécessaire.
- Avec beaucoup de requêtes, on limite la concurrence.

## Exercices

1. Écris `estTemporaire(reponseOuErreur)` qui renvoie `true` pour une `TypeError` réseau et pour les statuts `429`, `502`,
   `503` et `504`, et `false` pour toute autre réponse ou erreur, y compris une annulation.

   :::indice
   Distingue d'abord une erreur d'une réponse, avec `instanceof Response`.
   :::

   :::solution
   ```js
   const TEMPORAIRES = new Set([429, 502, 503, 504]);

   function estTemporaire(reponseOuErreur) {
     if (reponseOuErreur instanceof Response) {
       return TEMPORAIRES.has(reponseOuErreur.status);
     }
     return reponseOuErreur instanceof TypeError;
   }

   console.log(
     estTemporaire(new Response(null, { status: 503 })),
     estTemporaire(new Response(null, { status: 404 })),
     estTemporaire(new TypeError('fetch failed')),
     estTemporaire(new DOMException('annulée', 'AbortError')),
   ); // true false true false
   ```
   :::

2. `Retry-After` contient soit un nombre de secondes, soit une date HTTP. Écris `delaiRetryAfter(valeur, maintenant)` qui
   renvoie le délai en millisecondes, jamais négatif, ou `null` si la valeur est absente ou illisible.

   :::indice
   `Number(valeur)` pour les secondes ; `Date.parse(valeur)` pour une date, comparée à `maintenant`.
   :::

   :::solution
   ```js
   function delaiRetryAfter(valeur, maintenant = Date.now()) {
     if (!valeur) return null;
     const secondes = Number(valeur);
     if (Number.isFinite(secondes)) return Math.max(0, secondes * 1000);
     const date = Date.parse(valeur);
     return Number.isNaN(date) ? null : Math.max(0, date - maintenant);
   }

   const maintenant = Date.parse('Wed, 17 Sep 2026 10:00:00 GMT');
   console.log(delaiRetryAfter('30', maintenant)); // 30000
   console.log(delaiRetryAfter('Wed, 17 Sep 2026 10:00:05 GMT', maintenant)); // 5000
   console.log(delaiRetryAfter('bientôt', maintenant), delaiRetryAfter(null, maintenant)); // null null
   ```

   L'instant présent est un paramètre : la fonction se teste sans dépendre de l'horloge.
   :::

3. Un tableau de bord affiche trois blocs indépendants : produits, profil et produit du jour. Écris
   `chargerTableauDeBord()` qui charge les trois en parallèle et renvoie, pour chaque bloc, `{ ok: true, donnees }` ou
   `{ ok: false, message }`, sans qu'un échec empêche l'affichage des autres.

   :::indice
   Une fonction `chargerJSON(chemin)` qui rompt sa promesse pour un statut d'erreur, puis `Promise.allSettled`.
   :::

   :::solution
   ```js
   async function chargerJSON(chemin) {
     const reponse = await fetch(`${API}${chemin}`);
     if (!reponse.ok) throw new Error(`${chemin} : ${reponse.status}`);
     return reponse.json();
   }

   async function chargerTableauDeBord() {
     const blocs = { produits: '/produits', profil: '/profil', produitDuJour: '/produits/99' };
     const bilans = await Promise.allSettled(Object.values(blocs).map(chargerJSON));
     return Object.fromEntries(
       Object.keys(blocs).map((nom, i) => [
         nom,
         bilans[i].status === 'fulfilled'
           ? { ok: true, donnees: bilans[i].value }
           : { ok: false, message: bilans[i].reason.message },
       ]),
     );
   }

   const tableau = await chargerTableauDeBord();
   console.log(tableau.produits.ok, tableau.profil.message, tableau.produitDuJour.message);
   // true '/profil : 401' '/produits/99 : 404'
   ```
   :::

## Questions d'entretien

- Quelles requêtes faut-il réessayer automatiquement ?

  :::indice
  Pense à la nature de l'erreur et à la méthode HTTP.
  :::

  :::reponse
  Celles dont l'échec est probablement passager — erreur réseau, `429`, `502`, `503`, `504` — et dont la répétition est
  sans danger, c'est-à-dire les méthodes idempotentes comme `GET`, `PUT` et `DELETE`. On ne réessaie pas les erreurs
  `4xx` qui viennent de la requête elle-même, ni une annulation volontaire, ni un `POST` sans clé d'idempotence, qui
  risquerait de créer un doublon.
  :::

- Pourquoi espacer les nouvelles tentatives de façon exponentielle ?

  :::indice
  Imagine des milliers de clients qui réessaient tous immédiatement.
  :::

  :::reponse
  Parce qu'un serveur en difficulté est souvent surchargé : des tentatives immédiates ajoutent de la charge au pire
  moment et peuvent transformer une panne passagère en panne durable. Doubler l'attente à chaque essai laisse le temps au
  service de se rétablir, et un léger aléa évite que tous les clients réessaient au même instant. Quand le serveur envoie
  `Retry-After`, c'est ce délai qu'on respecte.
  :::

- Quand utiliser `Promise.allSettled` plutôt que `Promise.all` pour plusieurs requêtes ?

  :::indice
  Un échec doit-il empêcher d'afficher les autres résultats ?
  :::

  :::reponse
  Quand les requêtes alimentent des parties indépendantes, comme les blocs d'un tableau de bord : `allSettled` attend
  toutes les issues et permet d'afficher ce qui a réussi, avec un message local pour ce qui a échoué. `Promise.all`
  convient quand les données ne valent rien les unes sans les autres : il échoue dès la première erreur, ce qui évite
  d'afficher une page incohérente.
  :::
