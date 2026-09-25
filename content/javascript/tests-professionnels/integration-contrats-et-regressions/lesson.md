---
id: javascript-integration-contrats-et-regressions
title: Mocks ou intégration, contrats et régressions
slug: integration-contrats-et-regressions
technology: javascript
level: advanced
module: tests-professionnels
order: 2
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-tester-les-comportements
  - javascript-pourquoi-tester
skills:
  - test-strategy
tags:
  - javascript
  - tests
  - integration
  - contrats
---

## Objectifs

- Choisir entre un test isolé par des mocks et un test d'intégration, selon ce que chacun peut prouver.
- Écrire une suite de contrat partagée qui garantit qu'un faux se comporte comme la vraie implémentation.
- Vérifier le contrat entre un client et une API : forme des réponses, codes d'erreur.
- Transformer chaque bug corrigé en test de régression, écrit avant la correction.

## Introduction

Un test isolé par des mocks est rapide et précis, mais il repose sur une **hypothèse** : que la dépendance simulée se
comporte comme le mock le prétend. Si le vrai dépôt renvoie `null` là où le mock renvoie `undefined`, ou si l'API
renomme un champ, tous les tests restent verts et la production casse.

Les tests d'intégration vérifient ces hypothèses en faisant travailler de vrais composants ensemble, au prix de la
vitesse. Les tests de contrat, eux, vérifient les hypothèses sans tout assembler. Et les tests de régression
s'assurent qu'un bug corrigé ne revient jamais. Ensemble, ils forment une stratégie, pas une collection de tests.

## Concept

| Type de test | Ce qu'il prouve | Ce qu'il ne prouve pas | Coût |
| --- | --- | --- | --- |
| isolé, avec mocks | la logique de l'unité, pour les réponses simulées | que les dépendances répondent vraiment ainsi | très faible |
| intégration | que les composants réels fonctionnent ensemble | tous les cas limites, trop coûteux à produire | moyen |
| contrat | qu'un faux, ou un fournisseur, respecte l'interface convenue | le parcours complet | faible |
| régression | qu'un bug précis corrigé ne revient pas | l'absence d'autres bugs | faible |
| bout en bout | qu'un parcours utilisateur fonctionne | le détail des règles | élevé |

## Exemple

Deux implémentations d'un même dépôt de tâches : une en mémoire pour les tests rapides, une sur fichier JSON pour la
production. Une seule suite de contrat les vérifie toutes les deux.

```js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function creerDepotMemoire() {
  const taches = new Map();
  return {
    async ajouter(tache) {
      if (taches.has(tache.id)) throw new Error(`Tâche en double : ${tache.id}`);
      taches.set(tache.id, structuredClone(tache));
    },
    async trouver(id) {
      return taches.has(id) ? structuredClone(taches.get(id)) : null;
    },
    async lister() {
      return [...taches.values()].map((t) => structuredClone(t));
    },
  };
}

function creerDepotFichier(chemin) {
  const lire = async () => JSON.parse(await readFile(chemin, 'utf8').catch(() => '[]'));
  return {
    async ajouter(tache) {
      const taches = await lire();
      if (taches.some((t) => t.id === tache.id)) throw new Error(`Tâche en double : ${tache.id}`);
      await writeFile(chemin, JSON.stringify([...taches, tache]));
    },
    async trouver(id) {
      return (await lire()).find((t) => t.id === id) ?? null;
    },
    lister: lire,
  };
}

function verifierContratDepot(nom, preparer) {
  describe(`contrat du dépôt : ${nom}`, () => {
    let depot;
    let nettoyer;

    beforeEach(async () => {
      ({ depot, nettoyer } = await preparer());
    });

    afterEach(async () => {
      await nettoyer?.();
    });

    it('retrouve une tâche ajoutée', async () => {
      await depot.ajouter({ id: 't-1', titre: 'Écrire les tests' });
      await expect(depot.trouver('t-1')).resolves.toEqual({ id: 't-1', titre: 'Écrire les tests' });
    });

    it('renvoie null pour une tâche inconnue', async () => {
      await expect(depot.trouver('absente')).resolves.toBeNull();
    });

    it('refuse un identifiant en double', async () => {
      await depot.ajouter({ id: 't-1', titre: 'A' });
      await expect(depot.ajouter({ id: 't-1', titre: 'B' })).rejects.toThrow('en double');
    });

    it('protège ses données des modifications extérieures', async () => {
      const tache = { id: 't-1', titre: 'Original' };
      await depot.ajouter(tache);
      tache.titre = 'Modifié dehors';
      (await depot.lister())[0].titre = 'Modifié aussi';

      await expect(depot.trouver('t-1')).resolves.toMatchObject({ titre: 'Original' });
    });
  });
}

verifierContratDepot('mémoire', async () => ({ depot: creerDepotMemoire() }));

verifierContratDepot('fichier JSON', async () => {
  const dossier = await mkdtemp(join(tmpdir(), 'depot-'));
  return {
    depot: creerDepotFichier(join(dossier, 'taches.json')),
    nettoyer: () => rm(dossier, { recursive: true, force: true }),
  };
});
```

## Comment ça fonctionne

**Mock ou intégration ?** Un test isolé remplace les collaborateurs par des doublures : il localise précisément une
erreur et s'exécute en microsecondes, mais il vérifie le code contre l'idée qu'on se fait des dépendances. Un test
d'intégration utilise les vrais collaborateurs — plusieurs modules, une vraie base de test, un vrai système de
fichiers — et vérifie qu'ils s'accordent réellement. Règle pratique : on simule ce qu'on ne contrôle pas ou qui est
lent et instable (réseau externe, paiement, horloge), et on garde réels les modules de son propre code. Beaucoup
d'équipes privilégient ainsi des tests « sociables », qui exercent une unité avec ses vrais collaborateurs internes,
et réservent les mocks aux frontières du système.

**Tester le faux.** Un faux en mémoire rend des centaines de tests rapides, mais c'est une deuxième implémentation,
qui peut diverger de la vraie. La suite de contrat de l'exemple règle ce problème : `verifierContratDepot` décrit une
fois le comportement attendu de **tout** dépôt, puis s'exécute contre chaque implémentation. Tant que les deux passent
la même suite, les tests qui utilisent le faux valent pour la vraie. Le quatrième test l'illustre : le dépôt sur
fichier protège naturellement ses données, puisqu'il relit le JSON à chaque appel ; le faux ne le fait que parce qu'il
copie avec `structuredClone`. Sans cette copie, le faux laisserait passer des tests qui échoueraient en production.

**Contrat entre un client et une API.** Quand le fournisseur est un autre service, on ne peut pas lancer sa vraie
implémentation dans les tests du client. Le **contract testing** piloté par le consommateur, popularisé par l'outil
Pact, procède en deux temps : les tests du client enregistrent les requêtes qu'il envoie et les réponses dont il a
besoin ; ce contrat est ensuite rejoué contre le vrai fournisseur, dans sa propre intégration continue. Une version
simple, sans outil, consiste à valider la forme des réponses : un schéma — écrit à la main ou avec une bibliothèque
comme Zod — vérifié dans les tests du client contre les réponses simulées, et dans les tests du fournisseur contre
ses vraies réponses. Si le fournisseur renomme un champ, c'est **son** test qui casse, avant le déploiement.

**Régression.** Un test de régression reproduit un bug signalé. La méthode est toujours la même : écrire d'abord un
test qui **échoue** en reproduisant le bug, vérifier qu'il échoue pour la bonne raison, puis corriger jusqu'à ce qu'il
passe. Un test écrit après la correction peut passer sans jamais avoir détecté le bug. Le nom du test décrit le
comportement attendu, et l'on peut y référencer le ticket : `it('arrondit 2,675 € à 2,68 € (#412)')`. Ces tests
restent dans la suite pour toujours : un bug qui a existé une fois a de bonnes chances de réapparaître lors d'un
refactoring.

## Erreurs fréquentes

**Simuler ses propres modules.** Les tests ne vérifient plus que les modules s'accordent ; garde les mocks aux
frontières.

**Écrire un faux sans le vérifier.** Il diverge de la vraie implémentation : fais-lui passer la même suite de contrat.

**Se fier aux mocks d'une API externe qui a évolué.** Valide la forme des réponses, et fais vérifier le contrat par le
fournisseur.

**Corriger un bug avant d'écrire son test.** Rien ne prouve que le test aurait détecté le bug.

**Supprimer un test de régression « ancien ».** Il protège contre le retour d'un bug déjà vu.

## À retenir

- Les mocks prouvent la logique, pas l'accord avec les vraies dépendances : on les garde aux frontières.
- Les tests d'intégration vérifient que les vrais composants s'accordent.
- Une suite de contrat partagée garantit qu'un faux se comporte comme la vraie implémentation.
- Le contract testing fait vérifier par le fournisseur les réponses dont le client dépend.
- Un bug corrigé commence par un test qui échoue, et ce test reste dans la suite.

## Exercices

1. Pour chaque situation, choisis le type de test le plus adapté : isolé avec mocks, intégration, contrat ou
   régression.

   - a. La logique de calcul des frais de port selon le poids et la zone.
   - b. Le service de commande enregistre-t-il vraiment les commandes dans PostgreSQL ?
   - c. Un client signale qu'un panier vide affiche « NaN € ».
   - d. L'équipe mobile dépend des champs `id`, `total` et `statut` renvoyés par ton API.

   :::indice
   Demande-toi ce qu'il faut prouver : une règle, un accord entre composants réels, une interface entre équipes, ou
   l'absence d'un bug précis.
   :::

   :::solution
   - a. Isolé : une fonction pure, beaucoup de cas, aucun besoin de dépendance réelle.
   - b. Intégration : seul un test contre une vraie base de test prouve les requêtes SQL et le mapping.
   - c. Régression : un test qui reproduit le panier vide et échoue, puis la correction.
   - d. Contrat : un schéma des réponses vérifié dans les tests de l'API, pour qu'un renommage casse ton test avant de
     casser l'application mobile.
   :::

2. Un client dépend des champs `id` (chaîne), `total` (nombre) et `statut` (`'payee'` ou `'en-attente'`) de la
   réponse `/commandes/:id`. Écris `verifierCommande(donnees)`, qui renvoie la liste des écarts au contrat, puis des
   tests qui l'appliquent à une réponse conforme, à une réponse dont `total` est devenu une chaîne, et à une réponse
   avec un champ supplémentaire, qui reste acceptée.

   :::indice
   Décris le contrat comme un objet `{ champ: (valeur) => booléen }`, et parcours ses entrées.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   const contratCommande = {
     id: (v) => typeof v === 'string' && v.length > 0,
     total: (v) => typeof v === 'number' && Number.isFinite(v),
     statut: (v) => ['payee', 'en-attente'].includes(v),
   };

   function verifierCommande(donnees) {
     return Object.entries(contratCommande)
       .filter(([champ, valide]) => !valide(donnees?.[champ]))
       .map(([champ]) => `${champ} : valeur invalide (${JSON.stringify(donnees?.[champ])})`);
   }

   describe('contrat de /commandes/:id', () => {
     it('accepte une réponse conforme', () => {
       expect(verifierCommande({ id: 'c-1', total: 42.5, statut: 'payee' })).toEqual([]);
     });

     it('signale un total transmis comme chaîne', () => {
       expect(verifierCommande({ id: 'c-1', total: '42.50', statut: 'payee' })).toEqual([
         'total : valeur invalide ("42.50")',
       ]);
     });

     it('tolère les champs supplémentaires', () => {
       expect(verifierCommande({ id: 'c-1', total: 0, statut: 'en-attente', devise: 'EUR' })).toEqual([]);
     });
   });
   ```

   Le contrat ne mentionne que les champs dont le client dépend : le fournisseur reste libre d'en ajouter. Côté
   fournisseur, la même fonction s'applique aux vraies réponses de l'API.
   :::

3. Un bug est signalé : `formaterMontant(2.675)` affiche `2,67 €` au lieu de `2,68 €`. Écris d'abord le test de
   régression et constate qu'il échoue avec cette version, puis corrige la fonction.

   ```js
   const formaterMontant = (euros) => `${euros.toFixed(2).replace('.', ',')} €`;
   ```

   :::indice
   `2.675` n'est pas représentable exactement : sa valeur binaire est légèrement inférieure. Travaille en centimes,
   arrondis avec `Math.round` après une petite correction, ou utilise `Intl.NumberFormat`.
   :::

   :::solution
   Avec la version actuelle, le test échoue : `(2.675).toFixed(2)` donne `'2.67'`, car `2.675` est stocké comme
   `2.67499999…`. On corrige en arrondissant en centimes, avec `Number.EPSILON` pour compenser l'erreur de
   représentation.

   ```js
   import { describe, it, expect } from 'vitest';

   const formaterMontant = (euros) => {
     const centimes = Math.round((euros + Number.EPSILON) * 100);
     return `${(centimes / 100).toFixed(2).replace('.', ',')} €`;
   };

   describe('formaterMontant', () => {
     it('arrondit 2,675 € au centime supérieur (#412)', () => {
       expect(formaterMontant(2.675)).toBe('2,68 €');
     });

     it.each([
       [0, '0,00 €'],
       [2.5, '2,50 €'],
       [1.005, '1,01 €'],
       [19.99, '19,99 €'],
     ])('formate %s en %s', (euros, attendu) => {
       expect(formaterMontant(euros)).toBe(attendu);
     });
   });
   ```

   Les cas voisins, comme `1.005`, vérifient que la correction ne vise pas que la valeur signalée. Dans une vraie
   application, on stockerait directement des centimes entiers.
   :::

## Questions d'entretien

- Quels sont les risques d'une suite de tests qui repose surtout sur des mocks ?

  :::indice
  Que se passe-t-il quand la vraie dépendance ne se comporte pas comme le mock ?
  :::

  :::reponse
  Chaque mock est une hypothèse sur une dépendance. Si l'hypothèse est fausse ou le devient — un champ renommé,
  `null` au lieu d'une exception —, les tests restent verts et la production casse. Les mocks couplent aussi les tests
  aux appels internes, ce qui les rend fragiles. Je garde les mocks aux frontières que je ne contrôle pas, j'utilise
  les vrais modules internes, j'ajoute des tests d'intégration pour les accès réels, et je vérifie mes faux avec une
  suite de contrat partagée.
  :::

- Qu'est-ce que le contract testing, et quel problème résout-il ?

  :::indice
  Pense à deux équipes qui déploient indépendamment un client et une API.
  :::

  :::reponse
  C'est vérifier qu'un fournisseur respecte ce que ses consommateurs attendent, sans lancer tout le système. Dans
  l'approche pilotée par le consommateur, comme avec Pact, les tests du client produisent un contrat — requêtes
  envoyées, réponses attendues — que le fournisseur rejoue dans sa propre CI. Un changement incompatible casse alors
  le build du fournisseur avant le déploiement, au lieu de casser le client en production. C'est plus rapide et plus
  ciblé qu'un test de bout en bout entre services.
  :::

- Comment traites-tu un bug signalé en production ?

  :::indice
  Dans quel ordre écris-tu le test et la correction ?
  :::

  :::reponse
  Je le reproduis d'abord, idéalement par un test automatisé au niveau le plus bas qui le montre. Je vérifie que ce
  test échoue pour la bonne raison, puis je corrige jusqu'à ce qu'il passe, en ajoutant les cas voisins. Le test
  reste dans la suite comme test de régression, avec un nom qui décrit le comportement et la référence du ticket.
  Enfin je me demande pourquoi les tests existants ne l'ont pas détecté, ce qui révèle souvent un cas limite ou une
  frontière non testée.
  :::
