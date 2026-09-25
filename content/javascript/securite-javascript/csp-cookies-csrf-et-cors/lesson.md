---
id: javascript-csp-cookies-csrf-et-cors
title: "CSP, cookies sécurisés, CSRF et configuration de CORS"
slug: csp-cookies-csrf-et-cors
technology: javascript
level: advanced
module: securite-javascript
order: 2
estimatedMinutes: 50
difficulty: 4
xp: 110
prerequisites:
  - javascript-xss-et-encodage-de-sortie
  - javascript-serveur-http
skills:
  - js-csp-cookies-csrf
tags:
  - javascript
  - securite
  - http
---

## Objectifs

- Écrire une politique de sécurité du contenu, CSP, qui bloque les scripts injectés, avec des *nonces*.
- Poser un cookie de session avec les bons attributs : `HttpOnly`, `Secure`, `SameSite`, préfixe `__Host-`.
- Expliquer une attaque CSRF, et la bloquer : `SameSite`, vérification de l'origine, jeton anti-CSRF.
- Configurer CORS sans ouvrir de brèche, et savoir ce que CORS ne protège pas.

## Introduction

Le chapitre précédent traitait la cause des XSS : un mélange entre données et code. Celui-ci ajoute des protections
que le **navigateur** applique quand le serveur les demande, par des en-têtes HTTP. Elles ne remplacent pas un code sûr,
elles limitent les dégâts quand une erreur passe : c'est la défense en profondeur.

On y traite aussi une attaque différente, la **CSRF**, *cross-site request forgery*, où un site malveillant fait
envoyer par le navigateur de la victime une requête vers votre application, cookies compris. Et l'on revient sur CORS,
vu dans la partie HTTP, cette fois sous l'angle de la sécurité : ce qu'il faut ne jamais configurer.

## Concept

| Directive CSP | Rôle |
| --- | --- |
| `default-src 'self'` | par défaut, ressources de la même origine uniquement |
| `script-src 'self' 'nonce-…'` | scripts de la même origine, ou portant le *nonce* de la réponse ; bloque les scripts en ligne et les attributs `on…` |
| `object-src 'none'` | aucun plugin |
| `base-uri 'none'` | empêche une balise `<base>` injectée de détourner les URL relatives |
| `frame-ancestors 'none'` | interdit d'afficher la page dans un cadre : protège du *clickjacking* |
| `Content-Security-Policy-Report-Only` | le même en-tête, qui signale sans bloquer : pour déployer progressivement |

| Attribut de cookie | Effet |
| --- | --- |
| `HttpOnly` | illisible par JavaScript : une XSS ne peut pas voler la session |
| `Secure` | envoyé seulement en HTTPS |
| `SameSite=Lax` | pas envoyé par les requêtes intersites, sauf une navigation `GET` de premier niveau |
| `SameSite=Strict` | jamais envoyé depuis un autre site, même en suivant un lien |
| `SameSite=None` | toujours envoyé ; exige `Secure` ; pour les usages intersites voulus |
| préfixe `__Host-` | exige `Secure`, `Path=/` et aucun `Domain` : le cookie ne peut pas être écrasé depuis un sous-domaine |

| Défense CSRF | Principe |
| --- | --- |
| cookie `SameSite=Lax` ou `Strict` | le navigateur n'envoie pas la session avec une requête intersite |
| vérifier `Origin`, ou `Sec-Fetch-Site` | refuser une requête qui modifie l'état venant d'une autre origine |
| jeton anti-CSRF | une valeur secrète, liée à la session, que le site pirate ne peut pas connaître |
| pas d'effet de bord en `GET` | une image ou un lien ne peuvent déclencher qu'un `GET` |

## Exemple

Un serveur Node sert une page, ouvre une session et accepte un virement. Chaque réponse porte une CSP avec un *nonce*
aléatoire ; le cookie de session est protégé ; les requêtes qui modifient l'état doivent venir de la même origine.

```js
// serveur-securise.mjs
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';

const ORIGINE = 'http://localhost:4600'; // en production : https://banque.exemple
const sessions = new Map();

function entetesDeSecurite(nonce) {
  return {
    'content-security-policy': [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  };
}

function lireCookie(requete, nom) {
  const paire = (requete.headers.cookie ?? '').split('; ').find((c) => c.startsWith(`${nom}=`));
  return paire?.slice(nom.length + 1);
}

createServer((requete, reponse) => {
  const nonce = randomBytes(16).toString('base64');
  const entetes = entetesDeSecurite(nonce);

  // CSRF : une requête qui modifie l'état doit venir de notre origine.
  if (!['GET', 'HEAD'].includes(requete.method) && requete.headers.origin !== ORIGINE) {
    reponse.writeHead(403, entetes).end('Origine refusée');
    return;
  }

  if (requete.method === 'POST' && requete.url === '/connexion') {
    const id = randomBytes(32).toString('base64url');
    sessions.set(id, { utilisateur: 'ana' });
    // En production, en HTTPS : '__Host-session=…; Path=/; Secure; HttpOnly; SameSite=Lax'
    reponse.writeHead(204, { ...entetes, 'set-cookie': `session=${id}; Path=/; HttpOnly; SameSite=Lax` }).end();
    return;
  }

  if (requete.method === 'POST' && requete.url === '/virement') {
    const session = sessions.get(lireCookie(requete, 'session'));
    if (!session) return void reponse.writeHead(401, entetes).end('Non connecté');
    reponse.writeHead(200, entetes).end(`Virement accepté pour ${session.utilisateur}`);
    return;
  }

  reponse.writeHead(200, { ...entetes, 'content-type': 'text/html; charset=utf-8' });
  reponse.end(`<!doctype html>
<p id="etat">en attente</p>
<script nonce="${nonce}">document.querySelector('#etat').textContent = 'script autorisé exécuté';</script>
<script>document.body.append(' / script en ligne sans nonce exécuté');</script>
<img src="x" onerror="document.body.append(' / attribut onerror exécuté')">`);
}).listen(4600);
```

Dans Chromium, la page affiche « script autorisé exécuté » et rien d'autre : le script sans *nonce* et l'attribut
`onerror`, qui simulent une injection, sont bloqués par la CSP, et la console signale chaque violation. Côté CSRF :

```js
const base = 'http://localhost:4600';

const connexion = await fetch(`${base}/connexion`, { method: 'POST', headers: { origin: base } });
const cookie = connexion.headers.get('set-cookie').split(';')[0];
console.log(connexion.headers.get('set-cookie').replace(/=[^;]+/, '=…'));
// session=…; Path=/; HttpOnly; SameSite=Lax

const legitime = await fetch(`${base}/virement`, { method: 'POST', headers: { origin: base, cookie } });
console.log(legitime.status, await legitime.text()); // 200 Virement accepté pour ana

const pirate = await fetch(`${base}/virement`, { method: 'POST', headers: { origin: 'https://pirate.exemple', cookie } });
console.log(pirate.status, await pirate.text()); // 403 Origine refusée
```

## Comment ça fonctionne

**CSP : n'exécuter que les scripts voulus.** Une XSS a besoin que le navigateur exécute du code injecté : une balise
`<script>` en ligne, un attribut `onerror`, un `eval`. Une CSP qui n'autorise que les fichiers de la même origine et
les scripts portant un *nonce* bloque tout cela. Le *nonce* est une valeur aléatoire, **différente à chaque réponse** :
l'attaquant, qui injecte son code sans connaître la valeur du jour, ne peut pas l'ajouter. Une CSP rend aussi `eval` et
`new Function` impossibles, sauf `'unsafe-eval'`, qu'on évite. On déploie d'abord la politique avec
`Content-Security-Policy-Report-Only`, on corrige ce qu'elle signale, puis on l'active. Écrire `'unsafe-inline'` dans
`script-src` annule l'essentiel de la protection.

**Les cookies, gardiens de la session.** Un cookie de session est une clé : quiconque le possède est l'utilisateur.
`HttpOnly` le rend invisible à `document.cookie`, donc à une XSS. `Secure` l'empêche de circuler en clair. `SameSite`
contrôle son envoi avec les requêtes venant d'autres sites, la base de la défense contre la CSRF. Le préfixe `__Host-`
garantit qu'un sous-domaine compromis ne peut pas le remplacer. On évite l'attribut `Domain`, qui élargit le cookie à
tous les sous-domaines.

**La CSRF.** Ana est connectée à sa banque. Elle visite un site piégé qui contient un formulaire invisible, envoyé
automatiquement en `POST` vers `https://banque.exemple/virement`. Sans protection, le navigateur joint le cookie de
session, et la banque croit à une demande d'Ana. Le site pirate ne **lit** jamais la réponse, la politique de même
origine l'en empêche, mais il n'en a pas besoin : l'action a eu lieu.

**Les défenses contre la CSRF.** `SameSite=Lax`, la valeur par défaut de Chrome pour un cookie sans attribut, empêche
l'envoi du cookie avec ce `POST` intersite ; on la déclare explicitement, car tous les navigateurs n'appliquent pas ce
défaut. En complément, le serveur vérifie l'en-tête `Origin`, que le navigateur ajoute aux requêtes `POST` et que le
site pirate ne peut pas falsifier ; l'en-tête `Sec-Fetch-Site: cross-site` donne la même information. Les applications
qui doivent accepter des requêtes intersites, ou soutenir d'anciens navigateurs, ajoutent un **jeton anti-CSRF** :
une valeur aléatoire liée à la session, incluse dans chaque formulaire ou en-tête, et vérifiée par le serveur. Enfin,
une requête `GET` ne doit jamais modifier l'état : une simple image `<img src="/supprimer?id=3">` suffirait sinon.

**CORS n'est pas une protection contre la CSRF.** CORS **assouplit** la politique de même origine, pour autoriser
certains sites à **lire** vos réponses. Il n'empêche pas l'envoi des requêtes : un formulaire `POST` intersite part sans
pré-vérification. Les erreurs de configuration, elles, ouvrent de vraies brèches : renvoyer l'en-tête `Origin` reçu dans
`Access-Control-Allow-Origin` avec `Access-Control-Allow-Credentials: true` permet à **n'importe quel** site de lire les
données privées de vos utilisateurs connectés ; accepter l'origine `null`, envoyée par des documents en bac à sable, a
le même effet. On compare l'origine à une liste blanche exacte.

**Les autres en-têtes utiles.** `X-Content-Type-Options: nosniff` interdit au navigateur de deviner un type de fichier
et d'exécuter comme script un fichier servi comme texte. `Strict-Transport-Security` impose HTTPS pour les visites
suivantes. `Referrer-Policy` limite les informations envoyées aux autres sites. Des bibliothèques comme Helmet, pour
Express et Fastify, posent ces en-têtes avec des valeurs sûres.

## Erreurs fréquentes

**Une CSP avec `'unsafe-inline'` dans `script-src`.** Les scripts injectés en ligne s'exécutent ; utilise des *nonces*.

**Un *nonce* fixe.** S'il ne change pas à chaque réponse, l'attaquant finit par le connaître.

**Un cookie de session sans `HttpOnly`.** Une XSS le lit et l'exfiltre.

**Compter sur le défaut de `SameSite`.** Déclare-le : les navigateurs n'ont pas tous le même comportement.

**Modifier l'état avec une requête `GET`.** Un lien ou une image suffit alors à déclencher l'action.

**Refléter l'origine dans `Access-Control-Allow-Origin` avec les identifiants.** Tout site peut lire les données
privées ; compare à une liste blanche.

**Croire que CORS protège de la CSRF.** CORS contrôle la lecture des réponses, pas l'envoi des requêtes.

## À retenir

- CSP : `script-src 'self' 'nonce-…'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'` ; un *nonce*
  aléatoire par réponse ; `Report-Only` pour déployer.
- Cookie de session : `HttpOnly`, `Secure`, `SameSite=Lax` ou `Strict`, préfixe `__Host-`, sans `Domain`.
- CSRF : `SameSite`, vérification de `Origin`, jeton anti-CSRF si nécessaire, aucun effet de bord en `GET`.
- CORS autorise la lecture intersite ; mal configuré, il expose les données ; il ne bloque pas la CSRF.
- Les en-têtes de sécurité limitent l'impact d'une faille, ils ne remplacent pas un code sûr.

## Exercices

1. Critique cette politique et propose une version sûre pour une application qui charge ses scripts depuis sa propre
   origine et un seul script en ligne d'initialisation.

   ```text
   Content-Security-Policy: default-src *; script-src * 'unsafe-inline' 'unsafe-eval'
   ```

   :::indice
   Que bloque réellement cette politique ? Remplace chaque joker par ce dont l'application a besoin.
   :::

   :::solution
   Elle ne bloque presque rien : `*` autorise des scripts de n'importe quel domaine, `'unsafe-inline'` autorise les
   scripts et attributs injectés, `'unsafe-eval'` autorise `eval`. Une XSS s'exécute comme sans CSP. Version sûre :

   ```text
   Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-R4nd0mParReponse'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'
   ```

   Le script d'initialisation reçoit l'attribut `nonce` avec la valeur générée pour cette réponse ; les autres scripts
   sont des fichiers de la même origine. Si la page doit charger des images d'un CDN, on ajoute précisément
   `img-src 'self' https://cdn.exemple`, plutôt qu'un joker. On déploie d'abord en `Report-Only`.
   :::

2. Écris `verifierOrigine(requete, originesAutorisees)`, qui renvoie `true` pour les méthodes sans effet de bord, et,
   pour les autres, n'accepte que les requêtes dont l'en-tête `Origin` figure dans la liste. Si `Origin` est absent, elle
   consulte `Sec-Fetch-Site` et n'accepte que `same-origin` ; si les deux manquent, elle refuse. Teste les cas.

   :::indice
   Une liste des méthodes sûres, puis trois cas selon les en-têtes présents.
   :::

   :::solution
   ```js
   const METHODES_SURES = new Set(['GET', 'HEAD', 'OPTIONS']);

   function verifierOrigine(requete, originesAutorisees) {
     if (METHODES_SURES.has(requete.method)) return true;
     const { origin, 'sec-fetch-site': site } = requete.headers;
     if (origin) return originesAutorisees.includes(origin);
     if (site) return site === 'same-origin';
     return false;
   }

   const autorisees = ['https://atelier.exemple'];
   const cas = [
     { method: 'GET', headers: {} },
     { method: 'POST', headers: { origin: 'https://atelier.exemple' } },
     { method: 'POST', headers: { origin: 'https://atelier.exemple.pirate.io' } },
     { method: 'DELETE', headers: { 'sec-fetch-site': 'cross-site' } },
     { method: 'POST', headers: { 'sec-fetch-site': 'same-origin' } },
     { method: 'POST', headers: {} },
   ];
   console.log(cas.map((requete) => verifierOrigine(requete, autorisees)));
   // [ true, true, false, false, true, false ]
   ```

   La comparaison est exacte : `https://atelier.exemple.pirate.io` commence comme l'origine autorisée, mais n'est pas
   elle ; un `startsWith` ou une expression régulière mal ancrée laisserait passer ce domaine. Refuser quand les deux
   en-têtes manquent est prudent pour un navigateur ; une API appelée par d'autres serveurs, sans cookies, s'authentifie
   autrement, par un jeton dans `Authorization`.
   :::

3. Ce middleware CORS a été écrit pour « débloquer » une application mobile hybride. Explique l'attaque qu'il rend
   possible sur une API authentifiée par cookie, puis corrige-le.

   ```js
   function cors(requete, reponse) {
     reponse.setHeader('access-control-allow-origin', requete.headers.origin ?? '*');
     reponse.setHeader('access-control-allow-credentials', 'true');
   }
   ```

   :::indice
   Quel site peut désormais lire la réponse d'un `fetch` avec `credentials: 'include'` ?
   :::

   :::solution
   Il renvoie à chaque site l'origine qu'il annonce, avec l'autorisation d'envoyer les cookies. Un site pirate visité par
   un utilisateur connecté exécute `fetch('https://api.atelier.exemple/moi', { credentials: 'include' })` : le navigateur
   joint le cookie, l'API répond, et CORS autorise le site pirate à **lire** la réponse, avec les données personnelles.
   Correction : une liste blanche exacte, et l'en-tête `Vary: Origin` pour que les caches ne mélangent pas les réponses.

   ```js
   const ORIGINES_AUTORISEES = new Set(['https://atelier.exemple', 'capacitor://localhost']);

   function cors(requete, reponse) {
     const origine = requete.headers.origin;
     reponse.setHeader('vary', 'Origin');
     if (origine && ORIGINES_AUTORISEES.has(origine)) {
       reponse.setHeader('access-control-allow-origin', origine);
       reponse.setHeader('access-control-allow-credentials', 'true');
     }
   }

   const entetes = {};
   const reponse = { setHeader: (nom, valeur) => (entetes[nom] = valeur) };
   cors({ headers: { origin: 'https://pirate.exemple' } }, reponse);
   console.log(entetes); // { vary: 'Origin' }
   cors({ headers: { origin: 'https://atelier.exemple' } }, reponse);
   console.log(entetes['access-control-allow-origin']); // https://atelier.exemple
   ```

   L'origine de l'application hybride est ajoutée explicitement, au lieu d'ouvrir l'API à tous.
   :::

## Questions d'entretien

- Qu'est-ce qu'une CSP, et comment protège-t-elle contre les XSS ?

  :::indice
  Qui décide des scripts autorisés, et qu'est-ce qu'un *nonce* ?
  :::

  :::reponse
  C'est un en-tête HTTP par lequel le serveur indique au navigateur quelles ressources la page peut charger et
  exécuter. Une politique stricte, `script-src 'self' 'nonce-…'`, n'autorise que les scripts de la même origine et ceux
  qui portent un *nonce* aléatoire, régénéré à chaque réponse ; elle bloque les scripts en ligne injectés, les attributs
  d'événement et `eval`. C'est une défense en profondeur : elle empêche l'exploitation d'une injection qui aurait échappé
  au code, mais ne remplace pas l'encodage de sortie. On la déploie d'abord en mode `Report-Only`.
  :::

- Explique une attaque CSRF et les moyens de s'en protéger.

  :::indice
  Un cookie envoyé automatiquement, une requête que la victime n'a pas voulue.
  :::

  :::reponse
  Un site malveillant fait envoyer par le navigateur de la victime une requête qui modifie l'état sur un site où elle est
  connectée, par exemple un formulaire `POST` caché. Le navigateur joint les cookies, et le serveur croit à une action
  légitime. Protections : des cookies de session `SameSite=Lax` ou `Strict` ; la vérification de l'en-tête `Origin` ou
  `Sec-Fetch-Site` pour les requêtes qui modifient l'état ; un jeton anti-CSRF lié à la session quand c'est nécessaire ;
  et aucune modification d'état en `GET`. Une authentification par jeton dans l'en-tête `Authorization` n'est pas exposée
  à la CSRF, mais le jeton doit alors être protégé des XSS.
  :::

- Quels attributs donnes-tu à un cookie de session ?

  :::indice
  Quatre attributs et un préfixe.
  :::

  :::reponse
  `HttpOnly`, pour qu'aucun script ne puisse le lire, même en cas de XSS ; `Secure`, pour qu'il ne circule qu'en HTTPS ;
  `SameSite=Lax`, ou `Strict` si le site n'a pas besoin de garder la session en arrivant depuis un lien externe, contre la
  CSRF ; `Path=/` et aucun `Domain`, pour ne pas l'étendre aux sous-domaines, avec le préfixe `__Host-` qui garantit ces
  conditions. Une durée de vie limitée, et une valeur aléatoire longue, générée par un générateur cryptographique,
  complètent le tout.
  :::
