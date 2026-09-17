---
id: typescript-10-narrowing-instanceof
title: Narrowing avec instanceof
slug: narrowing-instanceof
technology: typescript
level: intermediate
module: 10-type-narrowing
order: 2
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-10-narrowing-typeof]
skills: [type-narrowing]
tags: [typescript, narrowing, instanceof]
---

## Objectifs

- Utiliser `instanceof` pour narrow les instances de classes
- Connaître ses limites
- Le combiner avec d’autres techniques

## Introduction

`instanceof` teste si un objet est une instance d’une classe (ou d’un constructeur).

## Concept

```ts
class Dog {
  bark() { console.log("woof"); }
}
class Cat {
  meow() { console.log("meow"); }
}

function speak(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();
  } else {
    animal.meow();
  }
}
```

## Exemple

```ts
function handleError(err: Error | string) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
}
```

## Comment ça fonctionne

TypeScript utilise le test `instanceof` pour restreindre le type à la classe concernée (et ses sous-classes).

## Erreurs fréquentes

- Utiliser `instanceof` sur des objets littéraux / interfaces (ça ne fonctionne pas)
- Oublier que `instanceof` dépend de la chaîne de prototypes

## À retenir

- `instanceof` = narrowing pour les classes
- Idéal avec `Error`, `Date`, classes métier
- Pas adapté aux types purement structurels

## Exercices

1. Narrow une union `Date | string` pour formater la date ou afficher la string.

   :::solution
   ```ts
   function format(value: Date | string): string {
     if (value instanceof Date) return value.toISOString();
     return value;
   }
   ```
   :::

## Questions d'entretien

1. Quand utilises-tu `instanceof` plutôt que `typeof` ou `in` ?

   :::reponse
   Quand on travaille avec des instances de classes (Error, Date, classes métier). `typeof` est pour les primitifs, `in` pour la présence de propriétés sur des objets structurels.
   :::
