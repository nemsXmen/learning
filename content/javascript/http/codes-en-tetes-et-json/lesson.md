---
id: javascript-http-codes
title: "Codes de statut, en-têtes et JSON"
slug: codes-en-tetes-et-json
technology: javascript
level: intermediate
module: http
order: 2
estimatedMinutes: 30
difficulty: 3
xp: 80
prerequisites:
  - javascript-http-requete
skills:
  - http-status-headers
tags:
  - javascript
  - http
---

## Objectifs

- Interpréter un code de statut à partir de sa famille, et connaître les codes les plus courants.
- Lire et envoyer les en-têtes essentiels : `Content-Type`, `Accept`, `Authorization`, `Location`, `Cache-Control`.
- Échanger des données en JSON en respectant ses règles et ses limites.

## Introduction

Le code de statut est la première chose qu'un client doit lire : il dit si la requête a réussi, et sinon à qui
revient la faute. Les en-têtes, eux, décrivent le message — son format, son auteur, sa durée de validité. Un client
qui les ignore affiche « Une erreur est survenue » pour tout, et une API qui les choisit mal oblige ses clients à
deviner. Ce chapitre donne le vocabulaire commun.

## Concept

| Famille | Sens | Codes courants |
| --- | --- | --- |
| `2xx` | succès | `200` OK, `201` créé, `204` succès sans contenu |
| `3xx` | redirection | `301` déplacé définitivement, `302` temporairement, `304` non modifié |
| `4xx` | erreur du **client** | `400` requête invalide, `401` non authentifié, `403` interdit, `404` introuvable, `409` conflit, `415` format non pris en charge, `422` données invalides, `429` trop de requêtes |
| `5xx` | erreur du **serveur** | `500` erreur interne, `502` passerelle, `503` indisponible, `504` délai de passerelle |

| En-tête | Sens | Exemple |
| --- | --- | --- |
| `Content-Type` | format du corps envoyé | `application/json` |
| `Accept` | formats que le client accepte en réponse | `application/json` |
| `Authorization` | preuve d'identité | `Bearer eyJhbGciOi…` |
| `Location` | adresse de la ressource créée ou de la redirection | `/produits/3` |
| `Cache-Control` | durée et conditions de mise en cache | `max-age=60` |
| `Retry-After` | délai avant de réessayer, avec `429` ou `503` | `30` |

**JSON** ne connaît que les objets, tableaux, chaînes entre guillemets doubles, nombres, booléens et `null`.

## Exemple

```js
const API = 'https://api.boutique.exemple';

function decrire(reponse) {
  if (reponse.ok) return `succès ${reponse.status}`;
  if (reponse.status >= 500) return `erreur serveur ${reponse.status} : réessayer plus tard`;
  if (reponse.status === 401) return 'authentification requise';
  if (reponse.status === 403) return 'accès refusé';
  if (reponse.status === 404) return 'ressource introuvable';
  return `requête à corriger ${reponse.status}`;
}

const trouve = await fetch(`${API}/produits/1`, { headers: { Accept: 'application/json' } });
console.log(decrire(trouve), trouve.headers.get('cache-control')); // 'succès 200' 'max-age=60'

const absent = await fetch(`${API}/produits/99`);
console.log(decrire(absent), (await absent.json()).erreur); // 'ressource introuvable' 'produit 99 introuvable'

const sansFormat = await fetch(`${API}/produits`, { method: 'POST', body: JSON.stringify({ nom: 'Écran' }) });
console.log(sansFormat.status); // 415 : sans Content-Type, le corps part en text/plain

const invalide = await fetch(`${API}/produits`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prix: 199 }),
});
console.log(invalide.status, await invalide.json()); // 422 { erreur: 'nom requis' }

const anonyme = await fetch(`${API}/profil`);
console.log(decrire(anonyme), anonyme.headers.get('www-authenticate')); // 'authentification requise' 'Bearer'

console.log(JSON.stringify({ date: new Date(0), inconnu: undefined, total: NaN }));
// '{"date":"1970-01-01T00:00:00.000Z","total":null}'
```

## Comment ça fonctionne

Le premier chiffre du statut suffit à orienter le traitement. Un `2xx` signale un succès ; un `4xx` indique que
la **requête** doit changer — la réessayer telle quelle ne sert à rien ; un `5xx` indique un problème du **serveur**,
souvent temporaire, qu'une nouvelle tentative peut résoudre. `response.ok` vaut `true` pour tout statut de 200 à 299.

Certains codes se confondent facilement. `401 Unauthorized` signifie en réalité « non **authentifié** » : le serveur
ne sait pas qui fait la demande, et l'en-tête `WWW-Authenticate` indique comment s'identifier. `403 Forbidden`
signifie « authentifié, mais pas autorisé ». `400` signale une requête mal formée — JSON illisible —, alors que
`422` signale des données bien formées mais invalides — un champ obligatoire manquant. `409 Conflict` indique un
conflit avec l'état actuel, comme un email déjà utilisé. `429` demande de ralentir, souvent avec `Retry-After`.

Les **en-têtes** ne sont pas sensibles à la casse : `response.headers.get('content-type')` fonctionne quelle que soit
l'écriture du serveur. `Content-Type` décrit le corps **envoyé** : sans lui, une chaîne JSON part en `text/plain`, et
une API stricte répond `415`. `Accept` décrit ce que le client veut **recevoir**. Côté réponse, `Location` accompagne
un `201` avec l'adresse de la ressource créée, et `Cache-Control` indique combien de temps une réponse peut être
réutilisée sans redemander.

**JSON** est un sous-ensemble strict de la syntaxe des objets JavaScript : clés et chaînes entre guillemets doubles,
pas de virgule finale, pas de commentaire. `JSON.stringify` applique des conversions silencieuses qu'il faut
connaître : une `Date` devient une chaîne ISO, qu'il faudra reconvertir à la lecture ; `undefined` et les fonctions
disparaissent des objets ; `NaN` et `Infinity` deviennent `null` ; une `Map` devient `{}`. Les grands entiers au-delà
de `Number.MAX_SAFE_INTEGER` perdent en précision, ce qui explique que beaucoup d'API envoient les identifiants sous
forme de chaînes.

Enfin, un corps d'erreur utile suit une forme stable — un code lisible par programme et un message —, ce qui permet
au client d'afficher un retour précis au lieu d'un message générique.

## Erreurs fréquentes

**Traiter tout statut autre que 200 comme une panne.** `201` et `204` sont des succès : teste `response.ok`.

**Confondre `401` et `403`.** L'un demande de s'authentifier, l'autre signale un manque de droits.

**Oublier `Content-Type: application/json`.** Le corps part en texte brut.

**Réessayer une requête qui a reçu un `4xx`.** Elle échouera de la même façon.

**Relire une date JSON comme un objet `Date`.** C'est une chaîne : convertis-la.

## À retenir

- `2xx` succès, `4xx` erreur du client, `5xx` erreur du serveur ; `response.ok` couvre 200 à 299.
- `401` : non authentifié ; `403` : non autorisé ; `422` : données invalides ; `429` : trop de requêtes.
- `Content-Type` décrit le corps envoyé, `Accept` ce qu'on veut recevoir.
- `Location`, `Cache-Control` et `Retry-After` guident le client.
- JSON perd les `undefined`, convertit les dates en chaînes et `NaN` en `null`.

## Exercices

1. Écris `messageUtilisateur(statut)` qui renvoie un message adapté pour 400 et 422 (« Vérifiez les informations
   saisies »), 401 (« Veuillez vous connecter »), 403 (« Vous n'avez pas accès à cette page »), 404, 429, toute erreur
   5xx (« Service momentanément indisponible »), et un message générique sinon.

   :::indice
   Traite d'abord la famille 5xx avec une comparaison, puis les codes précis avec un objet de correspondance.
   :::

   :::solution
   ```js
   const MESSAGES = {
     400: 'Vérifiez les informations saisies',
     401: 'Veuillez vous connecter',
     403: "Vous n'avez pas accès à cette page",
     404: 'Cette page est introuvable',
     422: 'Vérifiez les informations saisies',
     429: 'Trop de tentatives, réessayez dans un instant',
   };

   function messageUtilisateur(statut) {
     if (statut >= 500) return 'Service momentanément indisponible';
     return MESSAGES[statut] ?? 'Une erreur est survenue';
   }

   console.log([401, 422, 503, 418].map(messageUtilisateur));
   // ['Veuillez vous connecter', 'Vérifiez les informations saisies', 'Service momentanément indisponible', 'Une erreur est survenue']
   ```
   :::

2. Une API renvoie `{"id":7,"creeLe":"2026-09-17T10:00:00.000Z"}`. Écris `lireCommande(texte)` qui analyse ce JSON
   en transformant automatiquement toute propriété dont le nom finit par `Le` en objet `Date`.

   :::indice
   `JSON.parse` accepte un second argument, une fonction appelée pour chaque paire clé-valeur.
   :::

   :::solution
   ```js
   function lireCommande(texte) {
     return JSON.parse(texte, (cle, valeur) =>
       cle.endsWith('Le') && typeof valeur === 'string' ? new Date(valeur) : valeur,
     );
   }

   const commande = lireCommande('{"id":7,"creeLe":"2026-09-17T10:00:00.000Z"}');
   console.log(commande.creeLe instanceof Date, commande.creeLe.getUTCFullYear()); // true 2026
   ```

   Sans cette conversion, `commande.creeLe` serait une chaîne, et un calcul comme `creeLe.getTime()` échouerait.
   :::

3. Écris `lireErreur(reponse)` qui renvoie le message d'une réponse en échec : le champ `erreur` si le corps est du
   JSON, sinon un message générique qui cite le statut — certaines erreurs `502` sont des pages HTML renvoyées par un
   serveur intermédiaire.

   :::indice
   Lis l'en-tête `Content-Type` avant d'appeler `json()`, et protège l'analyse.
   :::

   :::solution
   ```js
   async function lireErreur(reponse) {
     const type = reponse.headers.get('content-type') ?? '';
     if (type.includes('application/json')) {
       try {
         const corps = await reponse.json();
         if (corps.erreur) return corps.erreur;
       } catch {
         // corps annoncé en JSON mais illisible : on passe au message générique
       }
     }
     return `Erreur ${reponse.status}`;
   }

   const erreurJSON = new Response(JSON.stringify({ erreur: 'nom requis' }), {
     status: 422,
     headers: { 'Content-Type': 'application/json' },
   });
   const pageHTML = new Response('<h1>Bad Gateway</h1>', { status: 502, headers: { 'Content-Type': 'text/html' } });

   console.log(await lireErreur(erreurJSON), await lireErreur(pageHTML)); // 'nom requis' 'Erreur 502'
   ```
   :::

## Questions d'entretien

- Quelle différence entre `401` et `403` ?

  :::indice
  Le serveur sait-il qui fait la demande ?
  :::

  :::reponse
  `401` signifie que la requête n'est pas authentifiée : le serveur ne sait pas qui la fait, ou l'identification est
  invalide, et l'en-tête `WWW-Authenticate` indique comment s'authentifier. `403` signifie que le serveur sait qui fait
  la demande, mais que cette identité n'a pas le droit d'accéder à la ressource ; se reconnecter n'y changera rien. Côté
  interface, le premier mène à l'écran de connexion, le second à un message d'accès refusé.
  :::

- À quoi servent `Content-Type` et `Accept` ?

  :::indice
  L'un concerne ce qu'on envoie, l'autre ce qu'on attend.
  :::

  :::reponse
  `Content-Type` décrit le format du corps du message qui le contient : sur une requête, le format envoyé au serveur ;
  sur une réponse, le format renvoyé. `Accept` est envoyé par le client pour indiquer les formats qu'il sait traiter en
  réponse. Un serveur peut refuser un corps dans un format inattendu avec `415`, et répondre `406` s'il ne peut produire
  aucun des formats acceptés.
  :::

- Quelles données JSON ne peut-il pas représenter fidèlement ?

  :::indice
  Pense aux dates, à `undefined`, aux collections et aux très grands nombres.
  :::

  :::reponse
  Les dates deviennent des chaînes ISO, qu'il faut reconvertir ; `undefined` et les fonctions disparaissent des objets
  et deviennent `null` dans les tableaux ; `NaN` et `Infinity` deviennent `null` ; `Map` et `Set` deviennent des objets
  vides ; les entiers au-delà de `Number.MAX_SAFE_INTEGER` perdent en précision, et `BigInt` lève même une erreur. On
  convertit explicitement ces valeurs, et l'on transmet les grands identifiants sous forme de chaînes.
  :::
