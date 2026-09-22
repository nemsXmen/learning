---
id: typescript-16-dependency-injection
title: Dependency Injection
slug: dependency-injection
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 7
estimatedMinutes: 15
difficulty: 3
xp: 55
prerequisites: [typescript-16-interfaces-comme-contrats]
skills: [oop]
tags: [typescript, oop, di]
---

## Objectifs

- Comprendre l’injection de dépendances (DI)
- L’appliquer manuellement en TypeScript
- Voir le lien avec les interfaces

## Introduction

L’**injection de dépendances** consiste à fournir ses dépendances à un objet plutôt qu’à les créer lui-même.

## Concept

```ts
// Sans DI (couplage fort)
class UserService {
  private repo = new PostgresUserRepository();
}

// Avec DI (couplage faible)
class UserService {
  constructor(private repo: UserRepository) {}
}

const repo = new PostgresUserRepository();
const service = new UserService(repo);
```

## Exemple

```ts
function createApp() {
  const mailer: EmailSender = new SmtpEmailSender();
  const users: UserRepository = new PostgresUserRepository();
  return new UserService(users, mailer);
}
```

## Comment ça fonctionne

Les dépendances sont passées au constructeur (ou via setters/méthodes). Un conteneur DI (Inversify, NestJS, etc.) peut automatiser cela, mais la DI manuelle suffit souvent.

## Erreurs fréquentes

- Service locator opaque partout
- Injecter des concrets alors qu’un contrat suffirait

## À retenir

- « Ne crée pas tes dépendances, reçois-les »
- Constructeur injection = pattern simple et clair
- Va avec interfaces + composition

## Exercices

1. Injecte un `Logger` dans un `OrderService` via le constructeur.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class OrderService {
     constructor(private logger: Logger) {}
     place() { this.logger.info("order placed"); }
   }
   ```
   :::

## Questions d'entretien

1. Qu’est-ce que l’injection de dépendances et quel bénéfice apporte-t-elle ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   C’est le fait de fournir les dépendances d’un objet de l’extérieur (souvent au constructeur) plutôt que de les instancier en interne. Cela réduit le couplage, facilite les tests et rend les collaborations explicites.
   :::
