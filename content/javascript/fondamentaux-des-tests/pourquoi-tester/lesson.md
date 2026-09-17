---
id: javascript-pourquoi-tester
title: "Pourquoi tester, et quels tests écrire"
slug: pourquoi-tester
technology: javascript
level: intermediate
module: fondamentaux-des-tests
order: 1
estimatedMinutes: 30
difficulty: 2
xp: 80
prerequisites:
  - javascript-fonctions-pures
  - javascript-es-modules
skills:
  - testing-levels
tags:
  - javascript
  - tests
---

## Objectifs

- Expliquer ce qu'apportent les tests automatisés, au-delà de « trouver des bugs ».
- Distinguer test unitaire, test d'intégration et test de bout en bout.
- Utiliser la pyramide des tests pour répartir l'effort.
- Lire et lancer un premier test avec Vitest.

## Introduction

Chaque développeur teste : il lance l'application, clique, regarde la console. Le problème de ce test manuel, c'est
qu'il disparaît dès qu'il est fini. La semaine suivante, une modification dans un autre fichier casse la remise des
paniers, et personne ne refait les quarante clics qui l'auraient montré. Un **test automatisé** est une vérification
écrite une fois et rejouée en quelques secondes, à chaque modification, par chaque membre de l'équipe et par
l'intégration continue. Ce module pose les bases ; le suivant détaille l'outil.

## Concept

| Niveau | Ce qu'il vérifie | Vitesse | Ce qui casse le test |
| --- | --- | --- | --- |
| Unitaire | une fonction ou un module isolé | millisecondes | un changement de comportement de cette unité |
| Intégration | plusieurs modules ensemble : service et dépôt, API et base | dizaines de ms à secondes | un défaut d'assemblage entre les parties |
| Bout en bout (E2E) | l'application complète, pilotée comme un utilisateur | secondes par test | tout ce qui gêne le parcours, y compris l'environnement |

La **pyramide des tests** recommande beaucoup de tests unitaires, rapides et précis, une bonne couche de tests
d'intégration, et quelques tests de bout en bout sur les parcours critiques : connexion, paiement, inscription.

Un test Vitest se compose d'un `describe` qui regroupe, d'un `it` (ou `test`) qui décrit un comportement, et
d'assertions `expect(valeur).toBe(attendu)`. On le lance avec `npx vitest`, qui trouve les fichiers `*.test.js`.

## Exemple

```js
import { describe, it, expect } from 'vitest';

// Code applicatif : habituellement dans panier.js, importé par panier.test.js.
export function appliquerRemise(totalCentimes, code) {
  if (code === 'BIENVENUE10') return Math.round(totalCentimes * 0.9);
  if (code === 'LIVRAISON') return totalCentimes;
  throw new Error(`Code inconnu : ${code}`);
}

export function creerPanier(depot) {
  return {
    async ajouter(sku, quantite) {
      const produit = await depot.trouver(sku);
      if (!produit) throw new Error(`Produit introuvable : ${sku}`);
      return { sku, quantite, totalCentimes: produit.prixCentimes * quantite };
    },
  };
}

// Tests unitaires : une fonction pure, des entrées, une sortie.
describe('appliquerRemise', () => {
  it('retire 10 % avec BIENVENUE10', () => {
    expect(appliquerRemise(5000, 'BIENVENUE10')).toBe(4500);
  });

  it('refuse un code inconnu', () => {
    expect(() => appliquerRemise(5000, 'FAUX')).toThrow('Code inconnu : FAUX');
  });
});

// Test d'intégration : le panier avec un vrai dépôt en mémoire.
function creerDepotMemoire(produits) {
  const parSku = new Map(produits.map((produit) => [produit.sku, produit]));
  return { trouver: async (sku) => parSku.get(sku) ?? null };
}

describe('creerPanier avec un dépôt en mémoire', () => {
  it('calcule le total de la ligne à partir du prix du dépôt', async () => {
    const panier = creerPanier(creerDepotMemoire([{ sku: 'LIV-1', prixCentimes: 1250 }]));
    await expect(panier.ajouter('LIV-1', 2)).resolves.toEqual({
      sku: 'LIV-1',
      quantite: 2,
      totalCentimes: 2500,
    });
  });

  it('signale un produit absent', async () => {
    const panier = creerPanier(creerDepotMemoire([]));
    await expect(panier.ajouter('XXX', 1)).rejects.toThrow('Produit introuvable');
  });
});
```

## Comment ça fonctionne

Un test automatisé apporte trois choses. D'abord un **filet de sécurité** : quand on modifie ou réorganise du code,
les tests existants signalent immédiatement ce qui a changé de comportement, ce qui rend les refactorisations
possibles sans peur. Ensuite une **documentation exécutable** : `retire 10 % avec BIENVENUE10` dit ce que fait la
fonction, et contrairement à un commentaire, cette description ne peut pas devenir fausse sans que le test échoue.
Enfin une **pression sur la conception** : une fonction difficile à tester dépend souvent d'effets cachés, et la
rendre testable la rend aussi plus simple.

Le **test unitaire** vérifie une unité isolée, ici `appliquerRemise`. Il s'exécute en quelques millisecondes et, quand
il échoue, il désigne précisément la fonction et le cas en cause. Il ne dit rien, en revanche, de la façon dont les
unités s'assemblent.

Le **test d'intégration** vérifie des parties qui collaborent. Le panier est testé avec un dépôt en mémoire qui se
comporte comme le vrai : on vérifie ainsi le contrat entre les deux — `trouver` renvoie un produit ou `null`, le panier
multiplie le prix par la quantité. Un test d'intégration plus large utiliserait la vraie base de données de test. La
frontière entre unitaire et intégration est floue ; ce qui compte, c'est de savoir ce que chaque test vérifie
réellement.

Le **test de bout en bout** pilote l'application complète dans un vrai navigateur, avec un outil comme Playwright :

```js
test('un visiteur se connecte', async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Email').fill('ada@exemple.fr');
  await page.getByLabel('Mot de passe').fill('une phrase longue');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
});
```

C'est le test le plus proche de l'expérience réelle, mais aussi le plus lent, le plus coûteux à maintenir et le plus
sensible à l'environnement : réseau, données, animations. Quand il échoue, la cause peut être n'importe où.

D'où la **pyramide** : à la base, beaucoup de tests unitaires qui couvrent les règles et les cas limites ; au milieu,
des tests d'intégration qui vérifient les assemblages importants ; au sommet, quelques tests de bout en bout sur les
parcours dont l'échec coûterait cher. Certaines équipes préfèrent un « trophée », avec plus de tests d'intégration, car
ils donnent davantage de confiance par test. Dans les deux cas, l'idée est la même : chaque niveau attrape des défauts
que les autres ne voient pas, et le coût d'un test doit être justifié par la confiance qu'il apporte.

Les tests ne prouvent pas l'absence de bug : ils vérifient les cas qu'on a pensé à écrire. Leur valeur vient du choix
de ces cas — comportements nominaux, limites, erreurs — et de leur exécution systématique.

## Erreurs fréquentes

**Tout tester de bout en bout.** La suite devient lente et instable, et les échecs sont difficiles à diagnostiquer.

**N'écrire que des tests unitaires.** Chaque pièce fonctionne, mais l'assemblage peut échouer.

**Tester seulement le cas nominal.** Les bugs se cachent dans les limites et les erreurs.

**Garder des tests qu'on ne lance jamais.** Un test utile tourne à chaque modification, en local et en intégration
continue.

**Croire qu'une suite verte prouve l'absence de bug.** Elle prouve que les cas écrits passent.

## À retenir

- Un test automatisé est un filet de sécurité, une documentation et une pression sur la conception.
- Unitaire : une unité, rapide et précis. Intégration : des parties ensemble. E2E : l'application complète.
- Pyramide : beaucoup d'unitaires, des intégrations ciblées, quelques E2E critiques.
- Vitest : `describe`, `it`, `expect`, fichiers `*.test.js`.
- Tester les cas nominaux, les limites et les erreurs.

## Exercices

1. Classe chaque test : unitaire, intégration ou bout en bout.

   - a. On vérifie que `slugifier('Été 2026 !')` renvoie `'ete-2026'`.
   - b. On démarre l'API avec une base de test, on envoie `POST /commandes`, puis on lit la commande en base.
   - c. Un navigateur ouvre la boutique, ajoute un article, paie avec une carte de test et voit la confirmation.
   - d. On vérifie que le service de commande appelle le dépôt en mémoire et renvoie le total calculé.

   :::indice
   Compte les parties réelles mises en jeu, et demande-toi si un utilisateur pourrait reproduire le test.
   :::

   :::solution
   - a. Unitaire : une fonction pure, isolée.
   - b. Intégration : l'API et la base de données réelles collaborent, sans interface.
   - c. Bout en bout : l'application complète pilotée comme par un utilisateur.
   - d. Intégration à petite échelle : le service et un dépôt qui respecte le contrat du vrai. Certaines équipes
     l'appellent unitaire ; l'important est de savoir que la vraie base n'est pas testée ici.
   :::

2. Écris `formaterDuree(secondes)` qui renvoie `'1 h 05 min'`, `'5 min'` ou `'0 min'`, et lève une `RangeError` pour
   une valeur négative ou non entière. Écris les tests Vitest : cas nominaux, limites et erreurs.

   :::indice
   Pense aux limites : 0, 59 secondes, exactement 60 minutes, et aux entrées invalides.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   function formaterDuree(secondes) {
     if (!Number.isInteger(secondes) || secondes < 0) {
       throw new RangeError('La durée doit être un entier positif');
     }
     const minutesTotales = Math.floor(secondes / 60);
     const heures = Math.floor(minutesTotales / 60);
     const minutes = minutesTotales % 60;
     if (heures === 0) return `${minutes} min`;
     return `${heures} h ${String(minutes).padStart(2, '0')} min`;
   }

   describe('formaterDuree', () => {
     it('affiche les minutes seules sous une heure', () => {
       expect(formaterDuree(300)).toBe('5 min');
     });

     it('affiche les heures et les minutes sur deux chiffres', () => {
       expect(formaterDuree(3900)).toBe('1 h 05 min');
     });

     it('arrondit les secondes restantes vers le bas', () => {
       expect(formaterDuree(0)).toBe('0 min');
       expect(formaterDuree(59)).toBe('0 min');
     });

     it('passe aux heures à exactement 60 minutes', () => {
       expect(formaterDuree(3600)).toBe('1 h 00 min');
     });

     it('refuse une durée négative ou non entière', () => {
       expect(() => formaterDuree(-1)).toThrow(RangeError);
       expect(() => formaterDuree(1.5)).toThrow(RangeError);
     });
   });
   ```
   :::

3. Écris un test d'intégration pour `creerCatalogue(depot)`, dont la méthode `rechercher(texte)` renvoie les noms des
   produits qui contiennent le texte, sans tenir compte de la casse, triés par ordre alphabétique.

   :::indice
   Fournis un dépôt en mémoire avec une méthode `lister()` asynchrone, et choisis des données qui vérifient à la fois la
   casse, le filtre et le tri.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   function creerCatalogue(depot) {
     return {
       async rechercher(texte) {
         const recherche = texte.toLowerCase();
         const produits = await depot.lister();
         return produits
           .filter((produit) => produit.nom.toLowerCase().includes(recherche))
           .map((produit) => produit.nom)
           .toSorted((a, b) => a.localeCompare(b));
       },
     };
   }

   const depotMemoire = (produits) => ({ lister: async () => produits });

   describe('creerCatalogue', () => {
     it('trouve sans tenir compte de la casse et trie les résultats', async () => {
       const catalogue = creerCatalogue(
         depotMemoire([{ nom: 'Stylo bleu' }, { nom: 'Cahier' }, { nom: 'stylo rouge' }, { nom: 'Agenda' }]),
       );
       await expect(catalogue.rechercher('STYLO')).resolves.toEqual(['Stylo bleu', 'stylo rouge']);
     });

     it('renvoie une liste vide sans correspondance', async () => {
       const catalogue = creerCatalogue(depotMemoire([{ nom: 'Cahier' }]));
       await expect(catalogue.rechercher('gomme')).resolves.toEqual([]);
     });
   });
   ```
   :::

## Questions d'entretien

- Pourquoi écrire des tests automatisés, puisque l'équipe teste déjà manuellement ?

  :::indice
  Pense à ce qui se passe la semaine suivante, lors d'une autre modification.
  :::

  :::reponse
  Un test manuel vérifie l'état du code à un instant, puis disparaît. Un test automatisé se rejoue à chaque
  modification, en quelques secondes, en local comme en intégration continue : il détecte les régressions dans des
  parties qu'on n'a pas pensé à revérifier. Il rend les refactorisations sûres, documente le comportement attendu de
  façon toujours à jour, et pousse vers un code aux dépendances explicites. Les tests manuels exploratoires restent
  utiles pour découvrir des problèmes qu'aucun test n'anticipait.
  :::

- Qu'est-ce que la pyramide des tests, et quelle est sa limite ?

  :::indice
  Compare le coût, la vitesse et la confiance apportée à chaque niveau.
  :::

  :::reponse
  C'est une répartition : beaucoup de tests unitaires rapides et précis, moins de tests d'intégration, et quelques
  tests de bout en bout lents et coûteux sur les parcours critiques. Sa limite : des tests unitaires très nombreux mais
  trop isolés, à coups de simulations, peuvent tous passer alors que l'assemblage est cassé. D'où des variantes comme le
  trophée, qui renforcent l'intégration. Le bon dosage dépend de l'application : on cherche le maximum de confiance pour
  un temps d'exécution et un coût de maintenance raisonnables.
  :::

- Quels cas choisis-tu de tester pour une fonction ?

  :::indice
  Nominal, limites, erreurs.
  :::

  :::reponse
  Les cas nominaux qui représentent l'usage courant, les limites où le comportement change — zéro, vide, maximum,
  frontière entre deux branches —, et les entrées invalides ou les erreurs attendues. J'ajoute un test pour chaque bug
  corrigé, afin qu'il ne revienne pas. Je teste le comportement observable, pas le détail de l'implémentation, pour que
  les tests survivent aux refactorisations.
  :::
