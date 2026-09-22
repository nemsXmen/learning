---
id: typescript-18-omit
title: Omit
slug: omit
technology: typescript
level: intermediate
module: 18-utility-types
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-pick]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Omit<T, K>`
- Exclure des propriétés
- Le comparer à Pick

## Introduction

`Omit<T, K>` crée un type en excluant certaines clés de `T`.

## Concept

```ts
type User = { id: number; name: string; password: string };
type SafeUser = Omit<User, "password">;
// { id: number; name: string }
```

## Exemple

```ts
function createUser(data: Omit<User, "id">): User {
  return { id: generateId(), ...data };
}
```

## Comment ça fonctionne

Équivalent conceptuel à `Pick<T, Exclude<keyof T, K>>`.

## Erreurs fréquentes

- Confondre Omit et Exclude (Exclude opère sur des unions, pas sur des clés d’objet directement de la même façon)

## À retenir

- `Omit<T, K>` = T sans les clés K
- Création sans id, exposition sans secrets
- Complémentaire de Pick

## Exercices

1. Type un input de création de Product sans le champ id.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Product = { id: string; name: string; price: number };
   type ProductCreate = Omit<Product, "id">;
   ```
   :::

## Questions d'entretien

1. Quelle différence entre Pick et Omit ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pick sélectionne les clés à conserver. Omit sélectionne les clés à exclure. Les deux produisent un sous-type d’objet dérivé de T.
   :::
