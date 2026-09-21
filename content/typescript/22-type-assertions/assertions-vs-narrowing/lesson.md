---
id: typescript-22-assertions-vs-narrowing
title: Assertions vs narrowing
slug: assertions-vs-narrowing
technology: typescript
level: intermediate
module: 22-type-assertions
order: 7
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-22-assertions-dangereuses]
skills: [type-assertions]
tags: [typescript, assertions, narrowing]
---

## Objectifs

- Comparer assertions et narrowing
- Préférer le narrowing quand c’est possible
- Savoir quand l’assertion reste pertinente

## Introduction

Le **narrowing** affine un type grâce à des checks runtime. L’**assertion** force un type sans check.

## Concept

```ts
// Narrowing
function process(x: string | number) {
  if (typeof x === "string") {
    x.toUpperCase(); // string
  }
}

// Assertion
function process2(x: string | number) {
  (x as string).toUpperCase(); // dangereux si number
}
```

## Exemple

```ts
// Narrowing DOM
const el = document.getElementById("app");
if (el) {
  el.innerHTML = "...";
}

// Assertion
const el2 = document.getElementById("app")!;
el2.innerHTML = "...";
```

## Comment ça fonctionne

Narrowing = preuve pour le compilateur + sécurité runtime. Assertion = confiance déclarée sans preuve.

## Erreurs fréquentes

- Assertir alors qu’un `if` / `typeof` / `instanceof` suffirait

## À retenir

- Narrowing > assertion quand un check est possible
- Assertion pour les cas où le développeur a une garantie externe
- Type guards = narrowing réutilisable

## Exercices

1. Réécris `(x as string).length` avec un narrowing typeof.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   if (typeof x === "string") {
     x.length;
   }
   ```
   :::

## Questions d'entretien

1. Assertion ou narrowing : que choisis-tu en premier ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Le narrowing (typeof, instanceof, in, type guards) dès qu’un check runtime est possible. L’assertion seulement quand on a une garantie externe solide ou après validation.
   :::
