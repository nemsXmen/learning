---
id: typescript-21-capitalize
title: Capitalize
slug: capitalize
technology: typescript
level: advanced
module: 21-template-literal-types
order: 10
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-21-lowercase]
skills: [template-literal-types]
tags: [typescript, template-literal-types]
---

## Objectifs

- Utiliser `Capitalize`
- Capitaliser la première lettre
- Cas d’usage (onClick, getName)

## Introduction

`Capitalize<S>` met la première lettre en majuscule.

## Concept

```ts
type A = Capitalize<"hello">; // "Hello"
type B = Capitalize<"click" | "change">; // "Click" | "Change"
```

## Exemple

```ts
type Event = "click";
type Handler = `on${Capitalize<Event>}`; // "onClick"
```

## Comment ça fonctionne

Intrinsic string manipulation type, distributif sur les unions.

## Erreurs fréquentes

- L’utiliser à la place de Uppercase pour tout mettre en majuscules

## À retenir

- `Capitalize<S>` = première lettre majuscule
- Indispensable pour onX / getX
- Ne traite que le premier caractère

## Exercices

1. Produis `"onSubmit"` à partir de `"submit"`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type H = `on${Capitalize<"submit">}`; // "onSubmit"
   ```
   :::

## Questions d'entretien

1. Pourquoi Capitalize est-il si présent dans les mapped types d’handlers ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce qu’il permet de passer de `click` à `Click` pour construire `onClick` de façon systématique et type-safe.
   :::
