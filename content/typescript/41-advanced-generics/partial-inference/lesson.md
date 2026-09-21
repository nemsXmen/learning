---
id: typescript-41-partial-inference
title: Partial inference
slug: partial-inference
technology: typescript
level: advanced
module: 41-advanced-generics
order: 5
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-41-inference-avancee]
skills: [generics]
tags: [typescript, generics]
---

## Objectifs

- Voir les limites d’inférence partielle
- Patterns currying / helpers
- Fournir certains args seulement

## Introduction

TypeScript n’infère **pas toujours** une partie des type args si d’autres sont fournis explicitement.

## Concept

```ts
function createEvent<TPayload, TType extends string>(
  type: TType,
  payload: TPayload
) {
  return { type, payload };
}
// OK : les deux inférés

// Si on veut fixer TType et inférer TPayload — parfois besoin d’astuces
```

## Exemple

Pattern : fonction factory intermédiaire pour figer un param.

```ts
function defineHandler<TType extends string>(type: TType) {
  return <TPayload,>(payload: TPayload) => ({ type, payload });
}
```

## Comment ça fonctionne

Le currying crée un nouveau site d’inférence pour le second param.

## Erreurs fréquentes

- S’attendre à partial inference comme en certains langages
- Surcharges complexes illisibles

## À retenir

- Limites TS
- Currying helpers
- Lisibilité

## Exercices

1. Pourquoi defineHandler("click") retourne une fonction générique ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour figer TType et laisser inférer TPayload à l’appel suivant.
   :::

## Questions d'entretien

1. Comment contourner l’absence de partial type inference ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Avec des factories curryfiées, des overloads, ou en fournissant explicitement les type args nécessaires — en gardant l’API lisible.
   :::
