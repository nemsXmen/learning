---
id: typescript-37-type-testing
title: Type testing
slug: type-testing
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Comprendre les tests au niveau des types
- Différencier tests runtime et type-level
- Voir les outils (tsc, tsd, expect-type)

## Introduction

En TypeScript, on teste le **comportement runtime** et aussi la **qualité des types**.

## Concept

Deux axes :
1. **Unit / integration / e2e** — exécutent du JS
2. **Type tests** — vérifient que les types se comportent comme prévu (assignabilité, inférence)

```ts
// idée type test
type Assert<T extends true> = T;
type _test = Assert<Equal<ReturnType<typeof fn>, string>>;
```

## Exemple

Outils : `tsd`, `expect-type`, `vitest` + type checks, `tsc --noEmit` en CI.

## Comment ça fonctionne

Les type tests échouent à la compilation si un type dérive. Ils ne remplacent pas les tests runtime.

## Erreurs fréquentes

- Ne tester que le runtime sur du code ultra-générique
- Type tests fragiles trop couplés aux implémentations

## À retenir

- Runtime + types
- tsc / tsd / expect-type
- Complémentaires

## Exercices

1. Cite un outil de type testing.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   tsd, expect-type, ou assertions de types custom compilées par tsc.
   :::

## Questions d'entretien

1. Pourquoi tester les types en plus du runtime ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que beaucoup de valeur TypeScript est dans l’API de types (inférence, génériques). Un refactor peut casser les types sans casser les tests runtime si ceux-ci ne couvrent pas les cas de typage.
   :::
