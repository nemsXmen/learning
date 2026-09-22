---
id: typescript-25-no-unused-locals
title: noUnusedLocals
slug: no-unused-locals
technology: typescript
level: intermediate
module: 25-tsconfig
order: 11
estimatedMinutes: 8
difficulty: 1
xp: 30
prerequisites: [typescript-25-no-implicit-returns]
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Activer `noUnusedLocals`
- Détecter les variables locales inutilisées
- Garder le code propre

## Introduction

Signale les variables locales déclarées mais jamais lues.

## Concept

```ts
function f() {
  const unused = 1; // erreur si noUnusedLocals
  return 2;
}
```

## Exemple

Complémentaire des linters (ESLint unused-imports, etc.).

## Comment ça fonctionne

Analyse statique des bindings locaux non référencés.

## Erreurs fréquentes

- Préfixer avec `_` selon conventions pour les args volontairement ignorés (plutôt noUnusedParameters)

## À retenir

- Locals non utilisés = erreur
- Hygiène de code
- Pair avec noUnusedParameters

## Exercices

1. Active noUnusedLocals dans tsconfig.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "noUnusedLocals": true } }
   ```
   :::

## Questions d'entretien

1. À quoi sert `noUnusedLocals` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   À signaler les variables locales déclarées mais jamais utilisées, pour réduire le code mort et les erreurs d’inattention.
   :::
