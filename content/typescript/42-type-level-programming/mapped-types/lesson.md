---
id: typescript-42-mapped-types
title: Mapped types
slug: type-level-mapped-types
technology: typescript
level: advanced
module: 42-type-level-programming
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-42-conditional-types]
skills: [type-level]
tags: [typescript, type-level]
---

## Objectifs

- Écrire des mapped types
- Modifiers +/-
- Key remapping as

## Introduction

Les **mapped types** itèrent sur des clés pour construire un objet type.

## Concept

```ts
type Flags<T> = { [K in keyof T]: boolean };

type Optional<T> = { [K in keyof T]?: T[K] };
type RequiredProps<T> = { [K in keyof T]-?: T[K] };

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

## Exemple

Pick/Omit sont des mapped + conditionnels sous le capot conceptuel.

## Comment ça fonctionne

`in` parcourt un union de clés. `as` renomme. `+readonly` / `-?` ajustent les modifiers.

## Erreurs fréquentes

- Oublier string & K pour Capitalize
- Mapped sur never → {}

## À retenir

- [K in ...]
- Modifiers
- as remapping

## Exercices

1. Flags\<{ a: number }\> ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   `{ a: boolean }`
   :::

## Questions d'entretien

1. À quoi sert le key remapping `as` dans un mapped type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À transformer le nom des clés (préfixes, filtres via never, template literals) tout en dérivant les valeurs associées.
   :::
