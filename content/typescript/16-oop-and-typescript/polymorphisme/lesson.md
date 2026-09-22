---
id: typescript-16-polymorphisme
title: Polymorphisme
slug: polymorphisme
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 3
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-16-heritage]
skills: [oop]
tags: [typescript, oop, polymorphism]
---

## Objectifs

- Comprendre le polymorphisme
- L’obtenir via héritage et interfaces
- Voir le typage structurel en action

## Introduction

Le **polymorphisme** permet de traiter des objets de types différents via une interface commune.

## Concept

```ts
interface Shape {
  area(): number;
}

class Circle implements Shape {
  constructor(public radius: number) {}
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Square implements Shape {
  constructor(public size: number) {}
  area() {
    return this.size ** 2;
  }
}

function totalArea(shapes: Shape[]): number {
  return shapes.reduce((sum, s) => sum + s.area(), 0);
}
```

## Exemple

Grâce au typage structurel, n’importe quel objet avec `area(): number` est un `Shape`.

## Comment ça fonctionne

On programme contre le contrat (`Shape`), pas contre les implémentations concrètes. L’héritage ou `implements` formalisent le contrat.

## Erreurs fréquentes

- Switch sur le type concret au lieu d’utiliser le polymorphisme
- Interfaces trop larges

## À retenir

- Même contrat, comportements différents
- Interfaces + classes (ou objets littéraux)
- Programmation au contrat

## Exercices

1. Crée deux classes `EmailNotifier` et `SmsNotifier` avec `notify(msg: string)` et une fonction qui accepte le contrat.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   interface Notifier { notify(msg: string): void; }
   class EmailNotifier implements Notifier {
     notify(msg: string) { console.log("email", msg); }
   }
   class SmsNotifier implements Notifier {
     notify(msg: string) { console.log("sms", msg); }
   }
   function send(n: Notifier, msg: string) { n.notify(msg); }
   ```
   :::

## Questions d'entretien

1. Comment le polymorphisme se manifeste-t-il en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Via des interfaces ou classes de base communes : on manipule des objets différents à travers le même contrat (`Shape`, `Notifier`…). Le typage structurel permet aussi le polymorphisme sans `implements` explicite.
   :::
