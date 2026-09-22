---
id: typescript-16-heritage
title: Héritage
slug: heritage
technology: typescript
level: intermediate
module: 16-oop-and-typescript
order: 2
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-16-encapsulation]
skills: [oop]
tags: [typescript, oop, inheritance]
---

## Objectifs

- Utiliser `extends` pour l’héritage de classes
- Appeler `super`
- Comprendre la chaîne de prototypes typée

## Introduction

L’**héritage** permet à une classe de réutiliser et d’étendre une autre classe.

## Concept

```ts
class Animal {
  constructor(public name: string) {}
  move(distance: number) {
    console.log(`${this.name} moved ${distance}m`);
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof!");
  }
}

const d = new Dog("Rex");
d.move(10);
d.bark();
```

## Exemple – super

```ts
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);
  }
}
```



## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

`extends` lie la sous-classe à la super-classe. `super()` appelle le constructeur parent. TypeScript vérifie la compatibilité des types.

## Erreurs fréquentes

- Oublier `super()` dans le constructeur d’une sous-classe
- Hiérarchies trop profondes

## À retenir

- `class B extends A`
- `super` pour le parent
- Préférer des hiérarchies peu profondes

## Exercices

1. Crée `Cat extends Animal` avec une méthode `meow()`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Cat extends Animal {
     meow() {
       console.log("Meow");
     }
   }
   ```
   :::

## Questions d'entretien

1. Que fait `super()` dans le constructeur d’une sous-classe ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il appelle le constructeur de la classe parente pour initialiser la partie héritée de l’instance. En TypeScript/JavaScript, il doit généralement être appelé avant d’utiliser `this`.
   :::
