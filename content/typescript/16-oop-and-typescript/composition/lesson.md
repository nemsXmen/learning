---
id: typescript-16-composition
title: Composition
slug: composition
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 5
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-16-abstraction]
skills: [oop]
tags: [typescript, oop, composition]
---

## Objectifs

- Comprendre la composition d’objets
- Préférer « has-a » à « is-a » quand c’est pertinent
- Voir un exemple concret

## Introduction

La **composition** consiste à construire des objets complexes en assemblant des objets plus simples.

## Concept

```ts
class Engine {
  start() { console.log("engine started"); }
}

class Car {
  private engine = new Engine();
  start() {
    this.engine.start();
  }
}
```

La voiture *a* un moteur (composition), elle n’*est* pas un moteur (héritage).

## Exemple

```ts
class Logger {
  log(msg: string) { console.log(msg); }
}

class UserService {
  constructor(private logger: Logger) {}
  createUser(name: string) {
    this.logger.log(`Creating ${name}`);
  }
}
```

## Comment ça fonctionne

On injecte ou on instancie des dépendances plutôt que d’hériter de leur comportement. Plus flexible pour combiner des capacités.

## Erreurs fréquentes

- Hériter alors qu’une composition suffirait
- Créer des hiérarchies pour partager du code utilitaire

## À retenir

- Composition = assemblage
- Souvent plus flexible que l’héritage
- Va de pair avec l’injection de dépendances

## Exercices

1. Compose un `Notifier` dans un `OrderService` plutôt que d’hériter.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Notifier { notify(msg: string) { console.log(msg); } }
   class OrderService {
     constructor(private notifier: Notifier) {}
     placeOrder() { this.notifier.notify("Order placed"); }
   }
   ```
   :::

## Questions d'entretien

1. Composition vs héritage : que préfères-tu en général et pourquoi ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   La composition est souvent préférable : elle évite les hiérarchies rigides, permet de combiner des comportements librement et se marie bien avec l’injection de dépendances. L’héritage reste utile pour une relation « est-un » claire et stable.
   :::
