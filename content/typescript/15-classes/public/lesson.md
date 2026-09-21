---
id: typescript-15-public
title: public
slug: public
technology: typescript
level: intermediate
module: 15-classes
order: 6
estimatedMinutes: 10
difficulty: 1
xp: 35
prerequisites: [typescript-15-parameter-properties]
skills: [classes]
tags: [typescript, classes, visibility]
---

## Objectifs

- Comprendre le modificateur `public`
- Savoir qu’il est le défaut
- L’utiliser explicitement quand c’est utile

## Introduction

`public` rend un membre accessible de partout. C’est le modificateur **par défaut**.

## Concept

```ts
class User {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

const u = new User("Alice");
console.log(u.name); // OK
```

Équivalent sans mot-clé :

```ts
class User {
  name: string; // public implicite
  // ...
}
```

## Exemple

On l’écrit souvent explicitement dans les parameter properties pour la clarté.

## Comment ça fonctionne

Aucun contrôle d’accès particulier : lecture et écriture libres (sauf si combiné avec `readonly`).

## Erreurs fréquentes

- Croire que l’absence de modificateur signifie private
- Exposer des détails d’implémentation en public

## À retenir

- `public` = accessible partout
- Défaut si aucun modificateur
- Préférer private/protected pour l’encapsulation

## Exercices

1. Déclare une propriété public `title: string` dans une classe Book.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   class Book {
     public title: string;
     constructor(title: string) {
       this.title = title;
     }
   }
   ```
   :::

## Questions d'entretien

1. Quel est le modificateur de visibilité par défaut des membres de classe en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `public`. Tout membre sans modificateur est public.
   :::
