---
id: typescript-38-specification
title: Specification
slug: specification
technology: typescript
level: intermediate
module: 38-design-patterns
order: 10
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-state]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Encapsuler des règles métier booléennes
- Composer and/or/not
- Typer isSatisfiedBy

## Introduction

Une **Specification** teste si un candidat satisfait une règle.

## Concept

```ts
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
}

class ActiveUserSpec implements Specification<User> {
  isSatisfiedBy(user: User) {
    return user.status === "active";
  }
}

function and<T>(...specs: Specification<T>[]): Specification<T> {
  return {
    isSatisfiedBy: (c) => specs.every((s) => s.isSatisfiedBy(c))
  };
}
```

## Exemple

Filtres de recherche, règles de validation métier composables.

## Comment ça fonctionne

Composition de predicates typés. Peut se traduire en SQL (avancé) ou rester in-memory.

## Erreurs fréquentes

- Specs qui mutent le candidat
- Trop de logique IO dans isSatisfiedBy

## À retenir

- isSatisfiedBy
- Composition
- Pureté

## Exercices

1. Spec IsAdult pour { age: number }.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const IsAdult: Specification<{ age: number }> = {
     isSatisfiedBy: (p) => p.age >= 18
   };
   ```
   :::

## Questions d'entretien

1. À quoi sert le pattern Specification ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À encapsuler et composer des règles métier booléennes de façon réutilisable et testable, sans disperser des ifs dans tout le code.
   :::
