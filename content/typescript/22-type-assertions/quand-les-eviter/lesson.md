---
id: typescript-22-quand-les-eviter
title: Quand les éviter ?
slug: quand-les-eviter
technology: typescript
level: intermediate
module: 22-type-assertions
order: 9
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-22-quand-utiliser-les-assertions]
skills: [type-assertions]
tags: [typescript, assertions]
---

## Objectifs

- Savoir quand refuser une assertion
- Proposer des alternatives
- Installer une culture de typage honnête

## Introduction

Éviter les assertions quand un meilleur outil existe.

## Concept

À éviter :
- À la place d’un **narrowing** possible
- Sur des **données externes non validées**
- `as any` / double assertions pour faire compiler
- Non-null `!` systématique

Alternatives :
- typeof / instanceof / in
- Type guards
- Validation runtime (Zod…)
- Meilleur design des types (unions discriminées)

## Exemple

```ts
// Éviter
function f(x: string | null) {
  return (x as string).trim();
}

// Préférer
function f(x: string | null) {
  if (x === null) return "";
  return x.trim();
}
```

## Comment ça fonctionne

Moins d’assertions = plus de garanties réelles et moins de surprises runtime.

## Erreurs fréquentes

- Culture « as any pour avancer »
- Ignorer les alternatives de narrowing

## À retenir

- Narrowing d’abord
- Valider les données externes
- Assertion = exception justifiée
- Le compilateur est un allié, pas un obstacle

## Exercices

1. Propose une alternative à `(data as User).name` quand data est unknown.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Valider avec un schema (Zod) ou un type guard `isUser(data)`, puis utiliser data.name.
   :::

## Questions d'entretien

1. Comment évites-tu le recours excessif aux assertions ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En privilégiant narrowing et type guards, en validant les données externes, en améliorant le design des types (unions discriminées), et en réservant les assertions aux cas vraiment justifiés et documentés.
   :::
