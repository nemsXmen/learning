---
id: typescript-25-target
title: target
slug: target
technology: typescript
level: intermediate
module: 25-tsconfig
order: 1
estimatedMinutes: 10
difficulty: 2
xp: 40
prerequisites: []
skills: [tsconfig]
tags: [typescript, tsconfig]
---

## Objectifs

- Comprendre l’option `target`
- Choisir une cible ECMAScript
- Voir l’impact sur le JS émis

## Introduction

`target` définit la version d’ECMAScript du JavaScript **émis** par le compilateur.

## Concept

```json
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

Valeurs courantes : `ES5`, `ES2015`, `ES2020`, `ESNext`…

## Exemple

Avec `target: ES5`, les `async/await` et classes peuvent être downlevelés. Avec `ES2022`, le code moderne est préservé davantage.

## Comment ça fonctionne

TypeScript transforme la syntaxe non supportée par la cible. Cela n’ajoute pas automatiquement les polyfills runtime (lib vs polyfills).

## Erreurs fréquentes

- target trop bas → bundles plus lourds / syntaxe transformée inutilement
- target trop haut → runtime non supporté

## À retenir

- `target` = version JS de sortie
- Aligner sur les runtimes supportés
- Différent de `lib` (types disponibles)

## Exercices

1. Configure target sur ES2020 dans un tsconfig minimal.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```json
   { "compilerOptions": { "target": "ES2020" } }
   ```
   :::

## Questions d'entretien

1. Quelle différence entre `target` et `lib` ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   `target` contrôle la syntaxe JavaScript émise. `lib` contrôle quels types d’API (DOM, ES2020…) sont disponibles au type-checking, sans forcément émettre de polyfills.
   :::
