---
id: javascript-architecture-hexagonale-et-clean
title: "Architecture hexagonale, clean architecture : domaine, application, infrastructure"
slug: architecture-hexagonale-et-clean
technology: javascript
level: advanced
module: architecture-applicative
order: 2
estimatedMinutes: 50
difficulty: 5
xp: 120
prerequisites:
  - javascript-couches-et-modules
  - javascript-patterns-a-l-echelle-d-une-application
skills:
  - js-hexagonal-clean
tags:
  - javascript
  - architecture
---

## Objectifs

- Décrire l'architecture hexagonale : un cœur, des ports, des adaptateurs primaires et secondaires.
- Relier ce modèle à la clean architecture et à sa règle de dépendance vers l'intérieur.
- Préciser le rôle de chaque couche : domaine, application, infrastructure.
- Piloter un même cas d'utilisation par HTTP, par une commande et par des tests, sans le modifier.
- Savoir quand ces architectures valent leur coût, et quand elles sont excessives.

## Introduction

Le chapitre précédent a posé les couches et la règle des dépendances. Deux modèles célèbres poussent cette idée
jusqu'au bout. L'**architecture hexagonale**, ou *ports and adapters*, proposée par Alistair Cockburn, place
l'application au centre et traite tout ce qui l'entoure, interface utilisateur comme base de données, comme des
détails branchés sur des ports. La **clean architecture**, décrite par Robert C. Martin, dessine des cercles
concentriques et impose que les dépendances pointent toujours vers l'intérieur.

Les deux disent la même chose avec des images différentes : le cœur métier ne connaît pas le monde extérieur. Ce
chapitre montre ce que cela donne concrètement en JavaScript.

## Concept

```text
         adaptateurs primaires                         adaptateurs secondaires
      (ils pilotent l'application)                  (l'application les pilote)

   route HTTP ─┐                                            ┌─▶ dépôt PostgreSQL
   commande   ─┼─▶ [port d'entrée] ─▶  CŒUR  ─▶ [port de sortie] ─┼─▶ e-mail SMTP
   test       ─┘   cas d'utilisation   domaine    contrats         └─▶ horloge système
```

| Élément | Rôle | Exemple |
| --- | --- | --- |
| domaine | règles et vocabulaire métier, sans aucune dépendance technique | `Reservation`, « deux réservations d'une même salle ne se chevauchent pas » |
| application | cas d'utilisation : orchestrer le domaine et les ports | `reserverSalle` |
| port d'entrée | ce que l'application offre au monde | la fonction `reserverSalle(demande)` |
| port de sortie | ce dont l'application a besoin du monde | `{ reservationsDeLaSalle(salle, jour), ajouter(reservation) }`, `maintenant()` |
| adaptateur primaire | traduit un stimulus extérieur en appel d'un port d'entrée | une route HTTP, une commande en ligne, un consommateur de file |
| adaptateur secondaire | implémente un port de sortie avec une technologie | dépôt SQL, client SMTP, horloge système |

| Clean architecture, de l'intérieur vers l'extérieur | Correspond à |
| --- | --- |
| entités | domaine |
| cas d'utilisation | application |
| adaptateurs d'interface : contrôleurs, présentateurs, passerelles | adaptateurs |
| frameworks et pilotes : base, web, bibliothèques | infrastructure |

## Exemple

Le **domaine** : une réservation de salle, et la règle de non-chevauchement, en pur JavaScript.

```js
// domaine/reservation.js
export class ErreurDomaine extends Error {}

export function creerReservation({ id, salle, debut, fin, par }) {
  if (!(debut < fin)) throw new ErreurDomaine('La fin doit suivre le début');
  const minutes = (fin - debut) / 60_000;
  if (minutes > 4 * 60) throw new ErreurDomaine('Quatre heures au maximum');
  return Object.freeze({ id, salle, debut, fin, par });
}

export const seChevauchent = (a, b) => a.salle === b.salle && a.debut < b.fin && b.debut < a.fin;
```

L'**application** : le cas d'utilisation, qui ne connaît que ses ports.

```js
// application/reserver-salle.js
import { creerReservation, seChevauchent, ErreurDomaine } from '../domaine/reservation.js';

export function creerReserverSalle({ reservations, horloge, genererId }) {
  return async function reserverSalle({ salle, debut, fin, par }) {
    if (debut < horloge.maintenant()) return { type: 'refusee', raison: 'La réservation est dans le passé' };
    let nouvelle;
    try {
      nouvelle = creerReservation({ id: genererId(), salle, debut, fin, par });
    } catch (erreur) {
      if (erreur instanceof ErreurDomaine) return { type: 'refusee', raison: erreur.message };
      throw erreur;
    }
    const existantes = await reservations.reservationsDeLaSalle(salle, debut);
    if (existantes.some((r) => seChevauchent(r, nouvelle))) return { type: 'refusee', raison: 'Créneau déjà pris' };
    await reservations.ajouter(nouvelle);
    return { type: 'confirmee', reservation: nouvelle };
  };
}
```

Des **adaptateurs** : un dépôt en mémoire, une horloge fixe pour les tests, et deux adaptateurs primaires qui pilotent le
même cas d'utilisation, l'un depuis HTTP, l'autre depuis la ligne de commande.

```js
// infrastructure/reservations-en-memoire.js
export function creerReservationsEnMemoire() {
  const toutes = [];
  const memeJour = (a, b) => a.toDateString() === b.toDateString();
  return {
    reservationsDeLaSalle: async (salle, jour) => toutes.filter((r) => r.salle === salle && memeJour(r.debut, jour)),
    ajouter: async (reservation) => void toutes.push(reservation),
  };
}

// http/route-reservation.js : adaptateur primaire HTTP
export function creerRouteReservation(reserverSalle) {
  return async function gerer(corps) {
    const resultat = await reserverSalle({ ...corps, debut: new Date(corps.debut), fin: new Date(corps.fin) });
    return resultat.type === 'confirmee'
      ? { statut: 201, corps: { id: resultat.reservation.id } }
      : { statut: 409, corps: { erreur: resultat.raison } };
  };
}

// cli/reserver.js : adaptateur primaire en ligne de commande
export function creerCommandeReserver(reserverSalle, sortie) {
  return async function executer([salle, debut, fin, par]) {
    const resultat = await reserverSalle({ salle, debut: new Date(debut), fin: new Date(fin), par });
    sortie(resultat.type === 'confirmee' ? `Réservé : ${resultat.reservation.id}` : `Refusé : ${resultat.raison}`);
    return resultat.type === 'confirmee' ? 0 : 1;
  };
}
```

Assemblés dans une racine de composition :

```js
let compteur = 0;
const reserverSalle = creerReserverSalle({
  reservations: creerReservationsEnMemoire(),
  horloge: { maintenant: () => new Date('2026-09-25T08:00:00Z') },
  genererId: () => `r${++compteur}`,
});

const route = creerRouteReservation(reserverSalle);
const commande = creerCommandeReserver(reserverSalle, console.log);

console.log(await route({ salle: 'A', debut: '2026-09-25T09:00:00Z', fin: '2026-09-25T10:00:00Z', par: 'ana' }));
// { statut: 201, corps: { id: 'r1' } }
console.log(await commande(['A', '2026-09-25T09:30:00Z', '2026-09-25T11:00:00Z', 'bao']));
// Refusé : Créneau déjà pris
// 1
console.log(await route({ salle: 'A', debut: '2026-09-25T10:00:00Z', fin: '2026-09-25T16:00:00Z', par: 'chloe' }));
// { statut: 409, corps: { erreur: 'Quatre heures au maximum' } }
```

## Comment ça fonctionne

**Le cœur ignore le monde.** Ni `reservation.js` ni `reserver-salle.js` n'importent quoi que ce soit de technique : pas
de framework HTTP, pas de client SQL, pas même `Date.now()`, remplacé par le port `horloge`. On peut les exécuter dans
un test, dans un script, dans une fonction serverless ou derrière n'importe quel framework. Les règles, qui sont la
raison d'être de l'application, ne sont écrites qu'une fois.

**Deux sortes d'adaptateurs.** Les adaptateurs **primaires**, à gauche, reçoivent un stimulus du monde, une requête, une
commande, un message, le traduisent en appel du cas d'utilisation, puis traduisent le résultat dans leur langage : un
statut HTTP, un texte et un code de sortie. Les adaptateurs **secondaires**, à droite, sont appelés par l'application
à travers les ports qu'elle définit, et parlent aux technologies. Les tests sont un adaptateur primaire comme un autre,
avec des adaptateurs secondaires en mémoire.

**Le rôle de chaque couche.** Le **domaine** contient ce qui resterait vrai si l'on remplaçait l'informatique par du
papier : une réservation a une fin après son début, deux réservations ne se chevauchent pas. Il valide ses invariants
et lève des erreurs métier. L'**application** contient ce qui est propre à ce logiciel : l'ordre des étapes, les
vérifications qui demandent des données extérieures, comme les réservations existantes, les autorisations, les
transactions, la publication d'événements. Elle renvoie des résultats métier, pas des statuts HTTP. L'**infrastructure**
contient tout le reste : base de données, fichiers, e-mails, horloge système, frameworks.

**La règle de dépendance.** Les imports vont toujours vers l'intérieur : les adaptateurs importent l'application, qui
importe le domaine. Jamais l'inverse. Quand le cœur a besoin de l'extérieur, il déclare un port, et l'extérieur
l'implémente. C'est l'inversion des dépendances appliquée à toute l'application.

**Traduire aux frontières.** Les données qui entrent sont converties à la frontière : chaînes en dates, JSON en objets
métier validés. Celles qui sortent aussi : un résultat `refusee` devient 409 pour HTTP, un code 1 pour la ligne de
commande. Le cœur ne manipule que des types métier. Si l'on veut vraiment isoler, les adaptateurs secondaires
convertissent aussi les lignes de la base en objets du domaine, et inversement.

**Le coût.** Plus de fichiers, plus d'indirections, plus de conversions. Pour une petite API qui lit et écrit des données
sans règles, un CRUD simple, c'est excessif : un gestionnaire qui valide et appelle la base suffit. Ces architectures
paient quand les règles métier sont riches, quand l'application doit vivre longtemps, être pilotée de plusieurs façons,
ou survivre à des changements techniques. On peut aussi les appliquer seulement aux modules qui le méritent.

## Erreurs fréquentes

**Importer un framework dans le domaine.** Un décorateur d'ORM ou un objet `Request` dans une entité lie les règles à
une technologie.

**Faire renvoyer des statuts HTTP par le cas d'utilisation.** La ligne de commande et les files de messages n'ont pas de
statut 409 ; renvoie un résultat métier.

**Lire l'horloge ou le hasard directement dans le cœur.** Les tests deviennent non déterministes ; passe par un port.

**Des ports calqués sur la base de données.** Un port `executerSql` n'isole rien ; nomme les besoins métier.

**Des règles dans les adaptateurs.** Si la route HTTP vérifie le chevauchement, la ligne de commande ne le vérifie pas.

**Appliquer l'hexagone à un simple CRUD.** La complexité dépasse le bénéfice ; réserve-le aux modules riches en règles.

## À retenir

- Hexagonale : un cœur, des ports d'entrée et de sortie, des adaptateurs primaires et secondaires.
- Clean architecture : des cercles concentriques, et des dépendances toujours vers l'intérieur.
- Domaine : règles et invariants ; application : orchestration et ports ; infrastructure : technologies.
- Le cœur renvoie des résultats métier ; les adaptateurs traduisent vers HTTP, la ligne de commande, les tests.
- Horloge, hasard et identifiants passent par des ports, pour des tests déterministes.
- Une architecture qui se justifie par des règles riches et une longue vie, pas pour un CRUD.

## Exercices

1. Écris un test du cas d'utilisation `reserverSalle` qui vérifie qu'une réservation dans le passé est refusée, et
   qu'une réservation de 9 h à 10 h n'empêche pas une autre de 10 h à 11 h. Aucun serveur ni base ne doit être démarré.

   :::indice
   Une horloge fixe, un dépôt en mémoire, et des dates en UTC.
   :::

   :::solution
   ```js
   import assert from 'node:assert/strict';

   const seChevauchent = (a, b) => a.salle === b.salle && a.debut < b.fin && b.debut < a.fin;

   function creerReserverSalle({ reservations, horloge, genererId }) {
     return async function reserverSalle({ salle, debut, fin, par }) {
       if (debut < horloge.maintenant()) return { type: 'refusee', raison: 'La réservation est dans le passé' };
       const nouvelle = { id: genererId(), salle, debut, fin, par };
       const existantes = await reservations.reservationsDeLaSalle(salle, debut);
       if (existantes.some((r) => seChevauchent(r, nouvelle))) return { type: 'refusee', raison: 'Créneau déjà pris' };
       await reservations.ajouter(nouvelle);
       return { type: 'confirmee', reservation: nouvelle };
     };
   }

   const toutes = [];
   let n = 0;
   const reserver = creerReserverSalle({
     reservations: { reservationsDeLaSalle: async () => toutes, ajouter: async (r) => void toutes.push(r) },
     horloge: { maintenant: () => new Date('2026-09-25T08:00:00Z') },
     genererId: () => `r${++n}`,
   });
   const creneau = (h1, h2) => ({
     salle: 'A',
     debut: new Date(`2026-09-25T${h1}:00:00Z`),
     fin: new Date(`2026-09-25T${h2}:00:00Z`),
     par: 'ana',
   });

   assert.deepEqual(await reserver(creneau('07', '08')), { type: 'refusee', raison: 'La réservation est dans le passé' });
   assert.equal((await reserver(creneau('09', '10'))).type, 'confirmee');
   assert.equal((await reserver(creneau('10', '11'))).type, 'confirmee'); // se touchent sans se chevaucher
   assert.equal((await reserver(creneau('10', '12'))).type, 'refusee');
   console.log('tests réussis');
   ```

   Le test s'exécute en quelques millisecondes et donne toujours le même résultat : l'horloge est fixée, et les
   données sont en mémoire. La frontière 10 h est un cas limite important : les inégalités strictes de `seChevauchent`
   laissent deux créneaux se toucher.
   :::

2. On veut que les réservations confirmées soient annoncées dans une messagerie d'équipe. Où ajoutes-tu ce comportement
   pour respecter l'architecture ? Décris le port et l'adaptateur, et montre la modification du cas d'utilisation.

   :::indice
   La messagerie est un détail extérieur : le cœur a besoin de « prévenir l'équipe », pas de connaître l'API de la
   messagerie.
   :::

   :::solution
   Le cas d'utilisation déclare un port de sortie décrit dans son vocabulaire, `annonces.reservationConfirmee(reservation)`.
   Un adaptateur secondaire l'implémente avec l'API de la messagerie : il construit le message, appelle le webhook,
   traduit les erreurs. La racine de composition branche cet adaptateur en production, et un faux dans les tests.

   ```js
   export function creerReserverSalle({ reservations, horloge, genererId, annonces }) {
     return async function reserverSalle(demande) {
       // … vérifications inchangées …
       const nouvelle = { id: genererId(), ...demande };
       await reservations.ajouter(nouvelle);
       await annonces.reservationConfirmee(nouvelle);
       return { type: 'confirmee', reservation: nouvelle };
     };
   }

   // infrastructure/annonces-messagerie.js
   export function creerAnnoncesMessagerie({ urlWebhook, envoyer = fetch }) {
     return {
       async reservationConfirmee({ salle, debut, par }) {
         const texte = `Salle ${salle} réservée par ${par} le ${debut.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`;
         const reponse = await envoyer(urlWebhook, {
           method: 'POST',
           headers: { 'content-type': 'application/json' },
           body: JSON.stringify({ text: texte }),
         });
         if (!reponse.ok) throw new Error(`Annonce refusée : ${reponse.status}`);
       },
     };
   }
   ```

   Si plusieurs réactions s'accumulent, on publiera plutôt un événement `ReservationConfirmee`, comme au module précédent,
   et l'annonce deviendra un abonné. Dans les deux cas, le domaine et les règles ne changent pas.
   :::

3. Pour chacune de ces applications, dis si une architecture hexagonale complète est justifiée, et propose un découpage
   adapté.
   - a) Une API interne qui expose en lecture et en écriture une table de paramètres, sans règle métier.
   - b) Un moteur de tarification d'assurance, avec des dizaines de règles, appelé par un site web, une application
     mobile et des traitements de nuit.
   - c) Un script ponctuel qui migre des fichiers d'un stockage à un autre.

   :::indice
   Richesse des règles, durée de vie, nombre de façons de piloter l'application.
   :::

   :::solution
   - a) Non. Sans règle métier, les ports et les conversions n'isolent rien d'important. Une route qui valide l'entrée
     avec un schéma et appelle un module d'accès aux données suffit, avec des tests d'intégration sur l'API.
   - b) Oui. Les règles sont riches, critiques et durables, et trois adaptateurs primaires pilotent le même cœur. Le
     domaine de tarification, pur et testé en profondeur, est l'actif principal ; les sources de données et les canaux
     sont des adaptateurs.
   - c) Non. Un script ponctuel gagne à être simple et lisible ; on peut quand même isoler la logique de correspondance
     des chemins dans une fonction pure testée, car c'est elle qui peut se tromper.
   :::

## Questions d'entretien

- Explique l'architecture hexagonale.

  :::indice
  Un cœur, des ports, des adaptateurs des deux côtés.
  :::

  :::reponse
  L'application est un cœur, domaine et cas d'utilisation, qui communique avec l'extérieur uniquement par des ports :
  des ports d'entrée, les fonctions qu'il offre, et des ports de sortie, les contrats dont il a besoin, définis dans son
  vocabulaire. Des adaptateurs primaires, comme une route HTTP, une commande ou un test, pilotent les ports d'entrée ;
  des adaptateurs secondaires, comme un dépôt SQL ou un client d'e-mail, implémentent les ports de sortie. Le cœur ne
  dépend d'aucune technologie : on peut changer de framework ou de base, ou ajouter un canal, sans toucher aux règles,
  et on teste le cœur avec des adaptateurs en mémoire.
  :::

- Quelle différence entre la couche application et la couche domaine ?

  :::indice
  Ce qui resterait vrai sur papier, et ce qui est propre au logiciel.
  :::

  :::reponse
  Le domaine contient les concepts et les règles du métier, indépendants du logiciel : les entités, les valeurs, les
  invariants, comme « une réservation dure au plus quatre heures ». L'application contient les cas d'utilisation du
  logiciel : elle orchestre le domaine, récupère les données nécessaires par les ports, vérifie les règles qui demandent
  ces données, gère les autorisations, les transactions et les événements, et renvoie un résultat métier. Le domaine ne
  dépend de rien ; l'application dépend du domaine et de ses ports.
  :::

- Ces architectures ne sont-elles pas trop lourdes ?

  :::indice
  Pour quel type d'application paient-elles ?
  :::

  :::reponse
  Elles ont un coût réel : plus de fichiers, d'indirections et de conversions. Pour un CRUD sans règles, ou un outil
  à courte durée de vie, c'est excessif, et une architecture simple en deux couches suffit. Elles paient quand les règles
  métier sont riches et critiques, quand l'application doit vivre longtemps et survivre à des changements techniques,
  ou quand plusieurs canaux pilotent la même logique. On peut aussi les appliquer module par module, seulement là où
  elles apportent quelque chose.
  :::
