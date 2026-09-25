---
id: javascript-serveur-http
title: "Un serveur HTTP avec node:http"
slug: serveur-http
technology: javascript
level: advanced
module: api-nodejs
order: 4
estimatedMinutes: 50
difficulty: 4
xp: 100
prerequisites:
  - javascript-evenements-flux-et-buffers
  - javascript-process-et-environnement
  - javascript-http-codes
skills:
  - js-node-http-server
tags:
  - javascript
  - nodejs
  - http
---

## Objectifs

- Créer un serveur avec `node:http`, lire une requête et construire une réponse.
- Router selon la méthode et le chemin, avec les bons statuts : 404, 405, 415, 413, 500.
- Lire un corps JSON en flux, avec une limite de taille, et le valider.
- Renvoyer un fichier en flux, et ne jamais divulguer d'information interne dans une erreur.
- Tester un serveur avec `fetch`, et savoir ce qu'apporte un framework comme Express ou Fastify.

## Introduction

La partie sur HTTP vous a appris à envoyer des requêtes depuis le navigateur. Passons de l'autre côté : les
recevoir. Node sait le faire sans aucune dépendance, avec le module `node:http`. En pratique, on écrit la plupart des
API avec un framework, mais un framework ne fait qu'organiser ce que fait `node:http` : lire la requête, choisir le
code à exécuter, écrire la réponse. Savoir le faire à la main, c'est comprendre ce que fait le framework, et
reconnaître ses erreurs.

## Concept

| La requête, `IncomingMessage` | |
| --- | --- |
| `requete.method` | `'GET'`, `'POST'`… |
| `requete.url` | le chemin et la chaîne de requête : `'/taches?fait=true'` |
| `requete.headers` | un objet, clés **en minuscules** : `requete.headers['content-type']` |
| le corps | un flux lisible : on le lit avec `for await` |

| La réponse, `ServerResponse` | |
| --- | --- |
| `reponse.statusCode = 201` | le statut, 200 par défaut |
| `reponse.setHeader(nom, valeur)` | un en-tête, avant d'écrire le corps |
| `reponse.writeHead(statut, entetes)` | les deux d'un coup |
| `reponse.end(corps)` | écrit le corps et termine la réponse ; obligatoire |
| c'est un flux inscriptible | on peut y relier un fichier avec `pipeline` |

| Situation | Statut |
| --- | --- |
| ressource inconnue | 404 Not Found |
| méthode non prise en charge sur une ressource existante | 405 Method Not Allowed, avec l'en-tête `Allow` |
| corps qui n'est pas du JSON annoncé | 415 Unsupported Media Type |
| corps trop gros | 413 Content Too Large |
| JSON invalide, données invalides | 400 Bad Request |
| erreur inattendue | 500, sans détail interne dans la réponse |

## Exemple

Une API de tâches, sans dépendance :

```js
// api.mjs
import { createServer } from 'node:http';

class ErreurHttp extends Error {
  constructor(statut, message, entetes = {}) {
    super(message);
    this.statut = statut;
    this.entetes = entetes;
  }
}

function envoyerJson(reponse, statut, donnees, entetes = {}) {
  const corps = JSON.stringify(donnees);
  reponse.writeHead(statut, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(corps),
    ...entetes,
  });
  reponse.end(corps);
}

async function lireJson(requete, limite = 10_000) {
  if (!requete.headers['content-type']?.startsWith('application/json')) {
    throw new ErreurHttp(415, 'Le corps doit être du JSON');
  }
  const morceaux = [];
  let taille = 0;
  for await (const morceau of requete) {
    taille += morceau.length;
    if (taille > limite) throw new ErreurHttp(413, 'Corps trop volumineux');
    morceaux.push(morceau);
  }
  try {
    return JSON.parse(Buffer.concat(morceaux).toString('utf8'));
  } catch {
    throw new ErreurHttp(400, 'JSON invalide');
  }
}

export function creerApplication() {
  const taches = new Map();
  let prochainId = 1;

  const routes = {
    '/taches': {
      GET: () => [200, [...taches.values()]],
      POST: async (requete) => {
        const { titre } = await lireJson(requete);
        if (typeof titre !== 'string' || titre.trim() === '') {
          throw new ErreurHttp(400, 'Le titre est obligatoire');
        }
        const tache = { id: prochainId++, titre: titre.trim(), faite: false };
        taches.set(tache.id, tache);
        return [201, tache, { location: `/taches/${tache.id}` }];
      },
    },
  };

  return createServer(async (requete, reponse) => {
    try {
      const { pathname } = new URL(requete.url, 'http://localhost');
      const ressource = routes[pathname];
      if (!ressource) throw new ErreurHttp(404, 'Ressource introuvable');
      const action = ressource[requete.method];
      if (!action) {
        throw new ErreurHttp(405, 'Méthode non autorisée', { allow: Object.keys(ressource).join(', ') });
      }
      const [statut, donnees, entetes] = await action(requete);
      envoyerJson(reponse, statut, donnees, entetes);
    } catch (erreur) {
      if (erreur instanceof ErreurHttp) {
        envoyerJson(reponse, erreur.statut, { erreur: erreur.message }, erreur.entetes);
      } else {
        console.error(erreur); // le détail reste dans les journaux du serveur
        envoyerJson(reponse, 500, { erreur: 'Erreur interne' });
      }
    }
  });
}
```

On le teste en l'écoutant sur le port `0`, que le système remplace par un port libre :

```js
import { once } from 'node:events';
import { creerApplication } from './api.mjs';

const serveur = creerApplication().listen(0);
await once(serveur, 'listening');
const base = `http://localhost:${serveur.address().port}`;

const creation = await fetch(`${base}/taches`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ titre: '  Relire le chapitre  ' }),
});
console.log(creation.status, creation.headers.get('location'), await creation.json());
// 201 /taches/1 { id: 1, titre: 'Relire le chapitre', faite: false }

const liste = await fetch(`${base}/taches`);
console.log(liste.status, await liste.json());
// 200 [ { id: 1, titre: 'Relire le chapitre', faite: false } ]

const mauvaiseMethode = await fetch(`${base}/taches`, { method: 'DELETE' });
console.log(mauvaiseMethode.status, mauvaiseMethode.headers.get('allow'));
// 405 GET, POST

const texte = await fetch(`${base}/taches`, { method: 'POST', body: 'bonjour' });
console.log(texte.status); // 415

serveur.close();
```

## Comment ça fonctionne

**Un serveur est un `EventEmitter`.** `createServer(gestionnaire)` enregistre le gestionnaire sur l'événement
`request`. Pour chaque requête, Node l'appelle avec deux flux : la requête, lisible, et la réponse, inscriptible. Le
gestionnaire est asynchrone, mais Node n'attend pas sa promesse : c'est pourquoi on attrape **toutes** les erreurs
à l'intérieur, sinon une exception dans un `await` devient une promesse rejetée non gérée, qui arrête le processus.

**L'URL.** `requete.url` ne contient que le chemin et la chaîne de requête. `new URL(requete.url, 'http://localhost')`
la découpe proprement : `pathname`, `searchParams.get('fait')`. La base est fictive ; elle ne sert qu'à compléter
l'URL relative.

**Lire le corps.** Le corps arrive en flux, par morceaux de `Buffer`. On les accumule, on les assemble avec
`Buffer.concat`, puis on décode : assembler **avant** de décoder évite de couper un caractère en deux. Sans limite,
un client pourrait envoyer un corps de plusieurs gigaoctets et épuiser la mémoire du serveur : on compte les octets
reçus et on s'arrête avec un 413. On vérifie aussi le `content-type` annoncé, puis la **forme** des données : un JSON
valide n'est pas forcément une tâche valide. Dans une vraie application, un schéma zod valide le corps.

**Écrire la réponse.** On fixe le statut et les en-têtes avant le corps : une fois le premier octet du corps envoyé,
il est trop tard pour les changer. `content-type` dit au client comment lire le corps ; `content-length`, en
**octets**, permet au client de savoir quand il a tout reçu. `end` termine la réponse : l'oublier laisse le client
attendre jusqu'au délai d'expiration.

**Des erreurs qui ne divulguent rien.** Les erreurs prévues, comme `ErreurHttp`, deviennent des réponses avec leur
statut et un message destiné au client. Toute autre erreur est inattendue : on journalise le détail côté serveur,
mais on ne renvoie qu'un 500 générique. Une pile d'appels ou un message de la base de données renvoyé au client
révèle la structure interne de l'application à un attaquant.

**Renvoyer un fichier.** La réponse est un flux inscriptible : on y relie un fichier avec `pipeline`, sans le
charger en mémoire. Les en-têtes sont écrits au premier octet envoyé.

```js
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

async function envoyerFichier(reponse, chemin, type) {
  const { size } = await stat(chemin); // rejette avec ENOENT avant d'avoir rien écrit
  reponse.writeHead(200, { 'content-type': type, 'content-length': size });
  await pipeline(createReadStream(chemin), reponse);
}
```

**Ce qu'apporte un framework.** Express, Fastify ou Hono ajoutent un routeur avec paramètres (`/taches/:id`), des
*middlewares* pour les tâches transversales (journalisation, authentification, CORS, compression), la lecture du
corps, la validation, la gestion centralisée des erreurs et des tests facilités. Fastify valide et sérialise avec des
schémas JSON, et il est très rapide. Ils reposent tous sur `node:http`, ou sur les objets `Request` et `Response`
standard pour Hono : ce chapitre est leur fondation.

## Erreurs fréquentes

**Laisser une exception s'échapper du gestionnaire.** Un `await` qui rejette sans `try` arrête le serveur.

**Oublier `reponse.end()`.** Le client attend jusqu'à l'expiration du délai.

**Lire le corps sans limite de taille.** Un seul client peut épuiser la mémoire du serveur.

**Renvoyer `erreur.stack` ou un message SQL au client.** Journalise le détail, renvoie un message générique.

**Calculer `content-length` avec `texte.length`.** Il faut des octets : `Buffer.byteLength(texte)`.

**Renvoyer 404 pour une méthode non gérée.** Si la ressource existe, c'est un 405, avec l'en-tête `Allow`.

**Décoder chaque morceau du corps séparément.** Assemble les buffers, puis décode.

## À retenir

- `createServer((requete, reponse) => …)` : requête lisible, réponse inscriptible, en-têtes en minuscules.
- `new URL(requete.url, base)` pour le chemin et les paramètres.
- Corps : lire en flux, limiter la taille, vérifier le `content-type`, valider la forme.
- Statut et en-têtes avant le corps ; `content-length` en octets ; toujours `end`.
- Erreurs prévues : statut et message ; erreurs inattendues : 500 générique, détail dans les journaux.
- Tester avec `listen(0)` et `fetch` ; les frameworks ajoutent routage, middlewares et validation.

## Exercices

1. Ajoute à l'API la route `/taches/:id` : `GET` renvoie la tâche ou 404 ; `PATCH` accepte `{ faite: true|false }` et
   renvoie la tâche modifiée ; `DELETE` la supprime et renvoie 204 sans corps. Un identifiant qui n'est pas un entier
   donne 400.

   :::indice
   Une expression régulière sur le chemin, `/^\/taches\/([^/]+)$/`, avant la table des routes. Pour 204, `writeHead(204)`
   puis `end()`, sans corps ni `content-type`.
   :::

   :::solution
   On ajoute ce traitement dans le gestionnaire, avant la recherche dans `routes` :

   ```js
   const correspondance = pathname.match(/^\/taches\/([^/]+)$/);
   if (correspondance) {
     const id = Number(correspondance[1]);
     if (!Number.isInteger(id)) throw new ErreurHttp(400, 'Identifiant invalide');
     const tache = taches.get(id);
     if (!tache) throw new ErreurHttp(404, 'Tâche introuvable');

     if (requete.method === 'GET') return envoyerJson(reponse, 200, tache);
     if (requete.method === 'PATCH') {
       const { faite } = await lireJson(requete);
       if (typeof faite !== 'boolean') throw new ErreurHttp(400, '« faite » doit être un booléen');
       tache.faite = faite;
       return envoyerJson(reponse, 200, tache);
     }
     if (requete.method === 'DELETE') {
       taches.delete(id);
       reponse.writeHead(204);
       return reponse.end();
     }
     throw new ErreurHttp(405, 'Méthode non autorisée', { allow: 'GET, PATCH, DELETE' });
   }
   ```

   ```js
   // Vérification, avec le serveur modifié
   const creee = await (await fetch(`${base}/taches`, {
     method: 'POST',
     headers: { 'content-type': 'application/json' },
     body: JSON.stringify({ titre: 'Tester' }),
   })).json();

   const patch = await fetch(`${base}/taches/${creee.id}`, {
     method: 'PATCH',
     headers: { 'content-type': 'application/json' },
     body: JSON.stringify({ faite: true }),
   });
   console.log(patch.status, await patch.json()); // 200 { id: 1, titre: 'Tester', faite: true }
   console.log((await fetch(`${base}/taches/abc`)).status); // 400
   console.log((await fetch(`${base}/taches/${creee.id}`, { method: 'DELETE' })).status); // 204
   console.log((await fetch(`${base}/taches/${creee.id}`)).status); // 404
   ```
   :::

2. Pourquoi ce gestionnaire arrête-t-il tout le serveur quand la base de données est indisponible, au lieu de renvoyer
   une erreur 500 ? Corrige-le.

   ```js
   createServer(async (requete, reponse) => {
     const produits = await base.lireProduits();
     reponse.end(JSON.stringify(produits));
   });
   ```

   :::indice
   Que fait Node de la promesse renvoyée par le gestionnaire ?
   :::

   :::solution
   Node appelle le gestionnaire mais ignore la promesse qu'il renvoie. Si `lireProduits` rejette, la promesse du
   gestionnaire est rejetée sans que personne ne l'attrape : c'est une `unhandledRejection`, qui arrête le processus
   depuis Node 15. Tous les clients perdent le service, et la requête en cours ne reçoit jamais de réponse.

   ```js
   createServer(async (requete, reponse) => {
     try {
       const produits = await base.lireProduits();
       reponse.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
       reponse.end(JSON.stringify(produits));
     } catch (erreur) {
       console.error('Lecture des produits impossible', erreur);
       if (!reponse.headersSent) {
         reponse.writeHead(503, { 'content-type': 'application/json; charset=utf-8', 'retry-after': '30' });
       }
       reponse.end(JSON.stringify({ erreur: 'Service momentanément indisponible' }));
     }
   });
   ```

   Une base indisponible est une panne temporaire : 503, avec `retry-after`, est plus précis que 500. `headersSent`
   évite d'écrire des en-têtes une seconde fois si l'erreur survient pendant l'envoi.
   :::

3. Un client malveillant envoie à `POST /taches` un corps de 50 Mo. Que se passe-t-il avec la limite de 10 000 octets de
   `lireJson` ? Écris un test qui le vérifie, sans envoyer vraiment 50 Mo.

   :::indice
   Un corps juste au-dessus de la limite suffit. Vérifie le statut et que le serveur répond toujours ensuite.
   :::

   :::solution
   `lireJson` compte les octets au fil de l'arrivée des morceaux et lève une `ErreurHttp(413)` dès que la limite est
   dépassée : le serveur n'accumule jamais plus d'environ 10 Ko pour cette requête, et répond 413 sans attendre la fin
   de l'envoi.

   ```js
   import { once } from 'node:events';
   import { creerApplication } from './api.mjs';

   const serveur = creerApplication().listen(0);
   await once(serveur, 'listening');
   const base = `http://localhost:${serveur.address().port}`;

   const trop = JSON.stringify({ titre: 'x'.repeat(20_000) });
   const reponse = await fetch(`${base}/taches`, {
     method: 'POST',
     headers: { 'content-type': 'application/json' },
     body: trop,
   });
   console.log(reponse.status, await reponse.json()); // 413 { erreur: 'Corps trop volumineux' }

   const ensuite = await fetch(`${base}/taches`);
   console.log(ensuite.status); // 200 : le serveur fonctionne toujours

   serveur.close();
   ```

   Un reverse proxy comme Nginx applique en général une limite similaire en amont ; la vérifier aussi dans
   l'application protège contre une configuration qui change.
   :::

## Questions d'entretien

- Que fait un framework comme Express par rapport à `node:http` ?

  :::indice
  Routage, middlewares, corps, erreurs.
  :::

  :::reponse
  Il organise ce que `node:http` fournit à l'état brut. Il ajoute un routeur avec des paramètres de chemin, une chaîne
  de middlewares pour les préoccupations transversales comme la journalisation, l'authentification, CORS ou la
  compression, la lecture et l'analyse du corps avec des limites, et une gestion centralisée des erreurs. Fastify y
  ajoute la validation et la sérialisation par schémas. Sous le capot, chaque requête reste un `IncomingMessage` et une
  `ServerResponse` de `node:http` : comprendre le module permet de déboguer le framework.
  :::

- Comment lire en toute sécurité le corps JSON d'une requête ?

  :::indice
  Taille, type, syntaxe, forme.
  :::

  :::reponse
  Je vérifie que le `content-type` annonce du JSON, sinon 415. Je lis le corps en flux en comptant les octets, et
  j'arrête avec 413 au-delà d'une limite raisonnable, pour qu'un client ne puisse pas épuiser la mémoire.
  J'assemble les buffers avant de décoder en UTF-8. `JSON.parse` dans un `try`, avec 400 en cas d'échec. Enfin, je
  valide la forme des données avec un schéma : un JSON valide n'est pas forcément un objet attendu, et le reste du
  code ne doit recevoir que des données validées.
  :::

- Pourquoi ne pas renvoyer le message d'une erreur inattendue au client ?

  :::indice
  Qui lit ce message, et qu'y apprend-il ?
  :::

  :::reponse
  Une erreur inattendue contient souvent des détails internes : pile d'appels, chemins de fichiers, requêtes SQL,
  versions de bibliothèques. Pour un attaquant, ce sont des indices sur la structure de l'application et ses
  faiblesses. On sépare donc les erreurs prévues, dont le message est écrit pour le client, des erreurs inattendues :
  pour celles-ci, on journalise tout côté serveur, avec un identifiant de corrélation, et on renvoie un 500
  générique. Le client peut citer l'identifiant au support.
  :::
