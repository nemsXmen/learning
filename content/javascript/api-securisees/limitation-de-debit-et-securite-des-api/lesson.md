---
id: javascript-limitation-de-debit-et-securite-des-api
title: "Limitation de débit, sécurité des API et fondamentaux OWASP"
slug: limitation-de-debit-et-securite-des-api
technology: javascript
level: advanced
module: api-securisees
order: 4
estimatedMinutes: 50
difficulty: 5
xp: 120
prerequisites:
  - javascript-autorisation-et-controle-d-acces
skills:
  - js-api-security
tags:
  - javascript
  - securite
  - api
---

## Objectifs

- Limiter le débit des requêtes avec un seau à jetons, et répondre 429 avec `Retry-After`.
- Protéger la connexion contre la force brute sans permettre de bloquer le compte d'une victime.
- Borner la consommation de ressources : taille des corps, pagination, délais, travail coûteux.
- Se protéger des requêtes forgées côté serveur, SSRF, quand l'API appelle une URL fournie.
- Parcourir les risques OWASP des API, et savoir quelle mesure du cours répond à chacun.

## Introduction

Une API publique reçoit des requêtes de tout le monde, y compris de scripts qui en envoient des milliers par seconde :
pour deviner des mots de passe, aspirer un catalogue, épuiser un serveur ou faire exploser une facture de SMS. Même une
API parfaitement authentifiée et autorisée peut être abusée par le **volume**.

Ce chapitre ajoute les protections de volume et de ressources, puis prend du recul avec la liste de référence de
l'OWASP, l'organisation qui publie les classements des risques les plus fréquents. C'est aussi un récapitulatif de la
partie : chaque risque y renvoie à une mesure déjà vue.

## Concept

| Algorithme | Principe | Défaut |
| --- | --- | --- |
| fenêtre fixe | au plus N requêtes par minute calendaire | un double pic possible à la frontière entre deux minutes |
| fenêtre glissante | au plus N requêtes dans les 60 dernières secondes | plus de mémoire ou d'approximation |
| seau à jetons | un seau de capacité C se remplit de R jetons par seconde ; chaque requête en consomme un | autorise des rafales courtes, jusqu'à C |

| Réponse de limitation | |
| --- | --- |
| statut | `429 Too Many Requests` |
| `Retry-After` | le nombre de secondes à attendre |
| clé de limitation | l'adresse IP, l'utilisateur, la clé d'API, le compte visé ; souvent plusieurs à la fois |

| OWASP API Security Top 10 (2023) | Mesure vue dans cette partie |
| --- | --- |
| API1 accès aux objets non contrôlé | contrôle d'appartenance de chaque ressource |
| API2 authentification défaillante | hachage lent, sessions et JWT vérifiés, limitation de la connexion |
| API3 accès aux propriétés non contrôlé | réponses construites champ par champ, schémas stricts en écriture |
| API4 consommation de ressources non bornée | limitation de débit, tailles maximales, pagination, délais |
| API5 accès aux fonctions non contrôlé | politique de rôles, refus par défaut |
| API6 accès sans limite à des flux métier sensibles | limitation par action métier : achats, inscriptions, envois |
| API7 requêtes forgées côté serveur (SSRF) | liste blanche d'hôtes, refus des adresses internes |
| API8 mauvaise configuration de sécurité | en-têtes, CORS strict, erreurs sans détail, HTTPS |
| API9 inventaire mal géré | versions et points d'accès documentés, anciennes versions retirées |
| API10 consommation non sûre d'API tierces | valider aussi les réponses des partenaires, délais |

## Exemple

Un limiteur à seau à jetons, avec une horloge injectable pour les tests, et son usage dans un serveur :

```js
export function creerLimiteur({ capacite, parSeconde, maintenant = () => Date.now() }) {
  const seaux = new Map(); // clé → { jetons, derniereRecharge }

  return function consommer(cle) {
    const instant = maintenant();
    const seau = seaux.get(cle) ?? { jetons: capacite, derniereRecharge: instant };
    const ecoule = (instant - seau.derniereRecharge) / 1000;
    seau.jetons = Math.min(capacite, seau.jetons + ecoule * parSeconde);
    seau.derniereRecharge = instant;
    seaux.set(cle, seau);

    if (seau.jetons >= 1) {
      seau.jetons -= 1;
      return { autorise: true, restants: Math.floor(seau.jetons) };
    }
    return { autorise: false, reessayerDans: Math.ceil((1 - seau.jetons) / parSeconde) };
  };
}

let horloge = 0;
const limiter = creerLimiteur({ capacite: 3, parSeconde: 0.5, maintenant: () => horloge });

console.log([1, 2, 3, 4].map(() => limiter('203.0.113.7').autorise)); // [ true, true, true, false ]
console.log(limiter('203.0.113.7')); // { autorise: false, reessayerDans: 2 }
console.log(limiter('198.51.100.2').autorise); // true : une autre clé a son propre seau
horloge += 2000; // deux secondes plus tard, un jeton est revenu
console.log(limiter('203.0.113.7').autorise); // true
```

```js
import { createServer } from 'node:http';

const limiteurGlobal = creerLimiteur({ capacite: 20, parSeconde: 10 });

createServer((requete, reponse) => {
  const { autorise, reessayerDans } = limiteurGlobal(requete.socket.remoteAddress);
  if (!autorise) {
    reponse.writeHead(429, { 'retry-after': String(reessayerDans), 'content-type': 'application/json' });
    return reponse.end(JSON.stringify({ erreur: 'Trop de requêtes' }));
  }
  reponse.end('ok');
}).listen(0);
```

Chaque adresse peut faire une rafale de 20 requêtes, puis 10 par seconde en régime continu. Au-delà, elle reçoit un 429
et sait quand réessayer.

## Comment ça fonctionne

**Le seau à jetons.** Chaque clé possède un seau qui se remplit à vitesse constante jusqu'à sa capacité. Une requête
prend un jeton ; un seau vide refuse. On autorise ainsi les rafales naturelles d'un usage normal, comme une page qui
charge dix ressources, tout en bornant le débit moyen. Le calcul se fait paresseusement, à chaque requête, à partir du
temps écoulé : aucun minuteur n'est nécessaire.

**Le choix de la clé.** L'adresse IP est la clé la plus simple, mais plusieurs utilisateurs partagent parfois une adresse,
dans une entreprise ou un réseau mobile, et un attaquant en change facilement. Derrière un proxy ou un répartiteur de
charge, l'adresse du socket est celle du proxy : on lit l'en-tête `X-Forwarded-For`, mais **seulement** s'il vient d'un
proxy de confiance, sinon le client l'invente. Pour une API authentifiée, on limite aussi par utilisateur ou par clé
d'API. Et pour les actions sensibles, on limite par **objet visé** : le nombre de tentatives de connexion par compte,
le nombre de SMS envoyés à un numéro.

**Plusieurs instances.** Une `Map` en mémoire ne fonctionne que pour un seul processus : avec trois instances derrière
un répartiteur, chaque limiteur ne voit qu'un tiers des requêtes. En production, l'état vit dans un magasin partagé
comme Redis, souvent via une bibliothèque, ou la limitation se fait en amont, dans la passerelle d'API ou le CDN.

**La force brute sur la connexion.** On combine une limite par adresse, contre un attaquant qui essaie beaucoup de
comptes, et une limite par compte, contre un attaquant qui essaie beaucoup de mots de passe sur un compte depuis de
nombreuses adresses. Mais bloquer complètement un compte après cinq échecs permet à n'importe qui de **bloquer** le compte
d'une victime : c'est un déni de service. On préfère des délais croissants, un CAPTCHA après quelques échecs, et une
notification à l'utilisateur, plutôt qu'un verrouillage dur.

**Borner toutes les ressources.** Le débit n'est qu'une ressource parmi d'autres. On limite la taille des corps de
requête, le nombre d'éléments par page avec un maximum imposé, la durée des requêtes à la base et des appels sortants,
la taille des fichiers téléversés, la profondeur et la complexité des requêtes GraphQL, et le nombre d'opérations
coûteuses, comme un export ou un hachage de mot de passe. Chaque « sans limite » est une porte ouverte à l'épuisement.

**Le SSRF.** Quand l'API télécharge une URL fournie par l'utilisateur, un webhook, un avatar par URL, un aperçu de lien,
l'attaquant peut lui faire appeler des adresses **internes**, inaccessibles de l'extérieur : `http://localhost:6379`,
une base interne, ou `http://169.254.169.254`, le service de métadonnées d'un hébergeur cloud, qui peut livrer des
identifiants. On se protège par une liste blanche d'hôtes quand c'est possible ; sinon, on résout le nom de domaine et
on refuse les adresses privées, de bouclage et locales, on interdit les redirections non vérifiées, et on impose des
délais et des tailles maximales.

**Les fondamentaux OWASP.** Le Top 10 OWASP des applications web, et sa déclinaison pour les API, classent les risques
observés le plus souvent dans les audits. Ils ne sont pas une liste exhaustive, mais un socle : contrôle d'accès,
authentification, injections, mauvaise configuration, composants vulnérables, journalisation insuffisante. Ce dernier
point mérite une mention : sans journal des événements de sécurité, échecs de connexion, refus d'autorisation, limites
atteintes, changements de rôle, une attaque passe inaperçue. On journalise ces événements, sans secrets, et on
surveille leurs anomalies.

## Erreurs fréquentes

**Aucune limite sur la connexion, l'inscription ou l'envoi de SMS.** Ce sont les premières cibles des scripts.

**Faire confiance à `X-Forwarded-For` sans proxy de confiance.** Le client choisit alors son adresse.

**Un limiteur en mémoire sur plusieurs instances.** Chaque instance ne voit qu'une partie du trafic ; partage l'état.

**Verrouiller un compte après quelques échecs.** Tout le monde peut bloquer la victime ; préfère des délais croissants.

**Des paramètres sans maximum.** `?limite=1000000` ou un corps de 1 Go épuisent le serveur.

**Télécharger une URL fournie sans contrôle.** C'est un SSRF vers le réseau interne.

**Ne pas journaliser les événements de sécurité.** Une attaque en cours reste invisible.

## À retenir

- Seau à jetons : rafales permises, débit moyen borné ; 429 avec `Retry-After`.
- Clés de limitation : adresse, utilisateur, clé d'API, et objet visé pour les actions sensibles.
- État partagé entre instances ; `X-Forwarded-For` seulement derrière un proxy de confiance.
- Connexion : limites par adresse et par compte, délais croissants plutôt que verrouillage.
- Borner corps, pages, délais, fichiers et opérations coûteuses.
- SSRF : liste blanche, refus des adresses internes, pas de redirections aveugles.
- L'OWASP API Top 10 résume les risques ; journaliser les événements de sécurité.

## Exercices

1. Écris un limiteur de connexion qui combine deux seaux : 10 tentatives par minute par adresse IP, et 5 tentatives par
   quart d'heure par compte visé. `tenter(ip, email)` renvoie `{ autorise, reessayerDans }` ; une tentative est refusée
   si l'un des deux seaux est vide, et ne consomme alors rien dans l'autre.

   :::indice
   Réutilise la logique du seau à jetons, mais sépare la vérification de la consommation, pour ne consommer que si les
   deux autorisent.
   :::

   :::solution
   ```js
   function creerSeaux({ capacite, parSeconde, maintenant }) {
     const seaux = new Map();
     const lire = (cle) => {
       const instant = maintenant();
       const seau = seaux.get(cle) ?? { jetons: capacite, derniereRecharge: instant };
       seau.jetons = Math.min(capacite, seau.jetons + ((instant - seau.derniereRecharge) / 1000) * parSeconde);
       seau.derniereRecharge = instant;
       seaux.set(cle, seau);
       return seau;
     };
     return {
       attente: (cle) => {
         const { jetons } = lire(cle);
         return jetons >= 1 ? 0 : Math.ceil((1 - jetons) / parSeconde);
       },
       consommer: (cle) => {
         lire(cle).jetons -= 1;
       },
     };
   }

   function creerLimiteurConnexion(maintenant = () => Date.now()) {
     const parIp = creerSeaux({ capacite: 10, parSeconde: 10 / 60, maintenant });
     const parCompte = creerSeaux({ capacite: 5, parSeconde: 5 / 900, maintenant });
     return function tenter(ip, email) {
       const compte = email.trim().toLowerCase();
       const reessayerDans = Math.max(parIp.attente(ip), parCompte.attente(compte));
       if (reessayerDans > 0) return { autorise: false, reessayerDans };
       parIp.consommer(ip);
       parCompte.consommer(compte);
       return { autorise: true };
     };
   }

   let horloge = 0;
   const tenter = creerLimiteurConnexion(() => horloge);

   // Un attaquant vise le compte d'Ana depuis de nombreuses adresses :
   const resultats = Array.from({ length: 7 }, (_, i) => tenter(`198.51.100.${i}`, 'ana@exemple.fr').autorise);
   console.log(resultats); // [ true, true, true, true, true, false, false ]
   console.log(tenter('203.0.113.1', 'ANA@exemple.fr')); // { autorise: false, reessayerDans: 180 }
   console.log(tenter('203.0.113.1', 'bao@exemple.fr').autorise); // true : l'adresse n'a rien consommé
   ```

   Changer d'adresse ne sert à rien contre la limite par compte, et la normalisation de l'e-mail empêche de la contourner
   avec des majuscules. Le compte d'Ana n'est pas verrouillé : un jeton revient toutes les trois minutes, ce qui rend
   l'attaque inutilisable sans bloquer durablement Ana.
   :::

2. Une API accepte `?page=` et `?limite=` pour lister des produits. Écris `lirePagination(parametres)` qui renvoie
   `{ page, limite, decalage }` avec des valeurs par défaut, un maximum de 100 éléments par page, et qui refuse des valeurs
   absurdes.

   :::indice
   Convertis, vérifie que ce sont des entiers positifs, et plafonne la limite plutôt que de faire confiance au client.
   :::

   :::solution
   ```js
   const LIMITE_PAR_DEFAUT = 20;
   const LIMITE_MAX = 100;
   const PAGE_MAX = 10_000;

   function lirePagination(parametres) {
     const page = Number(parametres.get('page') ?? 1);
     const limiteDemandee = Number(parametres.get('limite') ?? LIMITE_PAR_DEFAUT);
     if (!Number.isInteger(page) || page < 1 || page > PAGE_MAX) throw new RangeError('Page invalide');
     if (!Number.isInteger(limiteDemandee) || limiteDemandee < 1) throw new RangeError('Limite invalide');
     const limite = Math.min(limiteDemandee, LIMITE_MAX);
     return { page, limite, decalage: (page - 1) * limite };
   }

   console.log(lirePagination(new URLSearchParams(''))); // { page: 1, limite: 20, decalage: 0 }
   console.log(lirePagination(new URLSearchParams('page=3&limite=1000000'))); // { page: 3, limite: 100, decalage: 200 }
   for (const requete of ['page=-1', 'limite=abc', 'page=1e9']) {
     try {
       lirePagination(new URLSearchParams(requete));
     } catch (erreur) {
       console.log(requete, '→', erreur.message);
     }
   }
   ```

   Plafonner la limite plutôt que refuser reste confortable pour un client légitime. Pour les très grands jeux de
   données, la pagination par curseur, `?apres=<dernier identifiant>`, évite en plus les décalages coûteux en base.
   :::

3. Une fonctionnalité télécharge une image depuis une URL fournie par l'utilisateur. Écris `verifierUrlSortante(brute)`,
   qui n'accepte que `https`, résout le nom d'hôte, et refuse toute adresse de bouclage, privée ou locale, en IPv4 et IPv6.
   Utilise `BlockList` de `node:net` et `lookup` de `node:dns/promises`.

   :::indice
   `BlockList` accepte des plages avec `addSubnet`. Vérifie **toutes** les adresses renvoyées par la résolution.
   :::

   :::solution
   ```js
   import { BlockList, isIP } from 'node:net';
   import { lookup } from 'node:dns/promises';

   const interdites = new BlockList();
   for (const [reseau, prefixe] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16], ['100.64.0.0', 10]]) {
     interdites.addSubnet(reseau, prefixe, 'ipv4');
   }
   for (const [reseau, prefixe] of [['::1', 128], ['::', 128], ['fc00::', 7], ['fe80::', 10], ['::ffff:0:0', 96]]) {
     interdites.addSubnet(reseau, prefixe, 'ipv6');
   }

   async function verifierUrlSortante(brute) {
     const url = new URL(brute);
     if (url.protocol !== 'https:') throw new Error('Seul https est accepté');
     const hote = url.hostname.replace(/^\[|\]$/g, '');
     const adresses = isIP(hote) ? [{ address: hote, family: isIP(hote) }] : await lookup(hote, { all: true });
     for (const { address, family } of adresses) {
       if (interdites.check(address, family === 6 ? 'ipv6' : 'ipv4')) {
         throw new Error(`Adresse interdite : ${address}`);
       }
     }
     return { url, adresses: adresses.map((a) => a.address) };
   }

   for (const url of ['https://localhost/avatar.png', 'https://169.254.169.254/latest/meta-data/', 'https://[::1]/', 'http://exemple.org/a.png', 'https://192.168.1.10/']) {
     await verifierUrlSortante(url).catch((erreur) => console.log(url, '→', erreur.message));
   }
   ```

   Il faut ensuite télécharger en se connectant à l'adresse **vérifiée**, et non en résolvant de nouveau le nom : sinon un
   attaquant qui contrôle le DNS renvoie une adresse publique à la vérification, puis `127.0.0.1` à la connexion. On
   désactive aussi les redirections automatiques, ou on revérifie chaque étape, et on impose un délai et une taille
   maximale. Quand les sources sont connues, une liste blanche d'hôtes est plus simple et plus sûre.
   :::

## Questions d'entretien

- Comment protèges-tu une API contre les abus de volume ?

  :::indice
  Algorithme, clés, réponse, déploiement, et les autres ressources.
  :::

  :::reponse
  Par une limitation de débit, souvent un seau à jetons, qui accepte les rafales normales et borne le débit moyen. Je
  choisis des clés adaptées : adresse IP, utilisateur ou clé d'API, et objet visé pour les actions sensibles comme la
  connexion ou l'envoi de SMS. Au-delà, je réponds 429 avec `Retry-After`. L'état est partagé entre instances, dans Redis
  ou dans la passerelle. Et je borne toutes les ressources : taille des corps, pagination, délais, fichiers, opérations
  coûteuses. Les événements de limitation sont journalisés pour repérer les attaques.
  :::

- Comment protéger un formulaire de connexion contre la force brute ?

  :::indice
  Deux dimensions de limitation, et un piège à éviter.
  :::

  :::reponse
  En limitant à la fois par adresse, contre un attaquant qui teste beaucoup de comptes, et par compte visé, contre un
  attaquant qui teste beaucoup de mots de passe depuis de nombreuses adresses. J'applique des délais croissants et un
  CAPTCHA après quelques échecs, plutôt qu'un verrouillage dur, qui permettrait à n'importe qui de bloquer la victime.
  J'ajoute un hachage lent, des messages d'erreur identiques, la double authentification, la vérification des mots de
  passe connus pour avoir fui, et la journalisation des échecs.
  :::

- Qu'est-ce qu'une attaque SSRF ?

  :::indice
  Le serveur fait une requête pour le compte de l'attaquant.
  :::

  :::reponse
  C'est l'exploitation d'une fonctionnalité où le serveur appelle une URL fournie par l'utilisateur, un webhook, un
  aperçu de lien, une image à importer, pour lui faire atteindre des cibles internes : services en `localhost`, bases de
  données du réseau privé, ou service de métadonnées du cloud qui peut livrer des identifiants. On s'en protège par une
  liste blanche d'hôtes quand c'est possible ; sinon, on résout le nom, on refuse les adresses privées, de bouclage et
  locales, on se connecte à l'adresse vérifiée pour éviter le changement de DNS entre vérification et connexion, on
  contrôle les redirections, et on impose délais et tailles maximales.
  :::
