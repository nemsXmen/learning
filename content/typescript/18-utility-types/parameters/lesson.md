---
id: typescript-18-parameters
title: Parameters
slug: parameters
technology: typescript
level: intermediate
module: 18-utility-types
order: 11
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-18-returntype]
skills: [utility-types]
tags: [typescript, utility-types]
---

## Objectifs

- Utiliser `Parameters<T>`
- Extraire le tuple des paramètres
- Typer des wrappers et des appels

## Introduction

`Parameters<T>` produit un tuple des types de paramètres d’une fonction.

## Concept

```ts
function greet(name: string, age: number) {
  return `${name} is ${age}`;
}
type Args = Parameters<typeof greet>; // [string, number]

function callGreet(...args: Parameters<typeof greet>) {
  return greet(...args);
}
```

## Exemple

Utile pour les higher-order typescript-basics et les proxies d’appel.

## Comment ça fonctionne

Conditional type + infer sur la liste des paramètres.

## Erreurs fréquentes

- Confondre avec ConstructorParameters

## À retenir

- `Parameters<typeof fn>` → tuple d’args
- Wrappers / délégation
- Complémentaire de ReturnType

## Exercices

1. Extrais les paramètres de `(x: number, y: string) => void`.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type P = Parameters<(x: number, y: string) => void>; // [number, string]
   ```
   :::

## Questions d'entretien

1. Que retourne `Parameters<T>` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Un type tuple représentant les types des paramètres de la fonction T, dans l’ordre.
   :::
