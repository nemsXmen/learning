---
id: typescript-41-builders-types
title: Builders typés
slug: builders-types
technology: typescript
level: advanced
module: 41-advanced-generics
order: 11
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-factories-avancees]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Builder avec type state
- Accumuler des champs typés
- Final build sûr

## Introduction

Un **builder typé** fait évoluer le type au fil des appels.

## Concept

```ts
type Builder<T extends object> = {
  set<K extends string, V>(
    key: K,
    value: V
  ): Builder<T & { [P in K]: V }>;
  build(): T;
};

function builder<T extends object = {}>(current: T = {} as T): Builder<T> {
  return {
    set(key, value) {
      return builder({ ...current, [key]: value });
    },
    build() {
      return current;
    }
  };
}
```

## Exemple

Requiert certains champs avant build via types conditionnels (avancé).

## Comment ça fonctionne

Chaque `set` retourne un nouveau type enrichi. Le compilateur suit l’accumulation.

## Erreurs fréquentes

- Perdre le type en retournant any
- build() trop tôt non empêché

## À retenir

- Type state
- Intersection accumulée
- API fluent

## Exercices

1. Après set("id", "1"), le builder contient au moins { id: string }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Oui via T & { id: string }.
   :::

## Questions d'entretien

1. Qu’est-ce qu’un type-state builder ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un builder dont le type TypeScript change à chaque étape pour refléter les champs déjà fournis, rendant certaines transitions illégales à la compile.
   :::
