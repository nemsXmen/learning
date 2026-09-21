---
id: typescript-37-tests-de-generic-typescript-basics
title: Tests de generic typescript-basics
slug: tests-de-generic-typescript-basics
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-37-tests-derreurs]
skills: [testing]
tags: [typescript, testing, generics]
---

## Objectifs

- Tester le comportement runtime des génériques
- Couvrir plusieurs instantiations
- Compléter par des type tests

## Introduction

Les fonctions **génériques** se testent avec plusieurs types concrets.

## Concept

```ts
function identity<T>(value: T): T {
  return value;
}

it("identity preserves values", () => {
  expect(identity(1)).toBe(1);
  expect(identity("a")).toBe("a");
});
```

## Exemple

Pour un `mapAsync<T, U>`, tester avec T/U différents. Les type tests vérifient l’inférence.

## Comment ça fonctionne

Runtime : T est effacé — on teste le comportement. Types : assert d’inférence séparément.

## Erreurs fréquentes

- Un seul cas de type
- Oublier les edge cases (null, unions)

## À retenir

- Plusieurs instantiations
- Runtime + type tests
- Edge cases

## Exercices

1. Pourquoi un seul test identity(1) ne suffit-il pas toujours ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Il ne couvre qu’un type concret ; d’autres instantiations et l’inférence méritent d’être vérifiées.
   :::

## Questions d'entretien

1. Comment abordes-tu les tests d’une API générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Tests runtime sur plusieurs types concrets (comportement), plus des type tests pour l’inférence et les contraintes, afin de verrouiller l’API de types.
   :::
