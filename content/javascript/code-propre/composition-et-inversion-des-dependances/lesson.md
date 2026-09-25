---
id: javascript-composition-et-inversion-des-dependances
title: "Composition et inversion des dépendances"
slug: composition-et-inversion-des-dependances
technology: javascript
level: advanced
module: code-propre
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-responsabilite-cohesion-couplage
  - javascript-strategie-observateur
skills:
  - js-dependency-inversion
tags:
  - javascript
  - architecture
  - solid
---

## Objectifs

- Appliquer le principe d'inversion des dépendances : la politique ne dépend pas des détails.
- Définir un contrat du point de vue de celui qui l'utilise, sans interfaces du langage.
- Assembler l'application en un seul endroit, la racine de composition.
- Ajouter un comportement par composition, avec des décorateurs : journalisation, réessai, cache.
- Vérifier que plusieurs implémentations respectent le même contrat, avec une suite de tests partagée.

## Introduction

Dans la partie sur les patterns objet, on a passé ses collaborateurs à un objet pour pouvoir le tester : c'est
l'injection de dépendances. Ce chapitre en donne la raison profonde, et la mène au niveau de l'application.

Le code qui porte les **décisions** de l'application, ses règles et ses cas d'utilisation, est le plus précieux. Le
code qui parle au monde extérieur, base de données, fournisseur d'e-mails, API de paiement, est un **détail** : il
changera plus souvent, pour des raisons techniques. Le principe d'inversion des dépendances organise le code pour
que les détails dépendent des décisions, et non l'inverse.

## Concept

**Principe d'inversion des dépendances** (le D de SOLID) : les modules de haut niveau ne dépendent pas des modules de
bas niveau ; les deux dépendent d'une abstraction. Et l'abstraction est définie par le haut niveau, selon ses besoins.

```text
Sans inversion                         Avec inversion

commande.js ──import──▶ postgres.js    commande.js ──utilise──▶ contrat « dépôt de commandes »
                                                                      ▲
                                        postgres.js ──implémente──────┘
```

| Élément | Rôle |
| --- | --- |
| contrat, ou *port* | la forme attendue d'un collaborateur : `{ ajouter(commande), parId(id) }` |
| implémentation, ou *adaptateur* | un objet qui respecte le contrat : PostgreSQL, en mémoire, un faux pour les tests |
| racine de composition | le seul endroit qui crée les implémentations concrètes et les assemble |
| décorateur | un objet qui respecte le même contrat en enveloppant un autre, pour ajouter un comportement |

## Exemple

Un cas d'utilisation confirme une commande et prévient le client. Il dépend de deux contrats, qu'il décrit lui-même :

```js
// commandes/confirmer.js
/**
 * @typedef {{ parId(id: string): Promise<object|null>, enregistrer(commande: object): Promise<void> }} DepotCommandes
 * @typedef {{ envoyer(destinataire: string, message: string): Promise<void> }} Notificateur
 */

/** @param {{ commandes: DepotCommandes, notificateur: Notificateur }} dependances */
export function creerConfirmation({ commandes, notificateur }) {
  return async function confirmer(id) {
    const commande = await commandes.parId(id);
    if (!commande) return { type: 'introuvable' };
    if (commande.statut !== 'en-attente') return { type: 'deja-traitee' };

    const confirmee = { ...commande, statut: 'confirmee' };
    await commandes.enregistrer(confirmee);
    await notificateur.envoyer(commande.email, `Votre commande ${id} est confirmée.`);
    return { type: 'confirmee', commande: confirmee };
  };
}
```

Des implémentations, et un décorateur qui ajoute la journalisation à n'importe quel notificateur :

```js
export function creerDepotEnMemoire(commandesInitiales = []) {
  const commandes = new Map(commandesInitiales.map((c) => [c.id, c]));
  return {
    parId: async (id) => commandes.get(id) ?? null,
    enregistrer: async (commande) => {
      commandes.set(commande.id, commande);
    },
  };
}

export function creerNotificateurConsole() {
  return { envoyer: async (destinataire, message) => console.log(`→ ${destinataire} : ${message}`) };
}

// Décorateur : même contrat, comportement en plus.
export function avecJournal(notificateur, journal = console) {
  return {
    async envoyer(destinataire, message) {
      const debut = performance.now();
      await notificateur.envoyer(destinataire, message);
      journal.info(`notification envoyée en ${Math.round(performance.now() - debut)} ms`);
    },
  };
}
```

La racine de composition, au démarrage, est le seul endroit qui choisit les implémentations :

```js
// main.js
const confirmer = creerConfirmation({
  commandes: creerDepotEnMemoire([{ id: 'c1', email: 'ana@exemple.fr', statut: 'en-attente' }]),
  notificateur: avecJournal(creerNotificateurConsole()),
});

console.log(await confirmer('c1'));
console.log(await confirmer('c1'));
// → ana@exemple.fr : Votre commande c1 est confirmée.
// notification envoyée en 3 ms  (la durée varie)
// { type: 'confirmee', commande: { id: 'c1', email: 'ana@exemple.fr', statut: 'confirmee' } }
// { type: 'deja-traitee' }
```

En production, la racine passera un dépôt PostgreSQL et un notificateur par e-mail ; le cas d'utilisation ne change
pas d'une ligne.

## Comment ça fonctionne

**Qui dépend de qui.** Sans inversion, `confirmer.js` importerait `postgres.js` et `smtp.js` : changer de base ou de
fournisseur obligerait à modifier la règle métier, et la tester demanderait une base et un serveur SMTP. Avec
l'inversion, `confirmer.js` n'importe rien de concret : il déclare de quoi il a besoin. Ce sont les modules
techniques qui s'adaptent à ce besoin. La flèche des dépendances du code pointe vers les décisions, à l'inverse du
flux d'exécution, qui va de la règle vers la base : d'où le nom.

**Le contrat appartient à celui qui l'utilise.** Le dépôt ne présente pas « tout ce que sait faire PostgreSQL », mais
les deux opérations dont la confirmation a besoin, dans son vocabulaire : `parId`, `enregistrer`. Un contrat étroit
est facile à implémenter, en mémoire pour les tests ou avec un autre stockage plus tard. C'est aussi le principe de
ségrégation des interfaces, le I de SOLID : aucun client ne devrait dépendre de méthodes qu'il n'utilise pas.

**Sans interfaces dans le langage.** JavaScript n'a pas de mot-clé `interface`. Le contrat est la forme de l'objet :
on le documente avec JSDoc, que les éditeurs et TypeScript savent vérifier, et on le vérifie avec une **suite de
tests de contrat** exécutée contre chaque implémentation. Si l'implémentation en mémoire et l'implémentation SQL
passent les mêmes tests, on peut remplacer l'une par l'autre en confiance. C'est le principe de substitution de
Liskov, le L de SOLID, appliqué aux objets plutôt qu'aux classes.

**La racine de composition.** Quelque part, il faut bien créer les objets concrets. On le fait en un seul endroit, au
démarrage : `main.js`, ou la fonction qui construit le serveur. Partout ailleurs, le code reçoit ses dépendances.
Ainsi, les choix techniques sont visibles d'un coup d'œil, et une configuration de test ou de développement n'est
qu'une autre racine. En JavaScript, des fonctions et des objets suffisent ; un conteneur d'injection n'est utile que
dans de très grandes applications.

**Composer des comportements.** Un décorateur respecte le contrat qu'il enveloppe : `avecJournal(notificateur)` est
lui-même un notificateur. On peut empiler : `avecJournal(avecReessai(creerNotificateurEmail(config)))`. Chaque
préoccupation transversale, journalisation, réessais, cache, mesure, reste dans son propre module, et le cas
d'utilisation n'en sait rien. C'est le principe ouvert-fermé, le O de SOLID : on étend le comportement en ajoutant du
code, sans modifier celui qui existe.

**Ne pas tout abstraire.** Un contrat a un coût : une indirection de plus à suivre. On inverse les dépendances vers
ce qui est **volatil** ou **lent à tester** : entrées-sorties, services externes, horloge, hasard. On n'abstrait pas
une fonction pure et stable comme le calcul d'une TVA : on l'importe directement.

## Erreurs fréquentes

**Importer un module d'infrastructure depuis une règle métier.** La règle devient impossible à tester et à faire
évoluer sans lui.

**Définir le contrat d'après l'outil.** Un « dépôt » qui expose `query(sql)` fuit la base de données ; décris les
besoins métier.

**Créer les dépendances partout.** `new ClientSmtp()` au milieu d'un cas d'utilisation contourne l'injection ;
centralise dans la racine de composition.

**Des implémentations qui divergent en silence.** Le faux en mémoire accepte ce que la vraie base refuse ; une suite
de tests de contrat commune l'évite.

**Abstraire ce qui est stable.** Une interface pour chaque fonction pure alourdit le code sans rien apporter.

**Mettre la logique dans un décorateur.** Un décorateur ajoute une préoccupation transversale, pas une règle métier.

## À retenir

- La politique ne dépend pas des détails : les deux dépendent d'un contrat défini par la politique.
- Un contrat étroit, dans le vocabulaire de celui qui l'utilise, est facile à implémenter et à tester.
- En JavaScript, le contrat est une forme d'objet : JSDoc pour le documenter, tests de contrat pour le vérifier.
- Une seule racine de composition crée et assemble les implémentations concrètes.
- Les décorateurs composent journalisation, réessais et cache sans toucher au code métier.
- On inverse les dépendances vers ce qui est volatil ou lent à tester.

## Exercices

1. Ce cas d'utilisation viole l'inversion des dépendances. Réécris-le pour qu'il se teste sans réseau, sans horloge
   réelle et sans base de données.

   ```js
   import { pool } from '../infra/postgres.js';
   import Stripe from 'stripe';

   const stripe = new Stripe(process.env.STRIPE_KEY);

   export async function rembourser(commandeId) {
     const { rows } = await pool.query('SELECT * FROM commandes WHERE id = $1', [commandeId]);
     const commande = rows[0];
     const jours = (Date.now() - commande.payeeLe.getTime()) / 86_400_000;
     if (jours > 30) throw new Error('Délai de remboursement dépassé');
     await stripe.refunds.create({ payment_intent: commande.paiementId });
     await pool.query("UPDATE commandes SET statut = 'remboursee' WHERE id = $1", [commandeId]);
   }
   ```

   :::indice
   Trois dépendances à inverser : les commandes, le prestataire de paiement, l'horloge. Décris-les avec les besoins
   du cas d'utilisation.
   :::

   :::solution
   ```js
   const DELAI_REMBOURSEMENT_JOURS = 30;
   const MS_PAR_JOUR = 86_400_000;

   export function creerRemboursement({ commandes, paiements, maintenant = () => new Date() }) {
     return async function rembourser(commandeId) {
       const commande = await commandes.parId(commandeId);
       if (!commande) return { type: 'introuvable' };
       const jours = (maintenant().getTime() - commande.payeeLe.getTime()) / MS_PAR_JOUR;
       if (jours > DELAI_REMBOURSEMENT_JOURS) return { type: 'delai-depasse' };

       await paiements.rembourser(commande.paiementId);
       await commandes.enregistrer({ ...commande, statut: 'remboursee' });
       return { type: 'remboursee' };
     };
   }

   // Test, sans réseau ni base :
   const rembourses = [];
   const enregistrees = [];
   const rembourser = creerRemboursement({
     commandes: {
       parId: async (id) => ({ id, paiementId: 'pi_1', payeeLe: new Date('2026-09-01'), statut: 'payee' }),
       enregistrer: async (commande) => enregistrees.push(commande),
     },
     paiements: { rembourser: async (id) => rembourses.push(id) },
     maintenant: () => new Date('2026-09-20'),
   });
   console.log(await rembourser('c1'), rembourses, enregistrees[0].statut);
   // { type: 'remboursee' } [ 'pi_1' ] remboursee
   ```

   L'adaptateur Stripe, dans l'infrastructure, implémente `paiements.rembourser(paiementId)` avec
   `stripe.refunds.create`, et le dépôt PostgreSQL implémente `parId` et `enregistrer`. La racine de composition les
   assemble. Le délai dépassé devient un résultat métier, que la couche HTTP traduira.
   :::

2. Écris un décorateur `avecReessai(notificateur, { tentatives, delaiMs })` qui réessaie `envoyer` en cas d'échec, avec
   un délai qui double à chaque tentative, et relance la dernière erreur si toutes échouent. Teste-le avec un
   notificateur qui échoue deux fois puis réussit.

   :::indice
   Même contrat que le notificateur. Une boucle, un `try`, et `await new Promise((r) => setTimeout(r, delai))`.
   :::

   :::solution
   ```js
   const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

   function avecReessai(notificateur, { tentatives = 3, delaiMs = 100 } = {}) {
     return {
       async envoyer(destinataire, message) {
         let derniereErreur;
         for (let essai = 1; essai <= tentatives; essai++) {
           try {
             return await notificateur.envoyer(destinataire, message);
           } catch (erreur) {
             derniereErreur = erreur;
             if (essai < tentatives) await attendre(delaiMs * 2 ** (essai - 1));
           }
         }
         throw derniereErreur;
       },
     };
   }

   let appels = 0;
   const instable = {
     envoyer: async () => {
       appels += 1;
       if (appels < 3) throw new Error(`échec ${appels}`);
     },
   };

   await avecReessai(instable, { tentatives: 3, delaiMs: 10 }).envoyer('ana@exemple.fr', 'Bonjour');
   console.log('réussi après', appels, 'appels'); // réussi après 3 appels

   appels = -10; // échouera à chaque fois
   await avecReessai(instable, { tentatives: 2, delaiMs: 10 })
     .envoyer('ana@exemple.fr', 'Bonjour')
     .catch((erreur) => console.log(erreur.message)); // échec -8
   ```

   Le cas d'utilisation ne sait pas qu'il y a des réessais : c'est la racine de composition qui décide de décorer le
   notificateur. On ne réessaie que des opérations qu'on peut répéter sans effet indésirable : renvoyer un e-mail deux
   fois est gênant, débiter deux fois une carte est grave.
   :::

3. Écris une fonction `testerDepotCommandes(creerDepot)` qui vérifie le contrat `{ parId, enregistrer }` : une commande
   enregistrée se relit à l'identique ; un identifiant inconnu donne `null` ; un second `enregistrer` remplace la
   commande. Exécute-la contre `creerDepotEnMemoire`, et contre une implémentation qui stocke du JSON dans une `Map`.

   :::indice
   Une fonction qui reçoit une fabrique et lance des assertions avec `node:assert/strict`. Chaque implémentation
   appelle la même fonction.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   async function testerDepotCommandes(nom, creerDepot) {
     const depot = creerDepot();
     const commande = { id: 'c1', email: 'ana@exemple.fr', statut: 'en-attente', total: 42 };

     await depot.enregistrer(commande);
     assert.deepEqual(await depot.parId('c1'), commande);
     assert.equal(await depot.parId('inconnu'), null);

     await depot.enregistrer({ ...commande, statut: 'confirmee' });
     assert.equal((await depot.parId('c1')).statut, 'confirmee');
     console.log(`${nom} : contrat respecté`);
   }

   function creerDepotEnMemoire() {
     const commandes = new Map();
     return {
       parId: async (id) => commandes.get(id) ?? null,
       enregistrer: async (commande) => void commandes.set(commande.id, commande),
     };
   }

   function creerDepotJson() {
     const lignes = new Map();
     return {
       parId: async (id) => (lignes.has(id) ? JSON.parse(lignes.get(id)) : null),
       enregistrer: async (commande) => void lignes.set(commande.id, JSON.stringify(commande)),
     };
   }

   await testerDepotCommandes('mémoire', creerDepotEnMemoire);
   await testerDepotCommandes('JSON', creerDepotJson);
   // mémoire : contrat respecté
   // JSON : contrat respecté
   ```

   Dans un vrai projet, la même suite s'exécute aussi contre le dépôt PostgreSQL, dans les tests d'intégration. Si
   le faux en mémoire et la vraie base se comportent différemment, par exemple sur les dates que JSON transforme en
   chaînes, la suite le révèle avant la production.
   :::

## Questions d'entretien

- Explique le principe d'inversion des dépendances avec un exemple.

  :::indice
  Une règle métier, une base de données, et le sens des flèches.
  :::

  :::reponse
  Les modules de haut niveau, qui portent les règles, ne doivent pas dépendre des modules de bas niveau, comme l'accès
  à une base de données ; les deux doivent dépendre d'une abstraction définie par le haut niveau. Par exemple, un cas
  d'utilisation « confirmer une commande » déclare qu'il a besoin d'un dépôt avec `parId` et `enregistrer`, et d'un
  notificateur. L'adaptateur PostgreSQL et l'adaptateur e-mail implémentent ces contrats, et une racine de composition
  les assemble. On peut alors tester la règle avec des implémentations en mémoire, et changer de base sans toucher à
  la règle.
  :::

- Quelle différence entre injection de dépendances et inversion des dépendances ?

  :::indice
  L'une est une technique, l'autre un principe sur la direction des dépendances.
  :::

  :::reponse
  L'inversion des dépendances est un principe d'architecture : la direction des dépendances du code doit aller des
  détails vers les politiques, à travers des abstractions possédées par les politiques. L'injection de dépendances est
  une technique : fournir à un objet ses collaborateurs de l'extérieur, par paramètre ou constructeur, au lieu qu'il
  les crée. L'injection est le moyen le plus courant de réaliser l'inversion, mais on peut injecter des dépendances
  concrètes sans rien inverser, par exemple en injectant directement un client PostgreSQL dans une règle métier.
  :::

- Qu'est-ce qu'un décorateur, et à quoi sert-il dans une architecture ?

  :::indice
  Même contrat, comportement en plus.
  :::

  :::reponse
  C'est un objet qui respecte le même contrat que l'objet qu'il enveloppe, et qui ajoute un comportement avant ou
  après la délégation : journalisation, mesure, cache, réessais, contrôle d'accès. Le code qui l'utilise ne voit pas la
  différence. On garde ainsi chaque préoccupation transversale dans un module séparé, et on la compose au moment de
  l'assemblage, dans la racine de composition, sans modifier le code métier. On étend le comportement sans modifier
  l'existant.
  :::
