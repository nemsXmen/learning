---
id: typescript-18-partial
title: Partial
slug: partial
technology: typescript
level: intermediate
module: 18-utility-types
order: 1
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-17-mapped-types]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Partial<T>`
- Comprendre qu’il rend toutes les propriétés optionnelles
- Voir les cas d’usage (update, patch)

## Introduction

`Partial<T>` transforme toutes les propriétés de `T` en propriétés optionnelles.

## Concept

```ts
type User = { id: number; name: string; email: string };
type UserUpdate = Partial<User>;
// { id?: number; name?: string; email?: string }

function updateUser(id: number, patch: Partial<User>) {
  // ...
}
updateUser(1, { name: "Alice" }); // OK
```

## Exemple

Idéal pour les payloads de mise à jour partielle (PATCH).

## Comment ça fonctionne

Équivalent à `{ [K in keyof T]?: T[K] }`.

## Erreurs fréquentes

- Utiliser Partial quand seules certaines clés doivent être optionnelles (préférer Pick + Partial ciblé)

## À retenir

- `Partial<T>` = tout optionnel
- Update / patch
- Mapped type standard

## Exercices

1. Type le paramètre d’update d’un Product avec Partial.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Product = { id: string; price: number };
   function update(id: string, data: Partial<Product>) {}
   ```
   :::

## Questions d'entretien

1. À quoi sert `Partial<T>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À rendre toutes les propriétés de T optionnelles. Cas d’usage classique : objets de mise à jour partielle.
   :::
