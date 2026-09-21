---
id: typescript-39-application-layer
title: Application layer
slug: application-layer
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 3
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-39-domain-layer]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Comprendre la couche application
- Use cases / services applicatifs
- Orchestration typée

## Introduction

La couche **application** orchestre le domaine pour un cas d’usage.

## Concept

```ts
// application/create-user.ts
export class CreateUser {
  constructor(private readonly users: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictError();
    const user = User.create(input);
    await this.users.save(user);
    return user;
  }
}
```

## Exemple

Pas de détails HTTP ici : input/output typés, ports injectés.

## Comment ça fonctionne

Le use case dépend d’interfaces (ports). L’infra fournit les adapters.

## Erreurs fréquentes

- Use case qui parse req Express
- Logique métier poussée uniquement dans les controllers

## À retenir

- Orchestration
- Ports injectés
- Inputs/outputs typés

## Exercices

1. CreateUser dépend de UserRepository : pourquoi une interface ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour inverser la dépendance et tester avec un fake.
   :::

## Questions d'entretien

1. Rôle de la couche application ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Orchestrer les use cases : valider l’intention, appeler le domaine et les ports (repo, mailer…), sans connaître HTTP ni l’ORM concret.
   :::
