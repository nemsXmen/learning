---
id: typescript-12-enum-vs-union
title: Enum vs union
slug: enum-vs-union
technology: typescript
level: intermediate
module: 12-enums
order: 7
estimatedMinutes: 15
difficulty: 2
xp: 50
prerequisites: [typescript-12-reverse-mapping]
skills: [enums]
tags: [typescript, enums, unions]
---

## Objectifs

- Comparer enums et literal unions
- Voir les avantages de chaque approche
- Choisir selon le contexte

## Introduction

Les literal unions couvrent souvent le même besoin que les enums, avec un modèle plus simple.

## Concept

```ts
// Enum
enum Status {
  Idle = "idle",
  Loading = "loading",
  Success = "success"
}

// Literal union équivalente
type Status = "idle" | "loading" | "success";
const Status = {
  Idle: "idle",
  Loading: "loading",
  Success: "success"
} as const;
```

| Critère            | Enum                    | Literal union (+ as const)      |
|--------------------|-------------------------|---------------------------------|
| Runtime            | Objet (sauf const)      | Pas d’objet obligatoire         |
| Tree-shaking       | Moins bon               | Meilleur                        |
| Reverse mapping    | Numeric oui             | Non                             |
| Compatibilité      | Spécifique TS           | Plus « JS-friendly »            |
| Syntaxe            | Dédiée                  | Types standards                 |

## Exemple

Beaucoup d’équipes préfèrent aujourd’hui les literal unions pour les ensembles fermés de strings.

## Comment ça fonctionne

Les deux restreignent les valeurs. Les unions s’intègrent mieux au reste du système de types (mapped types, etc.) et n’imposent pas d’objet runtime.

## Erreurs fréquentes

- Utiliser un enum par habitude alors qu’une union suffit
- Mélanger les deux styles dans le même projet sans convention

## À retenir

- Literal union = souvent suffisant et plus simple
- Enum = utile si on veut un objet runtime / reverse mapping
- La cohérence d’équipe prime

## Exercices

1. Réécris un string enum Status en literal union + objet `as const`.

   :::solution
   ```ts
   type Status = "idle" | "loading" | "success";
   const Status = {
     Idle: "idle",
     Loading: "loading",
     Success: "success"
   } as const;
   ```
   :::

## Questions d'entretien

1. Enum ou literal union : que choisis-tu pour un ensemble de statuts string ?

   :::reponse
   Souvent une literal union (éventuellement avec un objet `as const` pour les constantes). C’est plus léger, mieux tree-shakeable et aligné avec le reste du système de types. Les enums restent valides si on a besoin d’un objet runtime ou de reverse mapping.
   :::
