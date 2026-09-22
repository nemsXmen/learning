---
id: typescript-34-schema-validation
title: Schema validation
slug: schema-validation
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 6
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-assertion-typescript-basics]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Comprendre la validation par schema
- Avantages déclaratifs
- Lien schema → type

## Introduction

Un **schema** décrit la forme attendue et valide les données à runtime.

## Concept

Approches :
- Zod, Valibot, Yup, Joi, Ajv (JSON Schema)
- class-validator (décorateurs sur classes)

```ts
// idée
const UserSchema = schema.object({
  id: schema.string(),
  name: schema.string()
});
const user = UserSchema.parse(input); // throw si invalide
```

## Exemple

Un schema devient la **source de vérité** : validation + type inféré.

## Comment ça fonctionne

Le schema exécute des checks. Les libs TS-first exposent un type dérivé (`z.infer`).

## Erreurs fréquentes

- Dupliquer type à la main + schema
- Parser trop tard (au fond du domaine)

## À retenir

- Schema déclaratif
- parse / safeParse
- Single source of truth

## Exercices

1. Avantage d’un schema vs checks manuels éparpillés ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Contrat central, réutilisable, moins d’oublis, type dérivable.
   :::

## Questions d'entretien

1. Pourquoi adopter une lib de schema en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Pour valider les données externes de façon déclarative, générer des messages d’erreur cohérents, et souvent inférer le type TypeScript depuis le même schema (une seule source de vérité).
   :::
