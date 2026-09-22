---
id: typescript-15-setters
title: Setters
slug: setters
technology: typescript
level: intermediate
module: 15-classes
order: 12
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-15-getters]
skills: [classes]
tags: [typescript, classes, setters]
---

## Objectifs

- Déclarer des setters
- Valider les écritures
- Les combiner avec des getters

## Introduction

Un **setter** intercepte l’assignation à une propriété.

## Concept

```ts
class User {
  private _age: number = 0;

  get age(): number {
    return this._age;
  }

  set age(value: number) {
    if (value < 0) throw new Error("Invalid age");
    this._age = value;
  }
}

const u = new User();
u.age = 30; // OK
// u.age = -1; // throw
```

## Exemple

```ts
class Temperature {
  private _celsius = 0;
  set celsius(v: number) {
    this._celsius = v;
  }
  get fahrenheit(): number {
    return this._celsius * 9/5 + 32;
  }
}
```

## Comment ça fonctionne

`set nom(value: Type)` est appelé lors de `obj.nom = value`. Souvent couplé à un champ privé et un getter.

## Erreurs fréquentes

- Setter sans validation alors qu’on voulait encapsuler
- Asymétrie getter/setter confuse

## À retenir

- `set prop(value: Type) { ... }`
- Validation et encapsulation à l’écriture
- Souvent pairé avec un getter

## Exercices

1. Ajoute un setter `name` qui refuse les chaînes vides.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Person {
     private _name = "";
     get name(): string { return this._name; }
     set name(v: string) {
       if (!v) throw new Error("Empty name");
       this._name = v;
     }
   }
   ```
   :::

## Questions d'entretien

1. À quoi sert un setter en TypeScript/JavaScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À intercepter l’assignation d’une propriété pour valider, transformer ou encapsuler la valeur avant de la stocker (souvent dans un champ privé).
   :::
