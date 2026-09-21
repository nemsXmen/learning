---
id: typescript-11-narrowing-de-unknown
title: Narrowing de unknown
slug: narrowing-de-unknown
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 4
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-11-comprendre-unknown]
skills: [any-unknown-never, type-narrowing]
tags: [typescript, unknown, narrowing]
---

## Objectifs

- Narrower une valeur `unknown` de façon sûre
- Combiner typeof, type guards, assertions
- Éviter les casts dangereux

## Introduction

Travailler avec `unknown` consiste essentiellement à le narrow correctement.

## Concept

```ts
function process(value: unknown) {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  if (Array.isArray(value)) {
    return value.length;
  }
  if (value && typeof value === "object" && "name" in value) {
    return (value as { name: string }).name;
  }
  return null;
}
```

Avec un type guard :

```ts
function isUser(value: unknown): value is { name: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name: unknown }).name === "string"
  );
}
```

## Exemple

```ts
const data: unknown = JSON.parse(text);
if (isUser(data)) {
  console.log(data.name);
}
```

## Comment ça fonctionne

On applique les mêmes techniques de narrowing que pour les unions, en partant de `unknown`.

## Erreurs fréquentes

- `as Type` immédiat sans validation
- Type guards incomplets

## À retenir

- typeof / in / Array.isArray / type guards
- Validation runtime pour les données externes
- Éviter le cast aveugle

## Exercices

1. Narrow un `unknown` en `{ id: number }` avec un type guard simple.

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::solution
   ```ts
   function isIdObject(v: unknown): v is { id: number } {
     return typeof v === "object" && v !== null && "id" in v && typeof (v as any).id === "number";
   }
   ```
   :::

## Questions d'entretien


1. Comment traites-tu une valeur `unknown` de façon sûre ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   En la narrowant avec typeof, in, Array.isArray ou des type guards personnalisés, éventuellement complétés par une validation runtime (Zod, etc.) pour les données externes. On évite le cast direct non validé.
   :::

