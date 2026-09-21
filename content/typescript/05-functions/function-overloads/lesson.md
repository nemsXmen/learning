---
id: typescript-05-function-overloads
title: Function overloads
slug: function-overloads
technology: typescript
level: intermediate
module: 05-functions
order: 14
estimatedMinutes: 20
difficulty: 3
xp: 60
prerequisites: [typescript-05-function-types]
skills: [functions]
tags: [typescript, functions, overloads]
---

## Objectifs

- Déclarer des function overloads
- Comprendre la différence entre signatures d’overload et signature d’implémentation
- Savoir quand les utiliser (et quand les éviter)

## Introduction

Les overloads permettent de décrire plusieurs signatures possibles pour une même fonction.

## Concept

```ts
function format(input: string): string;
function format(input: number): string;
function format(input: string | number): string {
  return String(input);
}

format("hello"); // string
format(42);      // string
```

Les deux premières lignes sont les **overload signatures**.  
La dernière est la **implementation signature** (plus large, non visible par les appelants).

## Exemple

```ts
function makeDate(timestamp: number): Date;
function makeDate(year: number, month: number, day: number): Date;
function makeDate(yearOrTimestamp: number, month?: number, day?: number): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  }
  return new Date(yearOrTimestamp);
}
```

## Comment ça fonctionne

TypeScript choisit la première overload signature compatible avec l’appel. L’implémentation doit être compatible avec toutes les overloads.

## Erreurs fréquentes

- Oublier que l’implementation signature n’est pas visible par l’extérieur
- Créer trop d’overloads alors qu’une union ou des generics suffiraient
- Ordre incorrect des overloads (du plus spécifique au plus général)

## À retenir

- Overloads = plusieurs signatures publiques + une implémentation
- Ordre : du plus spécifique au plus général
- À utiliser avec parcimonie ; les unions et generics sont souvent plus simples

## Exercices

1. Écris des overloads pour une fonction `pluck` qui accepte soit un objet + clé, soit un tableau d’objets + clé.

   :::indice
   Deux signatures + une implémentation.
   :::

   :::solution
   ```ts
   function pluck<T, K extends keyof T>(obj: T, key: K): T[K];
   function pluck<T, K extends keyof T>(objs: T[], key: K): T[K][];
   function pluck<T, K extends keyof T>(objOrObjs: T | T[], key: K): T[K] | T[K][] {
     if (Array.isArray(objOrObjs)) {
       return objOrObjs.map(o => o[key]);
     }
     return objOrObjs[key];
   }
   ```
   :::

## Questions d'entretien

1. Quelle est la différence entre les overload signatures et l’implementation signature ?

   :::indice
   Reprends les exemples de la lecon et verifie le type de chaque valeur avant de proposer ta reponse.
   :::

   :::reponse
   Les overload signatures sont les signatures visibles par les appelants. L’implementation signature est plus large, sert uniquement à typer le corps de la fonction, et n’est pas proposée à l’autocomplétion des appelants.
   :::

