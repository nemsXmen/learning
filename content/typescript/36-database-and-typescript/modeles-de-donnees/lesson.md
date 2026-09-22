---
id: typescript-36-modeles-de-donnees
title: Modèles de données
slug: modeles-de-donnees
technology: typescript
level: intermediate
module: 36-database-and-typescript
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: []
skills: [database]
tags: [typescript, database]
---

## Objectifs

- Modéliser les données en TypeScript
- Séparer modèle DB, domaine et API
- Voir les enjeux de mapping

## Introduction

Les **modèles de données** traversent plusieurs couches : tables, domain, DTOs.

## Concept

Trois niveaux fréquents :
1. **Row / Entity DB** — forme persistée
2. **Domain model** — règles métier
3. **DTO / API model** — contrat externe

```ts
// DB row
type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
};

// Domain
type User = {
  id: UserId;
  email: Email;
  createdAt: Date;
};
```

## Exemple

Ne pas faire fuiter `password_hash` dans le domain public ou l’API.

## Comment ça fonctionne

Chaque couche a son type. Des mappers convertissent explicitement.

## Erreurs fréquentes

- Un seul type pour tout
- Noms de colonnes SQL dans l’UI

## À retenir

- Plusieurs modèles
- Mapping explicite
- Secrets hors API

## Exercices

1. Pourquoi séparer UserRow et User domain ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   Pour isoler détails de persistance (hash, noms de colonnes) du modèle métier.
   :::

## Questions d'entretien

1. Comment structures-tu les modèles de données en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En séparant row/entity DB, modèle de domaine et DTOs API, avec des mappers explicites entre couches pour éviter fuites et couplage.
   :::
