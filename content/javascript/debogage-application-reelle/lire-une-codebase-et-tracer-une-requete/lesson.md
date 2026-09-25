---
id: javascript-lire-une-codebase-et-tracer-une-requete
title: "Lire une codebase existante et tracer une requête"
slug: lire-une-codebase-et-tracer-une-requete
technology: javascript
level: advanced
module: debogage-application-reelle
order: 1
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-methode-debogage
  - javascript-architecture-d-une-application-node
skills:
  - js-codebase-reading
tags:
  - javascript
  - debogage
  - lecture-de-code
---

## Objectifs

- Aborder une codebase inconnue avec méthode : documentation, scripts, points d'entrée, structure, tests, historique.
- Identifier le chemin d'une fonctionnalité, de la route jusqu'à la base de données.
- Tracer une requête à travers les couches avec un identifiant de corrélation et des journaux structurés.
- Propager ce contexte dans le code asynchrone avec `AsyncLocalStorage`.
- Suivre une exécution réelle avec le débogueur de Node.

## Introduction

Dans un emploi de développeur, on écrit rarement une application à partir de rien. On arrive sur un projet de plusieurs
années, écrit par des dizaines de personnes, et la première mission ressemble souvent à : « un client dit que sa
réservation a disparu, peux-tu regarder ? ». Il faut alors trouver, parmi des centaines de fichiers, les quelques lignes
qui comptent.

Lire du code est une compétence à part entière, qui s'apprend comme l'écriture. On ne lit pas une codebase de la
première ligne à la dernière : on la questionne, en partant de ce qu'on veut comprendre, et on s'appuie sur ce que les
outils savent montrer : les journaux, le débogueur, l'historique Git.

## Concept

| Pour s'orienter | On cherche |
| --- | --- |
| `README.md`, `docs/`, `CONTRIBUTING.md` | comment lancer le projet, ses conventions, ses décisions |
| `package.json` | les scripts, les dépendances principales, le point d'entrée, la version de Node |
| l'arborescence | l'organisation : couches techniques, modules métier, monorepo |
| les points d'entrée | `main.js`, `server.js`, la racine de composition, la table des routes |
| les tests | le comportement attendu, décrit par des exemples exécutables |
| `git log`, `git blame` | pourquoi le code est ainsi, et qui connaît ce domaine |

| Pour suivre une requête | Outil |
| --- | --- |
| relier toutes les traces d'une requête | un identifiant de corrélation, reçu ou généré, renvoyé dans la réponse |
| le propager sans le passer en paramètre partout | `AsyncLocalStorage` de `node:async_hooks` |
| des journaux exploitables | une ligne JSON par événement : niveau, message, identifiant, durée |
| observer l'exécution pas à pas | `node --inspect` et les DevTools, ou le débogueur de l'éditeur |
| suivre une requête entre plusieurs services | le traçage distribué, avec OpenTelemetry |

## Exemple

Dans l'API de réservation construite dans la partie sur l'architecture, on veut pouvoir suivre une requête à travers les
couches. Un module de contexte, basé sur `AsyncLocalStorage`, garde l'identifiant de la requête en cours :

```js
// partage/contexte.js
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const stockage = new AsyncLocalStorage();

export function executerDansUneRequete(idEntrant, fonction) {
  const id = /^[\w-]{8,64}$/.test(idEntrant ?? '') ? idEntrant : randomUUID();
  return stockage.run({ id, debut: performance.now() }, fonction);
}

export const idRequete = () => stockage.getStore()?.id;

export function journal(niveau, message, details = {}) {
  const contexte = stockage.getStore();
  const ligne = {
    niveau,
    message,
    requete: contexte?.id,
    ms: contexte ? Math.round(performance.now() - contexte.debut) : undefined,
    ...details,
  };
  console.log(JSON.stringify(ligne));
}
```

Chaque couche journalise sans recevoir l'identifiant en paramètre, même après des `await` :

```js
import { createServer } from 'node:http';
import { once } from 'node:events';

const depot = {
  async deLaSalle(salle) {
    journal('debug', 'lecture des réservations', { salle });
    await new Promise((resoudre) => setTimeout(resoudre, 5)); // simule la base de données
    return [];
  },
};

async function reserver(demande) {
  journal('info', 'réservation demandée', { salle: demande.salle });
  const existantes = await depot.deLaSalle(demande.salle);
  journal('info', 'réservation confirmée', { existantes: existantes.length });
  return { id: 'r1' };
}

const serveur = createServer((requete, reponse) => {
  executerDansUneRequete(requete.headers['x-request-id'], async () => {
    reponse.setHeader('x-request-id', idRequete());
    const resultat = await reserver({ salle: 'A' });
    journal('info', 'réponse envoyée', { statut: 201 });
    reponse.writeHead(201, { 'content-type': 'application/json' }).end(JSON.stringify(resultat));
  });
}).listen(0);
await once(serveur, 'listening');

const url = `http://localhost:${serveur.address().port}/reservations`;
await Promise.all([
  fetch(url, { headers: { 'x-request-id': 'client-aaaa-1111' } }),
  fetch(url, { headers: { 'x-request-id': 'client-bbbb-2222' } }),
]);
serveur.close();
```

```text
{"niveau":"info","message":"réservation demandée","requete":"client-aaaa-1111","ms":0,"salle":"A"}
{"niveau":"debug","message":"lecture des réservations","requete":"client-aaaa-1111","ms":0,"salle":"A"}
{"niveau":"info","message":"réservation demandée","requete":"client-bbbb-2222","ms":0,"salle":"A"}
{"niveau":"debug","message":"lecture des réservations","requete":"client-bbbb-2222","ms":0,"salle":"A"}
{"niveau":"info","message":"réservation confirmée","requete":"client-aaaa-1111","ms":6,"existantes":0}
{"niveau":"info","message":"réponse envoyée","requete":"client-aaaa-1111","ms":6,"statut":201}
{"niveau":"info","message":"réservation confirmée","requete":"client-bbbb-2222","ms":6,"existantes":0}
{"niveau":"info","message":"réponse envoyée","requete":"client-bbbb-2222","ms":6,"statut":201}
```

Les deux requêtes s'entremêlent dans le temps, mais chaque ligne porte le bon identifiant : filtrer sur
`client-aaaa-1111` reconstitue exactement le parcours d'une requête. Les durées, dans le champ `ms`, varient d'une
exécution à l'autre.

## Comment ça fonctionne

**Questionner, pas lire.** On part d'une question précise, « que se passe-t-il quand on réserve une salle ? », et on suit
le fil. On lance d'abord le projet en suivant le `README`, puis on lit les scripts du `package.json` : ils disent comment
démarrer, tester et construire, et révèlent les outils utilisés. On repère le point d'entrée, `main.js` ou `server.js`,
et la racine de composition, qui montre en un fichier quels modules existent et comment ils sont reliés.

**Trouver le chemin d'une fonctionnalité.** On part de ce que voit l'utilisateur, une URL, un texte de l'interface, un
message d'erreur, et on le cherche dans le code : `rg "POST.*reservations"`, `rg "Créneau déjà pris"`. La route mène au
cas d'utilisation, qui mène au domaine et au dépôt. Les éditeurs aident beaucoup : « aller à la définition », « trouver
toutes les références », la hiérarchie des appels. On note le chemin au fur et à mesure, comme une carte.

**Les tests comme documentation.** Les tests décrivent le comportement voulu par des exemples exécutables. Lire les tests
d'un module donne souvent une meilleure idée de ses règles que son code, et les exécuter vérifie qu'on a bien compris.
Écrire un petit test pour confirmer une hypothèse est une excellente façon de lire.

**L'historique explique le pourquoi.** Un code étrange a presque toujours une raison. `git blame` indique le commit qui a
écrit une ligne ; son message, sa pull request et le ticket associé expliquent souvent le cas particulier qu'elle traite.
`git log -p -- chemin` raconte l'évolution d'un fichier. Et l'historique dit qui connaît ce domaine : la personne à qui
poser une question précise.

**Un identifiant de corrélation.** Sur un serveur, les journaux de centaines de requêtes simultanées s'entremêlent. On
attribue à chaque requête un identifiant, repris de l'en-tête `X-Request-Id` s'il vient d'un proxy ou d'un client de
confiance, et validé, sinon généré. On le renvoie dans la réponse : un client ou le support peut le citer, et on retrouve
toutes les lignes de journal correspondantes. Entre plusieurs services, on le transmet dans les appels sortants ; le
standard W3C Trace Context, utilisé par OpenTelemetry, formalise ce mécanisme avec l'en-tête `traceparent`.

**`AsyncLocalStorage`.** Passer l'identifiant en paramètre à chaque fonction serait lourd, et impossible pour les
bibliothèques. `AsyncLocalStorage` associe une valeur à une exécution asynchrone : tout ce qui est appelé depuis
`stockage.run(valeur, fonction)`, y compris après des `await`, des minuteurs ou des callbacks, retrouve cette valeur avec
`getStore()`. Deux requêtes simultanées ont chacune leur contexte. Les bibliothèques de journalisation et de traçage
l'utilisent sous le capot.

**Des journaux structurés.** Une ligne JSON par événement, avec un niveau, un message stable et des champs, se filtre et
s'agrège dans un outil de centralisation des journaux : « toutes les erreurs de la salle A », « les requêtes de plus de
500 ms ». Des bibliothèques comme pino produisent ce format efficacement. On n'y met jamais de secrets ni de données
personnelles inutiles.

**Le débogueur sur un serveur.** `node --inspect src/main.js` ouvre un port de débogage ; dans Chrome, `chrome://inspect`
s'y connecte, ou l'éditeur le fait directement. On pose un point d'arrêt dans le cas d'utilisation, on envoie la requête,
et l'on inspecte les variables et la pile d'appels, qui montre d'un coup le chemin de la route au dépôt. Un point d'arrêt
conditionnel, par exemple `demande.salle === 'A'`, évite de s'arrêter à chaque requête. On ne l'utilise jamais sur un
serveur de production : il suspend toutes les requêtes.

## Erreurs fréquentes

**Lire la codebase de haut en bas.** Pars d'une question précise et suis le fil.

**Modifier avant d'avoir lancé le projet et ses tests.** Sans eux, tu ne sais pas ce que tu casses.

**Supposer au lieu de vérifier.** Confirme chaque hypothèse avec un test, un journal ou un point d'arrêt.

**Des journaux en texte libre, sans identifiant.** Impossible de reconstituer une requête parmi mille.

**Faire confiance à n'importe quel `X-Request-Id`.** Valide-le, ou génère-le, pour éviter l'injection dans les journaux.

**Journaliser des secrets ou des données personnelles.** Les journaux sont lus par beaucoup de monde, et conservés
longtemps.

**Attacher un débogueur à la production.** Il suspend le serveur ; reproduis en local.

## À retenir

- On lit une codebase en la questionnant : `README`, scripts, point d'entrée, racine de composition, tests, historique.
- On suit une fonctionnalité de ce que voit l'utilisateur jusqu'à la base, avec la recherche et la navigation de
  l'éditeur.
- Tests et `git blame` expliquent le comportement voulu et le pourquoi du code.
- Un identifiant de corrélation par requête, renvoyé au client et présent dans chaque ligne de journal.
- `AsyncLocalStorage` propage ce contexte à travers les `await` sans paramètre supplémentaire.
- Journaux structurés en JSON ; débogueur avec `node --inspect`, en local.

## Exercices

1. Tu arrives sur un projet inconnu et on te demande de corriger « le calcul des frais de port pour la Belgique ». Décris
   tes dix premières minutes, étape par étape, avec les commandes que tu lances.

   :::indice
   Lancer, s'orienter, chercher le texte métier, lire les tests, remonter l'historique.
   :::

   :::solution
   1. Lire le `README` et lancer le projet et ses tests : `pnpm install`, `pnpm test`, pour partir d'un état connu.
   2. Lire les scripts et dépendances du `package.json`, et survoler l'arborescence : `ls src`, ou `tree -L 2 src`.
   3. Chercher le vocabulaire métier : `rg -i "frais de port|livraison|shipping"`, puis `rg "'BE'"`.
   4. Lire les tests du module trouvé, par exemple `frais-de-port.test.js`, et chercher s'il existe un cas pour la
      Belgique.
   5. Remonter l'historique de ce fichier : `git log --oneline -- src/livraison/frais-de-port.js`, et
      `git blame` sur la ligne qui concerne la Belgique.
   6. Écrire un test qui reproduit le calcul incorrect, avant de toucher au code.

   À la fin de ces dix minutes, on sait où est le code, quelles règles existent, pourquoi elles ont été écrites ainsi, et
   on a un test rouge qui décrit le problème.
   :::

2. Étends le module de contexte pour que la fonction `journal` ajoute aussi l'identifiant de l'utilisateur connecté,
   quand il est connu. Le middleware d'authentification appelle `definirUtilisateur(id)` après avoir vérifié la session.
   Montre que deux requêtes simultanées de deux utilisateurs ne se mélangent pas.

   :::indice
   Le magasin renvoyé par `getStore()` est un objet : on peut y ajouter un champ pendant la requête.
   :::

   :::solution
   ```js
   import { AsyncLocalStorage } from 'node:async_hooks';

   const stockage = new AsyncLocalStorage();
   const lignes = [];

   const executerDansUneRequete = (id, fonction) => stockage.run({ id }, fonction);
   function definirUtilisateur(utilisateurId) {
     const contexte = stockage.getStore();
     if (contexte) contexte.utilisateur = utilisateurId;
   }
   function journal(message) {
     const { id, utilisateur } = stockage.getStore() ?? {};
     lignes.push({ message, requete: id, utilisateur });
   }

   const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
   async function traiter(idRequete, utilisateurId, delai) {
     await executerDansUneRequete(idRequete, async () => {
       journal('début');
       await attendre(delai);
       definirUtilisateur(utilisateurId); // après vérification de la session
       await attendre(delai);
       journal('fin');
     });
   }

   await Promise.all([traiter('r1', 'ana', 10), traiter('r2', 'bao', 3)]);
   console.log(lignes);
   // [
   //   { message: 'début', requete: 'r1', utilisateur: undefined },
   //   { message: 'début', requete: 'r2', utilisateur: undefined },
   //   { message: 'fin', requete: 'r2', utilisateur: 'bao' },
   //   { message: 'fin', requete: 'r1', utilisateur: 'ana' }
   // ]
   ```

   Chaque requête modifie son propre objet de contexte. La requête `r2`, plus rapide, termine avant `r1`, et chacune garde
   son utilisateur. On évite d'y stocker des données volumineuses, car le contexte vit pendant toute la requête.
   :::

3. Un client signale : « Ma réservation de 14 h a échoué hier vers 14 h 05, avec le message Erreur interne, référence
   `7f3c…` ». Explique comment tu retrouves ce qui s'est passé, et ce qui manquerait si l'application n'avait ni
   identifiant de corrélation ni journaux structurés.

   :::indice
   La référence affichée est l'identifiant de la requête.
   :::

   :::solution
   La référence est l'identifiant de corrélation, renvoyé dans la réponse et affiché par l'interface. Dans l'outil de
   centralisation des journaux, on filtre sur `requete = "7f3c…"` : on obtient, dans l'ordre, toutes les lignes de cette
   requête, route, cas d'utilisation, appels à la base, et la ligne d'erreur avec sa pile d'appels. Les champs structurés
   donnent la salle, la durée de chaque étape, le statut. On reproduit ensuite en local avec les mêmes paramètres, et on
   écrit un test.

   Sans identifiant ni structure, il faudrait parcourir à la main toutes les lignes de texte émises vers 14 h 05, mêlées à
   celles de centaines d'autres requêtes, en devinant lesquelles vont ensemble : des heures de travail, souvent sans
   résultat. C'est pourquoi on met en place ces outils **avant** le premier incident.
   :::

## Questions d'entretien

- Comment abordes-tu une codebase que tu ne connais pas ?

  :::indice
  Une question, des outils, et l'historique.
  :::

  :::reponse
  Je commence par la faire tourner, avec ses tests, en suivant le `README`. Je lis les scripts et les dépendances du
  `package.json`, puis l'arborescence et le point d'entrée, en particulier la racine de composition qui montre les
  modules et leurs liens. Ensuite, je pars d'une question précise et je suis le fil depuis ce que voit l'utilisateur,
  avec la recherche textuelle et la navigation de l'éditeur. Les tests me donnent le comportement attendu, `git blame` et
  les pull requests le pourquoi, et je confirme mes hypothèses par un test ou un point d'arrêt. Je pose aussi des
  questions ciblées aux personnes qui connaissent le domaine.
  :::

- Qu'est-ce qu'un identifiant de corrélation, et comment le propager en Node.js ?

  :::indice
  Une valeur par requête, dans chaque ligne de journal.
  :::

  :::reponse
  C'est un identifiant unique attribué à une requête, repris d'un en-tête de confiance ou généré, présent dans chaque ligne
  de journal qu'elle produit, transmis aux services appelés et renvoyé dans la réponse. Il permet de reconstituer le
  parcours complet d'une requête parmi toutes les autres. En Node, on le propage avec `AsyncLocalStorage` : le middleware
  exécute le traitement de la requête dans `run`, et n'importe quelle fonction retrouve le contexte avec `getStore()`,
  même après des `await`. Entre services, OpenTelemetry standardise la propagation avec l'en-tête `traceparent`.
  :::

- Pourquoi des journaux structurés plutôt que du texte libre ?

  :::indice
  Filtrer, agréger, alerter.
  :::

  :::reponse
  Une ligne JSON avec des champs stables, niveau, message, identifiant de requête, durée, code d'erreur, se filtre et
  s'agrège automatiquement dans un outil de centralisation : toutes les erreurs d'une route, les requêtes lentes, le taux
  d'échec par version. On peut en tirer des tableaux de bord et des alertes. Le texte libre oblige à écrire des
  expressions régulières fragiles pour chaque question. Les journaux structurés restent lisibles par un humain, et on les
  garde exempts de secrets et de données personnelles inutiles.
  :::
