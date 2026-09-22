---
id: typescript-34-dto-plus-schema
title: DTO + schema
slug: dto-plus-schema
technology: typescript
level: intermediate
module: 34-runtime-validation
order: 9
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-34-z-infer]
skills: [validation]
tags: [typescript, validation]
---

## Objectifs

- Combiner DTO et schema
- Choisir class-validator ou Zod
- Mapper vers le domaine

## Introduction

Les **DTO** d’API peuvent être validés par décorateurs ou par schema.

## Concept

**class-validator** (Nest classique) :

```ts
class CreateUserDto {
  @IsEmail() email: string;
}
```

**Zod** :

```ts
const CreateUserSchema = z.object({ email: z.string().email() });
type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

## Exemple

Après validation, mapper vers une entity / modèle domaine (pas toujours 1:1).

## Comment ça fonctionne

Pipe/middleware appelle parse ou validate. Le handler reçoit une donnée déjà sûre.

## Erreurs fréquentes

- Mélanger les deux sans standard d’équipe
- Utiliser le DTO comme modèle de persistance

## À retenir

- Une stratégie claire
- Validate → map → domain
- DTO ≠ entity

## Exercices

1. Pourquoi mapper DTO → domain après validation ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour isoler le contrat transport du modèle métier (champs, invariants différents).
   :::

## Questions d'entretien

1. Zod vs class-validator dans un projet TS ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   class-validator s’intègre bien avec Nest (décorateurs + ValidationPipe). Zod offre une approche schema-first, composition puissante et `z.infer`. Le choix dépend de l’écosystème et des préférences d’équipe.
   :::
