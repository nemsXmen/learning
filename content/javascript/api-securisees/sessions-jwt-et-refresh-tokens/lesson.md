---
id: javascript-sessions-jwt-et-refresh-tokens
title: "Sessions, JWT et jetons de rafraîchissement"
slug: sessions-jwt-et-refresh-tokens
technology: javascript
level: advanced
module: api-securisees
order: 2
estimatedMinutes: 55
difficulty: 5
xp: 120
prerequisites:
  - javascript-mots-de-passe-et-authentification
  - javascript-csp-cookies-csrf-et-cors
skills:
  - js-sessions-jwt
tags:
  - javascript
  - securite
  - authentification
---

## Objectifs

- Maintenir une connexion avec une session côté serveur, et savoir la révoquer.
- Lire, signer et surtout **vérifier** correctement un JWT : algorithme, signature, expiration, émetteur, audience.
- Comparer sessions et JWT, et choisir selon le besoin.
- Combiner un jeton d'accès court et un jeton de rafraîchissement, avec rotation et détection de réutilisation.
- Choisir où conserver les jetons dans un navigateur.

## Introduction

HTTP est sans état : chaque requête arrive seule, et le serveur ne se souvient pas de la précédente. Après une connexion
réussie, il faut donc donner au client une preuve qu'il présentera à chaque requête. Deux grandes familles existent.

La **session** : le serveur crée un enregistrement, et remet au client un identifiant aléatoire, en général dans un
cookie. Le **jeton autoportant**, le plus souvent un JWT : le serveur remet un document signé qui contient lui-même
l'identité et les droits, et qu'il pourra vérifier sans rien stocker. Chacune a ses forces, et ses pièges.

## Concept

| | Session côté serveur | JWT autoportant |
| --- | --- | --- |
| le client détient | un identifiant aléatoire, opaque | un document signé, lisible par tous |
| le serveur stocke | la session : utilisateur, expiration | rien, ou une liste de révocation |
| vérification | une lecture dans le magasin de sessions | un calcul de signature |
| révocation | immédiate : on supprime la session | difficile : le jeton reste valide jusqu'à son expiration |
| transport habituel | cookie `HttpOnly` | en-tête `Authorization: Bearer …`, ou cookie |
| cas typique | application web avec son propre serveur | API consommée par plusieurs services, fédération d'identité |

| Partie d'un JWT | Contenu |
| --- | --- |
| en-tête | `{ "alg": "HS256", "typ": "JWT" }`, encodé en base64url |
| charge utile | des revendications, *claims* : `sub` (sujet), `exp` (expiration), `iat`, `iss` (émetteur), `aud` (audience), rôles |
| signature | HMAC ou signature asymétrique de l'en-tête et de la charge, avec la clé du serveur |

Un JWT est **signé, pas chiffré** : n'importe qui peut lire sa charge utile. On n'y met jamais de secret ni de donnée
personnelle sensible.

## Exemple

Une implémentation minimale de JWT signés en HS256, pour comprendre ce que fait une bibliothèque :

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

const b64url = (donnees) => Buffer.from(donnees).toString('base64url');
const lireJson = (partie) => JSON.parse(Buffer.from(partie, 'base64url').toString('utf8'));

function signer(charge, cle, { dureeSecondes = 900, emetteur, audience }) {
  const maintenant = Math.floor(Date.now() / 1000);
  const entete = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const corps = b64url(JSON.stringify({ ...charge, iat: maintenant, exp: maintenant + dureeSecondes, iss: emetteur, aud: audience }));
  const signature = createHmac('sha256', cle).update(`${entete}.${corps}`).digest('base64url');
  return `${entete}.${corps}.${signature}`;
}

function verifier(jeton, cle, { emetteur, audience, maintenant = Math.floor(Date.now() / 1000) }) {
  const parties = jeton.split('.');
  if (parties.length !== 3) throw new Error('Jeton mal formé');
  const [entete, corps, signature] = parties;

  if (lireJson(entete).alg !== 'HS256') throw new Error('Algorithme refusé'); // jamais celui que le jeton choisit
  const attendue = createHmac('sha256', cle).update(`${entete}.${corps}`).digest();
  const recue = Buffer.from(signature, 'base64url');
  if (recue.length !== attendue.length || !timingSafeEqual(recue, attendue)) throw new Error('Signature invalide');

  const charge = lireJson(corps);
  if (typeof charge.exp !== 'number' || charge.exp <= maintenant) throw new Error('Jeton expiré');
  if (charge.iss !== emetteur || charge.aud !== audience) throw new Error('Émetteur ou audience inattendus');
  return charge;
}

const CLE = 'une-cle-de-32-octets-aleatoires-au-moins!!';
const contexte = { emetteur: 'https://auth.atelier.exemple', audience: 'api-atelier' };
const jeton = signer({ sub: 'u1', role: 'client' }, CLE, contexte);

console.log(verifier(jeton, CLE, contexte).sub); // u1

// Un client modifie son rôle dans la charge utile :
const [e, c, s] = jeton.split('.');
const falsifie = `${e}.${b64url(JSON.stringify({ ...lireJson(c), role: 'admin' }))}.${s}`;
try {
  verifier(falsifie, CLE, contexte);
} catch (erreur) {
  console.log(erreur.message); // Signature invalide
}

// L'attaque « alg: none » : un jeton sans signature.
const sansSignature = `${b64url(JSON.stringify({ alg: 'none' }))}.${b64url(JSON.stringify({ ...lireJson(c), role: 'admin' }))}.`;
try {
  verifier(sansSignature, CLE, contexte);
} catch (erreur) {
  console.log(erreur.message); // Algorithme refusé
}

try {
  verifier(jeton, CLE, { ...contexte, maintenant: Math.floor(Date.now() / 1000) + 3600 });
} catch (erreur) {
  console.log(erreur.message); // Jeton expiré
}
```

En production, on utilise une bibliothèque maintenue, comme `jose`, qui fait ces vérifications et bien d'autres. Mais
chaque ligne de `verifier` correspond à une faille réelle qu'on retrouve dans des applications qui les ont oubliées.

## Comment ça fonctionne

**La session, simple et révocable.** À la connexion, le serveur génère un identifiant aléatoire de 128 bits au moins,
stocke la session dans une base ou Redis, et envoie l'identifiant dans un cookie `HttpOnly; Secure; SameSite=Lax`. À
chaque requête, il retrouve la session. La déconnexion supprime la session : l'accès cesse **immédiatement**. On
régénère l'identifiant à la connexion et à chaque changement de privilège, pour qu'un identifiant connu d'un attaquant
avant la connexion ne devienne pas valide après : c'est la *fixation de session*. On fixe une expiration d'inactivité et
une expiration absolue.

**Le JWT, vérifiable sans stockage.** Un service qui reçoit un JWT vérifie la signature avec la clé, et fait confiance à
son contenu sans interroger de base. C'est utile quand plusieurs services doivent authentifier la même requête, ou
quand un fournisseur d'identité externe émet les jetons. Avec des signatures asymétriques, RS256 ou ES256, l'émetteur
signe avec sa clé privée, et chaque service vérifie avec la clé publique, sans pouvoir émettre de jetons.

**Vérifier, vraiment.** Les failles de JWT viennent presque toujours d'une vérification incomplète. **L'algorithme** est
imposé par le serveur, jamais lu dans le jeton : sinon un attaquant envoie `alg: none` et aucune signature, ou, avec
certaines bibliothèques, fait vérifier une signature HMAC avec la clé **publique** RSA comme secret. **La signature** est
comparée en temps constant. **L'expiration** est obligatoire et courte. **L'émetteur et l'audience** sont vérifiés, pour
qu'un jeton émis pour un autre service ne soit pas accepté ici. Et la clé HMAC est longue et aléatoire, au moins 256 bits
: une clé faible se retrouve par force brute à partir d'un seul jeton.

**Le problème de la révocation.** Un JWT valide le reste jusqu'à son expiration : déconnexion, changement de mot de passe
ou compte bloqué ne l'invalident pas. D'où la combinaison courante : un **jeton d'accès** JWT de courte durée, 5 à 15
minutes, et un **jeton de rafraîchissement** de longue durée, opaque et stocké côté serveur, qui sert uniquement à
obtenir un nouveau jeton d'accès. La révocation porte sur le jeton de rafraîchissement : au pire, l'accès cesse à la fin
des quelques minutes restantes.

**La rotation des jetons de rafraîchissement.** À chaque utilisation, le jeton de rafraîchissement est remplacé par un
nouveau, et l'ancien est invalidé. Si un ancien jeton est présenté de nouveau, c'est qu'il a été copié : un voleur et
l'utilisateur légitime l'utilisent tous les deux. Le serveur révoque alors **toute la famille** de jetons issue de la
même connexion, et l'utilisateur doit se reconnecter. Comme pour les jetons de réinitialisation, on ne stocke que leur
haché.

**Où les garder dans le navigateur.** Un jeton dans `localStorage` est lisible par toute XSS. Pour une application web,
le choix le plus sûr est un cookie `HttpOnly; Secure; SameSite`, pour la session ou le jeton de rafraîchissement, avec
un `Path` restreint à la route de rafraîchissement ; le jeton d'accès peut vivre en mémoire, dans une variable
JavaScript, et se renouveler au chargement. Un cookie impose de traiter la CSRF, vue au chapitre sur les cookies. Pour une
application qui a son propre serveur, une simple session est souvent le meilleur choix.

## Erreurs fréquentes

**Lire l'algorithme dans l'en-tête du jeton.** Impose l'algorithme attendu ; refuse `none`.

**Oublier `exp`, ou choisir une durée de plusieurs jours pour un jeton d'accès.** Un jeton volé reste utilisable
longtemps ; garde-le court.

**Mettre des données sensibles dans un JWT.** Il est seulement encodé en base64url : tout le monde peut le lire.

**Une clé HMAC courte ou devinable.** Elle se retrouve par force brute à partir d'un seul jeton ; 256 bits aléatoires.

**Ne pas vérifier l'émetteur et l'audience.** Un jeton destiné à un autre service est accepté.

**Stocker les jetons dans `localStorage`.** Une XSS les vole ; préfère un cookie `HttpOnly` ou la mémoire.

**Garder le même identifiant de session après la connexion.** C'est la fixation de session ; régénère-le.

**Écrire sa propre bibliothèque JWT en production.** Utilise `jose` ou l'équivalent maintenu de ta plateforme.

## À retenir

- Session : un identifiant opaque en cookie `HttpOnly`, un état côté serveur, une révocation immédiate.
- JWT : signé, pas chiffré ; vérifiable sans stockage ; difficile à révoquer.
- Vérifier : algorithme imposé, signature en temps constant, `exp` court, `iss` et `aud`, clé longue.
- Jeton d'accès court et jeton de rafraîchissement opaque, haché, avec rotation et détection de réutilisation.
- Dans le navigateur : cookie `HttpOnly` ou mémoire, pas `localStorage`.

## Exercices

1. Décode ce JWT à la main, sans clé : `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1NDIiLCJyb2xlIjoiY2xpZW50IiwiZXhwIjoxNzkwMDAwMDAwfQ.x`.
   Que contient-il ? Que prouve le fait d'avoir pu le lire ? Peut-on en déduire qu'il est valide ?

   :::indice
   Découpe aux points, et décode chaque partie en base64url.
   :::

   :::solution
   ```js
   const jeton = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1NDIiLCJyb2xlIjoiY2xpZW50IiwiZXhwIjoxNzkwMDAwMDAwfQ.x';
   const [entete, charge] = jeton.split('.').slice(0, 2).map((p) => JSON.parse(Buffer.from(p, 'base64url').toString()));
   console.log(entete, charge);
   // { alg: 'HS256' } { sub: 'u42', role: 'client', exp: 1790000000 }
   console.log(new Date(charge.exp * 1000).toISOString()); // 2026-09-21T14:13:20.000Z
   ```

   Il désigne l'utilisateur `u42`, avec le rôle `client`, et une expiration au 21 septembre 2026. Avoir pu le lire prouve
   seulement qu'un JWT n'est pas chiffré : on ne doit rien y mettre de secret. On ne peut rien dire de sa validité : la
   signature, ici `x`, doit être vérifiée avec la clé du serveur, et elle est manifestement fausse. Un serveur qui se
   contenterait de décoder la charge utile, sans vérifier, accepterait n'importe quel jeton fabriqué à la main.
   :::

2. Écris un service de jetons de rafraîchissement avec rotation : `emettre(utilisateurId)` crée un jeton d'une nouvelle
   famille ; `rafraichir(jeton)` renvoie un nouveau jeton et invalide l'ancien ; si un jeton déjà utilisé est présenté de
   nouveau, toute sa famille est révoquée. Seuls les hachés sont stockés.

   :::indice
   Stocke pour chaque haché : l'utilisateur, la famille, et s'il a été utilisé. Une famille révoquée rend tous ses jetons
   invalides.
   :::

   :::solution
   ```js
   import { randomBytes, createHash, randomUUID } from 'node:crypto';

   const hacher = (jeton) => createHash('sha256').update(jeton).digest('hex');

   function creerJetonsRafraichissement() {
     const jetons = new Map(); // haché → { utilisateurId, famille, utilise }
     const famillesRevoquees = new Set();

     function nouveau(utilisateurId, famille) {
       const jeton = randomBytes(32).toString('base64url');
       jetons.set(hacher(jeton), { utilisateurId, famille, utilise: false });
       return jeton;
     }

     return {
       emettre: (utilisateurId) => nouveau(utilisateurId, randomUUID()),
       rafraichir(jeton) {
         const entree = jetons.get(hacher(jeton));
         if (!entree || famillesRevoquees.has(entree.famille)) throw new Error('Jeton invalide');
         if (entree.utilise) {
           famillesRevoquees.add(entree.famille); // réutilisation : jeton volé
           throw new Error('Réutilisation détectée : session révoquée');
         }
         entree.utilise = true;
         return { utilisateurId: entree.utilisateurId, jeton: nouveau(entree.utilisateurId, entree.famille) };
       },
     };
   }

   const service = creerJetonsRafraichissement();
   const premier = service.emettre('u1');
   const { jeton: second } = service.rafraichir(premier); // l'utilisateur rafraîchit

   for (const essai of [premier, second]) {
     try {
       service.rafraichir(essai);
       console.log('accepté');
     } catch (erreur) {
       console.log(erreur.message);
     }
   }
   // Réutilisation détectée : session révoquée
   // Jeton invalide
   ```

   Le voleur rejoue `premier` : la réutilisation est détectée, et la famille est révoquée. Le jeton légitime `second`
   devient lui aussi invalide : l'utilisateur doit se reconnecter, ce qui coupe l'accès du voleur. En production, les
   entrées ont une expiration, et les familles se nettoient.
   :::

3. Pour chacune de ces applications, choisis entre session côté serveur et JWT, et précise où le client conserve sa
   preuve d'authentification.
   - a) Une boutique en ligne rendue par son propre serveur Node.
   - b) Une application monopage React, servie par le même domaine que son API.
   - c) Dix microservices internes qui doivent tous connaître l'utilisateur d'une requête.
   - d) Une application mobile native.

   :::indice
   Qui vérifie la preuve, faut-il révoquer vite, et qu'est-ce qui protège le mieux contre le vol ?
   :::

   :::solution
   - a) Session côté serveur, dans un cookie `__Host-` `HttpOnly; Secure; SameSite=Lax` : un seul serveur vérifie,
     la révocation est immédiate, et aucun script n'a accès à l'identifiant.
   - b) Session en cookie, là aussi : même domaine, donc le cookie est envoyé automatiquement ; on protège les requêtes
     qui modifient l'état contre la CSRF. Un JWT dans `localStorage` serait exposé à toute XSS.
   - c) JWT signé de façon asymétrique, de courte durée : une passerelle authentifie l'utilisateur, puis chaque service
     vérifie la signature avec la clé publique, sans appel à un magasin central.
   - d) Jeton d'accès court et jeton de rafraîchissement avec rotation, conservés dans le stockage sécurisé du système,
     Keychain ou Keystore : il n'y a pas de cookies de navigateur, et le stockage du système est protégé.
   :::

## Questions d'entretien

- Sessions ou JWT : lequel choisir ?

  :::indice
  Stockage, révocation, qui vérifie.
  :::

  :::reponse
  Une session stocke l'état côté serveur et donne au client un identifiant opaque : la révocation est immédiate, le
  contenu n'est pas exposé, et c'est le choix par défaut d'une application web qui a son propre serveur. Un JWT porte
  lui-même l'identité, signée : n'importe quel service qui a la clé peut le vérifier sans stockage, ce qui convient aux
  architectures distribuées et aux fournisseurs d'identité, mais il reste valide jusqu'à son expiration. On le combine
  alors avec une courte durée de vie et un jeton de rafraîchissement révocable. Le choix dépend donc de qui vérifie, et
  du besoin de révocation.
  :::

- Quelles vérifications faut-il faire sur un JWT reçu ?

  :::indice
  Cinq points au moins.
  :::

  :::reponse
  Imposer l'algorithme attendu, sans jamais utiliser celui qu'annonce l'en-tête, et refuser `none` ; vérifier la
  signature avec la bonne clé, en temps constant ; exiger une expiration `exp` et la contrôler, ainsi que `nbf` s'il
  existe ; vérifier l'émetteur `iss` et l'audience `aud` ; puis valider la forme des revendications utilisées. J'utilise
  une bibliothèque maintenue comme `jose`, avec ces options explicites, et une clé longue et aléatoire, ou une paire de
  clés asymétriques.
  :::

- Qu'est-ce que la rotation des jetons de rafraîchissement ?

  :::indice
  Que signifie un jeton déjà utilisé qui revient ?
  :::

  :::reponse
  À chaque rafraîchissement, le serveur émet un nouveau jeton de rafraîchissement et invalide l'ancien. Un jeton ne sert
  donc qu'une fois. Si un jeton déjà utilisé est présenté de nouveau, c'est qu'une copie circule : le serveur révoque
  toute la famille de jetons issue de la même connexion, ce qui coupe l'accès du voleur comme celui de l'utilisateur, qui
  se reconnecte. Les jetons sont stockés hachés, avec une expiration, et transmis dans un cookie `HttpOnly` restreint à
  la route de rafraîchissement, ou dans le stockage sécurisé d'une application mobile.
  :::
