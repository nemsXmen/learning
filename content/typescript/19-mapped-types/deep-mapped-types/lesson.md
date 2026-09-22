---
id: typescript-19-deep-mapped-types
title: Deep mapped types
slug: deep-mapped-types
technology: typescript
level: advanced
module: 19-mapped-types
order: 7
estimatedMinutes: 12
difficulty: 3
xp: 50
prerequisites: [typescript-19-conditional-mapped-types]
skills: [mapped-types]
tags: [typescript, mapped-types]
---

## Objectifs

- Comprendre les mapped types récursifs (deep)
- Voir le pattern général
- Anticiper les limites de profondeur

## Introduction

Un mapped type **deep** s’applique récursivement aux objets imbriqués.

## Concept

```ts
type DeepX<T> = {
  [K in keyof T]: T[K] extends object
    ? DeepX<T[K]>
    : /* transformation feuille */ T[K];
};
```

## Exemple

DeepPartial et DeepReadonly suivent ce schéma.

## Comment ça fonctionne

Le conditional détecte les objets et rappelle le mapped type. Les feuilles (primitives, fonctions selon le filtre) stoppent la récursion.

## Erreurs fréquentes

- Boucles sur des types qui se référencent (attention aux structures récursives métier)
- Trop de profondeur → erreur compilateur

## À retenir

- Pattern : mapped + `extends object ? Deep... : ...`
- Cas de base indispensable
- Outil pour Partial/Readonly en profondeur

## Exercices

1. Esquisse la structure d’un DeepReadonly.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type DeepReadonly<T> = {
     readonly [K in keyof T]: T[K] extends object
       ? DeepReadonly<T[K]>
       : T[K];
   };
   ```
   :::

## Questions d'entretien

1. Comment rend-on un mapped type « profond » ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   En le rendant récursif : si la valeur est un objet, on réapplique le mapped type ; sinon on applique la transformation de feuille. Un cas de base évite la récursion infinie.
   :::
