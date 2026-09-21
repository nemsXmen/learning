---
id: typescript-25-strict
title: strict
slug: strict
technology: typescript
level: intermediate
module: 25-tsconfig
order: 5
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: [typescript-25-lib]
skills: [tsconfig]
tags: [typescript, tsconfig, strict]
---

## Objectifs

- Activer `strict`
- Comprendre le pack de checks
- En faire le défaut des projets modernes

## Introduction

`strict: true` active un **ensemble** d’options de vérification strictes.

## Concept

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Inclut notamment : `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables` (selon version).

## Exemple

Projets neufs : toujours `strict: true`. Migration : activer progressivement les flags.

## Comment ça fonctionne

Un seul switch pour une base de type-safety solide.

## Erreurs fréquentes

- Désactiver strict par confort
- Activer strict sans traiter les erreurs progressivement

## À retenir

- `strict: true` = socle recommandé
- Pack de flags
- Default moderne

## Exercices

1. Active strict dans un tsconfig.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "strict": true } }
   ```
   :::

## Questions d'entretien

1. Que fait `strict: true` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Il active un ensemble d’options de vérification strictes (noImplicitAny, strictNullChecks, etc.) qui renforcent fortement la sécurité de types du projet.
   :::
