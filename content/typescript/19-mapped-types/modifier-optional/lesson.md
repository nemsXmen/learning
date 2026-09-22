---
id: typescript-19-modifier-optional
title: Modifier ?
slug: modifier-optional
technology: typescript
level: advanced
module: 19-mapped-types
order: 3
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-19-keyof-et-mapped-types]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Ajouter et retirer l’optionalité dans un mapped type
- Comprendre `?` et `-?`
- Reproduire Partial et Required

## Introduction

Les mapped types contrôlent le caractère optionnel des propriétés via `?` et `-?`.

## Concept

```ts
type Partial<T> = {
  [K in keyof T]?: T[K];
};

type Required<T> = {
  [K in keyof T]-?: T[K];
};
```

`+?` est équivalent à `?` (ajout). `-?` retire l’optionalité.

## Exemple

```ts
type OptionalId<T> = {
  [K in keyof T]: K extends "id" ? T[K] | undefined : T[K];
};
```

## Comment ça fonctionne

Le modifier s’applique à chaque propriété générée par le mapped type.

## Erreurs fréquentes

- Inverser `?` et `-?`

## À retenir

- `?` → optionnel (Partial)
- `-?` → obligatoire (Required)
- Contrôle fin de l’optionalité

## Exercices

1. Écris l’équivalent de Partial avec un mapped type.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type MyPartial<T> = { [K in keyof T]?: T[K] };
   ```
   :::

## Questions d'entretien

1. Comment Required retire-t-il l’optionalité ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec le modifier `-?` dans un mapped type : `{ [K in keyof T]-?: T[K] }`.
   :::
