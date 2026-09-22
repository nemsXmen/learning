---
id: typescript-38-command
title: Command
slug: command
technology: typescript
level: intermediate
module: 38-design-patterns
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-dependency-injection]
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Encapsuler une action en objet
- Typer execute / undo optionnel
- Bus de commandes

## Introduction

**Command** représente une intention métier exécutable.

## Concept

```ts
interface Command {
  execute(): Promise<void>;
}

class CreateUserCommand implements Command {
  constructor(
    private readonly dto: CreateUserDto,
    private readonly users: UserRepository
  ) {}

  async execute() {
    await this.users.save(/* map dto */);
  }
}
```

## Exemple

CQRS : commands vs queries. Undo/history pour éditeurs.

## Comment ça fonctionne

Les handlers reçoivent des commandes typées. Un bus route `Command` → handler.

## Erreurs fréquentes

- Command qui retourne trop de data (plutôt query)
- God command

## À retenir

- Intention nommée
- execute typé
- Séparer queries

## Exercices

1. Interface Command avec execute(): Promise<void>.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface Command {
     execute(): Promise<void>;
   }
   ```
   :::

## Questions d'entretien

1. Intérêt du pattern Command ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Encapsuler une action (params + exécution), faciliter file d’attente, undo, logging, et séparer l’intention de son handler (CQRS).
   :::
