---
id: typescript-15-methodes
title: Méthodes
slug: methodes
technology: typescript
level: intermediate
module: 15-classes
order: 4
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-proprietes]
skills: [classes]
tags: [typescript, classes]
---

## Objectifs

- Déclarer des méthodes d’instance
- Typer paramètres et retour
- Utiliser `this` correctement

## Introduction

Les **méthodes** définissent le comportement de l’instance.

## Concept

```ts
class Counter {
  value: number = 0;

  increment(by: number = 1): number {
    this.value += by;
    return this.value;
  }

  reset(): void {
    this.value = 0;
  }
}
```

## Exemple

```ts
class Greeter {
  constructor(private name: string) {}
  greet(): string {
    return `Hello, ${this.name}`;
  }
}
```

## Comment ça fonctionne

Les méthodes sont typées comme des fonctions. `this` désigne l’instance. On peut annoter le type de `this` si besoin (cas avancés).

## Erreurs fréquentes

- Perdre `this` en extrayant la méthode (callback) — préférer les arrow properties si nécessaire
- Oublier le type de retour quand il n’est pas évident

## À retenir

- Méthodes = fonctions sur l’instance
- `this` = instance
- Attention au binding dans les callbacks

## Exercices

1. Ajoute une méthode `double(): number` à un Counter qui double `value`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Counter {
     value = 0;
     double(): number {
       this.value *= 2;
       return this.value;
     }
   }
   ```
   :::

## Questions d'entretien

1. Que se passe-t-il si on passe `obj.method` comme callback sans le binder ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `this` peut être perdu (undefined ou autre selon le mode). Solutions : `obj.method.bind(obj)`, arrow function wrapper, ou propriété fléchée de classe.
   :::
