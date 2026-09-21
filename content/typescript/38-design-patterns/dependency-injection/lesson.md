---
id: typescript-38-dependency-injection
title: Dependency Injection
slug: patterns-dependency-injection
technology: typescript
level: intermediate
module: 38-design-patterns
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-repository]
skills: [patterns]
tags: [typescript, patterns, di]
---

## Objectifs

- Voir DI comme pattern (pas seulement Nest)
- Injection constructeur typée
- Composition root

## Introduction

La **DI** fournit les dépendances de l’extérieur plutôt que de les `new` en interne.

## Concept

```ts
class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly mailer: Mailer
  ) {}

  async place(order: Order) {
    await this.orders.save(order);
    await this.mailer.send(order.userEmail, "Thanks");
  }
}

// composition root
const service = new OrderService(new SqlOrderRepo(), new SmtpMailer());
```

## Exemple

Containers (Nest, Inversify, TSyringe) automatisent le wiring.

## Comment ça fonctionne

Les types des paramètres de constructeur documentent le graphe. Tests : injecter des fakes.

## Erreurs fréquentes

- Service locator caché partout
- new de dépendances concrètes dans le domaine

## À retenir

- Constructor injection
- Composition root
- Interfaces en params

## Exercices

1. Pourquoi injecter Mailer plutôt que new SmtpMailer() dans OrderService ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour tester sans SMTP et changer d’implémentation sans modifier OrderService.
   :::

## Questions d'entretien

1. DI manuelle vs container ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Manuelle : explicite, simple pour petits graphes. Container : pratique pour gros graphes et frameworks (Nest), mais ajoute de la magie et une courbe d’apprentissage.
   :::
