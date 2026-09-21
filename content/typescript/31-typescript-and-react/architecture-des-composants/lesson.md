---
id: typescript-31-architecture-des-composants
title: Architecture des composants
slug: architecture-des-composants
technology: typescript
level: intermediate
module: 31-typescript-and-react
order: 18
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-31-typage-des-donnees-api]
skills: [react]
tags: [typescript, react, architecture]
---

## Objectifs

- Organiser les composants typés
- Séparer UI pure et containers
- Définir des frontières de types

## Introduction

Une architecture claire maximise la valeur de TypeScript dans React.

## Concept

- **UI pure** : props in, JSX out, pas de fetch
- **Containers / hooks** : data fetching, state
- **domain types** partagés (User, Order…)
- **API layer** : clients typés + validation

```
components/Button.tsx   # props strictes
features/users/useUsers.ts
entities/user.ts        # type User
shared/api/client.ts
```

## Exemple

Éviter de faire fuiter les types de réponse HTTP bruts dans toute l’UI : mapper vers des types domaine.

## Comment ça fonctionne

Les types domaine stabilisent l’UI quand l’API évolue. Les composants restent testables avec des props simples.

## Erreurs fréquentes

- Types API partout dans les composants
- God components non typés

## À retenir

- UI pure typée
- Hooks data typés
- Types domaine centraux
- Validation aux bords

## Exercices

1. Où placer le type User métier ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Dans un module domain/entities partagé, pas uniquement inline dans un composant.
   :::

## Questions d'entretien

1. Comment structures-tu types et composants dans une app React TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Types domaine centraux, composants UI purement prop-driven, hooks/containers pour la data, validation à la couche API. Les frontières évitent de coupler l’UI aux DTOs bruts.
   :::
