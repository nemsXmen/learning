---
id: javascript-corriger-prouver-mesurer-et-relire
title: "Corriger, prouver, mesurer l'impact et relire la correction"
slug: corriger-prouver-mesurer-et-relire
technology: javascript
level: advanced
module: debogage-application-reelle
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 110
prerequisites:
  - javascript-identifier-reproduire-et-isoler-un-bug
  - javascript-pull-requests-revue-et-workflows
skills:
  - js-fix-and-review
tags:
  - javascript
  - debogage
  - qualite
---

## Objectifs

- Corriger la cause d'un bug, pas son symptôme, et chercher les autres occurrences du même défaut.
- Écrire un test de régression qui échoue sans la correction et vérifie les frontières.
- Mesurer l'impact du bug sur les utilisateurs et les données, et décider des réparations.
- Relire une correction avec une grille adaptée, et livrer en vérifiant le résultat en production.
- Tirer les leçons d'un incident sans chercher de coupable.

## Introduction

Le chapitre précédent a trouvé la cause : un `<=` devenu `<` lors d'un refactoring, qui facture la tranche lourde aux
colis d'exactement 5 kg. La tentation est de changer un caractère, de pousser, et de passer à autre chose. Ce serait
laisser le travail à moitié fait.

Une correction professionnelle répond à cinq questions. La cause est-elle vraiment corrigée, et ailleurs aussi ? Qu'est-ce
qui garantit que le bug ne reviendra pas ? Combien de clients ont été touchés, et que leur doit-on ? La correction
est-elle sûre à livrer ? Et qu'est-ce qui, dans la façon de travailler, a laissé passer ce bug ?

## Concept

| Étape | Question | Livrable |
| --- | --- | --- |
| corriger | la cause est-elle traitée, et existe-t-elle ailleurs ? | un changement minimal et ciblé |
| prouver | la correction marche-t-elle, et le bug peut-il revenir ? | un test de régression, rouge avant, vert après |
| mesurer | qui a été touché, depuis quand, pour combien ? | une requête ou un script sur les données, un chiffre |
| réparer | que doit-on aux personnes touchées ? | remboursements, correction de données, communication |
| relire et livrer | la correction est-elle sûre ? | une pull request courte, relue, vérifiée après déploiement |
| apprendre | pourquoi le bug est-il passé ? | une analyse sans reproche, avec des actions |

| Grille de relecture d'une correction | |
| --- | --- |
| la cause | la correction vise-t-elle la cause identifiée, pas un symptôme ? |
| le test | échoue-t-il sans la correction ? couvre-t-il les frontières ? |
| la portée | le même défaut existe-t-il ailleurs ? la correction change-t-elle autre chose ? |
| les données | les données déjà corrompues sont-elles traitées ? |
| le déploiement | faut-il une migration, une communication, une surveillance particulière ? |

## Exemple

La correction elle-même tient en une ligne, mais on en profite pour rendre la règle explicite :

```js
// frais.js
const TARIF_BASE = { FR: 4.9, BE: 7.9 };
const TARIF_ETRANGER = 8.9;
const POIDS_MAX_TRANCHE_LEGERE = 5; // kg, inclus : un colis de 5 kg est « léger »
const SUPPLEMENT_LOURD = 5;

export function fraisDePort({ poids, pays }) {
  const base = TARIF_BASE[pays] ?? TARIF_ETRANGER;
  return poids <= POIDS_MAX_TRANCHE_LEGERE ? base : base + SUPPLEMENT_LOURD;
}
```

Le test de régression vérifie la frontière exacte, et de part et d'autre :

```js
// frais.test.js
import { describe, it, expect } from 'vitest';
import { fraisDePort } from './frais.js';

describe('fraisDePort : tranche de poids', () => {
  it.each([
    [4.99, 4.9],
    [5, 4.9], // régression 1.4.0 : 5 kg était facturé comme un colis lourd
    [5.01, 9.9],
  ])('%s kg en France coûtent %s €', (poids, attendu) => {
    expect(fraisDePort({ poids, pays: 'FR' })).toBe(attendu);
  });
});
```

Puis on mesure l'impact, à partir des commandes passées depuis le déploiement de la version fautive :

```js
// mesurer-impact.mjs
const commandes = [
  { id: 'c101', poids: 5, pays: 'FR', fraisFactures: 9.9, date: '2026-09-22' },
  { id: 'c102', poids: 3, pays: 'FR', fraisFactures: 4.9, date: '2026-09-22' },
  { id: 'c103', poids: 5, pays: 'BE', fraisFactures: 12.9, date: '2026-09-23' },
  { id: 'c104', poids: 7, pays: 'FR', fraisFactures: 9.9, date: '2026-09-23' },
  { id: 'c105', poids: 5, pays: 'DE', fraisFactures: 13.9, date: '2026-09-24' },
];

const TARIF_BASE = { FR: 4.9, BE: 7.9 };
const fraisCorrects = ({ poids, pays }) => (TARIF_BASE[pays] ?? 8.9) + (poids <= 5 ? 0 : 5);

const touchees = commandes
  .map((c) => ({ ...c, trop: Math.round((c.fraisFactures - fraisCorrects(c)) * 100) / 100 }))
  .filter((c) => c.trop > 0);

const total = touchees.reduce((somme, c) => somme + c.trop, 0);
console.log(touchees.map(({ id, pays, trop }) => `${id} (${pays}) : ${trop} €`));
console.log(`${touchees.length} commandes sur ${commandes.length}, ${total.toFixed(2)} € facturés en trop`);
// [ 'c101 (FR) : 5 €', 'c103 (BE) : 5 €', 'c105 (DE) : 5 €' ]
// 3 commandes sur 5, 15.00 € facturés en trop
```

En production, la même logique s'exécute sur la base, avec une requête limitée à la période concernée. Le chiffre guide
la décision : rembourser automatiquement les 5 € des commandes touchées, et prévenir les clients concernés.

## Comment ça fonctionne

**Corriger la cause.** La cause n'est pas « 5 kg est mal calculé », c'est « la frontière de la tranche légère est
exclusive au lieu d'inclusive ». Ajouter un `if (poids === 5)` corrigerait le symptôme pour ce cas, et laisserait la règle
fausse. On corrige la comparaison, et l'on rend l'intention explicite par le nom de la constante et un commentaire, pour
que le prochain refactoring ne refasse pas l'erreur. On garde le changement **minimal** : ce n'est pas le moment de
réorganiser tout le module.

**Chercher le même défaut ailleurs.** Un bug révèle souvent un motif : si une frontière a été mal traduite ici, d'autres
l'ont peut-être été dans le même commit, ou dans du code écrit sur le même modèle. On relit le diff du commit fautif en
entier, et l'on cherche les motifs semblables : `rg "< POIDS|< SEUIL|< MAX"`.

**Prouver avec un test de régression.** Le test doit échouer **sans** la correction et passer avec : on le vérifie en
annulant temporairement la correction. Il teste la frontière elle-même, 5, et ses voisins, 4,99 et 5,01, car c'est là que
les erreurs se cachent. Il porte un commentaire qui rappelle le bug d'origine : la personne qui le verra échouer dans deux
ans comprendra pourquoi il existe. Ce test aurait dû exister avant le refactoring ; il existera désormais.

**Mesurer l'impact.** Sans chiffre, on ne sait ni l'urgence ni la réparation due. Qui est touché : les colis d'exactement
5 kg, dans tous les pays, depuis le 22 septembre. Combien : on calcule l'écart entre ce qui a été facturé et ce qui aurait
dû l'être, sur la période. On utilise pour cela les données et les journaux de production, en lecture seule, et une
requête relue. L'impact décide de la suite : une correction discrète, un remboursement automatique, une communication
aux clients, voire une obligation légale d'information pour certaines données.

**Réparer les données.** Corriger le code n'efface pas les dégâts déjà faits : des commandes ont été facturées trop cher,
des enregistrements peuvent être incohérents. La réparation est un changement à part entière : un script idempotent,
exécutable plusieurs fois sans effet supplémentaire, testé sur une copie, relu, et journalisé.

**Relire et livrer la correction.** La pull request de correction est courte, et sa description suit le cheminement :
symptôme, cause, commit fautif trouvé par `git bisect`, correction, test, impact mesuré, réparation prévue. Le relecteur
applique la grille : cause, test, portée, données, déploiement. Après la mise en production, on **vérifie** : les
nouvelles commandes de 5 kg sont-elles facturées 4,90 € ? Un tableau de bord ou une requête le confirme. Le journal des
modifications mentionne la correction.

**Apprendre sans chercher de coupable.** Une analyse d'incident, ou *postmortem*, reconstitue la chronologie, la cause,
et surtout les **facteurs** qui ont permis au bug de passer : aucun test sur les frontières, un commit qui mêlait une
fonctionnalité et un refactoring, une revue qui n'a pas repéré le changement de comparaison. Elle ne cherche pas de
coupable : la personne qui a écrit `<` a fait une erreur que n'importe qui aurait pu faire ; c'est le système de travail
qui n'a pas su l'attraper. Chaque facteur donne une action concrète, avec un responsable : ajouter des tests de
frontière aux règles tarifaires, séparer refactoring et fonctionnalité, ajouter la frontière à la grille de revue.

## Erreurs fréquentes

**Corriger le symptôme.** Un `if` pour le cas signalé laisse la règle fausse pour les autres.

**Livrer une correction sans test de régression.** Le bug reviendra au prochain refactoring.

**Un test qui passerait aussi sans la correction.** Vérifie-le en annulant la correction.

**Profiter de la correction pour tout réorganiser.** Le diff devient illisible et risqué ; refactore dans une autre pull
request.

**Ignorer les données déjà touchées.** Les clients facturés trop cher le restent ; mesure et répare.

**Ne pas vérifier après le déploiement.** « C'est corrigé » doit être constaté en production.

**Chercher un coupable.** Les gens cachent alors leurs erreurs ; cherche les facteurs du système.

## À retenir

- Corriger la cause, minimalement, et chercher le même motif ailleurs.
- Test de régression : rouge sans la correction, vert avec, centré sur les frontières, commenté.
- Mesurer l'impact sur les données : qui, depuis quand, combien ; puis réparer par un script idempotent et relu.
- Pull request courte qui raconte symptôme, cause, preuve et impact ; vérification après déploiement.
- Postmortem sans reproche : chronologie, cause, facteurs, actions concrètes.

## Exercices

1. Écris le test de régression complet des frais de port pour les trois pays connus et un pays étranger, sur les
   frontières de la tranche de poids, et vérifie qu'il échoue avec la version fautive (`<`) et passe avec la correction.

   :::indice
   `it.each` avec un tableau de cas, et une fonction qui fabrique les deux versions pour les comparer.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   const TARIF_BASE = { FR: 4.9, BE: 7.9 };
   const creerFrais = (comparer) => ({ poids, pays }) => {
     const base = TARIF_BASE[pays] ?? 8.9;
     return comparer(poids, 5) ? base : base + 5;
   };
   const fraisCorrige = creerFrais((poids, max) => poids <= max);
   const fraisFautif = creerFrais((poids, max) => poids < max);

   const CAS = [
     ['FR', 5, 4.9], ['FR', 5.01, 9.9],
     ['BE', 5, 7.9], ['BE', 5.01, 12.9],
     ['US', 5, 8.9], ['US', 5.01, 13.9],
   ];

   describe('fraisDePort : frontière de 5 kg', () => {
     it.each(CAS)('%s, %s kg → %s €', (pays, poids, attendu) => {
       expect(fraisCorrige({ pays, poids })).toBe(attendu);
     });

     it('détecterait la régression de la version 1.4.0', () => {
       const echecs = CAS.filter(([pays, poids, attendu]) => fraisFautif({ pays, poids }) !== attendu);
       expect(echecs.map(([pays]) => pays)).toEqual(['FR', 'BE', 'US']);
     });
   });
   ```

   Le second test documente que la suite attrape bien le bug : avec la version fautive, les trois cas à 5 kg échouent.
   Dans un vrai projet, on vérifie plus simplement en annulant la correction et en relançant les tests.
   :::

2. Écris un script de réparation qui rembourse les commandes facturées trop cher. Il doit être idempotent : exécuté deux
   fois, il ne rembourse pas deux fois. Montre-le sur les données de l'exemple.

   :::indice
   Enregistre chaque remboursement avec l'identifiant de la commande, et ignore les commandes déjà remboursées pour cette
   raison.
   :::

   :::solution
   ```js
   const TARIF_BASE = { FR: 4.9, BE: 7.9 };
   const fraisCorrects = ({ poids, pays }) => (TARIF_BASE[pays] ?? 8.9) + (poids <= 5 ? 0 : 5);
   const MOTIF = 'regression-frais-5kg-v1.4.0';

   function reparer(commandes, remboursements) {
     const dejaRembourses = new Set(remboursements.filter((r) => r.motif === MOTIF).map((r) => r.commandeId));
     const nouveaux = [];
     for (const commande of commandes) {
       const trop = Math.round((commande.fraisFactures - fraisCorrects(commande)) * 100) / 100;
       if (trop <= 0 || dejaRembourses.has(commande.id)) continue;
       nouveaux.push({ commandeId: commande.id, montant: trop, motif: MOTIF });
     }
     remboursements.push(...nouveaux);
     return nouveaux;
   }

   const commandes = [
     { id: 'c101', poids: 5, pays: 'FR', fraisFactures: 9.9 },
     { id: 'c102', poids: 3, pays: 'FR', fraisFactures: 4.9 },
     { id: 'c103', poids: 5, pays: 'BE', fraisFactures: 12.9 },
   ];
   const remboursements = [];
   console.log(reparer(commandes, remboursements).length, 'remboursements créés'); // 2 remboursements créés
   console.log(reparer(commandes, remboursements).length, 'remboursements créés'); // 0 remboursements créés
   console.log(remboursements);
   // [
   //   { commandeId: 'c101', montant: 5, motif: 'regression-frais-5kg-v1.4.0' },
   //   { commandeId: 'c103', montant: 5, motif: 'regression-frais-5kg-v1.4.0' }
   // ]
   ```

   Le motif identifie l'incident : une seconde exécution, après une interruption par exemple, ne crée aucun doublon. En
   production, le script lit et écrit dans une transaction, s'exécute d'abord en mode simulation, qui affiche ce qu'il
   ferait sans rien écrire, et journalise chaque remboursement.
   :::

3. Rédige les sections « Facteurs » et « Actions » du postmortem de cet incident, sans nommer de coupable.

   :::indice
   Pourquoi le bug a-t-il été écrit, pourquoi n'a-t-il pas été détecté, pourquoi a-t-il duré trois jours ?
   :::

   :::solution
   **Facteurs**

   - Les règles tarifaires n'avaient aucun test sur les frontières de poids : le changement de comparaison n'a fait échouer
     aucun test.
   - Le commit fautif mêlait une fonctionnalité, le tarif belge, et un refactoring, l'extraction des constantes : la revue
     s'est concentrée sur la fonctionnalité.
   - Le nom `POIDS_LEGER` ne disait pas si la limite était incluse, ce qui rendait l'erreur facile à écrire et difficile à
     voir.
   - Aucune surveillance ne suivait la répartition des frais facturés : le bug a été découvert par un client, trois jours
     après le déploiement.

   **Actions**

   | Action | Responsable | Échéance |
   | --- | --- | --- |
   | tests de frontière pour toutes les règles tarifaires | équipe paiement | 2 octobre |
   | convention : refactoring et fonctionnalité dans des commits ou pull requests séparés | tech lead | 30 septembre |
   | ajouter « frontières et comparaisons » à la grille de revue | équipe | 30 septembre |
   | alerte sur une variation anormale du montant moyen des frais de port | équipe plateforme | 9 octobre |

   Chaque action vise un facteur du système de travail, et a un responsable et une date. Aucune ne consiste à « faire plus
   attention » : c'est l'outillage et le processus qui doivent attraper l'erreur suivante.
   :::

## Questions d'entretien

- Qu'est-ce qu'un bon test de régression ?

  :::indice
  Rouge sans la correction, et au bon endroit.
  :::

  :::reponse
  Un test qui reproduit exactement les conditions du bug, qui échoue sans la correction et passe avec, ce qu'on vérifie
  en annulant temporairement la correction. Il se concentre sur la cause, souvent une frontière ou un cas limite, et teste
  aussi ses voisins. Il porte un nom ou un commentaire qui rappelle l'incident d'origine, pour qu'on comprenne pourquoi il
  existe. Il s'exécute avec le reste de la suite, en intégration continue, et empêche le bug de revenir silencieusement.
  :::

- Après avoir corrigé un bug en production, qu'est-ce qui reste à faire ?

  :::indice
  Les données, les personnes touchées, la vérification, les leçons.
  :::

  :::reponse
  Mesurer l'impact : qui a été touché, depuis quand, avec quelles conséquences, à partir des données et des journaux.
  Réparer ce qui doit l'être, données corrompues, remboursements, par un script idempotent, testé et relu, et communiquer
  avec les personnes concernées. Vérifier en production que la correction produit bien l'effet attendu. Documenter dans
  le journal des modifications. Et, pour un incident significatif, mener une analyse sans reproche, qui identifie les
  facteurs ayant permis au bug de passer et débouche sur des actions concrètes.
  :::

- Qu'est-ce qu'un postmortem sans reproche, et pourquoi ?

  :::indice
  Le système plutôt que la personne.
  :::

  :::reponse
  C'est une analyse d'incident qui reconstitue la chronologie, la cause et les facteurs contributifs en s'intéressant au
  système de travail, tests, outils, processus, revues, plutôt qu'à la personne qui a fait l'erreur. Une erreur humaine
  est inévitable ; la question utile est pourquoi elle n'a pas été attrapée. Chercher un coupable pousse les gens à cacher
  leurs erreurs et à ne plus signaler les incidents, ce qui prive l'équipe de ce qu'elle pourrait apprendre. Les
  conclusions prennent la forme d'actions concrètes, avec un responsable et une échéance.
  :::
