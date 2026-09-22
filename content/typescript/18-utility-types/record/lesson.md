---
id: typescript-18-record
title: Record
slug: record
technology: typescript
level: intermediate
module: 18-utility-types
order: 6
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-omit]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Record<K, V>`
- Typer des dictionnaires / maps d’objets
- Le combiner avec des literal unions

## Introduction

`Record<K, V>` construit un type objet dont les clés sont de type `K` et les valeurs de type `V`.

## Concept

```ts
type Scores = Record<string, number>;
// { [key: string]: number }

type Role = "admin" | "user" | "guest";
type Permissions = Record<Role, boolean>;
// { admin: boolean; user: boolean; guest: boolean }
```

## Exemple

```ts
const labels: Record<"fr" | "en", string> = {
  fr: "Bonjour",
  en: "Hello"
};
```

## Comment ça fonctionne

Équivalent à `{ [P in K]: V }`. Avec une literal union pour K, toutes les clés deviennent obligatoires.

## Erreurs fréquentes

- Oublier une clé quand K est une literal union fermée

## À retenir

- `Record<K, V>` = map typée
- Excellent avec les literal unions de clés
- Dictionnaires, tables de config

## Exercices

1. Type un objet de feature flags pour "darkMode" | "beta".

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type Flags = Record<"darkMode" | "beta", boolean>;
   ```
   :::

## Questions d'entretien

1. À quoi sert `Record<K, V>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À créer un type objet où chaque clé de type K a une valeur de type V. Très utile pour les dictionnaires et pour forcer la présence de toutes les clés d’une literal union.
   :::
