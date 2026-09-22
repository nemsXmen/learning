---
id: typescript-25-configuration-production
title: Configuration production
slug: configuration-production
technology: typescript
level: intermediate
module: 25-tsconfig
order: 18
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-25-project-references]
skills: [tsconfig]
tags: [typescript, tsconfig, production]
---

## Objectifs

- Assembler un tsconfig production solide
- Séparer dev / build si besoin
- Lister les options clés

## Introduction

Une config production privilégie **strictness**, **perf de build** et **alignement runtime**.

## Concept – base recommandée

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## Exemple – front bundlé

Souvent `module: ESNext`, `moduleResolution: bundler`, `noEmit: true` (le bundler émet).



## Concept

Ce concept s’appuie sur les notions présentées dans cette leçon.

## Exemple

Consulte les exemples de code de cette leçon pour appliquer la notion.

## Comment ça fonctionne

Dev peut assouplir certains flags (source maps plus verbeux). CI/production reste strict.

## Erreurs fréquentes

- Config unique incohérente pour Node et browser
- noEmit oublié quand le bundler compile

## À retenir

- strict + flags utiles
- skipLibCheck pragmatique
- Aligner module / resolution / runtime
- Séparer app et lib si besoin

## Exercices

1. Liste 5 options que tu activerais par défaut en prod.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   strict, esModuleInterop, skipLibCheck, forceConsistentCasingInFileNames, noUncheckedIndexedAccess (selon tolérance).
   :::

## Questions d'entretien

1. Quelles options tsconfig considères-tu non négociables en production ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Au minimum `strict: true`, une combinaison cohérente `module`/`moduleResolution`/`target` alignée sur le runtime, `esModuleInterop`, et souvent `skipLibCheck` pour la pragmatisme. J’ajoute selon le contexte noUncheckedIndexedAccess, noImplicitReturns, et les options de déclaration pour les libs.
   :::
