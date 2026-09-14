---
id: typescript-type-inference
title: Inférence de types
slug: type-inference
technology: typescript
level: beginner
module: fundamentals
order: 1
estimatedMinutes: 25
difficulty: 2
xp: 80
prerequisites: []
skills:
  - type-inference
  - primitive-types
tags:
  - typescript
  - fundamentals
---

## Objectifs

- Savoir quand TypeScript infère un type et quand il faut l'écrire.
- Comprendre pourquoi `let` et `const` n'infèrent pas la même chose.
- Utiliser `as const` à bon escient.

## Introduction

Le premier réflexe en arrivant sur TypeScript est d'annoter tout. C'est une erreur :
le compilateur infère mieux que nous dans la plupart des cas, et chaque annotation
superflue est une occasion de mentir au compilateur. La compétence à acquérir n'est
pas « écrire des types », c'est **savoir quand se taire**.

## Concept

TypeScript infère à partir de trois sources : la valeur initiale, le contexte
d'utilisation, et le type de retour des expressions. Deux règles suffisent à
expliquer 90 % des comportements :

- Une liaison **`const`** avec un littéral obtient le type **littéral** (`'ada'`).
- Une liaison **`let`**, réaffectable, obtient le type **élargi** (`string`).

C'est ce qu'on appelle l'*élargissement* (*widening*). Il est logique : une variable
réaffectable doit pouvoir accueillir d'autres chaînes.

## Exemple

```ts
const nom = 'ada';     // type 'ada'   (littéral)
let prenom = 'ada';    // type string  (élargi)

const point = { x: 1, y: 2 };
// type { x: number; y: number } — les propriétés sont élargies

const couleurs = ['rouge', 'vert'];
// type string[] — pas ('rouge' | 'vert')[]

const figees = ['rouge', 'vert'] as const;
// type readonly ['rouge', 'vert']
```

L'annotation utile est celle qui **contraint** une valeur, pas celle qui répète ce que
le compilateur sait déjà.

## Comment ça fonctionne

À l'affectation, le compilateur choisit le type le plus large qui reste correct pour
tous les usages possibles de la liaison. Un `const` ne pouvant jamais être réaffecté,
le type littéral reste sûr ; un `let` doit accepter n'importe quelle chaîne.

Le contexte inverse la direction : quand une valeur est passée à une fonction dont le
paramètre est typé, TypeScript utilise ce type attendu pour typer la valeur. C'est le
*typage contextuel*, et il fait tout le travail dans les callbacks :

```ts
const nombres = [1, 2, 3];
nombres.map((n) => n * 2); // `n` est number, sans annotation
```

Les paramètres de fonction, eux, ne sont jamais inférés depuis les appels : ils
doivent être annotés, sinon ils valent `any` implicite — ce que `strict` interdit.

## Erreurs fréquentes

**Annoter ce qui est déjà su.** `const age: number = 30` n'apporte rien et empêche
l'inférence de littéraux quand elle serait utile.

**Attendre un type littéral d'un objet.** Les propriétés d'objet sont toujours
élargies, même dans un `const` :

```ts
const config = { mode: 'sombre' };
// config.mode est string, pas 'sombre'
declare function appliquer(mode: 'sombre' | 'clair'): void;
// appliquer(config.mode); // erreur

const bonne = { mode: 'sombre' } as const; // mode: 'sombre'
appliquer(bonne.mode);                     // ✓
```

**Utiliser `as` pour faire taire une erreur.** `as` n'est pas une conversion, c'est
une affirmation : tu prends la responsabilité, et le compilateur cesse de vérifier.
Si tu écris `as` pour calmer une erreur que tu ne comprends pas, le bug reste, mais
silencieux.

## À retenir

- Laisse inférer par défaut ; annote pour contraindre, jamais pour répéter.
- `const` donne un type littéral, `let` un type élargi.
- Les propriétés d'objet sont élargies : `as const` les fige.
- Les paramètres de fonction s'annotent toujours ; les retours presque jamais.

## Exercices

1. Trouve les trois annotations superflues d'un fichier et supprime-les sans
   provoquer d'erreur.

   :::indice
   Une annotation est superflue quand TypeScript infère exactement le même type : une
   variable initialisée, un retour évident, un paramètre de rappel déjà typé par son
   contexte.
   :::

   :::indice
   Supprime-la et survole le nom dans ton éditeur : si le type affiché ne change pas,
   elle ne servait à rien.
   :::

   :::solution
   ```ts
   // Avant
   let port: number = 3000;
   function double(n: number): number {
     return n * 2;
   }
   const noms = ['Ada', 'Linus'].map((nom: string) => nom.toUpperCase());

   // Après : TypeScript infère exactement les mêmes types
   let port = 3000;
   function double(n: number) {
     return n * 2;
   }
   const noms = ['Ada', 'Linus'].map((nom) => nom.toUpperCase());
   ```

   Le paramètre `n` reste annoté : sans contexte, un paramètre n'est jamais inféré.
   Attention à `const port = 3000`, qui aurait le type littéral `3000` et non `number`.
   :::

2. Fais accepter `{ mode: 'sombre' }` par une fonction attendant `'sombre' | 'clair'`,
   sans utiliser `as` autrement qu'avec `const`.

   :::indice
   Dans un objet, `'sombre'` est élargi en `string` : la propriété pourrait changer.
   :::

   :::solution
   ```ts
   function appliquer(mode: 'sombre' | 'clair') {
     console.log(`Thème ${mode}`);
   }

   const options = { mode: 'sombre' } as const; // mode : 'sombre', en lecture seule
   appliquer(options.mode); // accepté
   ```

   Sans `as const`, `options.mode` est une `string` et l'appel est refusé. Annoter
   l'objet, `const options: { mode: 'sombre' | 'clair' } = …`, fonctionne aussi.
   :::

3. Écris une fonction dont le type de retour est correctement inféré comme union
   littérale.

   :::indice
   Écris plusieurs `return` de chaînes littérales différentes, puis regarde le type de
   retour qu'affiche l'éditeur.
   :::

   :::solution
   ```ts
   function niveau(score: number) {
     if (score >= 80) return 'maîtrisé';
     if (score >= 60) return 'en cours';
     return 'à revoir';
   }
   // retour inféré : 'maîtrisé' | 'en cours' | 'à revoir'
   ```

   Avec un seul `return 'maîtrisé'`, le retour serait élargi en `string` : TypeScript
   conserve une union de littéraux, pas un littéral isolé.
   :::

## Questions d'entretien

- Pourquoi `const x = 'a'` et `let y = 'a'` n'ont-ils pas le même type ?

  :::indice
  Demande-toi si la valeur peut encore changer.
  :::

  :::reponse
  `const x = 'a'` ne peut jamais changer : TypeScript lui donne le type littéral `'a'`.
  `let y = 'a'` peut être réaffectée : son type est élargi en `string`. C'est
  l'élargissement des littéraux (*widening*).
  :::

- Que fait `as const`, et dans quel cas est-ce indispensable ?

  :::indice
  Quel type obtient-on pour un tableau ou un objet littéral déclaré avec `const` seul ?
  :::

  :::reponse
  `as const` fige un littéral : chaînes et nombres gardent leur type littéral, les
  tableaux deviennent des tuples en lecture seule, les propriétés deviennent
  `readonly`. C'est indispensable pour passer une propriété d'objet à une fonction qui
  attend une union littérale, ou pour dériver une union d'un tableau :
  `const MODES = ['sombre', 'clair'] as const; type Mode = (typeof MODES)[number];`.
  :::

- Quelle différence entre `as` et une véritable vérification de type à l'exécution ?

  :::indice
  Que reste-t-il de `as` une fois le code compilé en JavaScript ?
  :::

  :::reponse
  `as` est une assertion : elle demande au compilateur de faire confiance, ne vérifie
  rien et disparaît à la compilation. Si la donnée ne correspond pas, l'erreur surgit
  plus loin, à l'exécution. Une vraie vérification — `typeof`, `in`, une garde de type,
  un schéma Zod — s'exécute et affine le type en conséquence. Pour une donnée venue de
  l'extérieur (API, formulaire, JSON), seule la vérification protège.
  :::
