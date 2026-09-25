---
id: javascript-patterns-a-l-echelle-d-une-application
title: "Fabrique, stratégie, observateur, dépôt et injection à l'échelle d'une application"
slug: patterns-a-l-echelle-d-une-application
technology: javascript
level: advanced
module: design-patterns
order: 3
estimatedMinutes: 50
difficulty: 4
xp: 110
prerequisites:
  - javascript-builder-adapter-facade
  - javascript-command-et-machine-a-etats
skills:
  - js-patterns-at-scale
tags:
  - javascript
  - architecture
  - design-patterns
---

## Objectifs

- Choisir une implémentation selon la configuration avec une fabrique, au démarrage.
- Sélectionner une règle métier à l'exécution avec une table de stratégies.
- Découpler les effets secondaires d'un cas d'utilisation avec des événements de domaine.
- Concevoir un dépôt dont les méthodes parlent le langage du métier.
- Assembler le tout dans une racine de composition, et savoir quand un pattern est de trop.

## Introduction

Les patterns vus jusqu'ici prennent tout leur sens quand ils travaillent ensemble. Dans une vraie application, passer
une commande implique de calculer un prix selon le pays et le type de client, d'enregistrer la commande, puis de
déclencher une série de réactions : e-mail de confirmation, réservation du stock, statistiques. Chacune de ces parties
évolue à son rythme, et chacune doit pouvoir être testée seule.

Ce chapitre montre comment fabrique, stratégie, observateur, dépôt et injection de dépendances s'articulent autour d'un
cas d'utilisation, et comment les garder à leur juste mesure.

## Concept

| Pattern | Question à laquelle il répond | À l'échelle d'une application |
| --- | --- | --- |
| fabrique | quelle implémentation créer ? | au démarrage, selon la configuration : stockage local ou cloud, e-mail réel ou console |
| stratégie | quelle règle appliquer ? | à l'exécution, selon les données : tarification par pays, par segment de client |
| observateur | qui doit réagir ? | événements de domaine : `CommandePassee` déclenche e-mail, stock, statistiques |
| dépôt | comment lire et écrire les objets métier ? | des méthodes au vocabulaire métier, qui cachent la base et l'ORM |
| injection | d'où viennent les collaborateurs ? | une racine de composition qui assemble tout |

## Exemple

Le cas d'utilisation « passer une commande » ne connaît que des contrats :

```js
// commandes/passer-commande.js
export function creerPasserCommande({ commandes, tarification, evenements, genererId }) {
  return async function passerCommande({ client, lignes }) {
    if (lignes.length === 0) return { type: 'panier-vide' };

    const regle = tarification.pour(client); // stratégie choisie selon le client
    const total = regle.total(lignes);
    const commande = { id: genererId(), clientId: client.id, lignes, total, statut: 'passee' };

    await commandes.ajouter(commande); // dépôt
    await evenements.publier({ type: 'CommandePassee', commande, client }); // observateurs
    return { type: 'passee', commande };
  };
}
```

Les stratégies de tarification, choisies par une table :

```js
// tarification.js
const sousTotal = (lignes) => lignes.reduce((s, l) => s + l.prix * l.quantite, 0);
const arrondir = (montant) => Math.round(montant * 100) / 100;

const STRATEGIES = {
  particulier: { total: (lignes) => arrondir(sousTotal(lignes) * 1.2) }, // TTC
  professionnel: { total: (lignes) => arrondir(sousTotal(lignes)) }, // HT, TVA autoliquidée
  membre: { total: (lignes) => arrondir(sousTotal(lignes) * 0.9 * 1.2) },
};

export const tarification = {
  pour(client) {
    const strategie = STRATEGIES[client.segment];
    if (!strategie) throw new Error(`Segment de client inconnu : ${client.segment}`);
    return strategie;
  },
};
```

Un bus d'événements minimal, et des réactions indépendantes :

```js
// evenements.js
export function creerBusEvenements({ journal = console } = {}) {
  const abonnes = new Map();
  return {
    abonner(type, reaction) {
      if (!abonnes.has(type)) abonnes.set(type, []);
      abonnes.get(type).push(reaction);
      return () => abonnes.set(type, abonnes.get(type).filter((r) => r !== reaction));
    },
    async publier(evenement) {
      const reactions = abonnes.get(evenement.type) ?? [];
      const resultats = await Promise.allSettled(reactions.map((reaction) => reaction(evenement)));
      for (const resultat of resultats) {
        if (resultat.status === 'rejected') journal.error(`réaction à ${evenement.type} en échec`, resultat.reason.message);
      }
    },
  };
}
```

La racine de composition assemble, avec une fabrique qui choisit le notificateur selon l'environnement :

```js
// main.js
function creerNotificateur(config) {
  if (config.email === 'console') return { envoyer: async (a, m) => console.log(`[email] ${a} : ${m}`) };
  throw new Error(`Notificateur inconnu : ${config.email}`); // en production : un adaptateur SMTP
}

const config = { email: 'console' };
const bus = creerBusEvenements();
const stock = new Map([['lampe', 5]]);
const commandesEnregistrees = new Map();
const notificateur = creerNotificateur(config);

bus.abonner('CommandePassee', async ({ commande, client }) => {
  await notificateur.envoyer(client.email, `Commande ${commande.id} : ${commande.total} €`);
});
bus.abonner('CommandePassee', async ({ commande }) => {
  for (const { sku, quantite } of commande.lignes) stock.set(sku, stock.get(sku) - quantite);
});

const passerCommande = creerPasserCommande({
  commandes: { ajouter: async (c) => void commandesEnregistrees.set(c.id, c) },
  tarification,
  evenements: bus,
  genererId: () => `c-${commandesEnregistrees.size + 1}`,
});

const resultat = await passerCommande({
  client: { id: 'u1', email: 'ana@exemple.fr', segment: 'membre' },
  lignes: [{ sku: 'lampe', prix: 50, quantite: 2 }],
});
console.log(resultat.commande.total, stock.get('lampe'));
// [email] ana@exemple.fr : Commande c-1 : 108 €
// 108 3
```

## Comment ça fonctionne

**Fabrique au démarrage, stratégie à l'exécution.** La fabrique répond à une question qui ne change pas pendant la vie
du processus : en développement, les e-mails s'affichent dans la console ; en production, ils partent par SMTP. On la
lit dans la racine de composition, à partir de la configuration. La stratégie répond à une question qui change à
chaque appel : ce client est-il un particulier, un professionnel, un membre ? La table `STRATEGIES` rend la liste des
règles visible et fermée : un segment inconnu est une erreur explicite, pas un tarif par défaut silencieux. Ajouter une
règle, c'est ajouter une entrée, sans modifier le cas d'utilisation.

**Des événements de domaine pour découpler les réactions.** Sans événements, `passerCommande` appellerait lui-même
l'e-mail, le stock, les statistiques, et demain la fidélité : chaque nouvelle réaction modifierait le cas
d'utilisation, et un échec de l'e-mail ferait échouer la commande. Avec un événement, le cas d'utilisation annonce un
**fait métier**, au passé : « une commande a été passée ». Les modules intéressés s'abonnent. On ajoute une réaction
sans toucher au code existant.

**Les choix du bus.** Ici, `publier` attend toutes les réactions avec `Promise.allSettled` : un échec de l'une
n'empêche pas les autres, et il est journalisé. D'autres choix sont possibles : ne pas attendre les réactions, pour
répondre plus vite ; ou faire échouer la publication si une réaction critique échoue. Un point est crucial : si le
processus s'arrête entre l'enregistrement de la commande et la publication, les réactions sont perdues. Les systèmes
qui ne peuvent pas se le permettre enregistrent l'événement dans la même transaction que la commande, dans une table
*outbox*, et un processus séparé le publie ensuite vers une file de messages. Le principe reste celui de
l'observateur.

**Des dépôts qui parlent métier.** Un dépôt n'est pas une façade sur la base de données : ses méthodes décrivent des
besoins métier, `commandesEnAttenteDepuis(date)`, `ajouter(commande)`, `parId(id)`, et renvoient des objets métier, pas
des lignes SQL. Le jour où l'on change de base, ou où l'on ajoute un cache, seul le dépôt change. On évite le dépôt
« générique » qui expose `trouver(criteres)` avec n'importe quel filtre : il fait fuir la structure de la base dans tout
le code.

**La racine de composition, là où tout se voit.** Tous les choix concrets sont réunis dans `main.js` : quel
notificateur, quel dépôt, quelles réactions à quels événements. Pour un test d'intégration, on écrit une autre racine,
avec des implémentations en mémoire. Pour une requête HTTP, certaines dépendances dépendent de la requête, comme
l'utilisateur connecté : on les passe en paramètres, ou on crée les cas d'utilisation dans une petite fabrique par
requête.

**Pas de pattern sans problème.** Chaque pattern ajoute une indirection. Une table de stratégies pour une seule règle,
un bus d'événements pour une seule réaction, une fabrique pour une seule implémentation : c'est de la complexité sans
bénéfice. On introduit un pattern quand le besoin apparaît, typiquement à la deuxième variante, et on le retire s'il
ne sert plus.

## Erreurs fréquentes

**Une stratégie par défaut silencieuse.** Un segment inconnu facturé au tarif particulier cache une erreur de données ;
refuse-le.

**Des événements nommés comme des ordres.** `EnvoyerEmail` est une commande déguisée ; un événement décrit un fait
passé : `CommandePassee`.

**Une réaction qui fait échouer le cas d'utilisation.** L'e-mail en panne ne doit pas annuler une commande payée ;
isole les réactions.

**Perdre des événements critiques.** Si une réaction est indispensable, enregistre l'événement avec la donnée, puis
publie-le de façon fiable.

**Un dépôt qui expose la base.** `requete(sql)` ou `trouver(criteres)` quelconques font fuir le schéma ; nomme les
besoins.

**Des patterns par anticipation.** Attends la deuxième variante avant d'abstraire.

## À retenir

- Fabrique : choisir l'implémentation au démarrage, selon la configuration, dans la racine de composition.
- Stratégie : choisir la règle à l'exécution, dans une table fermée qui refuse l'inconnu.
- Événements de domaine : un fait passé, publié par le cas d'utilisation, auquel des modules indépendants réagissent.
- Isoler les réactions ; pour les réactions critiques, publication fiable avec une *outbox*.
- Dépôt : des méthodes au vocabulaire métier, qui renvoient des objets métier.
- Un pattern se justifie par un besoin présent, souvent à la deuxième variante.

## Exercices

1. Ajoute une réaction « points de fidélité » à l'événement `CommandePassee` : un point par euro dépensé, pour les
   seuls membres. Montre que tu n'as modifié ni `passerCommande` ni les autres réactions, et qu'une réaction en échec
   n'empêche pas les autres.

   :::indice
   Un nouvel `abonner`, dans la racine de composition. Pour tester l'isolation, une réaction qui lève une erreur.
   :::

   :::solution
   ```js
   function creerBusEvenements({ journal = console } = {}) {
     const abonnes = new Map();
     return {
       abonner(type, reaction) {
         if (!abonnes.has(type)) abonnes.set(type, []);
         abonnes.get(type).push(reaction);
       },
       async publier(evenement) {
         const reactions = abonnes.get(evenement.type) ?? [];
         const resultats = await Promise.allSettled(reactions.map((r) => r(evenement)));
         for (const r of resultats) if (r.status === 'rejected') journal.error('échec :', r.reason.message);
       },
     };
   }

   const bus = creerBusEvenements();
   const points = new Map();

   bus.abonner('CommandePassee', async () => {
     throw new Error('service statistiques indisponible');
   });
   bus.abonner('CommandePassee', async ({ commande, client }) => {
     if (client.segment !== 'membre') return;
     points.set(client.id, (points.get(client.id) ?? 0) + Math.floor(commande.total));
   });

   await bus.publier({ type: 'CommandePassee', commande: { total: 108.6 }, client: { id: 'u1', segment: 'membre' } });
   await bus.publier({ type: 'CommandePassee', commande: { total: 40 }, client: { id: 'u2', segment: 'particulier' } });
   console.log(points); // Map(1) { 'u1' => 108 }
   ```

   La réaction s'ajoute par un appel à `abonner`, dans la racine de composition. Le cas d'utilisation ignore son
   existence. La réaction des statistiques échoue, l'erreur est journalisée, et les points sont quand même attribués.
   :::

2. Ce dépôt expose trop la base de données. Réécris son contrat avec des méthodes métier, pour les besoins suivants :
   relancer les paniers abandonnés depuis plus de 24 heures, afficher les dix dernières commandes d'un client, et
   retrouver une commande par son identifiant.

   ```js
   const depot = {
     requete: (sql, parametres) => pool.query(sql, parametres),
     trouver: (table, filtres) => { /* … */ },
   };
   ```

   :::indice
   Un nom de méthode par besoin, avec des paramètres métier : un instant, un client, un identifiant.
   :::

   :::solution
   ```js
   /**
    * @typedef {object} DepotCommandes
    * @property {(id: string) => Promise<object|null>} parId
    * @property {(clientId: string, limite?: number) => Promise<object[]>} dernieresDuClient
    * @property {(avant: Date) => Promise<object[]>} paniersAbandonnesDepuis
    */

   // Implémentation en mémoire, qui sert aussi de spécification exécutable.
   function creerDepotCommandesEnMemoire(commandes) {
     return {
       parId: async (id) => commandes.find((c) => c.id === id) ?? null,
       dernieresDuClient: async (clientId, limite = 10) =>
         commandes
           .filter((c) => c.clientId === clientId)
           .toSorted((a, b) => b.creeeLe - a.creeeLe)
           .slice(0, limite),
       paniersAbandonnesDepuis: async (avant) =>
         commandes.filter((c) => c.statut === 'panier' && c.modifieeLe < avant),
     };
   }

   const maintenant = new Date('2026-09-25T12:00:00Z');
   const depot = creerDepotCommandesEnMemoire([
     { id: 'c1', clientId: 'u1', statut: 'panier', creeeLe: new Date('2026-09-23'), modifieeLe: new Date('2026-09-23') },
     { id: 'c2', clientId: 'u1', statut: 'payee', creeeLe: new Date('2026-09-24'), modifieeLe: new Date('2026-09-24') },
   ]);
   const hier = new Date(maintenant.getTime() - 24 * 60 * 60 * 1000);
   console.log((await depot.paniersAbandonnesDepuis(hier)).map((c) => c.id)); // [ 'c1' ]
   console.log((await depot.dernieresDuClient('u1')).map((c) => c.id)); // [ 'c2', 'c1' ]
   ```

   Chaque méthode dit **pourquoi** on lit les données. L'implémentation SQL traduira chacune en une requête optimisée,
   avec ses index, sans que le reste du code connaisse les tables. La règle « abandonné depuis 24 heures » reste dans
   le cas d'utilisation, qui calcule l'instant et le passe au dépôt.
   :::

3. Un collègue propose d'introduire, pour une application qui n'envoie que des e-mails par un seul fournisseur : une
   interface `Notificateur`, une fabrique `creerNotificateur(type)`, un registre de stratégies de notification et un bus
   d'événements pour l'unique réaction « e-mail de bienvenue ». Que gardes-tu, et pourquoi ?

   :::indice
   Pour chaque pattern : quel problème présent résout-il ?
   :::

   :::solution
   Je garde le contrat du notificateur, injecté dans le cas d'utilisation : il permet de tester sans envoyer d'e-mails,
   et il isole le fournisseur dans un adaptateur. C'est un besoin présent, les tests.

   Je reporte le reste. La fabrique n'a qu'une implémentation à créer : la racine de composition la crée directement.
   Le registre de stratégies n'a qu'une stratégie : c'est une indirection sans choix. Le bus d'événements pour une seule
   réaction ajoute un mécanisme d'abonnement que personne n'utilise ; un appel direct au notificateur, depuis le cas
   d'utilisation, est plus lisible.

   Quand un deuxième canal apparaîtra, SMS ou notifications push, une fabrique ou une stratégie aura un rôle. Quand
   plusieurs modules devront réagir à l'inscription, un événement de domaine aussi. On introduit le pattern quand le
   problème existe : c'est moins de code à comprendre en attendant, et le refactoring vers le pattern est simple si le
   code est propre.
   :::

## Questions d'entretien

- Quelle différence entre une fabrique et une stratégie ?

  :::indice
  Quand le choix se fait-il, et que choisit-on ?
  :::

  :::reponse
  La fabrique choisit quoi **créer** : une implémentation, souvent au démarrage, à partir de la configuration, comme un
  stockage local en développement et un stockage cloud en production. La stratégie choisit quelle **règle appliquer**,
  à chaque appel, selon les données, comme une tarification différente selon le type de client. On les combine souvent :
  une fabrique peut construire la table des stratégies disponibles. Dans les deux cas, le code appelant ne dépend que
  du contrat commun.
  :::

- Qu'est-ce qu'un événement de domaine, et quels problèmes pose-t-il ?

  :::indice
  Un fait passé, des réactions indépendantes, et la fiabilité.
  :::

  :::reponse
  C'est l'annonce d'un fait métier qui s'est produit, nommé au passé, comme `CommandePassee`. Le cas d'utilisation le
  publie, et des modules indépendants y réagissent, ce qui découple les effets secondaires : on ajoute une réaction
  sans modifier le cas d'utilisation. Les problèmes : l'ordre et l'isolation des réactions, la gestion de leurs échecs,
  la traçabilité, car le flux devient moins visible dans le code, et la fiabilité, car un événement publié en mémoire
  peut être perdu si le processus s'arrête. Pour les réactions critiques, on enregistre l'événement dans la même
  transaction que les données, dans une *outbox*, et on le publie ensuite de façon fiable.
  :::

- Comment évites-tu de sur-utiliser les design patterns ?

  :::indice
  Quel problème présent le pattern résout-il ?
  :::

  :::reponse
  J'introduis un pattern quand un problème réel apparaît : une deuxième implémentation, une deuxième règle, un
  deuxième module qui doit réagir, ou un besoin de test. Avant, un code direct et bien nommé est plus simple à lire.
  Chaque pattern ajoute une indirection que le lecteur doit suivre. Comme le code reste propre et testé, le
  refactoring vers le pattern est facile le jour où il devient utile, et je n'hésite pas à retirer un pattern qui ne
  sert plus.
  :::
