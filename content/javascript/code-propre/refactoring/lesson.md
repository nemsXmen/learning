---
id: javascript-refactoring
title: "Refactoring : améliorer la structure sans changer le comportement"
slug: refactoring
technology: javascript
level: advanced
module: code-propre
order: 4
estimatedMinutes: 50
difficulty: 4
xp: 100
prerequisites:
  - javascript-composition-et-inversion-des-dependances
  - javascript-tester-les-comportements
skills:
  - js-refactoring
tags:
  - javascript
  - architecture
  - refactoring
---

## Objectifs

- Définir le refactoring, et le distinguer d'une réécriture ou d'une nouvelle fonctionnalité.
- Poser un filet de sécurité sur du code existant avec des tests de caractérisation.
- Avancer par petites étapes vérifiées, avec les refactorings du catalogue : extraire, renommer, déplacer, remplacer
  une condition.
- Reconnaître les principales odeurs de code, et le refactoring qui répond à chacune.
- Choisir le bon moment : avant d'ajouter une fonctionnalité, pendant une correction, jamais mêlé à un changement de
  comportement.

## Introduction

Le code d'une application vit longtemps, et il se dégrade : chaque correction pressée, chaque fonctionnalité ajoutée
dans l'urgence le rend un peu plus difficile à comprendre. Le **refactoring** est la discipline qui inverse cette
pente : modifier la **structure** du code sans modifier son **comportement** observable, par petites étapes sûres.

Ce n'est pas une réécriture. Réécrire, c'est jeter et recommencer, avec le risque de perdre des règles que personne
n'avait documentées. Refactorer, c'est transformer le code existant, pas à pas, en gardant à chaque instant une
application qui fonctionne. La condition : des tests qui prouvent que le comportement n'a pas changé.

## Concept

| Odeur de code | Signe | Refactoring |
| --- | --- | --- |
| fonction longue | il faut défiler pour la lire | extraire des fonctions |
| nom obscur | il faut lire le corps pour comprendre | renommer |
| code dupliqué | la même logique à plusieurs endroits | extraire, puis réutiliser |
| longue liste de paramètres | appels illisibles | introduire un objet de paramètres |
| conditions en cascade sur un type | `if (pays === 'FR') … else if …` | table de correspondance, ou polymorphisme |
| obsession des primitifs | un montant en nombre, un e-mail en chaîne, partout | objet valeur avec ses règles |
| jalousie de fonctionnalité | une fonction manipule surtout les données d'un autre module | déplacer la fonction |
| modification en rafale | un changement touche dix fichiers | regrouper ce qui change ensemble |
| deux étapes mêlées | analyser et calculer dans la même boucle | séparer en phases |

| Règle | Pourquoi |
| --- | --- |
| tests verts avant de commencer | sinon on ne sait pas ce qu'on casse |
| une petite étape à la fois, tests après chacune | une erreur se trouve immédiatement |
| jamais de changement de comportement pendant un refactoring | on ne sait plus ce qui a causé une différence |
| commits séparés | la revue distingue « déplacé » de « modifié » |

## Exemple

Un calcul de frais de port, écrit au fil des années :

```js
// frais-de-port.js
export function fraisDePort(commande) {
  let f = 0;
  if (commande.pays === 'FR') {
    if (commande.poids <= 1) f = 4.9;
    else if (commande.poids <= 5) f = 7.9;
    else f = 12.9;
    if (commande.total >= 60) f = 0;
  } else if (commande.pays === 'BE' || commande.pays === 'LU') {
    if (commande.poids <= 1) f = 8.9;
    else if (commande.poids <= 5) f = 12.9;
    else f = 19.9;
    if (commande.total >= 100) f = 0;
  } else {
    if (commande.poids <= 5) f = 24.9;
    else f = 39.9;
  }
  if (commande.express) f = f + 10;
  return f;
}
```

On doit ajouter l'Allemagne. Avant, on rend le changement facile. **Étape 1 : caractériser.** On ne sait pas tout ce
que fait ce code, alors on enregistre ce qu'il fait **aujourd'hui**, sur une grille de cas, y compris ceux qui
paraissent étranges : par exemple, la livraison offerte en France devient payante en express.

```js
// frais-de-port.test.js
import { it, expect } from 'vitest';
import { fraisDePort } from './frais-de-port.js';

const CAS = [];
for (const pays of ['FR', 'BE', 'LU', 'US'])
  for (const poids of [0.5, 1, 3, 5, 8])
    for (const total of [20, 60, 100])
      for (const express of [false, true]) CAS.push({ pays, poids, total, express });

it('caractérise les frais de port actuels', () => {
  const resultats = CAS.map((commande) => [commande, fraisDePort(commande)]);
  expect(resultats).toMatchSnapshot();
});
```

Au premier lancement, Vitest enregistre les 120 résultats dans un fichier d'instantané ; ensuite, toute différence
fait échouer le test. **Étapes 2 à 4 : transformer par petits pas**, en relançant les tests après chacun : extraire
les tarifs dans une table, extraire la recherche de tranche, nommer les règles.

```js
// frais-de-port.js, après refactoring
const SUPPLEMENT_EXPRESS = 10;

const TARIFS = {
  domestique: { tranches: [[1, 4.9], [5, 7.9], [Infinity, 12.9]], gratuitDes: 60 },
  benelux: { tranches: [[1, 8.9], [5, 12.9], [Infinity, 19.9]], gratuitDes: 100 },
  international: { tranches: [[5, 24.9], [Infinity, 39.9]], gratuitDes: Infinity },
};

const ZONE_PAR_PAYS = { FR: 'domestique', BE: 'benelux', LU: 'benelux' };

function tarifDeBase(tarif, poids) {
  return tarif.tranches.find(([poidsMax]) => poids <= poidsMax)[1];
}

export function fraisDePort({ pays, poids, total, express }) {
  const tarif = TARIFS[ZONE_PAR_PAYS[pays] ?? 'international'];
  const base = total >= tarif.gratuitDes ? 0 : tarifDeBase(tarif, poids);
  return express ? base + SUPPLEMENT_EXPRESS : base;
}
```

Les 120 cas donnent exactement les mêmes résultats. Ajouter l'Allemagne est maintenant un changement de
**comportement**, séparé et minuscule : une ligne `DE: 'benelux'` dans `ZONE_PAR_PAYS`, ou une nouvelle zone, avec
un nouveau test qui décrit la règle voulue, et un instantané mis à jour en connaissance de cause.

## Comment ça fonctionne

**Rendre le changement facile, puis faire le changement facile.** On refactore rarement pour le plaisir : on refactore
parce qu'on doit modifier un code qui résiste. Dans le code d'origine, ajouter un pays demandait un quatrième bloc
`else if` copié et adapté, avec le risque d'oublier une règle. Dans le nouveau, les données et la logique sont
séparées, et le changement se réduit à une donnée.

**Les tests de caractérisation.** Sur du code sans tests, on ne connaît pas toujours le comportement **voulu**, mais on
peut enregistrer le comportement **actuel**, bizarreries comprises : c'est la référence à préserver. Une grille de cas
qui couvre chaque branche et chaque frontière, 1 kg, 5 kg, 60 €, et un instantané qui fige les résultats, suffisent
souvent. Pendant qu'on écrit la grille, on découvre des comportements surprenants : on les note, mais on ne les
corrige pas pendant le refactoring. Les corriger est un changement de comportement, à faire ensuite, volontairement.

**Des pas minuscules.** Chaque étape doit être assez petite pour que, si les tests échouent, la cause soit évidente :
extraire une constante, relancer ; extraire une fonction, relancer ; remplacer une branche par une consultation de
table, relancer. Si un pas casse quelque chose, on l'annule plutôt que de déboguer. Les éditeurs automatisent
beaucoup de ces transformations : renommer un symbole partout, extraire une fonction ou une variable, déplacer vers
un autre fichier. Ils sont plus sûrs que les modifications à la main.

**Séparer structure et comportement.** Un commit « refactoring » ne change aucun test existant ; un commit
« fonctionnalité » ajoute ou modifie des tests. Mélangés, une revue ne peut plus distinguer une ligne déplacée d'une
règle modifiée. C'est la règle des deux chapeaux : on porte l'un ou l'autre, jamais les deux à la fois.

**Quand refactorer.** Avant d'ajouter une fonctionnalité dans du code difficile ; en corrigeant un bug, une fois le test
de régression écrit ; à la troisième duplication d'une même logique, la « règle de trois » ; en revue de code, par
petites touches. On ne refactore pas un code qu'on ne va pas modifier, ni juste avant une mise en production
critique sans filet de tests.

**Les grandes transformations.** Pour remplacer tout un module, on évite la réécriture complète en parallèle, qui
n'aboutit jamais. On construit le nouveau à côté de l'ancien, on redirige les appels fonctionnalité par fonctionnalité,
et on supprime l'ancien quand plus rien ne l'utilise : c'est le motif de l'**étrangleur**, *strangler fig*.

## Erreurs fréquentes

**Refactorer sans tests.** Sans filet, un refactoring est une modification à l'aveugle ; commence par caractériser.

**Corriger les bizarreries pendant le refactoring.** Note-les, termine le refactoring, puis change le comportement
dans un commit dédié, avec un test.

**Faire de grands pas.** Si les tests échouent après une heure de modifications, on ne sait plus pourquoi ; avance par
étapes de quelques minutes.

**Mélanger refactoring et fonctionnalité dans un commit.** La revue devient impossible.

**Réécrire au lieu de refactorer.** Les règles implicites du code existant se perdent ; transforme par étapes.

**Refactorer du code qu'on ne touche pas.** Le gain est nul et le risque réel ; refactore là où tu travailles.

## À retenir

- Refactorer, c'est changer la structure sans changer le comportement observable.
- Filet de sécurité d'abord : des tests de caractérisation qui figent le comportement actuel.
- Petites étapes, tests après chacune ; on annule plutôt que de déboguer.
- Chaque odeur de code a ses refactorings : extraire, renommer, déplacer, table de correspondance, objet valeur.
- Rendre le changement facile, puis faire le changement facile ; structure et comportement dans des commits séparés.
- Pour un gros remplacement, l'étrangleur plutôt que la réécriture.

## Exercices

1. Pour chaque extrait, nomme l'odeur de code et le refactoring à appliquer.

   ```js
   // a)
   function afficherFacture(f) {
     const tva = f.lignes.reduce((s, l) => s + l.prix * l.qte, 0) * 0.2;
     // …
   }
   function exporterFacture(f) {
     const tva = f.lignes.reduce((s, l) => s + l.prix * l.qte, 0) * 0.2;
     // …
   }

   // b)
   function libelleLivraison(client) {
     return `${client.adresse.rue}, ${client.adresse.codePostal} ${client.adresse.ville} (${client.adresse.pays})`;
   }

   // c)
   function creerRendezVous(date, heure, duree, praticien, patient, salle, rappelSms, rappelEmail) {}

   // d)
   const prix = 19.99; // en euros ? en centimes ? TTC ? arrondi comment ?
   ```

   :::indice
   Duplication, jalousie de fonctionnalité, liste de paramètres, obsession des primitifs.
   :::

   :::solution
   - a) Code dupliqué : le calcul de TVA existe deux fois, avec un taux magique. Extraire `tvaFacture(facture)` avec
     une constante `TAUX_TVA`, et l'utiliser aux deux endroits.
   - b) Jalousie de fonctionnalité : la fonction ne s'intéresse qu'à l'adresse. Déplacer la mise en forme vers le
     module des adresses, `formaterAdresse(adresse)`, et l'appeler avec `client.adresse`.
   - c) Longue liste de paramètres, dont deux booléens : introduire un objet de paramètres,
     `creerRendezVous({ debut, duree, praticien, patient, salle, rappels: { sms: true, email: false } })`, en
     regroupant date et heure en un seul instant.
   - d) Obsession des primitifs : un montant n'est pas un simple nombre. Introduire un objet valeur `Montant`, en
     centimes entiers avec une devise, qui porte les règles d'addition et d'arrondi.
   :::

2. Ce code mêle deux étapes : analyser des lignes CSV et calculer des totaux. Applique « séparer en phases » : une
   fonction qui analyse et renvoie des objets, une fonction pure qui calcule. Vérifie que le résultat est identique.

   ```js
   function totauxParCategorie(csv) {
     const totaux = {};
     for (const ligne of csv.trim().split('\n').slice(1)) {
       const [, categorie, montant] = ligne.split(';');
       totaux[categorie] = (totaux[categorie] ?? 0) + Number(montant.replace(',', '.'));
     }
     return totaux;
   }
   ```

   :::indice
   Première phase : du texte aux objets `{ categorie, montant }`. Seconde phase : des objets aux totaux.
   :::

   :::solution
   ```js
   function analyserVentes(csv) {
     return csv
       .trim()
       .split('\n')
       .slice(1)
       .map((ligne) => {
         const [, categorie, montant] = ligne.split(';');
         return { categorie, montant: Number(montant.replace(',', '.')) };
       });
   }

   function totaliserParCategorie(ventes) {
     const totaux = {};
     for (const { categorie, montant } of ventes) {
       totaux[categorie] = (totaux[categorie] ?? 0) + montant;
     }
     return totaux;
   }

   const totauxParCategorie = (csv) => totaliserParCategorie(analyserVentes(csv));

   const csv = 'id;categorie;montant\n1;livres;12,50\n2;jeux;30\n3;livres;7,5\n';
   console.log(totauxParCategorie(csv)); // { livres: 20, jeux: 30 }
   ```

   Chaque phase se teste seule : l'analyse avec des chaînes, le calcul avec des objets. Si demain les ventes arrivent
   en JSON, on écrit un autre analyseur ; le calcul ne change pas.
   :::

3. Ta tâche : ajouter l'Allemagne aux frais de port, avec les tarifs du Benelux mais une livraison offerte dès 80 €.
   En partant de la version refactorée, décris les commits que tu fais, dans l'ordre, et écris le code du changement
   et le test qui l'accompagne.

   :::indice
   Le refactoring est déjà fait et commité. Le changement de comportement vient avec un test qui décrit la nouvelle
   règle.
   :::

   :::solution
   Commits, dans l'ordre :

   1. `test: caractériser les frais de port`, la grille et son instantané, sans toucher au code ;
   2. `refactor: tarifs de livraison en table`, le refactoring, sans modifier aucun test ;
   3. `feat: livraison vers l'Allemagne`, la nouvelle zone et un test de la règle.

   ```js
   // frais-de-port.js : on ajoute une zone et une correspondance
   const TARIFS = {
     domestique: { tranches: [[1, 4.9], [5, 7.9], [Infinity, 12.9]], gratuitDes: 60 },
     benelux: { tranches: [[1, 8.9], [5, 12.9], [Infinity, 19.9]], gratuitDes: 100 },
     allemagne: { tranches: [[1, 8.9], [5, 12.9], [Infinity, 19.9]], gratuitDes: 80 },
     international: { tranches: [[5, 24.9], [Infinity, 39.9]], gratuitDes: Infinity },
   };
   const ZONE_PAR_PAYS = { FR: 'domestique', BE: 'benelux', LU: 'benelux', DE: 'allemagne' };
   ```

   ```js
   // frais-de-port.test.js : la nouvelle règle, décrite explicitement
   import { it, expect } from 'vitest';
   import { fraisDePort } from './frais-de-port.js';

   it("livre l'Allemagne au tarif du Benelux, offert dès 80 €", () => {
     expect(fraisDePort({ pays: 'DE', poids: 3, total: 50, express: false })).toBe(12.9);
     expect(fraisDePort({ pays: 'DE', poids: 3, total: 80, express: false })).toBe(0);
     expect(fraisDePort({ pays: 'DE', poids: 3, total: 80, express: true })).toBe(10);
   });
   ```

   L'instantané de caractérisation ne change pas, car la grille ne contient pas l'Allemagne : c'est la preuve que le
   comportement des autres pays est intact. Dupliquer les tranches du Benelux est ici un choix assumé : si les
   deux tarifs divergent un jour, chacun a sa ligne.
   :::

## Questions d'entretien

- Qu'est-ce que le refactoring, et en quoi diffère-t-il d'une réécriture ?

  :::indice
  Structure, comportement, et taille des pas.
  :::

  :::reponse
  C'est la modification de la structure interne du code sans changement de son comportement observable, par petites
  transformations, chacune vérifiée par les tests. Une réécriture remplace le code d'un coup : elle fait courir le
  risque de perdre des règles implicites, et l'application ne fonctionne pas tant qu'elle n'est pas terminée. Le
  refactoring garde une application fonctionnelle à chaque étape, et peut être interrompu à tout moment. Pour remplacer
  un gros module, je procède aussi par étapes, avec le motif de l'étrangleur.
  :::

- Comment refactorer un code sans tests ?

  :::indice
  Que peut-on tester quand on ne connaît pas le comportement voulu ?
  :::

  :::reponse
  Je commence par écrire des tests de caractérisation : ils enregistrent ce que fait le code aujourd'hui, sur une
  grille de cas qui couvre ses branches et ses valeurs limites, souvent avec des instantanés. Ils ne disent pas si le
  comportement est correct, seulement s'il a changé. Si le code est difficile à tester parce qu'il dépend d'une base ou
  de l'horloge, je fais d'abord les plus petites modifications sûres possibles pour isoler ces dépendances, souvent
  avec les refactorings automatiques de l'éditeur. Ensuite seulement, je refactore par petites étapes.
  :::

- Pourquoi séparer les commits de refactoring et de fonctionnalité ?

  :::indice
  Pense à la personne qui relit, et à celle qui cherchera l'origine d'un bug.
  :::

  :::reponse
  Parce qu'ils se vérifient différemment. Un commit de refactoring ne doit changer aucun comportement : les tests
  existants passent sans modification, et le relecteur vérifie seulement que la transformation est correcte. Un commit
  de fonctionnalité change le comportement, avec de nouveaux tests. Mélangés, le relecteur ne peut plus distinguer une
  ligne déplacée d'une règle modifiée, et un `git bisect` qui désigne le commit ne dit pas laquelle des deux
  modifications a introduit le bug.
  :::
