---
id: typescript-37-typed-spies
title: Typed spies
slug: typed-spies
technology: typescript
level: intermediate
module: 37-typescript-testing
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-37-typed-mocks]
skills: [testing]
tags: [typescript, testing]
---

## Objectifs

- Utiliser des spies typés
- Vérifier les appels
- Conserver les signatures

## Introduction

Un **spy** observe les appels à une fonction existante.

## Concept

```ts
const spy = vi.spyOn(service, "save");
await controller.create(dto);
expect(spy).toHaveBeenCalledWith(expect.objectContaining({ email: dto.email }));
spy.mockRestore();
```

## Exemple

Les types de `toHaveBeenCalledWith` s’appuient sur la signature spied.

## Comment ça fonctionne

Le spy wrap la méthode. TypeScript connaît les args attendus via l’objet spied.

## Erreurs fréquentes

- Oublier mockRestore
- Assertions trop larges (any)

## À retenir

- spyOn typé
- toHaveBeenCalledWith
- Restore

## Exercices

1. Vérifie qu’un spy a été appelé une fois.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   expect(spy).toHaveBeenCalledTimes(1);
   ```
   :::

## Questions d'entretien

1. Mock vs spy ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Mock : remplace souvent entièrement la dépendance. Spy : observe (et peut stubber) une méthode existante tout en gardant ou contrôlant le comportement.
   :::
