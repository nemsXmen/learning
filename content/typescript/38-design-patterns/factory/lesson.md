---
id: typescript-38-factory
title: Factory
slug: factory
technology: typescript
level: intermediate
module: 38-design-patterns
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [patterns]
tags: [typescript, patterns]
---

## Objectifs

- Implémenter une Factory en TypeScript
- Typer le produit créé
- Factory method vs abstract factory (vue simple)

## Introduction

La **Factory** encapsule la création d’objets pour le découpler des clients.

## Concept

```ts
type Notifier = { send(message: string): Promise<void> };

function createNotifier(channel: "email" | "sms"): Notifier {
  switch (channel) {
    case "email":
      return { send: async (m) => { /* email */ } };
    case "sms":
      return { send: async (m) => { /* sms */ } };
  }
}
```

## Exemple

Factories génériques : `createRepository<T>()`, factories injectées Nest.

## Comment ça fonctionne

Le client dépend de l’interface `Notifier`, pas des classes concrètes. TypeScript type le retour.

## Erreurs fréquentes

- Switch non exhaustif (oublier default never)
- Factory god qui crée tout

## À retenir

- Interface produit
- Création centralisée
- Exhaustivité des cas

## Exercices

1. Factory createLogger(level: "info" | "debug"): Logger.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   function createLogger(level: "info" | "debug"): Logger {
     return { log: (m) => console.log(level, m) };
   }
   ```
   :::

## Questions d'entretien

1. Quel intérêt d’une Factory typée en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Centraliser la création, retourner une interface stable, et laisser le compilateur vérifier l’exhaustivité des variantes (unions discriminées).
   :::
