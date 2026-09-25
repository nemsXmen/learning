---
id: javascript-mocks-espions-et-modules
title: "Vitest : mocks, espions et modules"
slug: mocks-espions-et-modules
technology: javascript
level: intermediate
module: tests-javascript
order: 2
estimatedMinutes: 40
difficulty: 3
xp: 90
prerequisites:
  - javascript-vitest-assertions
  - javascript-doublures-de-test
skills:
  - vitest-mocking
tags:
  - javascript
  - tests
  - vitest
  - mocks
---

## Objectifs

- Créer une fonction simulée avec `vi.fn` et lui donner un comportement : valeur, promesse, implémentation.
- Observer une méthode existante avec `vi.spyOn`, puis la restaurer.
- Distinguer `mockClear`, `mockReset` et `mockRestore`, et les options qui les appliquent automatiquement.
- Remplacer un module entier ou une partie d'un module avec `vi.mock`, en comprenant le hissage.

## Introduction

Le chapitre sur les doublures de test les a écrites à la main : un stub renvoie une valeur, un espion enregistre ses
appels. Vitest fournit ces outils tout faits, avec des assertions dédiées et des messages d'échec lisibles. Il sait
aussi remplacer un **module importé**, ce qu'aucune doublure manuelle ne permet quand le code testé fait
`import { envoyerEmail } from './email.js'` au lieu de recevoir sa dépendance en paramètre.

Ces outils sont puissants, donc faciles à surutiliser. La règle du chapitre précédent tient toujours : on simule ce
qui est lent, non déterministe ou extérieur — réseau, horloge, hasard —, pas le code qu'on cherche à tester.

## Concept

| Outil | Rôle | Exemple |
| --- | --- | --- |
| `vi.fn(impl?)` | fonction simulée qui enregistre ses appels | dépendance injectée |
| `.mockReturnValue(v)` / `.mockReturnValueOnce(v)` | valeur renvoyée, toujours ou au prochain appel | stub |
| `.mockResolvedValue(v)` / `.mockRejectedValue(e)` | promesse résolue ou rejetée | API asynchrone |
| `.mockImplementation(fn)` | comportement complet | réponse selon l'argument |
| `vi.spyOn(objet, 'methode')` | espionne une méthode existante, la remplace si on le demande | `console`, `Math.random` |
| `toHaveBeenCalled`, `toHaveBeenCalledTimes(n)` | l'appel a eu lieu, n fois | effet attendu |
| `toHaveBeenCalledWith(...)`, `toHaveBeenNthCalledWith(n, ...)` | arguments d'un appel | message envoyé |
| `f.mock.calls`, `f.mock.results` | historique brut des appels et des résultats | cas particuliers |
| `vi.mock('./module.js', fabrique)` | remplace un module pour tout le fichier de test | client HTTP, email |

## Exemple

Le module testé importe deux dépendances : un envoi d'email, qu'on ne veut jamais exécuter en test, et une horloge.

```js
// email.js
export async function envoyerEmail(destinataire, sujet) {
  throw new Error(`Réseau interdit en test (${destinataire}, ${sujet})`);
}

// horloge.js
export const horodatage = () => new Date().toISOString();
export const fuseau = () => 'Europe/Paris';

// notifications.js
import { envoyerEmail } from './email.js';
import { horodatage } from './horloge.js';

export async function notifierRetard(commande) {
  if (commande.retardJours < 2) return { envoye: false };
  const sujet = `Commande ${commande.id} : ${commande.retardJours} jours de retard`;
  const reponse = await envoyerEmail(commande.email, sujet);
  return { envoye: reponse.ok, a: horodatage() };
}
```

```js
// notifications.test.js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { notifierRetard } from './notifications.js';
import { envoyerEmail } from './email.js';
import { fuseau } from './horloge.js';

vi.mock('./email.js', () => ({ envoyerEmail: vi.fn() }));
vi.mock('./horloge.js', async (importOriginal) => ({
  ...(await importOriginal()),
  horodatage: vi.fn(() => '2026-09-24T08:00:00.000Z'),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('notifierRetard', () => {
  it('envoie un email à partir de deux jours de retard', async () => {
    envoyerEmail.mockResolvedValue({ ok: true });

    const resultat = await notifierRetard({ id: 'c-1', email: 'ada@exemple.fr', retardJours: 3 });

    expect(resultat).toEqual({ envoye: true, a: '2026-09-24T08:00:00.000Z' });
    expect(envoyerEmail).toHaveBeenCalledTimes(1);
    expect(envoyerEmail).toHaveBeenCalledWith('ada@exemple.fr', expect.stringContaining('3 jours'));
  });

  it('ne contacte personne avant deux jours', async () => {
    const resultat = await notifierRetard({ id: 'c-2', email: 'bob@exemple.fr', retardJours: 1 });

    expect(resultat).toEqual({ envoye: false });
    expect(envoyerEmail).not.toHaveBeenCalled();
  });

  it('garde les exports non simulés de horloge.js', () => {
    expect(fuseau()).toBe('Europe/Paris');
  });
});

describe('vi.fn et vi.spyOn', () => {
  it('enchaîne des réponses et garde l’historique', () => {
    const tirer = vi.fn().mockReturnValueOnce(1).mockReturnValueOnce(2).mockReturnValue(0);

    expect([tirer('a'), tirer('b'), tirer('c')]).toEqual([1, 2, 0]);
    expect(tirer.mock.calls).toEqual([['a'], ['b'], ['c']]);
    expect(tirer).toHaveBeenNthCalledWith(2, 'b');
  });

  it('remplace temporairement une méthode existante', () => {
    const espion = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(Math.random()).toBe(0.5);

    espion.mockRestore();
    expect(vi.isMockFunction(Math.random)).toBe(false);
  });
});
```

## Comment ça fonctionne

`vi.fn()` crée une fonction qui, par défaut, renvoie `undefined` et enregistre chaque appel dans `f.mock.calls` (les
arguments) et `f.mock.results` (valeur renvoyée ou erreur levée). Les méthodes `mock…` configurent sa réponse :
`mockReturnValue` pour toujours, `mockReturnValueOnce` pour le prochain appel seulement — les réponses « once »
s'épuisent dans l'ordre, puis la réponse permanente reprend. `mockResolvedValue(v)` est un raccourci pour une
implémentation qui renvoie `Promise.resolve(v)`, et `mockRejectedValue(e)` pour `Promise.reject(e)`. Chaque méthode
renvoie la fonction simulée elle-même, d'où les chaînes `vi.fn().mockReturnValueOnce(1).mockReturnValue(0)`.

Les assertions dédiées lisent cet historique : `toHaveBeenCalledWith` réussit si **au moins un** appel correspond,
`toHaveBeenLastCalledWith` et `toHaveBeenNthCalledWith` ciblent un appel précis, et les matchers asymétriques
(`expect.stringContaining`, `expect.objectContaining`) fonctionnent aussi pour les arguments.

`vi.spyOn(objet, 'methode')` remplace la propriété de l'objet par une fonction simulée qui, sans configuration,
**appelle l'originale** : on observe sans changer le comportement. `mockReturnValue` ou `mockImplementation` la
remplacent pour de bon. On l'utilise pour les objets partagés qu'on ne peut pas injecter : `Math.random`, `console`,
`Date.now`, une méthode d'un objet importé.

Trois niveaux de remise à zéro, à ne pas confondre :

| Méthode | Historique | Implémentation | Propriété espionnée |
| --- | --- | --- | --- |
| `mockClear()` | effacé | conservée | toujours espionnée |
| `mockReset()` | effacé | revient à celle de départ (`vi.fn(impl)` ou l'originale) | toujours espionnée |
| `mockRestore()` | effacé | revient à celle de départ | **originale remise en place** |

Les versions globales `vi.clearAllMocks()`, `vi.resetAllMocks()` et `vi.restoreAllMocks()` s'appliquent à tous les
mocks ; `vi.restoreAllMocks()` ne concerne que les espions créés par `vi.spyOn`. Plutôt que de les appeler à la main,
on peut les activer dans la configuration : `clearMocks: true`, `mockReset: true` ou `restoreMocks: true` dans
`vitest.config.js` les exécutent avant chaque test. Sans ce nettoyage, un historique ou une réponse configurée dans un
test déborde sur le suivant, et les tests dépendent de leur ordre.

`vi.mock(chemin, fabrique)` remplace le module pour **tous** ses importateurs dans ce fichier de test — ici,
`notifications.js` reçoit le faux `envoyerEmail`. La fabrique renvoie les exports du faux module. Avec
`importOriginal`, on récupère le vrai module pour n'en remplacer qu'une partie : c'est un **mock partiel**. Sans
fabrique, `vi.mock('./email.js')` remplace automatiquement chaque fonction exportée par un `vi.fn()` qui renvoie
`undefined`.

Détail essentiel : Vitest **hisse** chaque appel `vi.mock` tout en haut du fichier, avant les `import`, sinon le
module réel serait déjà chargé. La fabrique ne peut donc pas utiliser une variable déclarée plus bas dans le fichier :
`const envoi = vi.fn(); vi.mock('./email.js', () => ({ envoyerEmail: envoi }))` échoue avec « Cannot access 'envoi'
before initialization ». Deux solutions : importer le module simulé, comme dans l'exemple, pour récupérer le
`vi.fn()` créé par la fabrique, ou déclarer la variable avec `vi.hoisted(() => ({ envoi: vi.fn() }))`, lui aussi
hissé.

Tester un module, enfin, c'est le tester par ses **exports**, comme ses vrais utilisateurs. Un état gardé au niveau
du module — un cache, un compteur — survit d'un test à l'autre, car un module n'est évalué qu'une fois.
`vi.resetModules()` vide le registre des modules : le prochain `await import('./compteur.js')` réévalue le fichier et
repart d'un état neuf.

## Erreurs fréquentes

**Référencer une variable du fichier dans la fabrique de `vi.mock`.** L'appel est hissé : importe le module simulé ou
utilise `vi.hoisted`.

**Oublier de nettoyer les mocks entre les tests.** Active `clearMocks` ou `restoreMocks` dans la configuration.

**Laisser un `vi.spyOn(console, 'error')` actif.** Les erreurs des autres tests disparaissent silencieusement :
restaure-le.

**Simuler le module qu'on teste.** Le test ne vérifie plus que le mock.

**Vérifier chaque appel interne.** Ne vérifie que les appels qui font partie du comportement attendu, comme l'email
envoyé.

## À retenir

- `vi.fn` crée une fonction simulée ; `mockReturnValue`, `mockResolvedValue`, `mockImplementation` règlent sa réponse.
- `vi.spyOn` observe une méthode existante et appelle l'originale tant qu'on ne la remplace pas.
- `mockClear` efface l'historique, `mockReset` l'implémentation, `mockRestore` remet l'original.
- `vi.mock` remplace un module pour tout le fichier ; `importOriginal` permet un mock partiel.
- `vi.mock` est hissé : pas de variable locale dans sa fabrique, sauf via `vi.hoisted`.

## Exercices

1. `tirerGagnant(participants)` renvoie un participant au hasard avec
   `participants[Math.floor(Math.random() * participants.length)]`. Teste qu'elle renvoie le premier et le dernier
   participant selon le hasard, sans modifier la fonction, et sans laisser `Math.random` simulé après le test.

   :::indice
   `vi.spyOn(Math, 'random')` avec `mockReturnValueOnce`, puis `mockRestore` dans un `afterEach`.
   :::

   :::solution
   ```js
   import { it, expect, vi, afterEach } from 'vitest';

   const tirerGagnant = (participants) => participants[Math.floor(Math.random() * participants.length)];

   afterEach(() => {
     vi.restoreAllMocks();
   });

   it('suit la valeur tirée par Math.random', () => {
     vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99);
     const participants = ['Ada', 'Bob', 'Chloé'];

     expect(tirerGagnant(participants)).toBe('Ada');
     expect(tirerGagnant(participants)).toBe('Chloé');
   });

   it('laisse Math.random intact après le test', () => {
     expect(vi.isMockFunction(Math.random)).toBe(false);
   });
   ```

   `0.99 * 3` vaut `2.97`, arrondi à `2` : le dernier indice. `vi.restoreAllMocks()` remet la vraie méthode, même si
   une assertion échoue, car `afterEach` s'exécute dans tous les cas.
   :::

2. `creerCache(charger)` renvoie `obtenir(cle)`, qui appelle `charger(cle)` au premier accès puis réutilise la
   promesse. Écris deux tests : la valeur chargée est renvoyée, et deux accès à la même clé n'appellent `charger`
   qu'une fois.

   :::indice
   `vi.fn(async (cle) => …)` sert de dépendance injectée ; `toHaveBeenCalledTimes(1)` vérifie l'unique appel.
   :::

   :::solution
   ```js
   import { describe, it, expect, vi } from 'vitest';

   function creerCache(charger) {
     const promesses = new Map();
     return {
       obtenir(cle) {
         if (!promesses.has(cle)) promesses.set(cle, charger(cle));
         return promesses.get(cle);
       },
     };
   }

   describe('creerCache', () => {
     it('renvoie la valeur chargée', async () => {
       const charger = vi.fn().mockResolvedValue({ nom: 'Ada' });
       const cache = creerCache(charger);

       await expect(cache.obtenir('u-1')).resolves.toEqual({ nom: 'Ada' });
       expect(charger).toHaveBeenCalledWith('u-1');
     });

     it('ne charge qu’une fois la même clé', async () => {
       const charger = vi.fn(async (cle) => ({ cle }));
       const cache = creerCache(charger);

       await Promise.all([cache.obtenir('u-1'), cache.obtenir('u-1')]);
       await cache.obtenir('u-2');

       expect(charger).toHaveBeenCalledTimes(2);
       expect(charger.mock.calls).toEqual([['u-1'], ['u-2']]);
     });
   });
   ```

   Chaque test crée son propre `vi.fn` : aucun historique ne passe d'un test à l'autre, sans nettoyage global.
   :::

3. Ce fichier de test échoue avant même d'exécuter un test. Explique pourquoi, puis corrige-le de deux façons.

   ```js
   import { it, expect, vi } from 'vitest';
   import { notifierRetard } from './notifications.js';

   const envoi = vi.fn().mockResolvedValue({ ok: true });
   vi.mock('./email.js', () => ({ envoyerEmail: envoi }));

   it('envoie un email', async () => {
     await notifierRetard({ id: 'c-1', email: 'ada@exemple.fr', retardJours: 5 });
     expect(envoi).toHaveBeenCalled();
   });
   ```

   :::indice
   Où Vitest place-t-il réellement l'appel à `vi.mock` ? Et `envoi`, est-il déjà initialisé à ce moment ?
   :::

   :::solution
   Vitest hisse `vi.mock` au-dessus des imports. Quand `notifications.js` importe `email.js`, la fabrique s'exécute
   alors que `const envoi` n'est pas encore initialisée : `ReferenceError: Cannot access 'envoi' before
   initialization`.

   Première correction, avec `vi.hoisted`, lui aussi hissé et exécuté avant la fabrique :

   ```js
   import { it, expect, vi } from 'vitest';
   import { notifierRetard } from './notifications.js';

   const { envoi } = vi.hoisted(() => ({ envoi: vi.fn() }));
   vi.mock('./email.js', () => ({ envoyerEmail: envoi }));

   it('envoie un email', async () => {
     envoi.mockResolvedValue({ ok: true });
     await notifierRetard({ id: 'c-1', email: 'ada@exemple.fr', retardJours: 5 });
     expect(envoi).toHaveBeenCalled();
   });
   ```

   Seconde correction : créer le `vi.fn()` dans la fabrique et importer le module simulé pour le récupérer.

   ```js
   import { it, expect, vi } from 'vitest';
   import { notifierRetard } from './notifications.js';
   import { envoyerEmail } from './email.js';

   vi.mock('./email.js', () => ({ envoyerEmail: vi.fn() }));

   it('envoie un email', async () => {
     envoyerEmail.mockResolvedValue({ ok: true });
     await notifierRetard({ id: 'c-1', email: 'ada@exemple.fr', retardJours: 5 });
     expect(envoyerEmail).toHaveBeenCalled();
   });
   ```
   :::

## Questions d'entretien

- Quelle différence entre `mockClear`, `mockReset` et `mockRestore` ?

  :::indice
  Qu'efface chacune : l'historique, le comportement configuré, le remplacement de la propriété ?
  :::

  :::reponse
  `mockClear` efface seulement l'historique des appels ; la réponse configurée reste. `mockReset` efface aussi le
  comportement configuré, et la fonction revient à son implémentation de départ. `mockRestore` fait de même et, pour
  un espion créé avec `vi.spyOn`, remet la vraie méthode sur l'objet. Dans un projet, j'active `restoreMocks` ou
  `clearMocks` dans la configuration pour que chaque test parte d'un état propre sans y penser.
  :::

- Pourquoi `vi.mock` est-il hissé en haut du fichier, et quelle contrainte en découle ?

  :::indice
  Les `import` statiques sont évalués avant le reste du code du module.
  :::

  :::reponse
  Les imports statiques sont résolus avant l'exécution du corps du fichier. Pour que le code testé reçoive le faux
  module, Vitest doit enregistrer le mock avant ces imports, d'où le hissage. Conséquence : la fabrique ne peut pas
  lire une variable déclarée plus bas, encore dans sa zone morte temporelle. On crée les fonctions simulées dans la
  fabrique puis on importe le module simulé, ou on passe par `vi.hoisted`.
  :::

- Injection de dépendance ou `vi.mock` : que préfères-tu ?

  :::indice
  Compare ce que chaque approche impose au code de production et au test.
  :::

  :::reponse
  Quand je conçois le code, je préfère injecter les dépendances : le test passe simplement un `vi.fn()`, sans
  mécanisme magique, et le contrat de la dépendance apparaît dans la signature. `vi.mock` reste utile pour du code
  existant qui importe directement un module, ou pour une bibliothèque tierce. Dans les deux cas, je ne simule que
  les frontières — réseau, horloge, hasard — et je garde le code métier réel.
  :::
