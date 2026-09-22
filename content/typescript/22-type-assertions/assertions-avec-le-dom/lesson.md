---
id: typescript-22-assertions-avec-le-dom
title: Assertions avec le DOM
slug: assertions-avec-le-dom
technology: typescript
level: intermediate
module: 22-type-assertions
order: 5
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-22-double-assertions]
skills: [type-assertions]
tags: [typescript, assertions, dom]
---

## Objectifs

- Assertir des éléments DOM
- Connaître HTMLElement / HTMLInputElement etc.
- Préférer narrowing quand possible

## Introduction

Le DOM est un cas fréquent d’assertions car `getElementById` retourne `HTMLElement | null`.

## Concept

```ts
const el = document.getElementById("app");
// HTMLElement | null

const app = document.getElementById("app") as HTMLDivElement;
app.style.color = "red";
```

Mieux avec narrowing :

```ts
const el = document.getElementById("app");
if (el instanceof HTMLDivElement) {
  el.style.color = "red";
}
```

## Exemple

```ts
const input = document.querySelector("#email") as HTMLInputElement | null;
input?.value;
```

## Comment ça fonctionne

Les interfaces DOM (`HTMLDivElement`, `HTMLInputElement`…) affinent les propriétés disponibles. L’assertion évite les checks mais assume que l’élément existe et a le bon type.

## Erreurs fréquentes

- Assertir sans gérer `null`
- Mauvais type d’élément (div vs input)

## À retenir

- DOM = assertions fréquentes
- Préférer `instanceof` / null checks
- Assertion OK si l’élément est garanti par le HTML

## Exercices

1. Récupère un input par id et assert-le en HTMLInputElement (en gérant null).

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   const input = document.getElementById("email") as HTMLInputElement | null;
   if (input) console.log(input.value);
   ```
   :::

## Questions d'entretien

1. Assertion DOM vs instanceof : que préfères-tu ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `instanceof` (ou un null check) quand l’élément n’est pas garanti. L’assertion est acceptable si le HTML garantit la présence et le type de l’élément.
   :::
