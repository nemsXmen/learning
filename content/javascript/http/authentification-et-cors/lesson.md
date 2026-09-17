---
id: javascript-http-cors
title: "Authentification et CORS"
slug: authentification-et-cors
technology: javascript
level: advanced
module: http
order: 3
estimatedMinutes: 30
difficulty: 4
xp: 90
prerequisites:
  - javascript-http-codes
  - javascript-stockage
skills:
  - http-auth-cors
tags:
  - javascript
  - http
---

## Objectifs

- Distinguer l'authentification par cookie de session et par jeton dans l'en-tête `Authorization`.
- Expliquer la politique de même origine, et ce que CORS autorise.
- Comprendre la requête de pré-vérification, et pourquoi une erreur CORS se corrige côté serveur.

## Introduction

« Blocked by CORS policy » est l'un des messages d'erreur les plus recherchés par les développeurs web. Il apparaît
dès qu'une application appelle une API située sur un autre domaine, et pousse souvent à des contournements
dangereux. Il est étroitement lié à l'authentification : c'est précisément pour protéger les sessions des
utilisateurs que le navigateur impose ces règles. Comprendre les deux ensemble permet de configurer correctement un
front-end et son API.

## Concept

Deux façons de prouver son identité :

| Mécanisme | Transport | Envoi | Point d'attention |
| --- | --- | --- | --- |
| Cookie de session | cookie `HttpOnly`, `Secure`, `SameSite` | **automatique** par le navigateur | protection contre CSRF |
| Jeton porteur (*Bearer*) | en-tête `Authorization: Bearer <jeton>` | **explicite** par le code | stockage du jeton |

Une **origine** est la combinaison protocole, domaine et port : `https://app.exemple` et `https://api.exemple` sont
deux origines différentes. La **politique de même origine** empêche le JavaScript d'une page de **lire** la réponse
d'une requête vers une autre origine, sauf si le serveur l'autorise par des en-têtes **CORS** :

| En-tête de réponse | Rôle |
| --- | --- |
| `Access-Control-Allow-Origin` | origine autorisée à lire la réponse |
| `Access-Control-Allow-Methods` | méthodes autorisées, pour la pré-vérification |
| `Access-Control-Allow-Headers` | en-têtes autorisés, comme `Authorization` ou `Content-Type` |
| `Access-Control-Allow-Credentials` | autorise l'envoi de cookies, avec une origine précise |

Une requête qui n'est pas « simple » — méthode `PUT` ou `DELETE`, en-tête `Authorization`, `Content-Type` en JSON —
déclenche d'abord une **pré-vérification** : une requête `OPTIONS` à laquelle le serveur doit répondre avec ces en-têtes.

## Exemple

```js
import http from 'node:http';

const ORIGINE_AUTORISEE = 'https://app.boutique.exemple';

// Côté serveur : l'API déclare quelle origine peut lire ses réponses.
const serveur = http.createServer((requete, reponse) => {
  reponse.setHeader('Access-Control-Allow-Origin', ORIGINE_AUTORISEE);
  reponse.setHeader('Vary', 'Origin');
  if (requete.method === 'OPTIONS') {
    reponse.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '600',
    });
    return reponse.end();
  }
  if (requete.headers.authorization !== 'Bearer jeton-valide') {
    reponse.writeHead(401, { 'Content-Type': 'application/json' });
    return reponse.end(JSON.stringify({ erreur: 'authentification requise' }));
  }
  reponse.writeHead(200, { 'Content-Type': 'application/json' });
  reponse.end(JSON.stringify({ nom: 'Ada' }));
});
await new Promise((resolve) => serveur.listen(0, resolve));
const API = `http://localhost:${serveur.address().port}`;

// Ce qu'envoie le navigateur avant une requête DELETE avec en-tête Authorization :
const preverification = await fetch(`${API}/commandes/7`, {
  method: 'OPTIONS',
  headers: {
    Origin: ORIGINE_AUTORISEE,
    'Access-Control-Request-Method': 'DELETE',
    'Access-Control-Request-Headers': 'authorization',
  },
});
console.log(preverification.status, preverification.headers.get('access-control-allow-methods'));
// 204 'GET, POST, DELETE'

// La requête authentifiée elle-même, avec un jeton porteur :
const profil = await fetch(`${API}/profil`, { headers: { Authorization: 'Bearer jeton-valide' } });
console.log(profil.status, (await profil.json()).nom, profil.headers.get('access-control-allow-origin'));
// 200 'Ada' 'https://app.boutique.exemple'

serveur.close();
```

## Comment ça fonctionne

La **politique de même origine** est une protection du navigateur. Sans elle, une page malveillante visitée par un
utilisateur connecté à sa banque pourrait appeler l'API de la banque — le navigateur y joindrait les cookies de
session — et **lire** la réponse. Le navigateur envoie bien certaines requêtes vers d'autres origines, mais il refuse
de transmettre la réponse au JavaScript si le serveur ne l'a pas explicitement autorisé.

**CORS** est ce mécanisme d'autorisation. Le serveur indique, par `Access-Control-Allow-Origin`, quelle origine peut
lire ses réponses. Pour une requête **simple** — `GET`, `HEAD` ou `POST` avec un corps de formulaire, sans en-tête
particulier —, le navigateur envoie la requête puis vérifie l'en-tête de la réponse. Pour les autres — `PUT`, `DELETE`,
un corps JSON, un en-tête `Authorization` —, il envoie d'abord une requête `OPTIONS` de **pré-vérification** avec
`Origin`, la méthode et les en-têtes prévus ; la vraie requête ne part que si le serveur les autorise.
`Access-Control-Max-Age` permet au navigateur de mémoriser cette autorisation.

Une conséquence essentielle : **une erreur CORS se corrige côté serveur**. Le code du client ne peut pas s'octroyer
l'accès, et c'est voulu. Les contournements — désactiver la sécurité du navigateur, passer par un proxy public — ne
règlent rien en production. On configure l'API pour qu'elle autorise précisément l'origine du front-end, ou l'on sert
les deux sous la même origine. En développement, le serveur de développement du front-end sert souvent de proxy vers
l'API pour éviter la question. Enfin, CORS ne concerne que les navigateurs : `curl` ou un serveur Node.js n'appliquent
pas ces règles, ce qui explique qu'une requête « marche dans Postman » et échoue dans la page.

Pour l'**authentification**, un **cookie de session** est envoyé automatiquement par le navigateur. Avec une API sur
une autre origine, cela exige `fetch(…, { credentials: 'include' })` côté client, et côté serveur
`Access-Control-Allow-Credentials: true` avec une origine **précise** — le joker `*` est interdit dans ce cas. Cet envoi
automatique expose aux attaques **CSRF**, que l'attribut `SameSite` et des jetons anti-CSRF limitent. Un **jeton
porteur** dans `Authorization` n'est jamais envoyé automatiquement, ce qui protège de CSRF, mais le code doit le
stocker : dans une variable en mémoire plutôt que dans `localStorage`, exposé aux failles XSS.

## Erreurs fréquentes

**Chercher à corriger une erreur CORS dans le code du client.** Elle se règle dans les en-têtes du serveur.

**Répondre `Access-Control-Allow-Origin: *` avec des cookies.** Le navigateur le refuse : indique l'origine exacte.

**Oublier de répondre à la requête `OPTIONS`.** La vraie requête ne part jamais.

**Oublier `credentials: 'include'` pour une API sur une autre origine.** Les cookies ne sont pas envoyés.

**Stocker un jeton porteur dans `localStorage`.** Une faille XSS suffit à le voler.

## À retenir

- Origine : protocole, domaine et port ; le navigateur protège la lecture des réponses entre origines.
- CORS : le serveur autorise une origine avec `Access-Control-Allow-Origin` et les en-têtes associés.
- Les requêtes non simples sont précédées d'une pré-vérification `OPTIONS`.
- Une erreur CORS se corrige côté serveur ; CORS ne concerne que les navigateurs.
- Cookie de session : automatique, à protéger contre CSRF ; jeton porteur : explicite, à protéger contre XSS.

## Exercices

1. Un front-end servi sur `https://app.exemple` appelle `DELETE https://api.exemple/commandes/7` avec un en-tête
   `Authorization`. Décris les deux requêtes que le navigateur envoie, et les en-têtes que l'API doit renvoyer pour
   que la suppression aboutisse et que la réponse soit lisible.

   :::indice
   La méthode et l'en-tête rendent la requête « non simple » : quelle requête part en premier ?
   :::

   :::solution
   1. Une pré-vérification `OPTIONS /commandes/7` avec `Origin: https://app.exemple`,
      `Access-Control-Request-Method: DELETE` et `Access-Control-Request-Headers: authorization`. L'API doit répondre avec
      `Access-Control-Allow-Origin: https://app.exemple`, `Access-Control-Allow-Methods` contenant `DELETE`, et
      `Access-Control-Allow-Headers` contenant `Authorization`.
   2. La requête `DELETE /commandes/7`, avec l'en-tête `Authorization`. Sa réponse doit aussi contenir
      `Access-Control-Allow-Origin: https://app.exemple`, sinon le JavaScript ne pourra pas lire le résultat.

   Si la pré-vérification échoue, la suppression n'est jamais envoyée.
   :::

2. Écris `appliquerCors(requete, reponse, originesAutorisees)` pour un serveur Node.js : l'origine de la requête n'est
   autorisée que si elle figure dans la liste, la pré-vérification `OPTIONS` reçoit une réponse `204` complète, et la
   fonction renvoie `true` quand la requête a été entièrement traitée.

   :::indice
   Lis `requete.headers.origin`, renvoie cette origine exacte si elle est autorisée, et ajoute `Vary: Origin`, car la
   réponse dépend de l'origine.
   :::

   :::solution
   ```js
   function appliquerCors(requete, reponse, originesAutorisees) {
     const origine = requete.headers.origin;
     if (origine && originesAutorisees.includes(origine)) {
       reponse.setHeader('Access-Control-Allow-Origin', origine);
       reponse.setHeader('Access-Control-Allow-Credentials', 'true');
     }
     reponse.setHeader('Vary', 'Origin');

     if (requete.method === 'OPTIONS') {
       reponse.writeHead(204, {
         'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
         'Access-Control-Allow-Headers': 'Authorization, Content-Type',
       });
       reponse.end();
       return true;
     }
     return false;
   }

   function reponseFactice() {
     return {
       entetes: {},
       statut: 200,
       setHeader(nom, valeur) { this.entetes[nom] = valeur; },
       writeHead(statut, entetes) { this.statut = statut; Object.assign(this.entetes, entetes); },
       end() {},
     };
   }

   const autorisee = reponseFactice();
   appliquerCors({ method: 'OPTIONS', headers: { origin: 'https://app.exemple' } }, autorisee, ['https://app.exemple']);
   console.log(autorisee.statut, autorisee.entetes['Access-Control-Allow-Origin']); // 204 'https://app.exemple'

   const refusee = reponseFactice();
   appliquerCors({ method: 'GET', headers: { origin: 'https://pirate.exemple' } }, refusee, ['https://app.exemple']);
   console.log(refusee.entetes['Access-Control-Allow-Origin']); // undefined : le navigateur bloquera la lecture
   ```
   :::

3. Une application sur `https://app.exemple` utilise une session par cookie auprès de `https://api.exemple`. Le cookie
   n'est jamais envoyé. Écris l'appel `fetch` correct, puis liste ce que le serveur doit renvoyer et les attributs du
   cookie.

   :::indice
   Côté client, une option de `fetch` ; côté serveur, un en-tête qui autorise les identifiants et une origine précise.
   :::

   :::solution
   ```js
   const reponse = await fetch('https://api.exemple/profil', { credentials: 'include' });
   ```

   Côté serveur :

   - `Access-Control-Allow-Origin: https://app.exemple` — une origine précise, jamais `*` ;
   - `Access-Control-Allow-Credentials: true` ;
   - un cookie posé avec `HttpOnly; Secure; SameSite=None` s'il doit voyager entre deux sites différents, ou
     `SameSite=Lax` si l'API et l'application partagent le même site, par exemple deux sous-domaines de `exemple`.

   Avec `SameSite=None`, le cookie redevient exposé aux requêtes intersites : l'API doit alors se protéger contre CSRF,
   par exemple avec un jeton anti-CSRF.
   :::

## Questions d'entretien

- Qu'est-ce que CORS, et pourquoi existe-t-il ?

  :::indice
  Que pourrait faire une page malveillante avec les cookies d'un utilisateur, sans la politique de même origine ?
  :::

  :::reponse
  La politique de même origine empêche le JavaScript d'une page de lire les réponses d'une autre origine, pour qu'un
  site malveillant ne puisse pas lire les données d'un service où l'utilisateur est connecté. CORS est le mécanisme par
  lequel un serveur assouplit cette règle pour des origines précises, avec des en-têtes comme
  `Access-Control-Allow-Origin`. C'est le navigateur qui l'applique : une erreur CORS se corrige donc dans la
  configuration du serveur.
  :::

- Qu'est-ce qu'une requête de pré-vérification ?

  :::indice
  Quelle requête le navigateur envoie-t-il avant un `DELETE` vers une autre origine ?
  :::

  :::reponse
  C'est une requête `OPTIONS` envoyée automatiquement avant une requête « non simple » vers une autre origine — méthode
  comme `PUT` ou `DELETE`, en-tête comme `Authorization`, corps JSON. Elle annonce l'origine, la méthode et les en-têtes
  prévus, et la vraie requête ne part que si le serveur les autorise dans sa réponse. `Access-Control-Max-Age` permet de
  mettre ce résultat en cache pour éviter une pré-vérification à chaque appel.
  :::

- Cookie de session ou jeton porteur : quels risques pour chacun ?

  :::indice
  L'un est envoyé automatiquement, l'autre doit être stocké par le code.
  :::

  :::reponse
  Un cookie de session `HttpOnly` est hors de portée du JavaScript, donc protégé contre le vol par XSS, mais il est envoyé
  automatiquement, ce qui expose aux attaques CSRF : on les limite avec `SameSite` et des jetons anti-CSRF. Un jeton
  porteur n'est jamais envoyé automatiquement, donc sans risque CSRF, mais le code doit le conserver : s'il est accessible
  au JavaScript, une faille XSS permet de le voler. On le garde en mémoire, avec une durée de vie courte.
  :::
