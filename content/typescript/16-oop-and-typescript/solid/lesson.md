---
id: typescript-16-solid
title: SOLID
slug: solid
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 10
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-16-composition-vs-inheritance]
skills: [oop]
tags: [typescript, oop, solid]
---

## Objectifs

- Connaître les 5 principes SOLID
- Les illustrer en TypeScript
- Les appliquer avec mesure

## Introduction

**SOLID** est un ensemble de principes de conception orientée objet.

## Concept

1. **S**ingle Responsibility — une classe / module = une raison de changer  
2. **O**pen/Closed — ouvert à l’extension, fermé à la modification  
3. **L**iskov Substitution — les sous-types doivent être substituables  
4. **I**nterface Segregation — interfaces petites et spécifiques  
5. **D**ependency Inversion — dépendre d’abstractions, pas de concrets  

```ts
// D — Dependency Inversion
interface Mailer { send(to: string, body: string): Promise<void>; }

class WelcomeService {
  constructor(private mailer: Mailer) {}
  async welcome(email: string) {
    await this.mailer.send(email, "Welcome!");
  }
}
```

## Exemple – Interface Segregation

```ts
// Trop large
interface Worker {
  work(): void;
  eat(): void;
}

// Mieux
interface Workable { work(): void; }
interface Eatable { eat(): void; }
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Ces principes guident le découpage, le polymorphisme et l’injection de dépendances. En TypeScript, interfaces + composition les supportent naturellement.

## Erreurs fréquentes

- Appliquer SOLID de façon dogmatique
- Multiplier les interfaces sans besoin

## À retenir

- SOLID = boussole, pas religion
- S et D sont souvent les plus rentables au quotidien
- TypeScript aide via interfaces et typage structurel

## Exercices

1. Sépare une classe qui à la fois envoie des emails et calcule des stats en deux responsabilités.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class EmailService { send() { /* ... */ } }
   class StatsService { compute() { /* ... */ } }
   ```
   :::

## Questions d'entretien

1. Explique brièvement le principe de Dependency Inversion.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Les modules de haut niveau ne doivent pas dépendre de modules de bas niveau : les deux doivent dépendre d’abstractions. En pratique, on injecte des interfaces plutôt que des classes concrètes.
   :::
