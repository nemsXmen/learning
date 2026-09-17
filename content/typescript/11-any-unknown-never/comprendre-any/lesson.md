---
id: typescript-11-comprendre-any
title: Comprendre any
slug: comprendre-any
technology: typescript
level: intermediate
module: 11-any-unknown-never
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 40
prerequisites: [typescript-02-any]
skills: [any-unknown-never]
tags: [typescript, any]
---

## Objectifs

- Comprendre ce que signifie le type `any`
- Voir son comportement (opt-out du type-checker)
- Identifier où il apparaît implicitement

## Introduction

`any` désactive le contrôle de types pour une valeur. Tout est assignable à `any`, et `any` est assignable à tout.

## Concept

```ts
let value: any = 42;
value = "hello";
value = { x: 1 };
value.foo.bar.baz(); // OK pour le compilateur… crash possible à runtime
```

Avec `noImplicitAny`, TypeScript refuse les paramètres non annotés qui deviendraient `any` implicitement.

## Exemple

```ts
function log(x: any) {
  console.log(x);
}
```

## Comment ça fonctionne

`any` court-circuite le système de types. C’est utile pour migrer du JS, mais dangereux en code TypeScript durable.

## Erreurs fréquentes

- Utiliser `any` par facilité
- Laisser des `any` implicites (paramètres, retours JSON, etc.)

## À retenir

- `any` = absence de typage
- Tout passe, plus de sécurité ni d’autocomplétion fiable
- À éviter dans le code applicatif

## Exercices

1. Montre une opération dangereuse possible avec `any` mais refusée avec un type précis.

   :::solution
   ```ts
   const a: any = 42;
   a.toUpperCase(); // compile, plante à runtime
   ```
   :::

## Questions d'entretien

1. Que signifie le type `any` en TypeScript ?

   :::reponse
   C’est un type qui désactive le contrôle de types pour la valeur concernée. N’importe quelle valeur peut y être assignée, et on peut y accéder comme on veut sans vérification du compilateur.
   :::
