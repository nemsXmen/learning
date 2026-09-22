---
id: typescript-20-t-extends-u
title: T extends U
slug: t-extends-u
technology: typescript
level: advanced
module: 20-conditional-types
order: 1
estimatedMinutes: 12
difficulty: 2
xp: 45
prerequisites: [typescript-17-conditional-types]
skills: [conditional-types]
tags: [typescript, conditional-types]
---

## Objectifs

- Comprendre `T extends U` dans les types
- Distinguer contrainte générique et conditional type
- Voir l’assignabilité comme condition

## Introduction

`extends` exprime une relation d’**assignabilité** : T est-il assignable à U ?

## Concept

Dans une contrainte :

```ts
function getLength<T extends { length: number }>(x: T): number {
  return x.length;
}
```

Dans un conditional type :

```ts
type IsString<T> = T extends string ? true : false;
```

## Exemple

```ts
type Result = string extends string | number ? "yes" : "no"; // "yes"
```

## Comment ça fonctionne

`T extends U` est vrai si toute valeur de type T peut être utilisée là où U est attendu.

## Erreurs fréquentes

- Confondre extends de classe et extends de type conditionnel
- Penser en termes d’égalité plutôt que d’assignabilité

## À retenir

- `extends` = assignabilité
- Contrainte vs branche conditionnelle
- Fondamentaux des conditional types

## Exercices

1. Écris un type `IsNumber<T>` qui vaut true si T extends number.

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::solution
   ```ts
   type IsNumber<T> = T extends number ? true : false;
   ```
   :::

## Questions d'entretien

1. Que signifie `T extends U` dans un conditional type ?

   :::indice
   Relis l’exemple et vérifie les types attendus.
   :::

   :::reponse
   Que T est assignable à U. Si oui, la branche vraie est choisie ; sinon la branche fausse.
   :::
