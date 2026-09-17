---
id: javascript-vitest-assertions
title: "Vitest : assertions, suites et cycle de vie"
slug: assertions-et-suites
technology: javascript
level: intermediate
module: tests-javascript
order: 1
estimatedMinutes: 35
difficulty: 3
xp: 90
prerequisites:
  - javascript-aaa-isolation
skills:
  - vitest-assertions
tags:
  - javascript
  - tests
  - vitest
---

## Objectifs

- Choisir le bon matcher : `toBe`, `toEqual`, `toStrictEqual`, `toMatchObject`, `toBeCloseTo`…
- Organiser une suite avec `describe`, et paramétrer un test avec `it.each`.
- Utiliser les crochets `beforeAll`, `beforeEach`, `afterEach`, `afterAll` et comprendre leur ordre.
- Cibler l'exécution avec `only`, `skip` et `todo`, sans les oublier dans le code.

## Introduction

Vitest et Jest partagent presque la même API : `describe`, `it`, `expect`, les mêmes matchers et les mêmes crochets. Ce
qu'on apprend ici vaut donc pour les deux. La difficulté n'est pas de retenir la syntaxe, mais de choisir l'assertion
qui vérifie exactement ce qu'on veut : ni trop peu — le test passe alors que le code est faux —, ni trop — le test casse
dès qu'un détail sans importance change.

## Concept

| Matcher | Vérifie | Exemple |
| --- | --- | --- |
| `toBe` | identité avec `Object.is` | primitives, même référence |
| `toEqual` | égalité récursive du contenu, ignore les propriétés `undefined` | objets et tableaux |
| `toStrictEqual` | comme `toEqual`, plus propriétés `undefined`, trous et classes | données exactes |
| `toMatchObject` | le sous-ensemble indiqué, le reste est libre | réponse d'API |
| `toContain` / `toHaveLength` | présence d'un élément, longueur | tableaux, chaînes |
| `toBeCloseTo` | nombre à une précision près | calculs décimaux |
| `toThrow` | une erreur levée, par message, regex ou classe | cas d'erreur |
| `expect.any(Date)`, `expect.stringMatching(/…/)` | une valeur partiellement connue | identifiants, dates |
| `.not` | l'inverse du matcher | `expect(x).not.toBeNull()` |

## Exemple

```js
import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

class Commande {
  constructor(id, total) {
    this.id = id;
    this.total = total;
  }
}

describe('choisir son assertion', () => {
  it('toBe compare les identités, toEqual les contenus', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(0.1 + 0.2).toBeCloseTo(0.3);
    expect({ id: 1 }).not.toBe({ id: 1 });
    expect({ id: 1 }).toEqual({ id: 1 });
  });

  it('toStrictEqual est plus exigeant que toEqual', () => {
    expect({ id: 1, note: undefined }).toEqual({ id: 1 });
    expect({ id: 1, note: undefined }).not.toStrictEqual({ id: 1 });
    expect(new Commande(1, 50)).toEqual({ id: 1, total: 50 });
    expect(new Commande(1, 50)).not.toStrictEqual({ id: 1, total: 50 });
  });

  it('toMatchObject et expect.any vérifient ce qui compte', () => {
    const reponse = { id: 'c-8f3a', total: 50, creeeLe: new Date(), lignes: [{ sku: 'A' }] };
    expect(reponse).toMatchObject({ total: 50, lignes: [{ sku: 'A' }] });
    expect(reponse).toEqual({
      id: expect.stringMatching(/^c-/),
      total: 50,
      creeeLe: expect.any(Date),
      lignes: expect.arrayContaining([{ sku: 'A' }]),
    });
  });

  it('toThrow accepte un message, une regex ou une classe', () => {
    const payer = (montant) => {
      if (montant <= 0) throw new RangeError('Montant invalide : 0');
    };
    expect(() => payer(0)).toThrow('Montant invalide');
    expect(() => payer(0)).toThrow(/invalide/);
    expect(() => payer(0)).toThrow(RangeError);
  });

  it.each([
    { entree: 'Été 2026', attendu: 'ete-2026' },
    { entree: '  Bonjour  ', attendu: 'bonjour' },
    { entree: 'A & B', attendu: 'a-b' },
  ])('slugifie « $entree » en $attendu', ({ entree, attendu }) => {
    const slug = entree
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    expect(slug).toBe(attendu);
  });
});

describe('ordre des crochets', () => {
  const journal = [];
  beforeAll(() => journal.push('beforeAll'));
  beforeEach(() => journal.push('beforeEach'));
  afterEach(() => journal.push('afterEach'));
  afterAll(() => {
    expect(journal).toEqual(['beforeAll', 'beforeEach', 'test 1', 'afterEach', 'beforeEach', 'test 2', 'afterEach']);
  });

  it('premier', () => journal.push('test 1'));
  it('second', () => journal.push('test 2'));
});
```

## Comment ça fonctionne

`expect(valeur)` renvoie un objet dont chaque matcher compare `valeur` à l'attendu et lève une `AssertionError`
détaillée en cas d'écart ; le test échoue à la première assertion ratée. Le choix du matcher décide donc de ce qui
est réellement vérifié.

`toBe` utilise `Object.is` : parfait pour les primitives, mais deux objets de même contenu ne sont pas le même objet.
`toEqual` compare récursivement les contenus, et se montre tolérant : une propriété qui vaut `undefined` est traitée
comme absente, et la classe de l'objet n'est pas vérifiée. `toStrictEqual` lève ces tolérances, ce qui convient quand
la forme exacte compte — une réponse sérialisée, un objet construit par une classe. Pour les nombres décimaux,
`toBeCloseTo` compare avec une précision de deux décimales par défaut, et évite le piège de `0.1 + 0.2`.

Quand seule une partie d'un objet est intéressante, vérifier tout l'objet rend le test **fragile** : l'ajout d'un champ
sans rapport le casse. `toMatchObject` vérifie un sous-ensemble, et les **matchers asymétriques** —
`expect.any(Date)`, `expect.stringMatching`, `expect.arrayContaining`, `expect.objectContaining` — décrivent une valeur
partiellement connue, comme un identifiant généré ou une date de création.

`toThrow` s'applique à une **fonction** que Vitest appelle lui-même : `expect(() => payer(0))`. Il accepte une chaîne
(le message doit la contenir), une expression régulière, ou une classe d'erreur. Sans argument, il accepte n'importe
quelle erreur, ce qui laisse passer une `TypeError` due à un bug à la place de l'erreur métier attendue.

`describe` regroupe des tests et peut s'imbriquer ; les noms s'enchaînent dans le rapport. `it.each` exécute le même
test sur un tableau de cas, et `$entree` dans le nom insère la valeur formatée de chaque cas : un échec désigne
précisément la ligne en cause.

Les **crochets** s'appliquent au `describe` qui les contient et à ses descendants. `beforeAll` s'exécute une fois
avant le premier test, `beforeEach` avant chacun, `afterEach` après chacun, même en cas d'échec, et `afterAll` une fois
à la fin. On réserve `beforeAll` à ce qui est coûteux et **non modifié** par les tests — démarrer un serveur de test —,
et `beforeEach` à l'état que les tests modifient. `afterEach` et `afterAll` nettoient : fermer une connexion, restaurer
une variable globale.

`it.only` et `describe.only` n'exécutent que les tests marqués dans le fichier, `it.skip` en saute un, `it.todo`
note un test à écrire. Pratiques pendant le développement, `only` et `skip` ne doivent pas être commités : un `only`
oublié désactive silencieusement le reste du fichier. Par défaut, Vitest refuse les `only` quand la variable
d'environnement `CI` est définie (option `allowOnly`) : la suite échoue en intégration continue au lieu de passer à
moitié.

## Erreurs fréquentes

**Comparer des objets avec `toBe`.** Utilise `toEqual` ou `toStrictEqual`.

**Vérifier une réponse entière alors qu'un champ compte.** Utilise `toMatchObject` ou les matchers asymétriques.

**Écrire `expect(f()).toThrow()`.** L'erreur est levée avant `expect` : passe une fonction.

**Utiliser `toThrow()` sans argument.** Précise le message ou la classe attendus.

**Commiter un `it.only`.** Le reste du fichier ne s'exécute plus.

## À retenir

- `toBe` : identité. `toEqual` : contenu, tolérant. `toStrictEqual` : contenu exact.
- `toMatchObject` et `expect.any` vérifient ce qui compte, sans fragilité.
- `toThrow` reçoit une fonction, et de préférence un message ou une classe.
- `it.each` paramètre un test ; `$propriete` nomme chaque cas.
- `beforeAll` pour le coûteux et immuable, `beforeEach` pour l'état modifié, `after*` pour nettoyer.

## Exercices

1. Remplace chaque assertion fragile ou fausse par une assertion adaptée.

   ```js
   const utilisateur = creerUtilisateur('ada@exemple.fr'); // { id: 'u-…', email, creeLe: Date, roles: ['lecteur'] }
   expect(utilisateur).toBe({ email: 'ada@exemple.fr' });
   expect(utilisateur.roles).toBe(['lecteur']);
   expect(prixTTC(10.2)).toBe(12.24);
   expect(valider('')).toThrow();
   ```

   :::indice
   Pour chaque ligne : identité ou contenu ? objet complet ou partie ? nombre exact ou approché ? fonction ou valeur ?
   :::

   :::solution
   ```js
   import { it, expect } from 'vitest';

   const creerUtilisateur = (email) => ({ id: `u-${Date.now()}`, email, creeLe: new Date(), roles: ['lecteur'] });
   const prixTTC = (ht) => ht * 1.2;
   const valider = (email) => {
     if (email === '') throw new TypeError('Email obligatoire');
   };

   it('vérifie ce qui compte, avec le bon matcher', () => {
     const utilisateur = creerUtilisateur('ada@exemple.fr');

     expect(utilisateur).toMatchObject({ email: 'ada@exemple.fr' });
     expect(utilisateur).toEqual({
       id: expect.stringMatching(/^u-/),
       email: 'ada@exemple.fr',
       creeLe: expect.any(Date),
       roles: ['lecteur'],
     });
     expect(utilisateur.roles).toEqual(['lecteur']);
     expect(prixTTC(10.2)).toBeCloseTo(12.24);
     expect(() => valider('')).toThrow('Email obligatoire');
   });
   ```

   `prixTTC(10.2)` vaut `12.239999999999998` : `toBe(12.24)` échouerait. Et `expect(valider(''))` lèverait l'erreur
   avant même d'atteindre le matcher.
   :::

2. Transforme ces quatre tests presque identiques en un seul `it.each` dont le nom décrit chaque cas.

   ```js
   it('code postal 75001', () => expect(estCodePostal('75001')).toBe(true));
   it('code postal 2A004', () => expect(estCodePostal('2A004')).toBe(true));
   it('code postal 7500', () => expect(estCodePostal('7500')).toBe(false));
   it('code postal ABCDE', () => expect(estCodePostal('ABCDE')).toBe(false));
   ```

   :::indice
   Un tableau d'objets `{ code, valide }`, et `$code` dans le nom du test.
   :::

   :::solution
   ```js
   import { describe, it, expect } from 'vitest';

   const estCodePostal = (code) => /^(\d{5}|2[AB]\d{3})$/.test(code);

   describe('estCodePostal', () => {
     it.each([
       { code: '75001', valide: true },
       { code: '2A004', valide: true },
       { code: '7500', valide: false },
       { code: 'ABCDE', valide: false },
     ])('$code → valide : $valide', ({ code, valide }) => {
       expect(estCodePostal(code)).toBe(valide);
     });
   });
   ```
   :::

3. Teste `creerJournalFichier(chemin)`, qui ajoute des lignes dans un fichier et les relit. Crée un dossier temporaire
   une seule fois pour la suite, un fichier neuf pour chaque test, et supprime tout à la fin.

   :::indice
   `mkdtemp` de `node:fs/promises` dans `beforeAll`, un nom de fichier différent dans `beforeEach`, `rm` avec
   `{ recursive: true, force: true }` dans `afterAll`.
   :::

   :::solution
   ```js
   import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
   import { mkdtemp, rm, appendFile, readFile } from 'node:fs/promises';
   import { tmpdir } from 'node:os';
   import { join } from 'node:path';

   function creerJournalFichier(chemin) {
     return {
       ecrire: (message) => appendFile(chemin, `${message}\n`),
       lire: async () => (await readFile(chemin, 'utf8').catch(() => '')).split('\n').filter(Boolean),
     };
   }

   describe('journal sur fichier', () => {
     let dossier;
     let journal;
     let numero = 0;

     beforeAll(async () => {
       dossier = await mkdtemp(join(tmpdir(), 'journal-'));
     });

     beforeEach(() => {
       numero += 1;
       journal = creerJournalFichier(join(dossier, `journal-${numero}.log`));
     });

     afterAll(async () => {
       await rm(dossier, { recursive: true, force: true });
     });

     it('lit une liste vide quand rien n’a été écrit', async () => {
       await expect(journal.lire()).resolves.toEqual([]);
     });

     it('relit les lignes dans l’ordre d’écriture', async () => {
       await journal.ecrire('démarrage');
       await journal.ecrire('arrêt');

       await expect(journal.lire()).resolves.toEqual(['démarrage', 'arrêt']);
     });
   });
   ```

   Le dossier, coûteux à créer et jamais modifié par les tests, relève de `beforeAll`. Le fichier, que les tests
   remplissent, est neuf dans chaque test : l'ordre d'exécution n'a plus d'importance.
   :::

## Questions d'entretien

- Quelle différence entre `toEqual` et `toStrictEqual` ?

  :::indice
  Pense aux propriétés qui valent `undefined` et aux instances de classe.
  :::

  :::reponse
  Les deux comparent récursivement les contenus. `toEqual` ignore les propriétés qui valent `undefined`, les trous des
  tableaux et le type des objets : une instance de `Commande` égale un littéral de mêmes propriétés. `toStrictEqual`
  vérifie aussi ces points. J'utilise `toStrictEqual` quand la forme exacte est le comportement attendu, par exemple un
  objet sérialisé, et `toEqual` ou `toMatchObject` quand seules les valeurs comptent.
  :::

- Comment éviter qu'un test casse à chaque ajout de champ dans une réponse ?

  :::indice
  Vérifie-t-on vraiment tout l'objet ?
  :::

  :::reponse
  En ne vérifiant que ce que le test concerne : `toMatchObject` pour un sous-ensemble, `expect.objectContaining` à
  l'intérieur d'une structure, et les matchers asymétriques comme `expect.any(String)` pour les valeurs générées. Le
  test exprime alors la règle métier, et reste stable quand l'objet s'enrichit. À l'inverse, un contrat d'API qui
  interdit les champs supplémentaires justifie une comparaison exacte.
  :::

- Quand utiliser `beforeAll` plutôt que `beforeEach` ?

  :::indice
  Pense au coût de la préparation et à ce que les tests modifient.
  :::

  :::reponse
  `beforeAll` convient à une préparation coûteuse dont les tests ne modifient pas le résultat : démarrer un serveur,
  créer un dossier temporaire, charger un gros jeu de données en lecture seule. Tout état que les tests modifient doit
  être recréé dans `beforeEach`, sinon les tests dépendent de leur ordre. Chaque ressource ouverte dans un `before*`
  est libérée dans le `after*` correspondant.
  :::
