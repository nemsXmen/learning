---
id: typescript-15-protected
title: protected
slug: protected
technology: typescript
level: intermediate
module: 15-classes
order: 8
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-15-private]
skills: [classes]
tags: [typescript, classes, visibility]
---

## Objectifs

- Utiliser `protected` pour le partage avec les sous-classes
- Le distinguer de `private` et `public`
- Voir un exemple d’héritage

## Introduction

`protected` est accessible dans la classe **et** ses sous-classes, mais pas depuis l’extérieur.

## Concept

```ts
class Animal {
  protected name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Dog extends Animal {
  bark() {
    return `${this.name} barks`; // OK – protected
  }
}

const d = new Dog("Rex");
// d.name; // ❌ pas accessible depuis l’extérieur
```

## Exemple

```ts
class Base {
  protected log(msg: string) {
    console.log(msg);
  }
}
```

## Comment ça fonctionne

Comme `private`, c’est une contrainte de compilation. Les sous-classes voient les membres protected ; le code externe non.

## Erreurs fréquentes

- Utiliser `protected` partout au lieu de `private` (surexposition aux sous-classes)
- Confondre avec `public`

## À retenir

- `protected` = classe + sous-classes
- Utile pour les hooks d’extension
- Toujours une protection compile-time

## Exercices

1. Déclare une propriété protected `status` dans une classe Task.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Task {
     protected status: string = "pending";
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre `private` et `protected` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `private` : accessible uniquement dans la classe déclarante. `protected` : accessible dans la classe et ses sous-classes, mais pas depuis le code externe.
   :::
