---
id: typescript-16-composition-vs-inheritance
title: Composition vs inheritance
slug: composition-vs-inheritance
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 9
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-16-classes-vs-interfaces]
skills: [oop]
tags: [typescript, oop]
---

## Objectifs

- Comparer composition et héritage
- Appliquer la règle « favor composition over inheritance »
- Reconnaître les anti-patterns d’héritage

## Introduction

Le choix entre composition et héritage structure fortement le design.

## Concept

**Héritage** : relation is-a, réutilisation via hiérarchie.  
**Composition** : relation has-a, réutilisation via assemblage.

```ts
// Héritage
class Bird extends Animal {
  fly() { /* ... */ }
}

// Composition
class Flyer {
  fly() { /* ... */ }
}
class Bird {
  constructor(private flyer: Flyer) {}
  fly() { this.flyer.fly(); }
}
```

## Exemple – anti-pattern

Hériter d’une classe utilitaire juste pour réutiliser 2 méthodes → préférer la composition ou des fonctions.



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

L’héritage couple fortement parent et enfant. La composition laisse combiner des comportements indépendants et les substituer.

## Erreurs fréquentes

- Hiérarchies profondes pour partager du code
- Forcer une relation is-a artificielle

## À retenir

- Favoriser la composition
- Héritage pour les is-a stables et peu profonds
- Refactorer les hiérarchies rigides vers la composition

## Exercices

1. Propose une version composition pour un `LoggedService` qui ajoute du logging à un service existant.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class LoggedService<T extends { execute(): void }> {
     constructor(private inner: T, private logger: Logger) {}
     execute() {
       this.logger.info("start");
       this.inner.execute();
       this.logger.info("end");
     }
   }
   ```
   :::

## Questions d'entretien

1. Pourquoi dit-on « favor composition over inheritance » ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que la composition est plus flexible, limite le couplage et évite les hiérarchies fragiles. L’héritage reste utile pour les relations is-a claires, mais l’abus mène à des designs rigides.
   :::
