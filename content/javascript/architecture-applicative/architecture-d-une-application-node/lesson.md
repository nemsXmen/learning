---
id: javascript-architecture-d-une-application-node
title: "Architecture d'une application Node.js, de bout en bout"
slug: architecture-d-une-application-node
technology: javascript
level: advanced
module: architecture-applicative
order: 4
estimatedMinutes: 60
difficulty: 5
xp: 130
prerequisites:
  - javascript-ddd-les-bases
  - javascript-serveur-http
skills:
  - js-node-app-architecture
tags:
  - javascript
  - architecture
  - nodejs
---

## Objectifs

- Organiser une application Node par modules métier, avec des couches à l'intérieur.
- Séparer la configuration, la racine de composition, le serveur HTTP et le point d'entrée.
- Traduire les résultats et les erreurs métier en réponses HTTP en un seul endroit.
- Construire l'application comme une fonction, pour la démarrer, la tester et l'arrêter proprement.
- Tester chaque couche avec le bon type de test.

## Introduction

Ce chapitre assemble tout ce que la partie a construit : noms clairs, responsabilités séparées, inversion des
dépendances, patterns, couches et modules, domaine protégé. Le résultat est une petite API de réservation de salles,
complète et exécutable, organisée comme une application qui pourrait grandir pendant des années.

Aucun framework n'est utilisé : seulement `node:http`. Ce n'est pas une recommandation pour la production, où Fastify
ou Express apportent beaucoup ; c'est pour que chaque décision soit visible. Avec un framework, la structure reste la
même, seul l'adaptateur HTTP change.

## Concept

```text
src/
├── main.js                     point d'entrée : lit l'environnement, démarre, gère les signaux
├── composition.js              racine de composition : assemble l'application
├── partage/
│   ├── configuration.js        lecture et validation de la configuration
│   └── serveur-http.js         routeur, lecture du JSON, traduction des erreurs
└── reservations/               un module métier
    ├── domaine.js              règles et invariants
    ├── application.js          cas d'utilisation
    ├── depot-memoire.js        adaptateur secondaire (en production : depot-postgres.js)
    └── routes.js               adaptateur primaire HTTP
test/
    ├── domaine.test.js          unitaire : règles pures
    ├── application.test.js      cas d'utilisation, avec adaptateurs en mémoire
    ├── depot-postgres.test.js   intégration : l'adaptateur contre une vraie base
    └── api.test.js              de bout en bout : HTTP, sur un port libre
```

| Fichier | Dépend de | Ne connaît pas |
| --- | --- | --- |
| `domaine.js` | rien | HTTP, base, configuration |
| `application.js` | domaine, ports | HTTP, technologie du dépôt |
| `routes.js` | application | base de données |
| `composition.js` | tout | — c'est son rôle |
| `main.js` | composition, configuration | les modules métier |

## Exemple

**La configuration**, lue une fois et validée :

```js
// src/partage/configuration.js
export function lireConfiguration(env) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`PORT invalide : ${env.PORT}`);
  return Object.freeze({ port, journalDetaille: env.JOURNAL === 'detaille' });
}
```

**Le module métier**, domaine et application :

```js
// src/reservations/domaine.js
export class ErreurMetier extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function creerReservation({ id, salle, debut, fin, par }) {
  if (!(debut < fin)) throw new ErreurMetier('CRENEAU_INVALIDE', 'La fin doit suivre le début');
  if (fin - debut > 4 * 3_600_000) throw new ErreurMetier('CRENEAU_TROP_LONG', 'Quatre heures au maximum');
  return Object.freeze({ id, salle, debut, fin, par });
}

export const seChevauchent = (a, b) => a.salle === b.salle && a.debut < b.fin && b.debut < a.fin;
```

```js
// src/reservations/application.js
import { creerReservation, seChevauchent, ErreurMetier } from './domaine.js';

export function creerCasReservations({ depot, horloge, genererId }) {
  return {
    async reserver({ salle, debut, fin, par }) {
      if (debut < horloge.maintenant()) throw new ErreurMetier('DANS_LE_PASSE', 'La réservation est dans le passé');
      const nouvelle = creerReservation({ id: genererId(), salle, debut, fin, par });
      const existantes = await depot.deLaSalle(salle);
      if (existantes.some((r) => seChevauchent(r, nouvelle))) {
        throw new ErreurMetier('CRENEAU_PRIS', 'Créneau déjà pris');
      }
      await depot.ajouter(nouvelle);
      return nouvelle;
    },
    lister: (salle) => depot.deLaSalle(salle),
  };
}
```

**Les adaptateurs** du module : un dépôt en mémoire, et les routes HTTP, qui convertissent aux frontières.

```js
// src/reservations/depot-memoire.js
export function creerDepotMemoire() {
  const reservations = [];
  return {
    deLaSalle: async (salle) => reservations.filter((r) => r.salle === salle),
    ajouter: async (reservation) => void reservations.push(reservation),
  };
}
```

```js
// src/reservations/routes.js
const enJson = (r) => ({ ...r, debut: r.debut.toISOString(), fin: r.fin.toISOString() });

export function routesReservations(cas) {
  return [
    {
      methode: 'POST',
      chemin: '/reservations',
      async gerer({ corps }) {
        const reservation = await cas.reserver({
          salle: String(corps.salle ?? ''),
          debut: new Date(corps.debut),
          fin: new Date(corps.fin),
          par: String(corps.par ?? ''),
        });
        return { statut: 201, corps: enJson(reservation) };
      },
    },
    {
      methode: 'GET',
      chemin: '/reservations',
      async gerer({ parametres }) {
        const reservations = await cas.lister(parametres.get('salle'));
        return { statut: 200, corps: reservations.map(enJson) };
      },
    },
  ];
}
```

**Le serveur HTTP partagé** : routage, lecture du JSON, et traduction centralisée des erreurs.

```js
// src/partage/serveur-http.js
import { createServer } from 'node:http';

const STATUT_PAR_CODE = { CRENEAU_PRIS: 409, DANS_LE_PASSE: 422, CRENEAU_INVALIDE: 422, CRENEAU_TROP_LONG: 422 };

async function lireCorps(requete) {
  const morceaux = [];
  let taille = 0;
  for await (const morceau of requete) {
    taille += morceau.length;
    if (taille > 100_000) throw Object.assign(new Error('Corps trop volumineux'), { statut: 413 });
    morceaux.push(morceau);
  }
  if (morceaux.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(morceaux).toString('utf8'));
  } catch {
    throw Object.assign(new Error('JSON invalide'), { statut: 400 });
  }
}

export function creerServeurHttp(routes, { journal }) {
  return createServer(async (requete, reponse) => {
    let statut = 500;
    let corps = { erreur: 'Erreur interne' };
    try {
      const url = new URL(requete.url, 'http://localhost');
      const route = routes.find((r) => r.methode === requete.method && r.chemin === url.pathname);
      if (!route) {
        statut = 404;
        corps = { erreur: 'Ressource introuvable' };
      } else {
        ({ statut, corps } = await route.gerer({ corps: await lireCorps(requete), parametres: url.searchParams }));
      }
    } catch (erreur) {
      if (erreur.code in STATUT_PAR_CODE) {
        statut = STATUT_PAR_CODE[erreur.code];
        corps = { erreur: erreur.message, code: erreur.code };
      } else if (erreur.statut) {
        statut = erreur.statut;
        corps = { erreur: erreur.message };
      } else {
        journal.error('erreur inattendue', erreur);
      }
    }
    const texte = JSON.stringify(corps);
    reponse.writeHead(statut, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(texte) });
    reponse.end(texte);
  });
}
```

**La racine de composition**, une fonction qui construit toute l'application :

```js
// src/composition.js
import { creerDepotMemoire } from './reservations/depot-memoire.js';
import { creerCasReservations } from './reservations/application.js';
import { routesReservations } from './reservations/routes.js';
import { creerServeurHttp } from './partage/serveur-http.js';

export function construireApplication({ configuration, horloge = { maintenant: () => new Date() }, journal = console }) {
  const casReservations = creerCasReservations({
    depot: creerDepotMemoire(), // en production : creerDepotPostgres(configuration.baseDeDonnees)
    horloge,
    genererId: () => crypto.randomUUID(),
  });
  const serveur = creerServeurHttp([...routesReservations(casReservations)], { journal });
  return {
    demarrer: () => new Promise((resoudre) => serveur.listen(configuration.port, () => resoudre(serveur.address().port))),
    arreter: () => new Promise((resoudre, rejeter) => serveur.close((e) => (e ? rejeter(e) : resoudre()))),
  };
}
```

**Le point d'entrée**, le seul fichier qui touche à `process` :

```js
// src/main.js
import { lireConfiguration } from './partage/configuration.js';
import { construireApplication } from './composition.js';

const application = construireApplication({ configuration: lireConfiguration(process.env) });
const port = await application.demarrer();
console.log(`API démarrée sur le port ${port}`);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    console.log(`${signal} reçu, arrêt…`);
    await application.arreter();
  });
}
```

Et un test de bout en bout, qui construit l'application avec une horloge fixe, sur un port libre :

```js
// test/api.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construireApplication } from '../src/composition.js';

test('réserver une salle, puis refuser un créneau qui chevauche', async () => {
  const application = construireApplication({
    configuration: { port: 0 },
    horloge: { maintenant: () => new Date('2026-09-25T08:00:00Z') },
  });
  const port = await application.demarrer();
  const api = (chemin, options) => fetch(`http://localhost:${port}${chemin}`, options);
  const reserver = (corps) =>
    api('/reservations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(corps) });

  try {
    const creee = await reserver({ salle: 'A', debut: '2026-09-25T09:00:00Z', fin: '2026-09-25T10:00:00Z', par: 'ana' });
    assert.equal(creee.status, 201);

    const refusee = await reserver({ salle: 'A', debut: '2026-09-25T09:30:00Z', fin: '2026-09-25T10:30:00Z', par: 'bao' });
    assert.equal(refusee.status, 409);
    assert.equal((await refusee.json()).code, 'CRENEAU_PRIS');

    const liste = await (await api('/reservations?salle=A')).json();
    assert.deepEqual(liste.map((r) => r.par), ['ana']);
  } finally {
    await application.arreter();
  }
});
```

```text
$ node --test
✔ réserver une salle, puis refuser un créneau qui chevauche
ℹ pass 1
ℹ fail 0
```

## Comment ça fonctionne

**L'application est une fonction.** `construireApplication` reçoit tout ce qui dépend de l'environnement, la
configuration, l'horloge, le journal, et renvoie un objet qu'on démarre et qu'on arrête. Rien ne se passe à l'import d'un
module : pas de connexion ouverte, pas de serveur qui écoute. C'est ce qui permet au test de construire une application
isolée, sur un port libre, avec une horloge fixe, puis de l'arrêter proprement. `main.js` est la seule partie non
testée, et elle ne contient presque rien.

**Un seul endroit par décision.** La configuration est lue et validée dans `configuration.js`. Les implémentations
concrètes sont choisies dans `composition.js`. La traduction des erreurs métier en statuts HTTP est dans
`serveur-http.js`, dans une table : `CRENEAU_PRIS` donne 409, les règles de validation donnent 422. Les erreurs
inattendues deviennent un 500 générique, journalisé côté serveur. Ajouter un code d'erreur, c'est ajouter une ligne,
et aucune route n'écrit elle-même de `try...catch`.

**Les conversions aux frontières.** La route convertit les chaînes JSON en `Date` à l'entrée, et les `Date` en chaînes
ISO à la sortie. Le cas d'utilisation et le domaine ne manipulent que des types métier. La validation des formes
d'entrée, comme une date illisible, se fait aussi à la frontière ; ici, une date invalide produit une comparaison fausse
et une `ErreurMetier` du domaine ; en production, un schéma zod à l'entrée de la route donnerait un message plus précis.

**Un module métier autonome.** Tout ce qui concerne les réservations est dans `reservations/` : règles, cas
d'utilisation, stockage, routes. Un second module, comme `salles/` ou `facturation/`, aurait la même forme, et la
racine de composition concaténerait leurs routes. Le serveur HTTP partagé ne connaît aucun module : il reçoit une liste
de routes.

**Une stratégie de tests par couche.** Le domaine se teste avec des tests unitaires rapides et nombreux : ce sont les
règles. Le cas d'utilisation se teste avec des adaptateurs en mémoire. L'adaptateur de base de données se teste contre
une vraie base, dans un test d'intégration, avec la même suite de contrat que le dépôt en mémoire. Et quelques tests de
bout en bout vérifient que tout est bien assemblé, HTTP compris. Beaucoup de tests en bas, peu en haut : c'est la
pyramide des tests, vue dans la partie sur les tests.

**Ce que la structure permet ensuite.** Remplacer le dépôt en mémoire par PostgreSQL : un fichier d'adaptateur et une
ligne dans la racine. Passer à Fastify : réécrire `serveur-http.js` et l'enregistrement des routes, sans toucher aux
modules. Ajouter une commande en ligne ou un traitement planifié : un nouvel adaptateur primaire qui appelle les mêmes
cas d'utilisation. Ajouter la journalisation structurée, des métriques ou une authentification : des décorateurs ou
des middlewares à la frontière.

## Erreurs fréquentes

**Démarrer des choses à l'import.** Un module qui ouvre une connexion ou écoute un port dès qu'on l'importe rend les
tests lents et fragiles ; construis dans une fonction.

**Lire `process.env` au fond du code.** Lis et valide la configuration une fois, puis passe-la.

**Traduire les erreurs dans chaque route.** Centralise la correspondance entre codes métier et statuts HTTP.

**Des modules qui connaissent le serveur.** Un module expose des routes ou des cas d'utilisation ; le serveur les
reçoit.

**Tout tester de bout en bout.** Les règles se testent au niveau du domaine ; quelques tests de bout en bout suffisent
pour l'assemblage.

**Oublier l'arrêt.** Un test qui ne ferme pas le serveur laisse le processus de test ouvert ; `finally` et `arreter()`.

## À retenir

- Modules métier, couches à l'intérieur ; un serveur HTTP partagé qui reçoit des routes.
- `configuration.js` valide, `composition.js` assemble, `main.js` démarre et gère les signaux.
- L'application est une fonction : rien ne démarre à l'import, tout se construit, se démarre et s'arrête.
- Les erreurs métier ont des codes ; une table les traduit en statuts HTTP, en un seul endroit.
- Conversions et validation des entrées aux frontières ; types métier au cœur.
- Tests par couche : beaucoup d'unitaires sur le domaine, des tests de contrat pour les adaptateurs, peu de bout en bout.

## Exercices

1. Ajoute la route `DELETE /reservations?id=…`, qui annule une réservation. Une réservation qui a déjà commencé ne peut
   plus être annulée (code métier `DEJA_COMMENCEE`, statut 409), et un identifiant inconnu donne 404. Indique chaque
   fichier modifié et ce que tu y ajoutes.

   :::indice
   Le dépôt gagne `parId` et `retirer`, le cas d'utilisation `annuler`, la route une entrée, et la table des statuts
   deux codes.
   :::

   :::solution
   ```js
   // depot-memoire.js : deux méthodes de plus
   export function creerDepotMemoire() {
     const reservations = [];
     return {
       deLaSalle: async (salle) => reservations.filter((r) => r.salle === salle),
       ajouter: async (reservation) => void reservations.push(reservation),
       parId: async (id) => reservations.find((r) => r.id === id) ?? null,
       retirer: async (id) => {
         const index = reservations.findIndex((r) => r.id === id);
         if (index >= 0) reservations.splice(index, 1);
       },
     };
   }

   // application.js : dans l'objet renvoyé par creerCasReservations
   async function annuler(id) {
     const reservation = await depot.parId(id);
     if (!reservation) throw new ErreurMetier('INTROUVABLE', 'Réservation introuvable');
     if (reservation.debut <= horloge.maintenant()) {
       throw new ErreurMetier('DEJA_COMMENCEE', 'Une réservation commencée ne peut plus être annulée');
     }
     await depot.retirer(id);
   }

   // routes.js : une route de plus
   const routeAnnulation = (cas) => ({
     methode: 'DELETE',
     chemin: '/reservations',
     async gerer({ parametres }) {
       await cas.annuler(parametres.get('id'));
       return { statut: 200, corps: { annulee: parametres.get('id') } };
     },
   });

   // serveur-http.js : deux codes de plus dans la table
   const STATUT_PAR_CODE = {
     CRENEAU_PRIS: 409,
     DEJA_COMMENCEE: 409,
     INTROUVABLE: 404,
     DANS_LE_PASSE: 422,
     CRENEAU_INVALIDE: 422,
     CRENEAU_TROP_LONG: 422,
   };
   ```

   La règle « déjà commencée » est dans l'application, car elle dépend de l'horloge ; elle se teste avec une horloge
   fixe. Aucune route ne gère d'erreur elle-même. On aurait pu renvoyer 204 sans corps ; le serveur partagé envoie ici
   toujours du JSON, ce qui garde un seul chemin de réponse.
   :::

2. On veut remplacer le dépôt en mémoire par PostgreSQL. Décris les étapes pour le faire sans risque, et le test qui
   garantit que les deux implémentations se comportent de la même façon.

   :::indice
   Pense au contrat du dépôt, à la suite de tests de contrat, et à la racine de composition.
   :::

   :::solution
   1. Écrire une suite de tests de contrat, `testerDepotReservations(creerDepot)`, qui vérifie `ajouter`, `deLaSalle`,
      `parId` et `retirer`, y compris les cas limites : salle sans réservation, dates restituées comme des `Date`, ordre
      des résultats si le contrat en promet un.
   2. L'exécuter contre le dépôt en mémoire : elle doit passer, c'est la référence.
   3. Écrire `depot-postgres.js`, qui implémente le même contrat avec des requêtes SQL paramétrées, et convertit les
      lignes en objets du domaine.
   4. Exécuter la même suite contre une base de test, par exemple dans un conteneur lancé par l'intégration continue.
   5. Changer une ligne dans `composition.js`, en fonction de la configuration, et ajouter la fermeture du pool de
      connexions dans `arreter()`.

   Le domaine, l'application, les routes et les tests de bout en bout ne changent pas. La suite de contrat attrape les
   écarts classiques : une date renvoyée en chaîne, un `undefined` au lieu de `null`, un ordre différent.
   :::

3. Un collègue propose de remplacer `construireApplication` par des modules qui démarrent tout seuls : `db.js` ouvre la
   connexion à l'import, `serveur.js` écoute le port à l'import, et `main.js` se contente d'importer `serveur.js`.
   Quels problèmes cela pose-t-il ?

   :::indice
   Pense aux tests, à la configuration, aux ports, et à l'arrêt.
   :::

   :::solution
   - **Tests** : importer n'importe quel module démarre une connexion et un serveur. Les tests unitaires deviennent
     lents, dépendent d'une base, et deux fichiers de test ne peuvent pas démarrer deux serveurs sur le même port.
   - **Configuration** : les modules lisent `process.env` au moment de l'import, avant que le test ou le script ait pu
     fournir une configuration différente.
   - **Injection** : impossible de remplacer la base par un dépôt en mémoire ou l'horloge par une horloge fixe sans
     bibliothèque de simulation de modules.
   - **Arrêt** : personne ne détient les ressources ouvertes ; fermer proprement le serveur et le pool lors d'un
     `SIGTERM` ou à la fin d'un test devient difficile.
   - **Ordre** : l'ordre des imports décide de l'ordre du démarrage, une dépendance cachée.

   Une fonction de construction explicite règle tout cela : chaque appel crée une application isolée, configurée, qu'on
   démarre et qu'on arrête à volonté.
   :::

## Questions d'entretien

- Comment structurerais-tu une API Node.js qui doit durer ?

  :::indice
  Modules, couches, composition, configuration, tests.
  :::

  :::reponse
  Par modules métier, chacun avec son domaine, ses cas d'utilisation, ses adaptateurs et ses routes, et une interface
  publique. Le domaine ne dépend d'aucune technologie ; les adaptateurs implémentent ses contrats. Une racine de
  composition construit l'application à partir d'une configuration validée ; `main.js` ne fait que démarrer et gérer
  les signaux. Les erreurs métier ont des codes, traduits en statuts HTTP en un seul endroit. L'application est une
  fonction qu'on démarre et arrête, ce qui rend les tests de bout en bout simples. Et la stratégie de tests suit les
  couches : beaucoup d'unitaires sur les règles, des tests de contrat pour les adaptateurs, quelques tests de bout en bout.
  :::

- Où gères-tu la traduction entre erreurs métier et statuts HTTP ?

  :::indice
  Un seul endroit, à la frontière.
  :::

  :::reponse
  À la frontière HTTP, dans un gestionnaire d'erreurs central : un middleware avec Express ou Fastify, ou le serveur
  partagé dans une application sans framework. Les couches internes lèvent des erreurs métier avec un code stable, sans
  rien savoir de HTTP, et une table associe chaque code à un statut. Les erreurs inattendues deviennent un 500 générique,
  journalisé avec un identifiant de corrélation. Ainsi, aucune route ne répète cette logique, et un même cas
  d'utilisation peut être appelé depuis une commande ou une file de messages, avec une autre traduction.
  :::

- Pourquoi éviter qu'un module ouvre une connexion ou démarre un serveur au moment de l'import ?

  :::indice
  Tests, configuration, arrêt.
  :::

  :::reponse
  Parce que l'import devient un effet de bord : les tests qui importent le module ouvrent des connexions et des ports, la
  configuration est lue avant qu'on puisse la fournir, les dépendances ne peuvent plus être remplacées, et personne ne
  détient les ressources pour les fermer. Je construis l'application dans une fonction qui reçoit sa configuration et ses
  dépendances, et renvoie de quoi la démarrer et l'arrêter. Le point d'entrée appelle cette fonction ; les tests aussi,
  avec d'autres paramètres.
  :::
