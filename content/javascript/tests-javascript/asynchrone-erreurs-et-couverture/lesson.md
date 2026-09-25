---
id: javascript-asynchrone-erreurs-et-couverture
title: "Vitest : code asynchrone, erreurs et couverture"
slug: asynchrone-erreurs-et-couverture
technology: javascript
level: intermediate
module: tests-javascript
order: 3
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-mocks-espions-et-modules
  - javascript-async-erreurs
skills:
  - async-testing
tags:
  - javascript
  - tests
  - vitest
  - asynchrone
  - couverture
---

## Objectifs

- Écrire un test asynchrone qui attend vraiment ses promesses, avec `await`, `resolves` et `rejects`.
- Vérifier une erreur précisément : classe, message et propriétés, en synchrone comme en asynchrone.
- Contrôler le temps avec les faux minuteurs, sans attendre de vraies secondes.
- Mesurer la couverture, lire son rapport, fixer des seuils, et connaître ses limites.

## Introduction

Un test asynchrone mal écrit est pire qu'un test absent : il affiche « réussi » alors que son assertion ne s'est
jamais exécutée, ou s'est exécutée après la fin du test. Et un code qui attend — une nouvelle tentative après une
seconde, une expiration après trente — rend la suite lente si le test attend réellement.

Ce chapitre donne les réflexes qui rendent ces tests fiables et rapides, puis introduit la couverture de code, une
mesure utile pour trouver ce qui n'est pas testé, à condition de ne pas la prendre pour une mesure de qualité.

## Concept

| Besoin | Outil |
| --- | --- |
| attendre un résultat | `const r = await f()` dans un test `async` |
| vérifier une promesse résolue | `await expect(p).resolves.toEqual(…)` |
| vérifier une promesse rejetée | `await expect(p).rejects.toThrow(ClasseErreur)` |
| vérifier les propriétés d'une erreur | `.rejects.toMatchObject({ status: 404 })` |
| garantir qu'une assertion a eu lieu | `expect.assertions(n)`, `expect.hasAssertions()` |
| figer ou avancer le temps | `vi.useFakeTimers()`, `vi.advanceTimersByTimeAsync(ms)`, `vi.setSystemTime(date)` |
| mesurer la couverture | `vitest run --coverage`, seuils dans `coverage.thresholds` |

## Exemple

```js
// profil.js
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const attendre = (ms) => new Promise((resoudre) => setTimeout(resoudre, ms));

export async function chargerProfil(id, { requete, tentatives = 3, delai = 1000 }) {
  for (let essai = 1; ; essai += 1) {
    try {
      return await requete(`/profils/${id}`);
    } catch (erreur) {
      if (erreur.status === 404 || essai === tentatives) throw erreur;
      await attendre(delai * essai);
    }
  }
}
```

```js
// profil.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { chargerProfil, HttpError } from './profil.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('chargerProfil', () => {
  it('renvoie le profil au premier essai', async () => {
    const requete = vi.fn().mockResolvedValue({ id: 'u-1', nom: 'Ada' });

    await expect(chargerProfil('u-1', { requete })).resolves.toEqual({ id: 'u-1', nom: 'Ada' });
    expect(requete).toHaveBeenCalledWith('/profils/u-1');
  });

  it('ne réessaie pas un profil introuvable', async () => {
    const requete = vi.fn().mockRejectedValue(new HttpError(404, 'Introuvable'));

    await expect(chargerProfil('u-9', { requete })).rejects.toThrow(HttpError);
    await expect(chargerProfil('u-9', { requete })).rejects.toMatchObject({ status: 404 });
    expect(requete).toHaveBeenCalledTimes(2);
  });

  it('réessaie après une seconde, sans attendre une vraie seconde', async () => {
    const requete = vi
      .fn()
      .mockRejectedValueOnce(new HttpError(503, 'Indisponible'))
      .mockResolvedValue({ id: 'u-1' });

    const promesse = chargerProfil('u-1', { requete });

    await vi.advanceTimersByTimeAsync(999);
    expect(requete).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(promesse).resolves.toEqual({ id: 'u-1' });
    expect(requete).toHaveBeenCalledTimes(2);
  });

  it('abandonne après trois tentatives', async () => {
    const requete = vi.fn().mockRejectedValue(new HttpError(503, 'Indisponible'));

    const verification = expect(chargerProfil('u-1', { requete })).rejects.toThrow('Indisponible');
    await vi.runAllTimersAsync();
    await verification;

    expect(requete).toHaveBeenCalledTimes(3);
  });
});
```

## Comment ça fonctionne

Un test se termine quand sa fonction se termine, ou, si elle renvoie une promesse, quand cette promesse est réglée.
Une fonction `async` renvoie toujours une promesse : chaque `await` retient donc le test jusqu'au résultat. Tout ce
qui n'est ni attendu ni renvoyé s'exécute **hors du test**. Ce test passe, alors que son assertion est fausse :

```js
it('passe à tort', () => {
  chargerProfil('u-1', { requete }).then((profil) => expect(profil.nom).toBe('Bob'));
});
```

La fonction se termine immédiatement, et l'échec arrive plus tard : au mieux signalé comme « Unhandled Rejection »
et attribué au test en cours à ce moment-là, au pire jamais vu si le processus s'est arrêté avant. Pour `resolves` et
`rejects`, Vitest va plus loin : une assertion de ce type non attendue fait échouer le test avec « Promise returned
by `expect(actual).rejects.toThrow(expected)` was not awaited ». Jest, lui, laisse passer ce test.

`resolves` et `rejects` déballent la promesse avant d'appliquer le matcher. Sur un rejet, le matcher reçoit la
**raison** : `toThrow(HttpError)` vérifie la classe, `toThrow('Indisponible')` le message, et `toMatchObject` les
propriétés qu'on a ajoutées à l'erreur, comme `status`. Si la promesse se résout au lieu d'être rejetée, `rejects`
échoue : le test ne peut pas passer par accident.

Quand on préfère `try`/`catch`, une assertion placée dans le `catch` ne s'exécute pas si aucune erreur n'est levée,
et le test passe sans rien vérifier. `expect.assertions(1)` en début de test compte les assertions exécutées et fait
échouer le test si le nombre ne correspond pas ; `expect.hasAssertions()` exige au moins une assertion.

Les **faux minuteurs** remplacent `setTimeout`, `setInterval` et `Date` par une horloge contrôlée. `vi.useFakeTimers()`
l'installe, `vi.useRealTimers()` rend les vrais — dans un `afterEach` pour ne pas contaminer les autres tests. Le
temps n'avance plus seul : `vi.advanceTimersByTimeAsync(ms)` l'avance de `ms` millisecondes en exécutant les minuteurs
échus, et `vi.runAllTimersAsync()` exécute tous les minuteurs jusqu'à ce qu'il n'en reste plus. Les versions `Async`
laissent aussi les promesses se régler entre deux minuteurs, indispensable quand le code enchaîne `await` et
`setTimeout`. `vi.setSystemTime(new Date('2026-09-24T08:00:00Z'))` fixe la date renvoyée par `new Date()` et
`Date.now()`.

Le dernier test de l'exemple montre un piège : `vi.runAllTimersAsync()` fait rejeter la promesse **pendant** son
exécution. Si aucun gestionnaire n'y est encore attaché, Node signale une « Unhandled Rejection » et Vitest fait
échouer la suite. D'où l'ordre : créer d'abord l'assertion `expect(…).rejects`, qui s'abonne à la promesse, avancer le
temps, puis attendre l'assertion.

La **couverture** s'active avec `vitest run --coverage`, après avoir installé un fournisseur :
`@vitest/coverage-v8`, par défaut, s'appuie sur la mesure intégrée au moteur V8 ; `@vitest/coverage-istanbul`
instrumente le code. Le rapport compte quatre mesures : les **instructions** exécutées (`Stmts`), les **branches**
parcourues — chaque côté d'un `if`, d'un `??` ou d'un ternaire (`Branch`) —, les **fonctions** appelées (`Funcs`) et
les **lignes** exécutées (`Lines`). Voici le rapport pour un module testé seulement avec un client fidèle au gros
panier et un client ordinaire :

```text
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
remise.js  |    62.5 |       75 |      50 |    62.5 | 3,9,15
```

Les lignes non couvertes désignent un cas oublié : la ligne 3 lève l'erreur de total négatif, la ligne 9 applique la
petite remise fidélité, et la ligne 15 appartient à une fonction jamais appelée. Dans `vitest.config.js`,
`coverage: { thresholds: { lines: 80, branches: 80 } }` fait échouer la commande sous ces seuils, ce qui empêche la
couverture de baisser silencieusement.

Mais une ligne couverte est une ligne **exécutée**, pas une ligne **vérifiée**. Un test qui appelle toutes les
fonctions sans une seule assertion atteint 100 % de couverture. La couverture répond à « qu'est-ce qui n'est
certainement pas testé ? », jamais à « est-ce bien testé ? ». Un seuil trop haut pousse à écrire des tests creux pour
atteindre le chiffre ; on le fixe au niveau actuel, puis on le remonte à mesure qu'on ajoute des tests utiles.

## Erreurs fréquentes

**Appeler une fonction asynchrone sans `await` ni `return`.** L'assertion s'exécute après la fin du test.

**Placer l'assertion dans un `catch` sans `expect.assertions`.** Si rien n'est levé, le test passe sans rien vérifier.

**Utiliser `rejects.toThrow()` sans argument.** Une `TypeError` due à un bug passerait pour l'erreur attendue.

**Oublier `vi.useRealTimers()`.** Les tests suivants héritent d'une horloge figée.

**Avancer le temps avant de s'abonner au rejet.** La promesse rejette sans gestionnaire : « Unhandled Rejection ».

**Viser 100 % de couverture.** Le chiffre monte, la confiance non.

## À retenir

- Tout ce qui est asynchrone dans un test est attendu : `await`, ou `return` de la promesse.
- `await expect(p).resolves` / `.rejects`, avec une classe, un message ou `toMatchObject` pour les propriétés.
- `expect.assertions(n)` protège les tests écrits avec `try`/`catch`.
- Faux minuteurs : `useFakeTimers`, `advanceTimersByTimeAsync`, `runAllTimersAsync`, puis `useRealTimers`.
- La couverture montre ce qui n'est pas exécuté ; elle ne prouve pas que le reste est vérifié.

## Exercices

1. Ces trois tests sont marqués réussis alors que `valider` est bogué. Pour chacun, explique pourquoi, puis corrige-le.

   ```js
   const valider = async (email) => email.includes('@'); // devrait rejeter une chaîne vide

   it('A', () => {
     valider('').then((resultat) => expect(resultat).toBe('rejet'));
   });

   it('B', async () => {
     try {
       await valider('');
     } catch (erreur) {
       expect(erreur.message).toBe('Email obligatoire');
     }
   });

   it('C', async () => {
     await expect(valider('ada@exemple.fr')).resolves.toBeDefined();
   });
   ```

   :::indice
   A : quand le test se termine-t-il ? B : que se passe-t-il si rien n'est levé ? C : `false` est-il « défini » ?
   :::

   :::solution
   A se termine avant que la promesse ne se règle : l'assertion s'exécute après le test. B ne passe jamais dans le
   `catch`, puisque `valider('')` renvoie `false` sans rejeter : aucune assertion ne s'exécute. C vérifie trop peu :
   `false` est défini, donc un validateur qui refuse tout passerait aussi.

   ```js
   import { describe, it, expect } from 'vitest';

   const valider = async (email) => {
     if (email === '') throw new TypeError('Email obligatoire');
     return email.includes('@');
   };

   describe('valider', () => {
     it('rejette une chaîne vide', async () => {
       await expect(valider('')).rejects.toThrow('Email obligatoire');
     });

     it('rejette une chaîne vide, version try/catch', async () => {
       expect.assertions(1);
       try {
         await valider('');
       } catch (erreur) {
         expect(erreur.message).toBe('Email obligatoire');
       }
     });

     it('accepte une adresse valide', async () => {
       await expect(valider('ada@exemple.fr')).resolves.toBe(true);
     });
   });
   ```

   Face à l'ancienne version boguée de `valider`, les deux premiers tests échouent désormais, comme il se doit. Le
   troisième ne concerne pas la chaîne vide, mais il vérifie maintenant une valeur précise : un validateur qui
   refuserait toutes les adresses serait détecté.
   :::

2. `creerSession({ duree })` renvoie `{ estActive() }` : la session expire `duree` millisecondes après sa création.
   Teste qu'elle est active juste avant l'expiration et inactive juste après, sans attendre réellement.

   :::indice
   `vi.useFakeTimers()`, puis `vi.advanceTimersByTime` : `Date.now()` avance avec l'horloge simulée.
   :::

   :::solution
   ```js
   import { it, expect, vi, beforeEach, afterEach } from 'vitest';

   function creerSession({ duree }) {
     const expiration = Date.now() + duree;
     return { estActive: () => Date.now() < expiration };
   }

   beforeEach(() => {
     vi.useFakeTimers();
     vi.setSystemTime(new Date('2026-09-24T08:00:00Z'));
   });

   afterEach(() => {
     vi.useRealTimers();
   });

   it('expire après la durée prévue', () => {
     const session = creerSession({ duree: 30 * 60 * 1000 });

     vi.advanceTimersByTime(30 * 60 * 1000 - 1);
     expect(session.estActive()).toBe(true);

     vi.advanceTimersByTime(1);
     expect(session.estActive()).toBe(false);
   });
   ```

   La version synchrone `advanceTimersByTime` suffit : aucune promesse n'intervient. Trente minutes de temps simulé
   s'écoulent en quelques millisecondes.
   :::

3. `lireConfig(chemin, { lire })` lit un fichier JSON avec la fonction injectée `lire`. Elle lève une
   `ConfigError` dont `cause` est l'erreur d'origine quand le fichier manque ou que le JSON est invalide. Écris les
   tests des deux échecs, en vérifiant la classe, le message et la cause.

   :::indice
   `rejects.toThrow(ConfigError)` pour la classe, puis `rejects.toMatchObject({ cause: expect.any(SyntaxError) })`.
   :::

   :::solution
   ```js
   import { describe, it, expect, vi } from 'vitest';

   class ConfigError extends Error {
     constructor(message, options) {
       super(message, options);
       this.name = 'ConfigError';
     }
   }

   async function lireConfig(chemin, { lire }) {
     let texte;
     try {
       texte = await lire(chemin);
     } catch (erreur) {
       throw new ConfigError(`Configuration absente : ${chemin}`, { cause: erreur });
     }
     try {
       return JSON.parse(texte);
     } catch (erreur) {
       throw new ConfigError(`Configuration invalide : ${chemin}`, { cause: erreur });
     }
   }

   describe('lireConfig', () => {
     it('signale un fichier absent', async () => {
       const absent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
       const lire = vi.fn().mockRejectedValue(absent);

       const promesse = lireConfig('app.json', { lire });

       await expect(promesse).rejects.toThrow(ConfigError);
       await expect(promesse).rejects.toMatchObject({
         message: 'Configuration absente : app.json',
         cause: { code: 'ENOENT' },
       });
     });

     it('signale un JSON invalide', async () => {
       const lire = vi.fn().mockResolvedValue('{ port: 80 }');

       await expect(lireConfig('app.json', { lire })).rejects.toMatchObject({
         name: 'ConfigError',
         message: 'Configuration invalide : app.json',
         cause: expect.any(SyntaxError),
       });
     });
   });
   ```

   Une même promesse rejetée peut être vérifiée plusieurs fois : elle garde sa raison de rejet.
   :::

## Questions d'entretien

- Pourquoi un test asynchrone peut-il passer alors que son assertion échoue ?

  :::indice
  Quand le lanceur de tests considère-t-il qu'un test est terminé ?
  :::

  :::reponse
  Le lanceur considère le test terminé quand sa fonction se termine, ou quand la promesse qu'elle renvoie se règle.
  Si le test lance une opération asynchrone sans l'attendre ni la renvoyer, l'assertion s'exécute après : le test
  est déjà compté comme réussi, et l'échec apparaît au mieux comme une erreur non gérée attribuée à un autre test.
  J'écris donc des tests `async` qui attendent chaque promesse, avec `await expect(p).resolves` ou `.rejects`, et
  `expect.assertions` quand l'assertion vit dans un `catch`.
  :::

- Comment tester du code qui attend plusieurs secondes, comme un mécanisme de nouvelles tentatives ?

  :::indice
  Qui contrôle le temps pendant le test ?
  :::

  :::reponse
  Avec les faux minuteurs : `vi.useFakeTimers()` remplace `setTimeout` et `Date`, puis j'avance le temps avec
  `vi.advanceTimersByTimeAsync`, qui laisse aussi les promesses se régler entre les minuteurs. Je peux vérifier que
  rien ne se passe à 999 ms et que la nouvelle tentative a lieu à 1 000 ms, en quelques millisecondes réelles. Je
  restaure les vrais minuteurs dans un `afterEach`. Une alternative est d'injecter la fonction d'attente, ce qui rend
  le code testable sans outil spécial.
  :::

- Que penses-tu d'un objectif de 100 % de couverture ?

  :::indice
  Que mesure exactement la couverture ?
  :::

  :::reponse
  La couverture mesure ce qui est exécuté, pas ce qui est vérifié : un test sans assertion couvre autant qu'un bon
  test. Un objectif de 100 % pousse à tester le code trivial ou à écrire des tests creux pour les dernières lignes.
  Je l'utilise pour repérer les branches oubliées, surtout les cas d'erreur, et je fixe des seuils qui empêchent la
  couverture de régresser plutôt qu'un chiffre absolu. La qualité se juge sur les comportements vérifiés, et, si
  besoin, avec des outils comme le mutation testing, qui vérifient que les tests détectent des bugs injectés.
  :::
