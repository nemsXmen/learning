---
id: typescript-15-methodes-abstraites
title: Méthodes abstraites
slug: methodes-abstraites
technology: typescript
level: intermediate
module: 15-classes
order: 14
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-15-classes-abstraites]
skills: [classes]
tags: [typescript, classes, abstract]
---

## Objectifs

- Déclarer des méthodes abstraites
- Forcer l’implémentation dans les sous-classes
- Les combiner avec du code concret

## Introduction

Une **méthode abstraite** n’a pas d’implémentation dans la classe de base : les sous-classes concrètes doivent la fournir.

## Concept

```ts
abstract class DataSource {
  abstract fetch(): Promise<string>;

  async loadAndLog(): Promise<void> {
    const data = await this.fetch();
    console.log(data);
  }
}

class ApiSource extends DataSource {
  async fetch(): Promise<string> {
    const res = await fetch("/api/data");
    return res.text();
  }
}
```

## Exemple

```ts
abstract class Formatter {
  abstract format(value: number): string;
  print(value: number) {
    console.log(this.format(value));
  }
}
```

## Comment ça fonctionne

`abstract method(...): Type;` déclare la signature sans corps. Toute classe concrète dérivée doit l’implémenter avec une signature compatible.

## Erreurs fréquentes

- Oublier d’implémenter la méthode dans une sous-classe concrète
- Mettre un corps à une méthode abstraite

## À retenir

- `abstract method(): Type;` dans une classe abstraite
- Obligation d’implémentation pour les classes concrètes
- Permet le template method pattern

## Exercices

1. Dans une classe abstraite `Logger`, déclare `abstract log(msg: string): void`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   abstract class Logger {
     abstract log(msg: string): void;
   }
   ```
   :::

## Questions d'entretien

1. À quoi servent les méthodes abstraites ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À imposer un contrat d’implémentation aux sous-classes tout en permettant à la classe de base de fournir du comportement commun qui s’appuie sur ces méthodes (pattern template method).
   :::
