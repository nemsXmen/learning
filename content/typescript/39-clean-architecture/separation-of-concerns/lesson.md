---
id: typescript-39-separation-of-concerns
title: Separation of Concerns
slug: separation-of-concerns
technology: typescript
level: intermediate
module: 39-clean-architecture
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-38-adapter]
skills: [architecture]
tags: [typescript, architecture]
---

## Objectifs

- Comprendre la séparation des responsabilités
- Voir pourquoi elle aide TypeScript
- Éviter les god modules

## Introduction

**Separation of Concerns** : chaque partie du code a une raison de changer distincte.

## Concept

Exemples de concerns :
- règles métier
- accès base de données
- transport HTTP
- UI
- configuration

```ts
// mauvais : tout mélangé
async function signup(req, res) {
  const user = await db.query(...);
  await sendEmail(...);
  res.json(user);
}
```

## Exemple

Séparer handlers HTTP, use cases, repositories.

## Comment ça fonctionne

Des modules/types par concern. Les frontières deviennent des interfaces typées.

## Erreurs fréquentes

- « Utilitaire » fourre-tout
- UI qui parle SQL

## À retenir

- Une raison de changer
- Frontières claires
- Types comme contrats

## Exercices

1. Cite 3 concerns distincts dans une API.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   HTTP, règles métier, persistance (et email, auth…).
   :::

## Questions d'entretien

1. Pourquoi la séparation des responsabilités aide-t-elle en TypeScript ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Parce que chaque couche expose des types stables ; on limite la propagation des détails (ORM, HTTP) et on rend le code testable et refactorable avec le filet du compilateur.
   :::
