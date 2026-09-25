---
id: javascript-tdd-et-tests-de-performance
title: TDD et tests de performance
slug: tdd-et-tests-de-performance
technology: javascript
level: advanced
module: tests-professionnels
order: 3
estimatedMinutes: 45
difficulty: 4
xp: 100
prerequisites:
  - javascript-tester-les-comportements
  - javascript-asynchrone-erreurs-et-couverture
skills:
  - tdd
tags:
  - javascript
  - tests
  - tdd
  - performance
---

## Objectifs

- Appliquer le cycle rouge, vert, refactor du Test-Driven Development par petits pas.
- Savoir quand le TDD aide, et quand il gêne.
- Écrire un test de performance déterministe en comptant les opérations coûteuses plutôt qu'en mesurant le temps.
- Comparer deux implémentations avec les benchmarks de Vitest, et interpréter leurs résultats.

## Introduction

Jusqu'ici, on a écrit les tests après le code. Le **Test-Driven Development** inverse l'ordre : on écrit d'abord un
test qui échoue, puis juste assez de code pour le faire passer, puis on nettoie. Ce n'est pas d'abord une technique
de test, c'est une technique de **conception** : chaque test oblige à décider comment le code sera utilisé avant de
décider comment il fonctionne.

La performance, elle, se teste mal avec un chronomètre : la même fonction prend 3 ms sur un poste et 12 ms sur un
serveur d'intégration continue chargé. Ce chapitre montre comment transformer une exigence de performance en test
fiable, et comment mesurer honnêtement quand on veut comparer deux solutions.

## Concept

| Étape du TDD | On fait | On s'interdit |
| --- | --- | --- |
| **Rouge** | écrire le plus petit test qui échoue, et le voir échouer | écrire du code de production |
| **Vert** | écrire le code le plus simple qui fait passer tous les tests | anticiper les cas futurs |
| **Refactor** | améliorer la structure, tests verts en permanence | changer le comportement |

| Besoin de performance | Outil fiable |
| --- | --- |
| éviter N requêtes au lieu d'une | compter les appels à la dépendance : `toHaveBeenCalledTimes(1)` |
| garantir un algorithme en O(n) plutôt qu'en O(n²) | compter les opérations, ou tester une taille où O(n²) est prohibitif |
| comparer deux implémentations | un benchmark : `vitest bench`, fichiers `*.bench.js` |
| vérifier la tenue en charge d'un service | un outil de charge dédié (k6, autocannon), hors tests unitaires |

## Exemple

On développe en TDD `analyserDuree(texte)`, qui convertit `'1h30'`, `'45min'` ou `'2h'` en minutes. Premier cycle,
le plus petit cas utile :

```js
it('convertit des minutes', () => {
  expect(analyserDuree('45min')).toBe(45);
});
// Rouge : analyserDuree n'existe pas.
// Vert, le plus simple possible :
const analyserDuree = (texte) => Number.parseInt(texte, 10);
```

Deuxième cycle : `'2h'` doit donner `120`. Le test échoue — il reçoit `2` —, ce qui force à distinguer les unités.
Troisième cycle : `'1h30'` combine les deux. Quatrième : une entrée invalide doit lever une erreur. Après chaque vert,
on refactore. Voici le résultat, tests compris :

```js
import { describe, it, expect } from 'vitest';

const FORMAT = /^(?:(\d+)h)?(?:(\d+)(?:min)?)?$/;

function analyserDuree(texte) {
  const correspondance = FORMAT.exec(texte.trim());
  if (!correspondance || texte.trim() === '') {
    throw new SyntaxError(`Durée illisible : « ${texte} »`);
  }
  const [, heures = '0', minutes = '0'] = correspondance;
  return Number(heures) * 60 + Number(minutes);
}

describe('analyserDuree', () => {
  it.each([
    ['45min', 45],
    ['2h', 120],
    ['1h30', 90],
    ['1h05min', 65],
    [' 3h ', 180],
  ])('%s → %i minutes', (texte, attendu) => {
    expect(analyserDuree(texte)).toBe(attendu);
  });

  it.each(['', 'h', '1j', 'deux heures'])('refuse « %s »', (texte) => {
    expect(() => analyserDuree(texte)).toThrow(SyntaxError);
  });
});
```

Et un test de performance déterministe : afficher une liste de commandes avec le nom de leur client ne doit coûter
qu'**une** requête de clients, quel que soit le nombre de commandes.

```js
import { it, expect, vi } from 'vitest';

async function commandesAvecClients(commandes, { chargerClients }) {
  const ids = [...new Set(commandes.map((c) => c.clientId))];
  const clients = new Map((await chargerClients(ids)).map((client) => [client.id, client]));
  return commandes.map((c) => ({ ...c, client: clients.get(c.clientId)?.nom ?? 'inconnu' }));
}

it('charge tous les clients en une seule requête', async () => {
  const chargerClients = vi.fn(async (ids) => ids.map((id) => ({ id, nom: `Client ${id}` })));
  const commandes = Array.from({ length: 50 }, (_, i) => ({ id: i, clientId: i % 7 }));

  const resultat = await commandesAvecClients(commandes, { chargerClients });

  expect(chargerClients).toHaveBeenCalledTimes(1);
  expect(chargerClients.mock.calls[0][0]).toHaveLength(7);
  expect(resultat[8]).toMatchObject({ id: 8, client: 'Client 1' });
});
```

## Comment ça fonctionne

**Le cycle.** Voir le test échouer d'abord prouve qu'il est capable d'échouer, et qu'il échoue pour la raison
prévue : un test qui passe du premier coup ne vérifie peut-être rien. L'étape verte vise le code le plus simple,
quitte à paraître naïf — `Number.parseInt` au premier cycle : c'est le **test suivant** qui force la généralisation.
Cette progression s'appelle la **triangulation** : chaque nouvel exemple élimine une implémentation trop simple. Le
refactor, enfin, se fait sous la protection de tests verts ; c'est là qu'on a extrait l'expression régulière et ajouté
la gestion des erreurs.

**Ce que le TDD apporte.** Le code naît testable, puisqu'on l'utilise avant de l'écrire : les dépendances
s'injectent, les fonctions sont petites. Chaque ligne existe parce qu'un test l'a exigée, ce qui évite le code
spéculatif. Et le travail avance par petits pas toujours verts : si un pas échoue, on sait exactement lequel.

**Ses limites.** Le TDD convient bien aux règles métier, aux parseurs, aux calculs : là où l'on sait décrire le
résultat attendu. Il convient mal à l'exploration, quand on ne sait pas encore ce qu'on construit, ou à une interface
visuelle dont on règle le rendu à l'œil. Beaucoup d'équipes l'appliquent à la logique métier et à la correction de
bugs — le test de régression écrit avant la correction, c'est déjà du TDD —, et écrivent le reste des tests après un
prototype.

**Tester la performance sans chronomètre.** `expect(duree).toBeLessThan(50)` échoue au hasard selon la charge de la
machine, ou passe sur un poste rapide alors que l'algorithme est quadratique. On teste plutôt la **cause** de la
lenteur, de façon déterministe. Le problème N+1 — une requête par commande au lieu d'une pour toutes — se vérifie en
comptant les appels : `toHaveBeenCalledTimes(1)`, pour 50 commandes comme pour 5 000. De même, on peut compter les
comparaisons d'un tri, ou les lectures d'un cache. Ces tests échouent dès qu'un refactoring réintroduit la boucle
de requêtes, et jamais à cause d'une machine lente. Ici, compter les appels n'est pas vérifier un détail
d'implémentation : le nombre d'allers-retours réseau **est** l'exigence.

**Mesurer : les benchmarks.** Pour comparer deux implémentations, on mesure, mais proprement : beaucoup
d'exécutions, un échauffement, des statistiques. Depuis Vitest 5, un benchmark est un test placé dans un fichier
`*.bench.js`, qui reçoit `bench` dans son contexte :

```js
// doublons.bench.js
import { test } from 'vitest';

const donnees = Array.from({ length: 2000 }, (_, i) => i % 1500);

test('supprimer les doublons', async ({ bench }) => {
  await bench.compare(
    bench('filter + indexOf', () => {
      donnees.filter((x, i) => donnees.indexOf(x) === i);
    }),
    bench('Set', () => {
      [...new Set(donnees)];
    }),
  );
});
```

`vitest bench` exécute ces fichiers, et eux seuls : `vitest run` les ignore, car une mesure de durée n'a pas sa place
dans une suite qui doit être stable. Le rapport donne, pour chaque candidat, le nombre d'exécutions par seconde (`hz`),
les durées minimale, moyenne et par percentile en millisecondes, la marge d'erreur relative (`rme`) et le nombre
d'échantillons. Sur un poste de développement, on obtient par exemple :

```text
name                     hz     mean     rme   samples
Set               14,965.98   0.0704  ±0.62%     14213   fastest
filter + indexOf     718.07   1.5097  ±4.17%       663
```

On lit un **ordre de grandeur** — ici, `Set` est une vingtaine de fois plus rapide, car `indexOf` reparcourt le tableau
pour chaque élément —, pas un chiffre absolu, qui changera sur une autre machine. Une `rme` élevée signale une mesure
bruitée. Et un micro-benchmark ne dit rien de l'application entière : on mesure d'abord ce qui est lent en conditions
réelles, avec le profileur, avant d'optimiser une fonction isolée. Avant Vitest 5, `bench` s'importait directement de
`vitest` et s'utilisait dans un `describe` ; l'idée reste la même.

## Erreurs fréquentes

**Écrire plusieurs tests d'un coup en TDD.** Un test rouge à la fois : sinon on ne sait plus lequel guide le code.

**Sauter l'étape rouge.** Un test jamais vu échouer peut ne rien vérifier.

**Généraliser trop tôt dans l'étape verte.** Laisse le test suivant forcer la généralisation.

**Oublier le refactor.** Le code passe les tests, mais la dette s'accumule à chaque cycle.

**Asserter des durées dans la suite de tests.** Teste la cause de la lenteur, de façon déterministe, et réserve les
mesures aux benchmarks.

**Optimiser sur la foi d'un micro-benchmark.** Mesure d'abord l'application réelle.

## À retenir

- TDD : un petit test rouge, le code le plus simple pour le vert, puis refactor, tests verts.
- Chaque nouveau test doit éliminer une implémentation trop naïve : c'est la triangulation.
- Le TDD est une technique de conception, efficace sur la logique métier et les corrections de bugs.
- Un test de performance fiable compte les opérations coûteuses au lieu de chronométrer.
- Les benchmarks (`*.bench.js`, `vitest bench`) comparent des implémentations ; on en lit l'ordre de grandeur.

## Exercices

1. En TDD, développe `estMotDePasseFort(mdp)` : au moins 12 caractères, au moins une majuscule, une minuscule et un
   chiffre. Écris la suite de tests dans l'ordre où tu les ajouterais, en indiquant ce que chacun force dans le code,
   puis la version finale.

   :::indice
   Commence par un cas qui passe avec `return true`, puis ajoute un test par règle : chacun fait échouer la version
   précédente.
   :::

   :::solution
   Ordre des tests : un mot de passe conforme (`return true` suffit) ; un mot de passe trop court (force la règle de
   longueur) ; sans majuscule ; sans minuscule ; sans chiffre (chaque test force une règle de plus). Après le dernier
   vert, on refactore les règles en une liste.

   ```js
   import { describe, it, expect } from 'vitest';

   const REGLES = [
     (mdp) => mdp.length >= 12,
     (mdp) => /[A-Z]/.test(mdp),
     (mdp) => /[a-z]/.test(mdp),
     (mdp) => /\d/.test(mdp),
   ];

   const estMotDePasseFort = (mdp) => REGLES.every((regle) => regle(mdp));

   describe('estMotDePasseFort', () => {
     it('accepte un mot de passe qui respecte toutes les règles', () => {
       expect(estMotDePasseFort('Printemps2026x')).toBe(true);
     });

     it.each([
       ['trop court', 'Court2026x'],
       ['sans majuscule', 'printemps2026x'],
       ['sans minuscule', 'PRINTEMPS2026X'],
       ['sans chiffre', 'PrintempsTardif'],
     ])('refuse un mot de passe %s', (_, mdp) => {
       expect(estMotDePasseFort(mdp)).toBe(false);
     });
   });
   ```

   Chaque cas refusé ne viole **qu'une** règle : si une règle disparaît du code, exactement un test échoue.
   :::

2. Cette fonction envoie une requête par article pour lire les stocks. Écris d'abord un test qui échoue en
   détectant le problème, puis corrige la fonction avec `stock.quantites(skus)`, qui lit plusieurs articles en une
   requête et renvoie un objet `{ [sku]: quantite }`.

   ```js
   async function articlesDisponibles(skus, stock) {
     const disponibles = [];
     for (const sku of skus) {
       if ((await stock.quantite(sku)) > 0) disponibles.push(sku);
     }
     return disponibles;
   }
   ```

   :::indice
   Un faux `stock` avec deux `vi.fn` : `quantite` et `quantites`. Vérifie le résultat, puis le nombre d'appels.
   :::

   :::solution
   Le test, écrit d'abord, échoue avec la version actuelle : `quantites` n'est jamais appelée, et `quantite` l'est
   trois fois.

   ```js
   import { it, expect, vi } from 'vitest';

   async function articlesDisponibles(skus, stock) {
     const quantites = await stock.quantites(skus);
     return skus.filter((sku) => (quantites[sku] ?? 0) > 0);
   }

   it('lit tous les stocks en une seule requête', async () => {
     const niveaux = { A: 3, B: 0, C: 8 };
     const stock = {
       quantite: vi.fn(async (sku) => niveaux[sku]),
       quantites: vi.fn(async (skus) => Object.fromEntries(skus.map((sku) => [sku, niveaux[sku]]))),
     };

     await expect(articlesDisponibles(['A', 'B', 'C'], stock)).resolves.toEqual(['A', 'C']);
     expect(stock.quantites).toHaveBeenCalledTimes(1);
     expect(stock.quantite).not.toHaveBeenCalled();
   });
   ```

   Le test ne mesure aucun temps : il échouera sur n'importe quelle machine si la boucle de requêtes revient.
   :::

3. Un collègue ajoute ce test dans la suite, et il échoue une fois sur dix en intégration continue. Explique
   pourquoi, puis propose une façon fiable de protéger la même exigence : `trouverDoublons` ne doit pas être
   quadratique.

   ```js
   it('est rapide', () => {
     const valeurs = Array.from({ length: 5000 }, (_, i) => i);
     const debut = performance.now();
     trouverDoublons(valeurs);
     expect(performance.now() - debut).toBeLessThan(5);
   });
   ```

   :::indice
   La durée dépend de la machine. Qu'est-ce qui distingue un algorithme linéaire d'un algorithme quadratique, et
   peut se compter ?
   :::

   :::solution
   La durée dépend de la charge de la machine, de la compilation à la volée et du ramasse-miettes : 5 ms sont parfois
   dépassées par une version linéaire, et une version quadratique peut passer sur un poste rapide. On compte plutôt
   les opérations : un `Proxy` autour du tableau compte chaque lecture d'élément, et l'on vérifie que chaque valeur
   n'est lue qu'une fois.

   ```js
   import { describe, it, expect } from 'vitest';

   function trouverDoublons(valeurs) {
     const vues = new Set();
     const doublons = new Set();
     for (const valeur of valeurs) {
       if (vues.has(valeur)) doublons.add(valeur);
       vues.add(valeur);
     }
     return [...doublons];
   }

   const trouverDoublonsQuadratique = (valeurs) =>
     valeurs.filter((valeur, i) => valeurs.indexOf(valeur) !== i && valeurs.indexOf(valeur, i + 1) === -1);

   function tableauCompteur(tableau) {
     const compteur = { lectures: 0 };
     const proxy = new Proxy(tableau, {
       get(cible, cle, recepteur) {
         if (typeof cle === 'string' && /^\d+$/.test(cle)) compteur.lectures += 1;
         return Reflect.get(cible, cle, recepteur);
       },
     });
     return { proxy, compteur };
   }

   describe('trouverDoublons', () => {
     it('trouve les doublons', () => {
       expect(trouverDoublons([3, 1, 3, 2, 1])).toEqual([3, 1]);
     });

     it('ne lit chaque valeur qu’une fois', () => {
       const { proxy, compteur } = tableauCompteur(Array.from({ length: 5000 }, (_, i) => i % 4000));

       trouverDoublons(proxy);

       expect(compteur.lectures).toBe(5000);
     });

     it('détecterait une version quadratique', () => {
       const { proxy, compteur } = tableauCompteur(Array.from({ length: 5000 }, (_, i) => i % 4000));

       expect(trouverDoublonsQuadratique(proxy)).toEqual(trouverDoublons(proxy));
       expect(compteur.lectures).toBeGreaterThan(1_000_000);
     });
   });
   ```

   Le test est déterministe : même résultat sur toutes les machines. Il a une limite, qu'il faut connaître : une
   version qui copierait d'abord le tableau, puis travaillerait sur la copie, échapperait au compteur. Il protège
   contre la régression la plus probable — relire les données reçues —, pas contre toutes. Pour comparer les vitesses
   réelles, on place une mesure dans un fichier `*.bench.js`, hors de la suite.
   :::

## Questions d'entretien

- Explique le cycle du TDD. Pourquoi voir le test échouer d'abord ?

  :::indice
  Rouge, vert, refactor : que prouve l'étape rouge ?
  :::

  :::reponse
  On écrit le plus petit test qui décrit le comportement suivant, et on le voit échouer ; on écrit le code le plus
  simple qui le fait passer ; puis on améliore la structure en gardant tous les tests verts. Voir le test échouer
  prouve qu'il est capable de détecter l'absence du comportement, et qu'il échoue pour la bonne raison : un test qui
  passe d'emblée peut être mal écrit et ne rien vérifier. Le cycle court donne aussi un retour immédiat : si un pas
  casse quelque chose, on sait lequel.
  :::

- Le TDD est-il toujours adapté ?

  :::indice
  Pense à ce qu'il faut savoir pour écrire un test avant le code.
  :::

  :::reponse
  Il suppose de savoir décrire le résultat attendu. Il excelle sur la logique métier, les parseurs, les calculs et
  les corrections de bugs, et il pousse vers un code découplé et testable. Il est moins utile en exploration, quand on
  prototype pour comprendre le problème, ou pour un rendu visuel qu'on ajuste à l'œil. Dans ces cas, je prototype, puis
  j'écris des tests une fois le comportement stabilisé, et je reviens au TDD pour les règles et les bugs.
  :::

- Comment testerais-tu une exigence de performance ?

  :::indice
  Distingue ce qu'on vérifie dans la suite de tests et ce qu'on mesure à part.
  :::

  :::reponse
  Dans la suite de tests, je vérifie la cause de la performance de façon déterministe : nombre de requêtes pour
  détecter un N+1, nombre de lectures ou de comparaisons pour la complexité, nombre d'appels à une API grâce à un
  cache. Je n'y mets pas de seuils de durée, qui échouent au hasard selon la machine. Pour comparer des
  implémentations, j'utilise des benchmarks séparés, comme `vitest bench`, en lisant l'ordre de grandeur et la marge
  d'erreur. Pour un service, des tests de charge dédiés, et en production, la supervision des temps de réponse.
  :::
