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
2. Fais accepter `{ mode: 'sombre' }` par une fonction attendant `'sombre' | 'clair'`,
   sans utiliser `as` autrement qu'avec `const`.
3. Écris une fonction dont le type de retour est correctement inféré comme union
   littérale.

## Questions d'entretien

- Pourquoi `const x = 'a'` et `let y = 'a'` n'ont-ils pas le même type ?
- Que fait `as const`, et dans quel cas est-ce indispensable ?
- Quelle différence entre `as` et une véritable vérification de type à l'exécution ?
